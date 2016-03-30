import { createClient, createWebServer, createConnection, Thrift, TBufferedTransport, TBinaryProtocol, TJSONProtocol} from 'thrift';
import { MongoClient } from 'mongodb';
import winston from 'winston';
import co from 'co';
import assert from 'assert';
import passwordUtil from 'password-hash-and-salt';
import validate from 'validate.js'
import Waverbase from '../gen-nodejs/Waverbase.js';
import EmailSender from '../gen-nodejs/EmailSender.js';
import promisify from 'es6-promisify';
import hat from 'hat';
import { User, Auth, TokenNotFoundError, DuplicateUsernameError, SignUpValidationError, NotAuthenticatedError, EmailAddressNotFoundError} from '../gen-nodejs/waverbase_types.js';

const connection = createConnection('email-sender', 9098, {
  transport: TBufferedTransport(),
  protocol: TBinaryProtocol(),
});
const emailSender = createClient(EmailSender, connection);

connection.on('error', function(error) {
  assert(false, error);
});

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
      if (error instanceof Thrift.TException) {
        resultCallback(error);
      } else {
        resultCallback(new Thrift.TException("Server side error."));
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


function requiresAuth(f) {
  const that = this;

  return function* (...args) {
    const token = args.shift();

    const db = yield MongoClient.connect(URL);
    const sessionTokens = db.collection('sessionTokens');
    const users = db.collection('users');

    const tokenDocument = yield sessionTokens.findOne({token: token});

    if (tokenDocument === null) {
      throw new NotAuthenticatedError({errorMessage: 'Token not found.'});
    }

    const user = yield users.findOne({_id: tokenDocument.userId});
    args.unshift(user);

    return yield f.apply(that, args);
  }
}

function* getSession(user) {
  const db = yield MongoClient.connect(URL);
  const sessionTokens = db.collection('sessionTokens');

  const token = hat();
  yield sessionTokens.insert({
    token: token,
    userId: user._id,
  });

  return new Auth({
    user: new User({emailAddress: user.emailAddress}),
    token: token
  });
}

const waverbaseHandler = {
  signUp: wrap(function* (emailAddress, password) {
    winston.info(`User attempted to sign up with email address ${emailAddress}`);
    const db = yield MongoClient.connect(URL);
    const users = db.collection('users');
    const verificationTokens = db.collection('verificationTokens');

    yield throwIfDuplicateUser(users, emailAddress);

    const user = new User({emailAddress: emailAddress});
    const passwordHash = yield promisify(passwordUtil(password).hash)();
    console.log(emailAddress, password, passwordHash);

    const userDocument = {
      isVerified: false,
      emailAddress: emailAddress,
      passwordHash: passwordHash,
    };

    yield users.insert(userDocument);

    winston.info(`User successfully signed up with email address ${emailAddress}`);

    const verificationTokenDocument = {
      userId: userDocument._id,
      token: hat(),
    };

    yield verificationTokens.insert(verificationTokenDocument);

    const verifyUrl = `http://localhost:8080/#verify-account?token=${verificationTokenDocument.token}`;
    winston.info(`Sent user sign up email with verify url ${verifyUrl}`);

    yield promisify(emailSender.sendEmail).bind(emailSender)(
      'avoid3d@gmail.com',
      emailAddress,
      "Welcome to Waverbase",
      `To get started please verify your email at ${verifyUrl}.`
    );

    return yield getSession(userDocument);
  }),


  verifyAccount: wrap(function* (token) {
    winston.info(`Attempting to verify account with token ${token}`);
    const db = yield MongoClient.connect(URL);
    const verificationTokens = db.collection('verificationTokens');
    const users = db.collection('users');

    const verificationToken = yield verificationTokens.findOne({token: token});
    if (verificationToken === null) {
      throw new TokenNotFoundError({errorMessage: "No record for that token."});
    }

    const result = yield users.updateOne(
      {_id: verificationToken.userId},
      {$set: {
        isVerified: true,
      }}
    );
    assert(
      result.modifiedCount == 1,
      `No user matching verificationToken ${JSON.stringify(verificationToken)}`
    );
  }),


  signIn: wrap(function* (emailAddress, password) {
    winston.info(`Sign in attempt with email address ${emailAddress}`);
    const db = yield MongoClient.connect(URL);
    const users = db.collection('users');
    const sessionTokens = db.collection('sessionTokens');

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

    return yield getSession(user);
  }),

  resetPassword: wrap(function* (emailAddress) {
    winston.info(`Resetting password for user with email address ${emailAddress}`);
    const db = yield MongoClient.connect(URL);
    const users = db.collection('users');
    const passwordResetTokens = db.collection('passwordResetTokens');

    const user = yield users.findOne({emailAddress: emailAddress});
    if (user === null) {
      throw new EmailAddressNotFoundError({errorMessage: 'No user with that email address exists.'});
    }

    const token = hat();
    const link = `http://localhost:8080/index.html#/choose-new-password?token=${token}`;

    yield passwordResetTokens.insert({
      token: token,
      userId: user._id,
    });

    yield promisify(emailSender.sendEmail).bind(emailSender)(
      'avoid3d@gmail.com',
      emailAddress,
      "Reset Waverbase password",
      `Link: ${link}.`
    );

    winston.info(`Sent password reset email with link ${link} and token ${token}`);

    return null;
  }),

  chooseNewPassword: wrap(function* (token, password) {
    winston.info(`Choosing new password for user with token ${token}.`);
    const db = yield MongoClient.connect(URL);
    const users = db.collection('users');
    const passwordResetTokens = db.collection('passwordResetTokens');

    const tokenRecord = yield passwordResetTokens.findOne({token: token});
    if (tokenRecord == null) {
      throw new TokenNotFoundError({errorMessage: "No record for that token."});
    }

    const passwordHash = yield promisify(passwordUtil(password).hash)();

    winston.info(`Updating user with id ${tokenRecord.userId}`);
    const result = yield users.updateOne(
      {_id: tokenRecord.userId},
      {$set: {
        passwordHash: passwordHash,
      }}
    );
    assert(result.modifiedCount == 1);
  }),

  changePassword: wrap(requiresAuth(function* (user, newPassword) {
    winston.info(`Changed password for user ${JSON.stringify(user)}.`);

    const db = yield MongoClient.connect(URL);
    const users = db.collection('users');

    const passwordHash = yield promisify(passwordUtil(newPassword).hash)();

    const result = yield users.updateOne(user, {
        $set: {
          passwordHash: passwordHash,
        }
      }
    );

    assert(result.modifiedCount == 1)
  })),

  createNewApp: wrap(function*(appName) {
    const db = yield MongoClient.connect(URL);
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
  transport: TBufferedTransport,
  protocol: TJSONProtocol,
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

var server = createWebServer(serverOptions);
server.listen(THRIFT_PORT);
winston.info('Thrift server running on port', THRIFT_PORT);
