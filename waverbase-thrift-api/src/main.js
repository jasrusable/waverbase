import thrift from 'thrift';
import { MongoClient } from 'mongodb';
import winston from 'winston';
import co from 'co';
import passwordUtil from 'password-hash-and-salt';
import validate from 'validate.js'
import Waverbase from '../gen-nodejs/Waverbase.js';
import promisify from 'es6-promisify';
import hat from 'hat';
import { User, Auth, DuplicateUsernameError, SignUpValidationError, NotAuthenticatedError, EmailAddressNotFoundError} from '../gen-nodejs/waverbase_types.js';

const URL = 'mongodb://mongo-dev:27017/db';
const THRIFT_PORT = 9099;

var signUpConstraints = {
  emailAddress: {
    presence: true
  },
  password: {
    presence: true
  }
}

function wrap(f) {
  const that = this;

  return function(...args) {
    const resultCallback = args.pop();

    function wrapped() {
      return f.apply(that, args);
    }

    co(wrapped).then(function(result) {
       resultCallback(null, result);
    }).catch(function(error) {
      console.log('ERROR:', error);
      console.log('STACKTRACE:', error.stack);
      if (error instanceof thrift.Thrift.TException) {
        resultCallback(error);
      } else {
        resultCallback(new thrift.Thrift.TException("Server side error."));
      }
    });
  }
}

function* throwIfDuplicateUser(users, emailAddress) {
    const count = yield users.count({emailAddress: emailAddress});
    if (count > 0) {
      throw new DuplicateUsernameError({
        errorMessage: `User with email address ${emailAddress} already exists.`
      });
    }
}

const waverbaseHandler = {
  signUp: wrap(function* (emailAddress, password) {
    winston.info(`User attempted to sign up with email address ${emailAddress}`);
    const db = yield MongoClient.connect(URL);
    const users = db.collection('users');

    yield throwIfDuplicateUser(users, emailAddress);

    const user = new User({emailAddress: emailAddress});
    const passwordHash = yield promisify(passwordUtil(password).hash)();
    console.log(emailAddress, password, passwordHash);

    yield users.insert({emailAddress: emailAddress, passwordHash: passwordHash});
    winston.info(`User successfully signed up with email address ${emailAddress}`);

    return new Auth({
      user: user,
      token: 'hello'
    });
  }),


  signIn: wrap(function* (emailAddress, password) {
    winston.info(`Sign in attempt with email address ${emailAddress}`);
    const db = yield MongoClient.connect(URL);
    const users = db.collection('users');

    const notAuthenticatedError = new NotAuthenticatedError({errorMessage: 'No user matching that email address and password'});
    const user = yield users.findOne({emailAddress: emailAddress});
    if (user === null) {
      throw notAuthenticatedError;
    }

    const passwordHash = passwordUtil(password);
    const verified = yield promisify(
      passwordHash.verifyAgainst.bind(passwordHash)
    )(user.passwordHash);

    if (!verified) {
      throw notAuthenticatedError;
    }

    return new Auth({
      user: new User({emailAddress: emailAddress}),
      token: 'hello'
    });
  }),

  resetPassword: wrap(function* (emailAddress) {
    winston.info(`Resetting password for user with email address ${emailAddress}`);
    const db = yield MongoClient.connect(URL);
    const users = db.collection('users');

    const user = yield users.findOne({emailAddress: emailAddress});
    if (user === null) {
      throw new EmailAddressNotFoundError({errorMessage: 'No user with that email address exists.'});
    }

    const token = hat();
    const link = 'http://localhost:8080/webpack-dev-server/#/choose-new-password';

    winston.info(`Sent password reset email with link ${link} and token ${token}`);

    return null;
  }),

  listDatabases: wrap(function*(instanceUrl) {
    const db = yield MongoClient.connect(instanceUrl);
    const dbs = yield db.admin().listDatabases();

    db.close();
    return JSON.stringify(dbs);
  }),

  findDocuments: wrap(function* (instanceUrl, database, collection, options) {
    const db = yield MongoClient.connect(instanceUrl + '/' + database);
    const col = db.collection(collection);

    const filter = options.query ? JSON.parse(options.query.filter) : {};
    const fields = options.query ? JSON.parse(options.query.fields) : {};
    const skip = options.skip ? options.skip : 0;

    p = col.find(filter, fields).skip(skip);
    if (options.limit) {
      p.limit(options.limit);
    }

    const docs = yield p.toArray();

    db.close();

    return JSON.stringify(docs);
  }),

  updateDocuments: wrap(function* (instanceUrl, database, collection, selector, update) {
    const db = yield MongoClient.connect(instanceUrl + '/' + database);
    const col = db.collection(collection);

    yield col.updateMany(JSON.parse(selector), JSON.parse(update));




    return null;
  }),

  insertDocument: wrap(function* (instanceUrl, database, collection, doc) {
    const db = yield MongoClient.connect(instanceUrl + '/' + database);
    const col = db.collection(collection);

    yield col.insert(JSON.parse(doc));

    db.close();
  }),

  deleteDocuments: wrap(function* (instanceUrl, database, collection, filter) {
    const db = yield MongoClient.connect(instanceUrl + '/' + database);
    const col = db.collection(collection);

    col.deleteMany(JSON.parse(filter));

    db.close();

    return null;
  })
}

var waverbaseServiceOptions = {
  transport: thrift.TBufferedTransport,
  protocol: thrift.TJSONProtocol,
  processor: Waverbase,
  handler: waverbaseHandler
};

var serverOptions = {
  // Include CORS header to accept any origin.
  cors: {'*': true},
  services: {
    "/waverbase": waverbaseServiceOptions
  }
}

var server = thrift.createWebServer(serverOptions);
server.listen(THRIFT_PORT);
winston.info('Thrift server running on port', THRIFT_PORT);
