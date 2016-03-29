var thrift = require('thrift');

var AppService = require('../../gen-nodejs/AppService');
var ttypes = require('../../gen-nodejs/app_types');

var process = require('process');

function getAppService() {
    var appServicePort = process.env.APP_SERVICE_SERVICE_PORT;
    var appServiceHost = process.env.APP_SERVICE_SERVICE_HOST;

    if (!appServicePort || !appServiceHost) {
	console.error('We do not have app service host or port');
	return null;
    }

    var transport = thrift.TBufferedTransport();
    var protocol = thrift.TBinaryProtocol();

    var connection = thrift.createConnection(
	appServiceHost,
	appServicePort,
	{
	    transport: transport,
	    protocol: protocol
	}
    );
    return thrift.createClient(AppService, connection);
}

function setAppMongoPassword(password) {
    var appName = process.env.APP_NAME;
    var creator = process.env.CREATOR_NAME;

    var service = getAppService();
    return service.set_mongo_password(
	appName,
	creator,
	password,
        function(err, result) {
	    console.log(err);
	    console.log(result);
	});
}

module.exports = {
    setAppMongoPassword: setAppMongoPassword
};
