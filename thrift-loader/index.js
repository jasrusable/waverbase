var assert = require('assert');
var exec = require('child_process').exec;
var jade = require('jade');
var path = require('path');
var loaderUtils = require('loader-utils');

buildClientLoader = function(locals) {
  return jade.renderFile(path.join(__dirname, './client-loader.jade'), locals);
}

module.exports = function(content, sourceMap) {
	var query = loaderUtils.parseQuery(this.query);
  this.cacheable();
  var callback = this.async();
  var command = 'thrift --recurse --gen js:jquery ' + this.resourcePath;


  exec(command, function(error, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    assert(error == null, error);
    callback(null, buildClientLoader(query));
  });
};
