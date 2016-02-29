'use strict'


const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const thrift = require('thrift');
const KeyChecker = require('./gen-nodejs/KeyChecker');

const URL = process.env.SECRET_KEY_CHECKER_MONGO_URL;
const PORT = 9090;

function makeServer(db) {
  const server = thrift.createServer(KeyChecker, {
    ping: function(result) {
      console.log('ping');
      result(null);
    },

    isAuthorized: function(publicKey, repository, result) {
      let apps = db.collection('apps');
      let query = {
        repository: repository,
        authorizedKeys: {$in: [publicKey]},
      };
      apps.find(query).toArray(function(err, docs) {
        assert.equal(null, err);
        result(null, docs.length);
      });
    },
  });

  return server;
}

MongoClient.connect(URL, function(err, db) {
  assert.equal(null, err);
  console.log('Connected to Mongo.');

  let server = makeServer(db);

  console.log('Listening on port', PORT);
  server.listen(PORT);
});
