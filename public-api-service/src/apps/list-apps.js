import wrap from '../utils/wrap.js';


module.exports = wrap(requiresAuth(function* (user: User): Array<App> {
  const db = yield MongoClient.connect(URL);
  const apps = db.collection('apps');

  const appDocuments = yield apps.find({_id: {$in: user.apps || [], }, }).toArray();
  return appDocuments.map((appDocument: Object) => new App({name: appDocument.name, }));
}));
