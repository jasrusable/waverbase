const thrift = require('thrift');
const mongo_svc = require('./gen-nodejs/mongo_svc.js');
const md_types = require('./gen-nodejs/mongo-dashboard_types.js');
const MongoClient = require('mongodb').MongoClient;
const co = require('co');

const mongo_handler = {
  listDatabases: function(instanceUrl, result) {
  
    // TODO: remove this line of code
    instanceUrl = 'mongodb://localhost:27017';

    co(function*() {
      const db = yield MongoClient.connect(instanceUrl);
      const dbs = yield db.admin().listDatabases();

      result(null, dbs);
      db.close();
    });
  },

  listCollections: function(instanceUrl, database, result) {
    instanceUrl = 'mongodb://localhost:27017';
    database = 'waverbase';


    co(function*() {
      const db = yield MongoClient.connect(instanceUrl + '/' + database);
      const collections = yield db.collections();

      if (collections.length > 0) {
        var collectionNames = collections.map(function(collection) {
            return collection['s']['name'];
        });

        result(null, collectionNames);
      }

      db.close();
    });
  },

  // TODO: change this to a find with limit
  listDocuments: function(instanceUrl, database, collection, result) {
    instanceUrl = 'mongodb://localhost:27017';
    database = 'waverbase';
    collection = 'test_db';

    co(function*(){
      const db = yield MongoClient.connect(instanceUrl + '/' + database);
      const col = db.collection(collection);
      const docs = yield col.find().toArray();

      result(null, docs);

      db.close();
    });
  }
};

const mongo_svc_opt = {
  transport: thrift.TXHRTransport,
  protocol: thrift.TJSONProtocol,
  processor: mongo_svc,
  handler: mongo_handler
};

const server_opt  = {
  files: ".",
  services: {
    "/mongo": mongo_svc_opt
  }
};

var server = thrift.createWebServer(server_opt);
var port = 9099;
server.listen(port);
console.log("Http/Thrift Server running on port: " + port);