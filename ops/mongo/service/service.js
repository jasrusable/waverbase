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
	// create the disk first
	var disk = gcompute.disk(appName+'-mongo-disk');
	// since app name is unique if the disk exists that means that we have previously created the mongo server
	console.log('stuff');
	var deferred = Q.defer();
	/*disk.exists(function(err, exists) {
	    if (err) {
		deferred.reject(new Error(err));
	    } else {
		deferred.resolve(exists);
	    }
	});*/
	//deferred.promise

	Q.nfcall((callback) => disk.exists(callback))
	    .then((exists) => {
		if (exists) {
		    console.log('it exists');
		    return;
		}
		console.log('it does not exist');
		return Q.nfcall(gcompute.create,
		{
		    sizeGb: diskSize,
		    name: appName+'-mongo-disk',
		    description: 'Disk used by mongodb for app '+appName
		})
	    })
	    .then(function(err, disk, operation, apiResponse) {
		if(err) {
		    result(false, 'gcloud failed on creating disk '+err);
		    return;
		}
		console.log(disk);
		console.log(operation);
		console.log(apiResponse);
	    });
    },
    getServer(appName) {
	return 'hello world';
    }
});

server.listen(9090);

