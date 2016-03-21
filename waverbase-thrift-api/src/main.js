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

function wrap(f) {
  const that = this;
  function wrapped(...args) {
    return f.apply(that, args);
  }

  return function(...args) {
    const resultCallback = args.pop();
    co(wrapped).then(function(result) {
       console.log('sucess stage b', result);
       resultCallback(null, result);
    }).catch(function(error) {
      console.log('error stage b', error.stack);
      resultCallback(error);
    });
  }
}

function callbackBasedFunction(a, b, callback) {
  callback(null, a + b);
};

const waverbaseHandler = {
  signUp: wrap(function* (emailAddress, password) {
    return new User({emailAddress: 'hello'});

    throw new DuplicateUsernameError({
      errorMessage: `User with email address ${emailAddress} already exists.`,
    });

    var db = yield MongoClient.connect(URL);
    var collection = yield db.createCollection('users');
    var count = yield db.collection('users').count({emailAddress: emailAddress});

    if (count > 0) {
      throw new DuplicateUsernameError({
        errorMessage: `User with email address ${emailAddress} already exists.`,
      });
    }
    var user = new User({emailAddress: emailAddress});
    const passwordHash = yield promisify(passwordUtil(password).hash)();
    yield collection.insert({emailAddress: emailAddress, passwordHash: passwordHash});
    return user;
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
