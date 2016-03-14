var MongoService = require('./gen-nodejs/MongoService');
var thrift = require('thrift');
var Q = require('Q');

var gcloud = require('gcloud')({
    projectId: 'api-project-1075799951054',
    keyFilename: './waverbase-b15a24492581.json'
});

var gcompute = gcloud
    .compute()
    .zone('europe-west1-b');


var server = thrift.createServer(MongoService, {
    createServer(appName, diskSize, ramSize, result) {
    },
    getServer(appName) {
	return 'hello world';
    }
});

server.listen(9090);

