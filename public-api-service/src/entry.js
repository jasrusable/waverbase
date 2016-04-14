import {
  createWebServer,
  Thrift,
  TBufferedTransport,
  TJSONProtocol,
} from 'thrift';
import { Waverbase, } from '!thrift-loader?generator=node!../public-api.thrift';
import winston from 'winston';

const waverbaseHandler = {
  signUp: require('./users/sign-up.js'),
  changePassword: require('./users/change-password.js'),
  chooseNewPassword: require('./users/choose-new-password.js'),
  resetPassword: require('./users/reset-password.js'),
  signIn: require('./users/sign-in.js'),
  verifyAccount: require('./users/verify-account.js'),
};

var waverbaseServiceOptions = {
  transport: TBufferedTransport,
  protocol: TJSONProtocol,
  processor: Waverbase,
  handler: waverbaseHandler,
};

var serverOptions = {
  // Include CORS header to accept any origin.
  cors: {'*': true, },
  services: {
    "/waverbase": waverbaseServiceOptions,
  },
}

var server = createWebServer(serverOptions);
server.listen(process.env.PUBLIC_API_SERVICE_PORT);
winston.info('Thrift server running on port', process.env.PUBLIC_API_SERVICE_PORT);
