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

def mongo_connection():
  # 'mongodb://mongo-1,mongo-2,mongo-3:27017/waverbase'
  return pymongo.MongoClient(os.environ['MONGO_CONNECTION_STRING']).waverbase

class AppHandler(object):
  def createApp(self, name, creator):
    db = mongo_connection()
    app = {
      'name': name,
      'creator': creator,
    }
    if not db.apps.find_one(app):
        app['rps'] = 30
        db.apps.insert_one(app)

  
  def getApp(self, name, creator):
    db = mongo_connection()
    return db.apps.find_one({'name': name, 'creator': creator})


  def initialiseApp(self, app):
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
