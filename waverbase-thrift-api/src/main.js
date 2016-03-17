import thrift from 'thrift';
import { MongoClient, } from 'mongodb';
import winston from 'winston';
import co from 'co';
import passwordUtil from 'password-hash-and-salt';
import validate from 'validate.js'
import Waverbase from '../gen-nodejs/Waverbase.js';
import promisify from 'es6-promisify';
import { User, DuplicateUsernameError, SignUpValidationError} from '../gen-nodejs/waverbase_types.js';

const URL = 'mongodb://localhost:27017/db';
const PORT = 9099;

var signUpConstraints = {
  username: {
    presence: true,
  },
}

const waverbaseHandler = {
  signUp: co.wrap(function* (username, password, result) {
    winston.info('Sign up attempt', username);
    const validationResults = validate({
      username: username,
      password: password,
    }, signUpConstraints);
    if (validationResults != null) {
      result(new SignUpValidationError({
        errorMessage: JSON.stringify(validationResults),
      }));
      return;
    }

    var db = yield MongoClient.connect(URL);
    var collection = yield db.createCollection('users');
    var count = yield db.collection('users').count({username: username});
    if (count > 0) {
      result(new DuplicateUsernameError({
        errorMessage: `User with username ${username} already exists.`,
      }));
      return;
    }
    var user = new User({username: username});
    const passwordHash = yield promisify(passwordUtil(password).hash)();
    yield collection.insert({username: username, passwordHash: passwordHash});
    result(null, user);
  }),


  signIn: function(username, password, result) {
    winston.info('Sign in attempt', username);
    const user = new User({username: username});
    const auth = new Auth({
      user: new User({username: username}),
      token: 'hello',
    })
    console.log(auth);
    result(null, auth);
  },
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
  },
}

var server = thrift.createWebServer(serverOptions);
server.listen(PORT);
winston.info('Thrift server running on port', PORT);
