'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
const util = require('util');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/waverbase';

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
module.exports = {
  getCollectionNames: getCollectionNames,
  getCollection: getCollection
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function getCollectionNames(req, res) {
  MongoClient.connect(url, function(err, db) {
    if(err) throw err;

    db.collection('schemas').find({}, {_id:0, name:1}).toArray(function(err, docs) {
      if(err) throw err;

      const collections = [];

      for (var i = 0; i < docs.length; ++i){
        collections.push(docs[i]['name']);
      }

      res.json({collections: collections});
    });
  });
}

/*
Functions in a127 controllers used for operations should take two parameters:

Param 1: a handle to the request object
Param 2: a handle to the response object
*/
function getCollection(req, res) {
  const name = req.swagger.params.name.value;

  // http://mongodb.github.io/node-mongodb-native/2.1/reference/crud/
  MongoClient.connect(url, function(err, db) {
    if(err) throw err;

    db.collection('schemas').find({name: name}, {_id:0}).toArray(function(err, docs) {
      if(err) throw err;

      if (docs.length > 0) {
        // If this database exists get and return its meta data.
          res.json({
            name: name,
            collectionSchema: docs[0]['schema'],
            size: 0
          });
      } else {
        // If the collection does not exist return an error
        res.json({
          message: "Requested collection does not exist."
        });
      }

      db.close();
    });
  });
}