import resetPassword from './reset-password';
import winston from 'winston';
import { MongoClient, } from 'mongodb';
import { EmailAddressNotFoundError, } from '!exports-loader?EmailAddressNotFoundError=EmailAddressNotFoundError!thrift-loader?generator=node!../../../public-api-service/public-api.thrift';
import unwrap from '../utils/unwrap.js';
import getDatabase from '../utils/db.js';
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

describe('reset-password', () => {
  it('Should return EmailAddressNotFoundError.', () => {
    const emailAddress = 'some-missing-email-address';
    const password = 'new-password';
    const promise = unwrap(resetPassword)(emailAddress, password);
    return chai.assert.isRejected(
      promise,
      EmailAddressNotFoundError,
      'Did not raise EmailAddressNotFoundError.'
    );
  }),
  it('Should reset the users password.', () => {
    const emailAddress = 'test-email-address';
    const password = 'new-password';
    const userDocument = {emailAddress, }

    const URL = 'mongodb://localhost:27017/db';
    return MongoClient.connect(URL).then((db) => {
      const users = db.collection('users');
      return users.insert(userDocument).then(() => {
        const promise = unwrap(resetPassword)(emailAddress, password)
        return chai.assert.becomes(promise, null);
      });
    });
  }),
  it('Should do some other awesome stuff.', () => {
  })
});
