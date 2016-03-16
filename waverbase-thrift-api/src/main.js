import thrift from 'thrift';
import Waverbase from '../gen-nodejs/Waverbase.js';
import { User } from '../gen-nodejs/waverbase_types.js';
var winston = require('winston');

const PORT = 9099;

const waverbaseHandler = {
  authenticate: function(username, password) {
    winston.info('Authenicate attempt', username);
    const user = new User({username: username});
    winston.info(user);
    result(null, user);
  }
}

var waverbaseServiceOptions = {
  transport: thrift.TBufferedTransport,
  protocol: thrift.TJSONProtocol,
  processor: Waverbase,
  handler: waverbaseHandler,
};

var serverOptions = {
  // Include CORS header to accept any origin.
  cors: {'*': true},
  services: {
    "/waverbase": waverbaseServiceOptions
  }
}

var server = thrift.createWebServer(serverOptions);
server.listen(PORT);
winston.info('Thrift server running on port', PORT);
