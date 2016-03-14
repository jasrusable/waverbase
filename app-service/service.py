import sys
import os
sys.path.append('gen-py')

import logging
logging.basicConfig()
import pymongo

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

from app import AppService

from plumbum import local, FG

UNITIALISED = 'unitialised'
INITIALISING = 'initialising'
INITIALISED = 'initialised'

GCLOUD_ZONE = 'europe-west1-b'
START_DISK_SIZE = 50

kubectl = local["kubectl"]
gcloud = local["gcloud"]

def mongo_connection():
  # 'mongodb://mongo-1,mongo-2,mongo-3:27017/waverbase'
  return pymongo.MongoClient(os.environ['MONGO_CONNECTION_STRING']).waverbase


class MongoReplica(object):
  def __init__(self, app):
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
      'app': self.app,
      'size': replica
    }

    # create the disk
    gcloud["compute", "disks", "create",
           "mongo-app-%(app)s-%(size)d-disk" % args,
           "--size", "%dGB" % disk_size,
           "--zone", GCLOUD_ZONE] & FG

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
    mongo = MongoReplica(name)
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
