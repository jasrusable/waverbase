var assert = require('assert');
var exec = require('child_process').exec;
var loaderUtils = require('loader-utils');
var fs = require('fs');
var glob = require('glob');

buildClientLoader = function(tempDir, callback) {
  glob(tempDir + '/**/*.js', {nonull: true}, function(error, files) {
    assert(error === null, error);
    var eachFilesContents = files.map(function(file) {
      return fs.readFileSync(file);
    })
    var allFilesContents = eachFilesContents.join('\n');
    var allFilesContents = allFilesContents.replace(
      /^var ttypes = require\(.*\);$/m,
      '// Require statement removed.'
    );
    const requireStatement = "var Thrift = require('thrift').Thrift\n";
    allFilesContents = requireStatement + allFilesContents;

    files.forEach(function(file) {
      fs.unlinkSync(file);
    });

    callback(allFilesContents)
  });
}

module.exports = function(content, sourceMap) {
	var query = loaderUtils.parseQuery(this.query);
  this.cacheable();

  if (query.generator !== 'node' && query.generator !== 'jquery') {
    assert(false, 'Generator query paramater needs to be node or jquery.');
  }
  var generator = query.generator == 'node' ? 'js:node,es6' : 'js:jquery,es6';

  var tempDir = '/tmp/thrift-loader' + Math.random();

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  var command = 'thrift --recurse --out ' + tempDir + ' --gen ' + generator + ' ' + this.resourcePath;

  var callback = this.async();
  exec(command, function(error, stdout, stderr) {
    console.log('Thrift gen stdout:', stdout);
    console.log('Thrift gen stderr:', stderr);
    assert(error == null, error);
    buildClientLoader(tempDir, function(output) {
      callback(null, output);
    })
  });
};
