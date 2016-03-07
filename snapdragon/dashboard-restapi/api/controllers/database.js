'use strict';

// TODO: remove this import
const util = require('util');
const MongoClient = require('mongodb').MongoClient;
const co = require('co');
const url = 'mongodb://localhost:27017';

module.exports = {
    showDatabases: showDatabases,
    showCollections: showCollections,
    addCollection: addCollection,
    addDatabase: addDatabase,
    getCollection: getCollection,
    findDocument: findDocument,
    insertDocument: insertDocument,
    insertManyDocuments: insertManyDocuments
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

function addDatabase(req, res) {
    const dbName = req.swagger.params.dbName.value;

    co(function*(){
        var db = yield MongoClient.connect(url+'/'+dbName);
        var collection = yield db.createCollection('test');
        yield collection.drop();
        res.send(201, 'Created a new Mongo database.');
        db.close();
    });
}

function getCollection(req, res) {
    const dbName = req.swagger.params.dbName.value;
    const collectionName = req.swagger.params.collectionName.value;

    co(function*(){
        var db = yield MongoClient.connect(url+'/'+dbName);
        var collection = yield db.createCollection(collectionName);

        // Collect the meta data
        var stats = yield collection.stats();

        res.send(
            200, 
            {
                stats: stats
            }
        );
        db.close();
    });
}

function findDocument(req, res) {

}

function insertDocument(req, res) {

}

function insertManyDocuments(req, res) {

}