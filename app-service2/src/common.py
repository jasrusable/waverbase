import pymongo
import os

def connect_mongo():
    host = os.environ['MONGO_WAVER_SERVICE_HOST']
    port = os.environ['MONGO_WAVER_SERVICE_PORT']
    return pymongo.MongoClient('mongodb://%(host)s:%(port)s' %
                               {
                                   host: host,
                                   port: port
                               })
