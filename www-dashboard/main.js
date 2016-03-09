const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/test_db';

function main(db) {
  // Do db stuff here
  console.log('Hello There!');
};


MongoClient.connect(url, function(err, db) {
    if(err) throw err;

    main(db);

    db.close();
});

// http://mongodb.github.io/node-mongodb-native/2.1/getting-started/quick-tour/

const restify = require('restify');

function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}

const server = restify.createServer();
server.get('/hello/:name', respond);

server.listen(8080, function(){
  console.log('%s listening at %s', server.name, server.url);
});