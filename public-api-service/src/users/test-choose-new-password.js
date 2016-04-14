import chooseNewPassword from './choose-new-password.js';
import winston from 'winston';
import unwrap from '../utils/unwrap.js';
import co from 'co';
import chai from 'chai'
import passwordUtil from 'password-hash-and-salt';
import promisify from 'es6-promisify';
import databaseFactory from '../utils/database-factory.js';
import chaiAsPromised from 'chai-as-promised';
// Import specific types defined in the IDL 'public-api.thrift'.
import { TokenNotFoundError, } from '!exports-loader?TokenNotFoundError=TokenNotFoundError!thrift-loader?generator=js:node!../../../public-api-service/public-api.thrift';
chai.use(chaiAsPromised);

describe('choose-new-password', () => {
  it('Should handle missing token.', co.wrap(function*(): Promise {
    const token = 'missing-token';
    const password = 'new-password';
    return yield chai.assert.isRejected(
      unwrap(chooseNewPassword)(token, password),
      TokenNotFoundError
    );
  }))


  it('Should reset the users password.', co.wrap(function*(): Promise {
    const db = yield databaseFactory.getInstance();
    const users = db.collection('users');
    const passwordResetTokens = db.collection('passwordResetTokens');

    const userDocument = {
      emailAddress: 'some-email-address',
      passwordHash: 'some-old-hash',
    }
    yield users.insert(userDocument);

    const passwordResetTokenDocument = {
      token: 'some-token',
      userId: userDocument._id,
    }
    passwordResetTokens.insert(passwordResetTokenDocument);

    const newPassword = 'some-new-password';
    const newPasswordHash = passwordUtil(newPassword);
    yield unwrap(chooseNewPassword)(passwordResetTokenDocument.token, newPassword);

    const updatedUserDocument = yield users.findOne({_id: userDocument._id, });
    const isVerified = yield promisify(
      newPasswordHash.verifyAgainst.bind(newPasswordHash)
    )(updatedUserDocument.passwordHash);
    return chai.assert.isOk(isVerified);
  }))

  afterEach(co.wrap(function*(): Promise {
    const db = yield databaseFactory.getInstance();
    return db.dropDatabase();
  }))
});
