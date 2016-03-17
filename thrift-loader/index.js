var assert = require('assert');
var exec = require('child_process').exec;
var loaderUtils = require('loader-utils');

buildClientLoader = function(service) {
  var requireService = "require('../waverbase-www/gen-js/" + service + ".js')";
  var requireTypes = "require('../waverbase-www/gen-js/"
    + service.toLowerCase() + "_types.js')";

  return "module.exports = jQuery.extend("
    + requireService + ", " + requireTypes + ");";
}

module.exports = function(content, sourceMap) {
	var query = loaderUtils.parseQuery(this.query);
  this.cacheable();
  var callback = this.async();
  var command = '../thrift/compiler/cpp/thrift --recurse --gen js:jquery,es6 ' + this.resourcePath;

  exec(command, function(error, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    assert(error == null, error);
    callback(null, buildClientLoader(query.service));
  });
};
