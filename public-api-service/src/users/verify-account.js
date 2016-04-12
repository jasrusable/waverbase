import wrap from '../utils/wrap.js';

module.exports = wrap(function* (token: string) {
  winston.info(`Attempting to verify account with token ${token}`);
  const db = yield MongoClient.connect(URL);
  const verificationTokens = db.collection('verificationTokens');
  const users = db.collection('users');

  const verificationToken = yield verificationTokens.findOne({token: token, });
  if (verificationToken === null) {
    throw new TokenNotFoundError({errorMessage: "No record for that token.", });
  }

  const result = yield users.updateOne(
    {_id: verificationToken.userId, },
    {$set: {
      isVerified: true,
    }, }
  );
  assert(
    result.modifiedCount === 1,
    `No user matching verificationToken ${JSON.stringify(verificationToken)}`
  );
});
