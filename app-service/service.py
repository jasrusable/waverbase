import sys
import os
sys.path.append('gen-py')
import time
import threading

import json
import logging
logging.basicConfig()
import pymongo

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

from app import AppService

from plumbum import local, FG, ProcessExecutionError

from oauth2client.client import GoogleCredentials
from googleapiclient import discovery
from googleapiclient.errors import HttpError


UNITIALISED = 'unitialised'
INITIALISING = 'initialising'
INITIALISED = 'initialised'

GCLOUD_ZONE = 'europe-west1-b'
GCLOUD_REGION = 'europe-west1'
GCLOUD_PROJECT = 'api-project-1075799951054'
START_DISK_SIZE = 50

kubectl = local["kubectl"]
gcloud = local["gcloud"]

def interleave_wait(*args):
    while True:
      # wait for the maximum returned sleep time (weird, but this is a hack so shhh)
      sleeps = map(lambda x: next(x, 'die'), args)
      if sleeps[0] == 'die':
        return
      time.sleep(max(sleeps))

def mongo_connection():
  return pymongo.MongoClient(os.environ['MONGO_CONNECTION_STRING']).waverbase

class Gcloud:
  def __init__(self):
    credentials = GoogleCredentials.get_application_default()
    self.compute = discovery.build('compute', 'v1', credentials=credentials)

  def wait_for_region_operation(self, project, region, operation):
    print('Waiting for operation to finish...')
    while True:
      result = self.compute.regionOperations().get(
      region=region,
      project=project,
      operation=operation).execute()

      if result['status'] == 'DONE':
        print("done.")
      if 'error' in result:
        raise Exception(result['error'])
      return result

      time.sleep(1)

  def delete_ip(self, name):
    try:
        result = self.compute.addresses().delete(
        project=GCLOUD_PROJECT,
        region=GCLOUD_REGION,
        address=name
        ).execute()
        return True
    except HttpError, err:
      print 'Unable to delete IP %s' % err
      return False


  def reserve_ip(self, name):
    print 'Reserving IP address'
    result = self.compute.addresses().insert(
      project=GCLOUD_PROJECT,
      region=GCLOUD_REGION,
      body={
        "name": name
      }
    ).execute()

    ip_address = None

    while ip_address is None:
        result = self.compute.addresses().get(
        project=GCLOUD_PROJECT,
        region=GCLOUD_REGION,
        address=name
        ).execute()

        ip_address = result.get('address')
        time.sleep(1)
        if not ip_address:
          print 'Waiting for IP...'

    print 'Got IP %s' % ip_address
    return ip_address

  def reserve_disk(self, name, size):
    disk = self.compute.disks().insert(
        project=GCLOUD_PROJECT,
        zone=GCLOUD_ZONE,
        body={
          "sizeGb": str(size),
          "name": name,
        }
    ).execute()

  def delete_disk(self, name):
    try:
        disk = self.compute.disks().delete(
            project=GCLOUD_PROJECT,
            zone=GCLOUD_ZONE,
            disk=name
        ).execute()
    except HttpError, e:
      if e.resp.status == 404:
        print 'Disk does not exist. Unable to delete'
      elif e.resp.status == 400:
        print 'Disk still in use. Unable to delete'
      else:
        raise


# Go Globals!
gcloud = Gcloud()

