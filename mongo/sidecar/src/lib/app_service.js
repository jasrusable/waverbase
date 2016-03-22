var thrift = require('thrift');
var ThriftTransports = require('thrift/transport');
var ThriftProtocols = require('thrift/protocol');

var AppService = require('../../gen-nodejs/AppService');
var ttypes = require('../../gen-nodejs/app_types');

var process = require('process');

function setAppMongoPassword(password) {
    var appName = process.env.APP_NAME;
    var creator = process.env.CREATOR_NAME;
}
