import winston from 'winston';
import { MongoClient, } from 'mongodb';
import wrap from '../utils/wrap.js';
import databaseFactory from '../utils/database-factory.js';
import { TokenNotFoundError, } from '!exports-loader?TokenNotFoundError=TokenNotFoundError!thrift-loader?generator=js:node!../../../public-api-service/public-api.thrift';
import promisify from 'es6-promisify';
import passwordUtil from 'password-hash-and-salt';
import assert from 'assert';

module.exports = wrap(function* (token: string, password: string) {
  winston.info(`Choosing new password for user with token ${token}.`);
  const db = yield databaseFactory.getInstance();
  const users = db.collection('users');
  const passwordResetTokens = db.collection('passwordResetTokens');

  const passwordResetTokenDocument = yield passwordResetTokens.findOne({token: token, });
  if (passwordResetTokenDocument === null) {
    throw new TokenNotFoundError({errorMessage: "No record for that token.", });
  }

  const passwordHash = yield promisify(passwordUtil(password).hash)();

  winston.info(`Updating password for user with id ${passwordResetTokenDocument.userId}`);
  const result = yield users.updateOne(
    {_id: passwordResetTokenDocument.userId, },
    {$set: {
      passwordHash: passwordHash,
    }, }
  );
  assert(result.modifiedCount === 1);
});
