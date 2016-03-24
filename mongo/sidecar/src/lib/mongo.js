var Db = require('mongodb').Db;
var MongoServer = require('mongodb').Server;
var async = require('async');
var crypto = require('crypto');

var AppService = require('./app_service');

var localhost = '127.0.0.1'; //Can access mongo as localhost from a sidecar

var getDb = function(host, done) {
    //If they called without host like getDb(function(err, db) { ... });
    if (arguments.length === 1) {
	      if (typeof arguments[0] === 'function') {
	          done = arguments[0];
	          host = localhost;
	      }
	      else {
	          throw new Error('getDb illegal invocation. User either getDb(\'hostAddr\', function(err, db) { ... }) OR getDb(function(err, db) { ... })');
	      }
    }

    host = host || localhost;
    var mongoDb = new Db(
	      'local',
	      new MongoServer(host, 27017),
        {
	          authSource: 'admin'
	      });
    mongoDb.open(function (err, db) {
	      if (err) {
	          return done(err);
	      }

	      return done(null, db);
    });
};

var replSetGetConfig = function(db, done) {
    db.admin().command({ replSetGetConfig: 1 }, {}, function (err, results) {
	      if (err) {
	          return done(err);
	      }

	      return done(null, results.config);
    });
};

var replSetGetStatus = function(db, done) {
    db.admin().command({ replSetGetStatus: {} }, {}, function (err, results) {
	      if (err) {
	          return done(err);
	      }

	      return done(null, results);
    });
};

var createAdminUser = function(db) {
    var password = crypto.randomBytes(16).toString('base64');

    return db.admin().addUser(
	      'waverbase',
	      password,
	      {
            roles: [{role:"root", db:"admin"}]
	      }
    ).then(function(result) {
	      return db.admin().authenticate('waverbase', password);
    }).then(function(result) {
	      // send password to thrift
	      return AppService.setAppMongoPassword(password);
    });
}

var initReplSet = function(db, hostIpAndPort, done) {
    console.log('initReplSet', hostIpAndPort);

    createAdminUser(db)
        .then(function(result) {
	          console.log('Created admin user and sent it to app service');
	          return db.admin().command({ replSetInitiate: {
	              _id: 'parse',
	              version: 1,
	              members: [{_id: 0, host: hostIpAndPort}]
	          }}, {});
        }).then(function (result) {
	          //We need to hack in the fix where the host is set to the hostname which isn't reachable from other hosts
	          replSetGetConfig(db, function(err, config) {
	              if (err) {
		                return done(err);
	              }
	              console.log('got config');

	              config.members[0].host = hostIpAndPort;
	              async.retry({times: 20, interval: 500}, function(callback) {
		                replSetReconfig(db, config, false, callback);
	              }, function(err, results) {
		                if (err) {
		                    return done(err);
		                }

		                return done();
	              });
	          });
        }).catch(function(err) {
	          done(err);
        });
};

var replSetReconfig = function(db, config, force, done) {
    console.log('replSetReconfig', config);

    config.version++;

    db.admin().command({ replSetReconfig: config, force: force }, {}, function (err) {
	      if (err) {
	          return done(err);
	      }

	      return done();
    });
};

var addNewReplSetMembers = function(db, addrToAdd, addrToRemove, shouldForce, done) {
    replSetGetConfig(db, function(err, config) {
	      if (err) {
	          return done(err);
	      }

	      addNewMembers(config, addrToAdd);

	      removeDeadMembers(config, addrToRemove);

	      replSetReconfig(db, config, shouldForce, done);
    });
};

var addNewMembers = function(config, addrsToAdd) {
    if (!addrsToAdd || !addrsToAdd.length) return;

    //Follows what is basically in mongo's rs.add function
    var max = 0;

    for (var j in config.members) {
	      if (config.members[j]._id > max) {
	          max = config.members[j]._id;
	      }
    }

    for (var i in addrsToAdd) {
	      var cfg = {
	          _id: ++max,
	          host: addrsToAdd[i]
	      };

	      config.members.push(cfg);
    }
};

var removeDeadMembers = function(config, addrsToRemove) {
    if (!addrsToRemove || !addrsToRemove.length) return;

    for (var i in addrsToRemove) {
	      var addrToRemove = addrsToRemove[i];
	      for (var j in config.members) {
	          var member = config.members[j];
	          if (member.host === addrToRemove) {
		            config.members.splice(j, 1);
		            break;
	          }
	      }
    }
};

var isInReplSet = function(ip, done) {
    getDb(ip, function(err, db) {
	      if (err) {
	          return done(err);
	      }

	      replSetGetConfig(db, function(err, config) {
	          db.close();
	          if (!err && config) {
		            done(null, true);
	          }
	          else {
		            done(null, false);
	          }
	      });
    });
};

module.exports = {
    getDb: getDb,
    replSetGetStatus: replSetGetStatus,
    initReplSet: initReplSet,
    addNewReplSetMembers: addNewReplSetMembers,
    isInReplSet: isInReplSet
};
