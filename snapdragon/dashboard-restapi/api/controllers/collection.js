'use strict';

const util = require('util');
const MongoClient = require('mongodb').MongoClient;
const co = require('co');
const url = 'mongodb://localhost:27017';


module.exports = {
    addCollection: addCollection
};

// http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#find
function addCollection(req, res) {
    const dbName = req.swagger.params.dbName.value;
    const collectionName = req.swagger.params.collectionName.value;

    co(function*(){
        var db = yield MongoClient.connect(url+'/'+dbName);
        var collection = db.collection(collectionName);
        var docs = yield collection.find().toArray();

        db.close();
    });
}