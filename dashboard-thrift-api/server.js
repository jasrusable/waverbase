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

      result(null, JSON.stringify(dbs));
      db.close();

    }).catch(function(err) {
      console.log(err.stack);
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

        result(null, JSON.stringify(collectionNames));
      }

      db.close();
    }).catch(function(err){
      console.log(err.stack);
    });
  },

  findDocuments: function(instanceUrl, database, collection, options, result) {
    instanceUrl = 'mongodb://localhost:27017';
    database = 'waverbase';
    collection = 'test_db';

    co(function*(){
      const db = yield MongoClient.connect(instanceUrl + '/' + database);
      const col = db.collection(collection);

      const filter = options.query ? JSON.parse(options.query.filter) : {};
      const fields = options.query ? JSON.parse(options.query.fields) : {};
      const skip = options.skip ? options.skip : 0;

      var p = col.find(filter, fields).skip(skip);
      if (options.limit) {
        p.limit(options.limit); 
      }

      const docs = yield p.toArray();

      result(null, JSON.stringify(docs));

      db.close();
    }).catch(function(err){
      console.log(err.stack);
    });
  },

  updateDocuments: function(instanceUrl, database, collection, selector, update) {
    instanceUrl = 'mongodb://localhost:27017';
    database = 'waverbase';
    collection = 'test_db';

    co(function*(){
      const db = yield MongoClient.connect(instanceUrl + '/' + database);
      const col = db.collection(collection);

      yield col.updateMany(JSON.parse(selector), JSON.parse(update));

      db.close();
    }).catch(function(err){
      console.log(err.stack);
    });
  },

  insertDocument: function(instanceUrl, database, collection, doc){
    instanceUrl = 'mongodb://localhost:27017';
    database = 'waverbase';
    collection = 'test_db';

    co(function*(){
      const db = yield MongoClient.connect(instanceUrl + '/' + database);
      const col = db.collection(collection);

      yield col.insert(JSON.parse(doc));

      db.close();
    }).catch(function(err){
      console.log(err.stack);
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