class MongoReplica(object):
  def __init__(self, creator, app):
    self.creator = creator
    self.app = app
    self.args = {
      'creator': self.creator,
      'app': self.app,
    }

  def connect(self):
    client = pymongo.MongoClient(self.get_mongo_ips(), connect=True)
    client.test.test.find_one({})
    return client

  def init_security(self, db):
    # create a super user for ourselves
    print db.admin.add_user(
      'waverbase-root',
      'supersecretpassword',
       roles=[{"role": "userAdminAnyDatabase", "db": "admin"}])

  def get_mongo_ips(self):
    return kubectl["get", "svc", "-o", 'jsonpath="{.items[*].status.loadBalancer.ingress[*].ip}"',
            "-l", "role=mongo,app=%s" % self.app]().split();

  @property
  def num_replicas(self):
    return int(kubectl["get","rc",
             "-l","role=mongo",
             "-l","app=%s" % self.app,
             "-o","template",
             "--template={{ len .items }}"]())


  def create(self):
    if self.num_replicas != 0:
        print '%d mongo replicas already exist' % self.num_replicas

    print 'Creating mongo replicas'
    interleave_wait(
        self.add(1),
        self.add(2),
        self.add(3))


    print 'Connecting...'
    db = self.connect()

    #print 'Securing...'
    #self.init_security(db)

  def add(self, replica, disk_size=START_DISK_SIZE):
    ip_address = gcloud.reserve_ip(self.ip_name(replica))

    # create the disk
    gcloud.reserve_disk(
      name=self.disk_name(replica),
      size=disk_size
    )

    args = dict(
      size=replica,
      ip=ip_address,
      **self.args)

    # create the service
    self.create_kube_from_template(
      'mongo-service-template.yaml',
      args)

    # sleep for 60 seconds but together with everyone else waiting
    yield 60

    # create the replication controller
    self.create_kube_from_template(
        'mongo-controller-template.yaml',
        args)

  def create_kube_from_template(self, file_name, args):
    template = open(file_name).read() % args
    print (kubectl["create", "-f", "-", "--logtostderr"] << template)()

  def delete_kube_by_name(self, name):
    try:
        print (kubectl["delete", name])()
        return True
    except ProcessExecutionError:
      return False

  def delete(self):
    for i in xrange(1, 4):
      self.delete_replica(i)

  def delete_replica(self, replica_num):
    self.delete_kube_by_name('rc/'+self.replication_controller_name(replica_num))
    self.delete_kube_by_name('svc/'+self.service_name(replica_num))

    # HACK ALERT! It takes a while for gcloud to release the ip/disk resources
    # so we just wait a bit
    # time.sleep(3)

    gcloud.delete_ip(self.ip_name(replica_num))
    gcloud.delete_disk(self.disk_name(replica_num))

  def ip_name(self, replica):
    return 'ip-mongo-%(creator)s-%(app)s-%(size)d' % dict(size=replica, **self.args)

  def disk_name(self, replica):
    return "mongo-app-%(app)s-%(size)d-disk" % dict(size=replica, **self.args)

  def replication_controller_name(self, replica):
    return 'mongo-%(app)s-%(replica)d' % dict(replica=replica, **self.args)

  def service_name(self, replica):
    return 'mongo-%(app)s-%(replica)d' % dict(replica=replica, **self.args)


class AppHandler(object):
  def create_app(self, app, creator):
    db = mongo_connection()
    app_args = {
        'name': app,
        'creator': creator,
    }
    mongo = MongoReplica(creator, app)
    if not db.apps.find_one(app_args):
        app_args.update({
        'rps': 30,
        'parse_server': '',
        'parse_server_state': UNITIALISED,
        'mongo_server': '',
        'mongo_server_state': UNITIALISED,
        'mongo_db': '',
        'mongo_username': '',
        'mongo_password': ''
        })
        db.apps.insert_one(app_args)
    else:
        print 'App already exists in db'

    mongo.create()

  def delete_app(self, app, creator):
    db = mongo_connection()
    mongo = MongoReplica(creator, app)
    mongo.delete()
    db.apps.delete_one({
      'creator': creator,
      'app': app
    })
    return True

  def get_app(self, app, creator):
    db = mongo_connection()
    return db.apps.find_one({'name': app, 'creator': creator})


  def get_parse_server_address(self, app):
    db = mongo_connection()
    app = db.apps.find_one({'name': app['name'], 'creator': app['creator']})
    return app['parse_address']

  def get_mongo_connection_string(self, app):
    db = mongo_connection()
    app = db.apps.find_one({'name': app['name'], 'creator': app['creator']})
    return app['mongo_connection_string']

  def ping(self):
    return 'pong'


if __name__ == '__main__':
  handler = AppHandler()
  # mongo = MongoReplica('yaseen', 'fb')
  # print mongo.get_mongo_ips()
  # db = mongo.connect()
  # mongo.init_security(db)
  processor = AppService.Processor(handler)

  transport = TSocket.TServerSocket(port=9090)
  tfactory = TTransport.TBufferedTransportFactory()
  pfactory = TBinaryProtocol.TBinaryProtocolFactory()

  server = TServer.TSimpleServer(processor, transport, tfactory, pfactory)
  server.serve()
