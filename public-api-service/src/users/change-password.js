import { MongoClient, } from 'mongodb';
import winston from 'winston';
import wrap from '../utils/wrap.js';
import requiresAuth from '../utils/requires-auth.js';

module.exports = wrap(requiresAuth(function* (user: Object, newPassword: string) {
  winston.info(`Changed password for user ${JSON.stringify(user)}.`);

  const db = yield MongoClient.connect(URL);
  const users = db.collection('users');

  const passwordHash = yield promisify(passwordUtil(newPassword).hash)();

  const result = yield users.updateOne(user, {
    $set: {
      passwordHash: passwordHash,
    },
  });

  assert(result.modifiedCount === 1)
}))
