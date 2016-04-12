import winston from 'winston';
import { MongoClient, } from 'mongodb';
import wrap from '../utils/wrap.js';

module.exports = wrap(function* (token: string, password: string) {
  winston.info(`Choosing new password for user with token ${token}.`);
  const db = yield MongoClient.connect(URL);
  const users = db.collection('users');
  const passwordResetTokens = db.collection('passwordResetTokens');

  const tokenRecord = yield passwordResetTokens.findOne({token: token, });
  if (tokenRecord === null) {
    throw new TokenNotFoundError({errorMessage: "No record for that token.", });
  }

  const passwordHash = yield promisify(passwordUtil(password).hash)();

  winston.info(`Updating user with id ${tokenRecord.userId}`);
  const result = yield users.updateOne(
    {_id: tokenRecord.userId, },
    {$set: {
      passwordHash: passwordHash,
    }, }
  );
  assert(result.modifiedCount === 1);
});
