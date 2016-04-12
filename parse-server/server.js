var express = require('express');
var ParseServer = require('./parse-server/').ParseServer;

var app = express();
var api = new ParseServer({
  databaseURI: 'mongodb://localhost:27017',
  appId: 'foo',
  masterKey: 'bar',
  serverURL: '/parse',
});

// Serve the Parse API at /parse URL prefix
app.use('/parse', api);

var port = 1337;
app.listen(port, function() {
  console.log('parse-server-example running on port ' + port + '.');
});
