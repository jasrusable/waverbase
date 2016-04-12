import passwordUtil from 'password-hash-and-salt';
import wrap from '../utils/wrap.js';
import { MongoClient, } from 'mongodb';

module.exports = wrap(function* (emailAddress: string, password: string): Iterable {
  winston.info(`Sign in attempt with email address ${emailAddress}`);
  const db = yield MongoClient.connect(URL);
  const users = db.collection('users');
  const sessionTokens = db.collection('sessionTokens');

  const notAuthenticatedError = new NotAuthenticatedError({errorMessage: 'No user matching that email address and password', });
  const user = yield users.findOne({emailAddress: emailAddress, });
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
});
