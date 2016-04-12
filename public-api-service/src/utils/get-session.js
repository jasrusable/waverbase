module.exports = function* getSession(user: Object): Auth {
  const db = yield MongoClient.connect(URL);
  const sessionTokens = db.collection('sessionTokens');

  const token = hat();
  yield sessionTokens.insert({
    token: token,
    userId: user._id,
  });

  return new Auth({
    user: new User({emailAddress: user.emailAddress, }),
    token: token,
  });
}
