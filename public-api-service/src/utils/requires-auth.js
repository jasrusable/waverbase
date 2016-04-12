module.exports = function requiresAuth(f: Function): Function {
  const that = this;

  return function* (...args: any): Iterable {
    const token = args.shift();

    const db = yield MongoClient.connect(URL);
    const sessionTokens = db.collection('sessionTokens');
    const users = db.collection('users');

    const tokenDocument = yield sessionTokens.findOne({token: token, });

    if (tokenDocument === null) {
      throw new NotAuthenticatedError({errorMessage: 'Token not found.', });
    }

    const user = yield users.findOne({_id: tokenDocument.userId, });
    args.unshift(user);

    return yield f.apply(that, args);
  }
}
