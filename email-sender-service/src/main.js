import Mailgun from 'mailgun-js';
import thrift from 'thrift';
import promisify from 'es6-promisify';
import EmailSender from '../gen-nodejs/EmailSender.js';
import winston from 'winston';
import assert from 'assert';

const THRIFT_PORT = 9098;
const API_KEY = 'key-18acefbb0db248da44accc2018281765';
const DOMAIN = 'sandboxa96b81d3f5644263a37223d4acc98058.mailgun.org';

const mailgun = Mailgun({apiKey: API_KEY, domain: DOMAIN});

const handler = {
  sendEmail: function(fromAddress, toAddress, subject, body, result) {
    winston.info(`Sending email from ${fromAddress} to ${toAddress}`);
    const messages = mailgun.messages();
    promisify(messages.send).bind(messages)({
      to: toAddress,
      from: fromAddress,
      subject: subject,
      text: body,
    }).then(function(body) {
      winston.info(body);
      result(null, null);
    }).catch(function(error) {
      winston.error(error);
      result(null, error);
    })
  }
};

var server = thrift.createServer(EmailSender, handler);

server.listen(THRIFT_PORT);
winston.info('Thrift server running on port', THRIFT_PORT);
