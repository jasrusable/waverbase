var Thrift = require('thrift');

module.exports = function(service, path) {
  var transport = new Thrift.TXHRTransport(path);
  var protocol  = new Thrift.TJSONProtocol(transport);
  return new service(protocol);
}
