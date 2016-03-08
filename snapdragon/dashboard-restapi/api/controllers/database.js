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
    insertManyDocuments: insertManyDocuments,
    dropDatabase: dropDatabase,
    dropCollection: dropCollection
};

// TODO: change to generator pattern
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

// TODO: change to generator pattern
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
    const dbName = req.swagger.params.dbName.value;
    const collectionName = req.swagger.params.collectionName.value;

    co(function*(){
        var db = yield MongoClient.connect(url+'/'+dbName);
        var collection = yield db.createCollection(collectionName);

        var docs = yield collection.find().toArray();

        res.json(200, docs);
        db.close();
    });
}

function insertDocument(req, res) {
    const dbName = req.swagger.params.dbName.value;
    const collectionName = req.swagger.params.collectionName.value;
    const doc = req.swagger.params.doc.value;

    console.log(doc);

    co(function*(){
        var db = yield MongoClient.connect(url+'/'+dbName);
        var collection = yield db.createCollection(collectionName);

        yield collection.insert(doc);

        res.send(201, 'Inserted document');

        db.close();
    });
}

function insertManyDocuments(req, res) {
    const dbName = req.swagger.params.dbName.value;
    const collectionName = req.swagger.params.collectionName.value;
    const docs = req.swagger.params.docs.value;

    console.log(docs);

    co(function*(){
        var db = yield MongoClient.connect(url+'/'+dbName);
        var collection = yield db.createCollection(collectionName);

        yield collection.insertMany(docs);

        res.send(201, 'Inserted documents');

        db.close();
    });
}

function dropDatabase(req, res) {
    const dbName = req.swagger.params.dbName.value;

    co(function*() {
        var db = yield MongoClient.connect(url+'/'+dbName);

        yield db.dropDatabase();

        res.send(204, 'Dropped Database');

        db.close();
    });
}

function dropCollection(req, res) {
    const dbName = req.swagger.params.dbName.value;
    const collectionName = req.swagger.params.collectionName.value;

    co(function*() {
        var db = yield MongoClient.connect(url+'/'+dbName);
        var collection = yield db.createCollection(collectionName);

        yield collection.drop();

        res.send(204, 'Dropped Collection');

        db.close();
    });
}