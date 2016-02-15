var MongoService = require('./gen-nodejs/MongoService');
var thrift = require('thrift');


var server = thrift.createServer(MongoService, {
    createServer: function(appName, diskSize, ramSize) {
    },
    getServer: function(appName) {
	return 'hello world';
    }
});

server.listen(9090);
