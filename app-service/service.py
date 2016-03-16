import sys
import os
sys.path.append('gen-py')
import time

import json
import logging
logging.basicConfig()
import pymongo

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

from app import AppService

from plumbum import local, FG

from oauth2client.client import GoogleCredentials
from googleapiclient import discovery

UNITIALISED = 'unitialised'
INITIALISING = 'initialising'
INITIALISED = 'initialised'

GCLOUD_ZONE = 'europe-west1-b'
GCLOUD_REGION = 'europe-west1'
GCLOUD_PROJECT = 'api-project-1075799951054'
START_DISK_SIZE = 50

kubectl = local["kubectl"]
gcloud = local["gcloud"]

def mongo_connection():
  # 'mongodb://mongo-1,mongo-2,mongo-3:27017/waverbase'
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


  def reserve_ip(self, name):
    print 'Reserving IP address'
    result = self.compute.addresses().insert(
      project=GCLOUD_PROJECT,
      region=GCLOUD_REGION,
      body={
        "name": name
      }
    ).execute()

    self.wait_for_region_operation(
      GCLOUD_PROJECT,
      GCLOUD_REGION,
      result['name'])

    ip_address = None

    while ip_address is None:
        result = self.compute.addresses().get(
        project=GCLOUD_PROJECT,
        region=GCLOUD_REGION,
        address=name
        ).execute()

        print json.dumps(result, indent=2)
        ip_address = result.get('address')
        time.sleep(1)

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
    

# Go Globals!
gcloud = Gcloud()

class MongoReplica(object):
  def __init__(self, creator, app):
    self.creator = creator
    self.app = app

  @property
  def num_replicas(self):
    return int(kubectl["get","rc",
             "-l","role=mongo",
             "-l","app=%s" % self.app,
             "-o","template",
             "--template={{ len .items }}"]())
       

  def create(self):
    if self.num_replicas == 0:
        print 'Creating mongo replicas'
        self.add(replica=1)
        self.add(replica=2)
        self.add(replica=3)
    else:
        print '%d mongo replicas already exist' % self.num_replicas

  def add(self, replica, disk_size=START_DISK_SIZE):
    args = {
      'creator': self.creator,
      'app': self.app,
      'size': replica,
    }

    ip_address = gcloud.reserve_ip('ip-mongo-%(creator)s-%(app)s-%(size)d' % args)
    args['ip'] = ip_address

    # create the disk
    gcloud.reserve_disk(
      name="mongo-app-%(app)s-%(size)d-disk" % args,
      size=disk_size
    )

    # create the replication controller
    rc_template = open('mongo-controller-template.yaml').read() % args

    print (kubectl["create", "-f", "-", "--logtostderr"] << rc_template)()

    # create service
    svc_template = open('mongo-service-template.yaml').read() % args

    print (kubectl["create", "-f", "-", "--logtostderr"] << svc_template)()

class AppHandler(object):


  def createApp(self, name, creator):
    db = mongo_connection()
    app = {
        'name': name,
        'creator': creator,
    }
    mongo = MongoReplica(creator, name)
    if not db.apps.find_one(app):
        app.update({
        'rps': 30,
        'parse_server': '',
        'parse_server_state': UNITIALISED,
        'mongo_server': '',
        'mongo_server_state': UNITIALISED,
        'mongo_db': '',
        'mongo_username': '',
        'mongo_password': ''
        })
        db.apps.insert_one(app)
    else:
        print 'App already exists in db'

    mongo.create()

  
  def getApp(self, name, creator):
    db = mongo_connection()
    return db.apps.find_one({'name': name, 'creator': creator})


  def initialiseApp(self, app):
    db = mongo_connection()
    app = db.apps.find_one({'name': name, 'creator': creator})
    if app['mongo_server_state'] == UNITIALISED:
        replication_controller = open('mongo-controller-template.yaml').read()
        replication_controller.replace('<app>', app.name)


  def getParseServerAddress(self, app):
    db = mongo_connection()
    app = db.apps.find_one({'name': app['name'], 'creator': app['creator']})
    return app['parse_address']

  def getMongoConnectionString(self, app):
    db = mongo_connection()
    app = db.apps.find_one({'name': app['name'], 'creator': app['creator']})
    return app['mongo_connection_string']

  def ping(self):
    return 'pong'


if __name__ == '__main__':
  handler = AppHandler()
  processor = AppService.Processor(handler)
 
  transport = TSocket.TServerSocket(port=9090)
  tfactory = TTransport.TBufferedTransportFactory()
  pfactory = TBinaryProtocol.TBinaryProtocolFactory()

  server = TServer.TSimpleServer(processor, transport, tfactory, pfactory)
  server.serve()
