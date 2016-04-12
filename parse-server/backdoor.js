var MongoStorageAdapter = require('./parse-server/lib/Adapters/Storage/Mongo/MongoStorageAdapter');

adapter = new MongoStorageAdapter('mongodb://localhost:27017');
adapter.schemaCollection('').then(function(collection) {
  collection.getAllSchemas().then(function(schemas) {
    console.log(schemas);
  })
}).catch(function(error) {
  console.log(error);
});
