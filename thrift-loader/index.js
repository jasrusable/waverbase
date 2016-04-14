var assert = require('assert');
var exec = require('child_process').exec;
var loaderUtils = require('loader-utils');
var fs = require('fs');
var glob = require('glob');
var randomString = require('randomstring');
var path = require('path');
var mkdirp = require('mkdirp');

function concatenateFileContents(files) {
  return files
  .map(function(file) {
    return fs.readFileSync(file);
  })
  .join('\n');
}

function deleteFiles(files) {
  files.forEach(function(file) {
    fs.unlinkSync(file);
  });
}

function removeImportStatements(code) {
  return code.replace(
    /^var ttypes = require\(.*\);$/m,
    '// require() types statement removed.'
  )
  .replace(
    /^var ttypes = module.exports = {};$/m,
    '// module.exports types statement removed.'
  );
}

function getPrefix(generator) {
  if (generator === 'js:node') {
    return '';
  }
  return fs.readFileSync(path.resolve(__dirname, './thrift.js'));
}

function build(temporaryDirectory, generator, callback) {
  glob(temporaryDirectory + '/**/*.js', {nonull: true}, function(error, files) {
    assert(error === null, error);
    var code = concatenateFileContents(files);
    deleteFiles(files);
    code = removeImportStatements(code);
    var prefix = getPrefix(generator);

    callback(prefix + code);
  });
}


function getTemporaryDirectory() {
  var temporaryDirectory = path.resolve(
    '/tmp/thrift-loader/',
    randomString.generate()
  );

  if (!fs.existsSync(temporaryDirectory)) {
    mkdirp(temporaryDirectory);
  }

  return temporaryDirectory;
}

module.exports = function(content, sourceMap) {
	var query = loaderUtils.parseQuery(this.query);
  this.cacheable();

  if (query.generator !== 'js:node' && query.generator !== 'js:jquery') {
    assert(false, 'Generator query paramater needs to be js:node or js:jquery.');
  }

  var temporaryDirectory = getTemporaryDirectory();

  var command = 'thrift --recurse --out ' + temporaryDirectory + ' --gen ' + query.generator + ' ' + this.resourcePath;

  var callback = this.async();

  exec(command, function(error, stdout, stderr) {
    assert(error == null, error, stdout, stderr);
    build(temporaryDirectory, query.generator, function(output) {
      callback(null, output);
    })
  });
};
