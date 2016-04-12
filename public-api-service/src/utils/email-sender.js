import assert from 'assert';
import { EmailSender, } from '!thrift-loader?generator=node!../../../email-sender-service/email-sender.thrift';

import {
  createClient,
  createConnection,
  TBufferedTransport,
  TBinaryProtocol,
} from 'thrift';


const emailSenderConnection = createConnection('email-sender-service', 9098, {
  transport: TBufferedTransport(),
  protocol: TBinaryProtocol(),
});
const emailSender = createClient(EmailSenderClient, emailSenderConnection);


emailSenderConnection.on('error', function(error: any) {
  assert(false, error);
});


module.exports = emailSender;
