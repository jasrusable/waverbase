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
  emailAddress: {
    presence: true,
  },
  password: {
    presence: true,
  }
}

const waverbaseHandler = {
  signUp: co.wrap(function* (emailAddress, password, result) {
    winston.info('Sign up attempt, email address:', emailAddress);
    const validationResults = validate({
      emailAddress: emailAddress,
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
    var count = yield db.collection('users').count({emailAddress: emailAddress});
    if (count > 0) {
      result(new DuplicateUsernameError({
        errorMessage: `User with email address ${emailAddress} already exists.`,
      }));
      return;
    }
    var user = new User({emailAddress: emailAddress});
    const passwordHash = yield promisify(passwordUtil(password).hash)();
    yield collection.insert({emailAddress: emailAddress, passwordHash: passwordHash});
    result(null, user);
  }),


  signIn: function(emailAddress, password, result) {
    winston.info('Sign in attempt', emailAddress);
    const user = new User({emailAddress: emailAddress});
    const auth = new Auth({
      user: new User({emailAddress: emailAddress}),
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
