import assert from 'assert';
import winston from 'winston';
import SyncFactory from './sync-factory.js';
import {
  createClient,
  createConnection,
  TBufferedTransport,
  TBinaryProtocol,
} from 'thrift';
import { EmailSenderClient, } from '!exports-loader?EmailSenderClient=EmailSenderClient!thrift-loader?generator=js:node!../../../email-sender-service/email-sender.thrift';

module.exports = new SyncFactory(function(): Object {
  winston.info('Creating new EmailSender.')
  const emailSenderConnection = createConnection(
    process.env.EMAIL_SENDER_SERVICE_HOST,
    process.env.EMAIL_SENDER_SERVICE_PORT,
    {
      transport: TBufferedTransport(),
      protocol: TBinaryProtocol(),
    }
  );

  emailSenderConnection.on('error', function(error: any) {
    assert(false, error);
  });

  return createClient(EmailSenderClient, emailSenderConnection);
})
