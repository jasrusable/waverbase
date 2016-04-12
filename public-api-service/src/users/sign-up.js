import passwordUtil from 'password-hash-and-salt';
import validate from 'validate.js'
import promisify from 'es6-promisify';
import winston from 'winston';
import hat from 'hat';
import { MongoClient, } from 'mongodb';
import wrap from '../utils/wrap.js';
import throwIfDuplicateUser from '../utils/throw-if-duplicate-user.js'

var signUpConstraints = {
  emailAddress: {
    presence: true,
  },
  password: {
    presence: true,
  },
}

module.exports = wrap(function* (emailAddress: String, password: String): Iterable {
  winston.info(`User attempted to sign up with email address ${emailAddress}`);
  const db = yield MongoClient.connect(URL);
  const users = db.collection('users');
  const verificationTokens = db.collection('verificationTokens');

  yield throwIfDuplicateUser(users, emailAddress);

  const user = new User({emailAddress: emailAddress, });
  const passwordHash = yield promisify(passwordUtil(password).hash)();

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
});
