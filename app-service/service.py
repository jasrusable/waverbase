import sys
sys.path.append('gen-py')

import logging
logging.basicConfig()

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

from app import AppService

from gcloud import gcloud
from mongo import mongo_connection, MongoReplica


UNITIALISED = 'unitialised'
INITIALISING = 'initialising'
INITIALISED = 'initialised'


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
