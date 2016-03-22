var mongo = require('./lib/mongo');

mongo.getDb(function(err, db) {
    console.log('got db');
    mongo.initReplSet(db, '127.0.0.1:27017', function(err, result) {
	console.log('everything completed');
    });
});
