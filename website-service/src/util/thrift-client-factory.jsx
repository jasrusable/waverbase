import { Thrift, } from '!exports-loader?Thrift=Thrift!../../thrift.js';

module.exports = function(service: Function, path: String): Function {
  var transport = new Thrift.TXHRTransport(path);
  var protocol  = new Thrift.TJSONProtocol(transport);
  return new service(protocol);
}
