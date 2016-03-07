'use strict';

const util = require('util');
const MongoClient = require('mongodb').MongoClient;
const co = require('co');
const url = 'mongodb://localhost:27017';


module.exports = {
    showDatabases: showDatabases,
    showCollections: showCollections,
    addCollection: addCollection
};

function showDatabases(req, res) {
    MongoClient.connect(url)
        .then(function(db){
            return db.admin().listDatabases();
        })
        .then(function(dbs){
            res.json(200, dbs);
            db.close();
        });
}

function showCollections(req, res) {
    const dbName = req.swagger.params.dbName.value;

    MongoClient.connect(url + '/' + dbName)
        .then(function(db){
            return db.collections();
        })
        .then(function(collections) {
            if (collections.length > 0){
                var collectionNames = collections.map(function(collection) {
                    return collection['s']['name'];
                });
                res.json({collections: collectionNames});
            } else {
                res.json(404, 'Database not found.');
            }
            db.close();
        });
}

function addCollection(req, res) {
    const dbName = req.swagger.params.dbName.value;
    const collectionName = req.swagger.params.collectionName.value;

    co(function*(){
        var db = yield MongoClient.connect(url+'/'+dbName);
        var collection = yield db.createCollection(collectionName);

        res.send(201, 'Collection created successfully.');
        db.close();
    });
}