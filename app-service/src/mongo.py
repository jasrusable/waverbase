import os
import pymongo
from plumbum import local, FG, ProcessExecutionError
import time
import logging

from gcloud import gcloud

kubectl = local["kubectl"]


def mongo_connection():
  return pymongo.MongoClient('mongodb://%s:%s' % (
      os.environ['MONGO_WAVER_SERVICE_HOST'],
      os.environ['MONGO_WAVER_SERVICE_PORT'])).waverbase


def interleave_wait(*args):
    while True:
      # wait for the maximum returned sleep time (weird, but this is a hack so shhh)
      sleeps = map(lambda x: next(x, 'die'), args)
      if sleeps[0] == 'die':
        return
      time.sleep(max(sleeps))


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
        logging.debug('%d mongo replicas already exist' % self.num_replicas)

    logging.info('Creating mongo replicas')
    interleave_wait(
        self.add(1),
        self.add(2),
        self.add(3))


    logging.info('Created')
    #db = self.connect()

    #print 'Securing...'
    #self.init_security(db)

  def add(self, replica, disk_size=20):
    ip_address = gcloud.reserve_ip(self.ip_name(replica))

    args = dict(
      hostname='mongo-%s-%s-%d' % (self.creator, self.app, replica),
      size=replica,
      ip=ip_address,
      **self.args)

    gcloud.add_dns_record(
      self.host_name(replica),
      ip_address)

    # create the disk
    gcloud.reserve_disk(
      name=self.disk_name(replica),
      size=disk_size
    )

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
    logging.info((kubectl["create", "-f", "-", "--logtostderr"] << template)())

  def delete_kube_by_name(self, name):
    try:
        logging.info((kubectl["delete", name])())
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

    gcloud.delete_dns_record(self.host_name(replica_num))
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

  def host_name(self, replica):
      return '%(app)s-%(replica)d.db.waverbase.com' % dict(replica=replica, **self.args)
