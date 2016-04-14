import resetPassword from './reset-password.js';
import winston from 'winston';
import { MongoClient, } from 'mongodb';
import { EmailAddressNotFoundError, } from '!exports-loader?EmailAddressNotFoundError=EmailAddressNotFoundError!thrift-loader?generator=js:node!../../../public-api-service/public-api.thrift';
import unwrap from '../utils/unwrap.js';
import co from 'co';
import databaseFactory from '../utils/database-factory.js';
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised';
import emailSenderFactory from '../utils/email-sender-factory.js';
chai.use(chaiAsPromised);

describe('reset-password', () => {
  it('Should return EmailAddressNotFoundError.', (): Promise => {
    const emailAddress = 'some-missing-email-address';
    const password = 'new-password';
    return chai.assert.isRejected(
      unwrap(resetPassword)(emailAddress, password),
      EmailAddressNotFoundError,
      'Did not raise EmailAddressNotFoundError.'
    );
  }),


  it('Should reset the users password.', co.wrap(function*(): void {
    const emailAddress = 'test-email-address';
    const password = 'new-password';
    const userDocument = {emailAddress, }

    let emailSent = false;
    emailSenderFactory.replaceConstructor((): Promise => {
      return {
        sendEmail: function(...args: Array<any>) {
          emailSent = true;
          winston.info('Attempted to send email.');
          chai.assert.equal(args[0], 'avoid3d@gmail.com');
          chai.assert.equal(args[1], 'test-email-address');
          const callback = args.pop();
          callback(null, 'success');
        },
      }
    });

    const db = yield databaseFactory.getInstance();
    const users = db.collection('users');
    yield users.insert(userDocument);

    yield unwrap(resetPassword)(emailAddress, password)

    const passwordResetTokens = db.collection('passwordResetTokens');
    chai.assert.isTrue(emailSent);
    const passwordResetTokenDocument = passwordResetTokens.findOne({
      'userId': userDocument._id,
    });

    chai.assert.isOk(passwordResetTokenDocument);
  })),


  afterEach(co.wrap(function*(): Promise {
    const db = yield databaseFactory.getInstance();
    return db.dropDatabase();
  }))
});
