'use strict';

const util = require('util');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';


module.exports = {
    showDatabases: showDatabases,
    showCollections: showCollections
};

function showDatabases(req, res) {
    MongoClient.connect(url)
        .then(function(db){
            return db.admin().listDatabases();
        })
        .then(function(dbs){
            res.json(dbs);
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
            if (collections.length >0){
                var collectionNames = collections.map(function(collection) {
                    return collection['s']['name'];
                });
                res.json({collections: collectionNames});
            } else {
                res.json({message: 'No such collection'});
            }
            db.close();
        });
}