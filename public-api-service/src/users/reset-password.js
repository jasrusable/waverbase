import wrap from '../utils/wrap.js';
import winston from 'winston';
import databaseFactory from '../utils/database-factory.js';
import hat from 'hat';
import promisify from 'es6-promisify'
import emailSenderFactory from '../utils/email-sender-factory.js';
import { EmailAddressNotFoundError, } from '!exports-loader?EmailAddressNotFoundError=EmailAddressNotFoundError!thrift-loader?generator=js:node!../../../public-api-service/public-api.thrift';

module.exports = wrap(function* (emailAddress: string): Iterator {
  winston.info(`Resetting password for user with email address ${emailAddress}`);
  const db = yield databaseFactory.getInstance();
  const users = db.collection('users');
  const passwordResetTokens = db.collection('passwordResetTokens');

  const user = yield users.findOne({emailAddress: emailAddress, });
  if (user === null) {
    throw new EmailAddressNotFoundError({errorMessage: 'No user with that email address exists.', });
  }

  const token = hat();
  const link = `http://localhost:8080/index.html#/choose-new-password?token=${token}`;

  yield passwordResetTokens.insert({
    token: token,
    userId: user._id,
  });

  const emailSender = emailSenderFactory.getInstance();
  yield promisify(emailSender.sendEmail).bind(emailSender)(
    'avoid3d@gmail.com',
    emailAddress,
    "Reset Waverbase password",
    `Link: ${link}.`
  );

  winston.info(`Sent password reset email with link ${link} and token ${token}`);

  return null;
});
