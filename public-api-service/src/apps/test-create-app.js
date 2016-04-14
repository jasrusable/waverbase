import co from 'co';
import createApp from './create-app.js';
import unwrap from '../utils/unwrap.js';
import provideAuth from '../utils/provide-auth.js';
import databaseFactory from '../utils/database-factory.js';


describe('Create app', () => {
  it('Should create a new app.', co.wrap(function*() {
    const db = yield databaseFactory.getInstance();
    const users = db.collection('users');

    const userDocument = {
      emailAddress: 'some-email-address',
    }
    yield users.insert(userDocument);

    const appName = 'some-app-name';

    provideAuth(
      unwrap(createApp)(appName),
      userDocument._id
    )();
  }))
});
