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
    console.log("listCollections!");
    result(null);
  },

  getDatabase: function(instanceUrl, database, result) {
    console.log("getDatabase!");
    result(null);
  },

  getCollection: function(instanceUrl, database, collection, result) {
    console.log("getCollection");
    result(null);
  },

  listDocuments: function(instanceUrl, database, collection, result) {
    console.log("listDocuments");
    result(null);
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