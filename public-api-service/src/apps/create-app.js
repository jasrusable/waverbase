import wrap from '../utils/wrap.js';
import {
  App,
} from '../gen-nodejs/public-api_types.js';



module.exports = requiresAuth(wrap(function*(user: string, name: string): App {
  winston.info(
    `Creating new app for ${user.emailAddress} with appName ${appName}`
  );
  const db = yield MongoClient.connect(URL);
  const apps = db.collection('apps');
  const users = db.collection('users');

  const appDocument = {
    name: appName,
  };
  yield apps.insert(appDocument);

  const result = yield users.updateOne(user, {
      $push: {
        apps: appDocument._id,
      },
    }
  );
  return new App({name: appDocument.name, });
}));
