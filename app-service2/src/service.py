import sys
sys.path.append('../gen-py')

import logging
logging.basicConfig(level=logging.DEBUG)

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
    deleted = db.apps.delete_one({
      'creator': creator,
      'name': app
    })
    print(deleted.deleted_count)
    return True

  def get_app(self, app, creator):
    db = mongo_connection()
    print db.apps.find_one({
        'name': app,
        'creator': creator
    })


  def get_parse_server_address(self, app):
    db = mongo_connection()
    app = db.apps.find_one({
        'name': app['name'],
        'creator': app['creator']
    })
    return app['parse_address']

  def get_mongo_connection_string(self, app, creator):
    db = mongo_connection()
    app = db.apps.find_one({
        'name': app,
        'creator': creator
    })
    return app['mongo_connection_string']

  def set_mongo_password(self, app_name, creator, password):
    db = mongo_connection()

    # we do not set the admin password multiple times. It should fail the second time
    app = db.apps.find_one({
        'name': app_name,
        'creator': creator
    })
    if not app:
      # XXX
      db.apps.insert({'name':app_name,'creator':creator,'mongo_password':password})
      return True

    return db.apps.update_one(
        {'name': app_name, 'creator': creator},
        {"$set": {"mongo_password": password}}
    ).matched_count == 1

  def get_mongo_password(self, app, creator):
    db = mongo_connection()

    # we do not set the admin password multiple times. It should fail the second time
    app = db.apps.find_one({
        'name': app,
        'creator': creator
    })
    if not app:
      return ''
    return app.get('mongo_password')

  def add_mongo_server(self, app, creator, mongo_connection_string):
    db = mongo_connection()
    db.apps.update_one(
        {'name': app, 'creator': creator},
        {"$addToSet": {"mongo_databases": mongo_connection_string}})

  def get_mongo_connection_string(self, app, creator):
    db = mongo_connection()
    app = db.apps.find_one({'name': app, 'creator': creator})
    print app['mongo_databases']
    return app['mongo_databases']

  def ping(self):
    logging.info('pong')
    return 'pong'


if __name__ == '__main__':
  handler = AppHandler()
  # mongo = MongoReplica('yaseen', 'fb')
  # print mongo.get_mongo_ips()
  # db = mongo.connect()
  # mongo.init_security(db)
  processor = AppService.Processor(handler)

  port=9090
  transport = TSocket.TServerSocket(port=port)
  tfactory = TTransport.TBufferedTransportFactory()
  pfactory = TBinaryProtocol.TBinaryProtocolFactory()

  logging.info('Listening on %d' % port)
  server = TServer.TThreadedServer(processor, transport, tfactory, pfactory)
  server.serve()