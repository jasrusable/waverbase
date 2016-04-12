import wrap from '../utils/wrap.js';


module.exports = wrap(requiresAuth(function* (user: User, appName: string) {
  const db = yield MongoClient.connect(URL);
  const apps = db.collection('apps');
  const users = db.collection('users');
  winston.info(`User ${user.emailAddress} deleting ${appName}`);

  //TODO: Only remove apps that /this/ user owns with this app name.
  const appDocument = yield apps.findOne({name: appName, });

  yield apps.remove({_id: appDocument._id, });
  yield users.update(
    {
    _id: user._id,
    },
    {
      $pull: {
        apps: appDocument._id,
      },
    }
  );
}));
