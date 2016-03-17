require("source-map-support").install();
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(2);


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("babel-polyfill");

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _thrift = __webpack_require__(3);
	
	var _thrift2 = _interopRequireDefault(_thrift);
	
	var _mongodb = __webpack_require__(4);
	
	var _winston = __webpack_require__(5);
	
	var _winston2 = _interopRequireDefault(_winston);
	
	var _co = __webpack_require__(6);
	
	var _co2 = _interopRequireDefault(_co);
	
	var _passwordHashAndSalt = __webpack_require__(7);
	
	var _passwordHashAndSalt2 = _interopRequireDefault(_passwordHashAndSalt);
	
	var _validate = __webpack_require__(8);
	
	var _validate2 = _interopRequireDefault(_validate);
	
	var _Waverbase = __webpack_require__(9);
	
	var _Waverbase2 = _interopRequireDefault(_Waverbase);
	
	var _es6Promisify = __webpack_require__(11);
	
	var _es6Promisify2 = _interopRequireDefault(_es6Promisify);
	
	var _waverbase_types = __webpack_require__(10);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var URL = 'mongodb://localhost:27017/db';
	var PORT = 9099;
	
	var signUpConstraints = {
	  username: {
	    presence: true
	  }
	};
	
	function toIdentityObject() {
	  var object = {};
	
	  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	    args[_key] = arguments[_key];
	  }
	
	  for (element in args) {
	    object[element] = element;
	  }
	  return object;
	}
	
	var waverbaseHandler = {
	  signUp: _co2.default.wrap(regeneratorRuntime.mark(function _callee(username, password, result) {
	    var validationResults, db, collection, count, user, passwordHash;
	    return regeneratorRuntime.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            _winston2.default.info('Sign up attempt', username);
	            validationResults = (0, _validate2.default)(toIdentityObject(username, password), signUpConstraints);
	
	            if (!(validationResults != null)) {
	              _context.next = 5;
	              break;
	            }
	
	            result(new _waverbase_types.SignUpValidationError({
	              errorMessage: JSON.stringify(validationResults)
	            }));
	            return _context.abrupt('return');
	
	          case 5:
	            console.log('ehl');
	
	            _context.next = 8;
	            return _mongodb.MongoClient.connect(URL);
	
	          case 8:
	            db = _context.sent;
	            _context.next = 11;
	            return db.createCollection('users');
	
	          case 11:
	            collection = _context.sent;
	            _context.next = 14;
	            return db.collection('users').count({ username: username });
	
	          case 14:
	            count = _context.sent;
	
	            if (!(count > 0)) {
	              _context.next = 18;
	              break;
	            }
	
	            result(new _waverbase_types.DuplicateUsernameError({
	              errorMessage: 'User with username ' + username + ' already exists.'
	            }));
	            return _context.abrupt('return');
	
	          case 18:
	            user = new _waverbase_types.User({ username: username });
	            _context.next = 21;
	            return (0, _es6Promisify2.default)((0, _passwordHashAndSalt2.default)(password).hash)();
	
	          case 21:
	            passwordHash = _context.sent;
	            _context.next = 24;
	            return collection.insert({ username: username, passwordHash: passwordHash });
	
	          case 24:
	            result(null, user);
	
	          case 25:
	          case 'end':
	            return _context.stop();
	        }
	      }
	    }, _callee, this);
	  })).catch(function (err) {
	    console.log(err.stack);
	  }),
	
	  signIn: function signIn(username, password, result) {
	    _winston2.default.info('Sign in attempt', username);
	    var user = new _waverbase_types.User({ username: username });
	    var auth = new Auth({
	      user: new _waverbase_types.User({ username: username }),
	      token: 'hello'
	    });
	    console.log(auth);
	    result(null, auth);
	  }
	};
	
	var waverbaseServiceOptions = {
	  transport: _thrift2.default.TBufferedTransport,
	  protocol: _thrift2.default.TJSONProtocol,
	  processor: _Waverbase2.default,
	  handler: waverbaseHandler
	};
	
	var serverOptions = {
	  // Include CORS header to accept any origin.
	  cors: { '*': true },
	  services: {
	    "/waverbase": waverbaseServiceOptions
	  }
	};
	
	var server = _thrift2.default.createWebServer(serverOptions);
	server.listen(PORT);
	_winston2.default.info('Thrift server running on port', PORT);

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("thrift");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("mongodb");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("winston");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("co");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("password-hash-and-salt");

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("validate.js");

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	//
	// Autogenerated by Thrift Compiler (0.9.1)
	//
	// DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
	//
	var Thrift = __webpack_require__(3).Thrift;
	
	var ttypes = __webpack_require__(10);
	//HELPER FUNCTIONS AND STRUCTURES
	
	Waverbase_signUp_args = function(args) {
	  this.username = null;
	  this.password = null;
	  if (args) {
	    if (args.username !== undefined) {
	      this.username = args.username;
	    }
	    if (args.password !== undefined) {
	      this.password = args.password;
	    }
	  }
	};
	Waverbase_signUp_args.prototype = {};
	Waverbase_signUp_args.prototype.read = function(input) {
	  input.readStructBegin();
	  while (true)
	  {
	    var ret = input.readFieldBegin();
	    var fname = ret.fname;
	    var ftype = ret.ftype;
	    var fid = ret.fid;
	    if (ftype == Thrift.Type.STOP) {
	      break;
	    }
	    switch (fid)
	    {
	      case 1:
	      if (ftype == Thrift.Type.STRING) {
	        this.username = input.readString();
	      } else {
	        input.skip(ftype);
	      }
	      break;
	      case 2:
	      if (ftype == Thrift.Type.STRING) {
	        this.password = input.readString();
	      } else {
	        input.skip(ftype);
	      }
	      break;
	      default:
	        input.skip(ftype);
	    }
	    input.readFieldEnd();
	  }
	  input.readStructEnd();
	  return;
	};
	
	Waverbase_signUp_args.prototype.write = function(output) {
	  output.writeStructBegin('Waverbase_signUp_args');
	  if (this.username !== null && this.username !== undefined) {
	    output.writeFieldBegin('username', Thrift.Type.STRING, 1);
	    output.writeString(this.username);
	    output.writeFieldEnd();
	  }
	  if (this.password !== null && this.password !== undefined) {
	    output.writeFieldBegin('password', Thrift.Type.STRING, 2);
	    output.writeString(this.password);
	    output.writeFieldEnd();
	  }
	  output.writeFieldStop();
	  output.writeStructEnd();
	  return;
	};
	
	Waverbase_signUp_result = function(args) {
	  this.success = null;
	  this.duplicateUsernameError = null;
	  this.signUpValidationError = null;
	  if (args instanceof ttypes.DuplicateUsernameError) {
	    this.duplicateUsernameError = args;
	    return;
	  }
	  if (args instanceof ttypes.SignUpValidationError) {
	    this.signUpValidationError = args;
	    return;
	  }
	  if (args) {
	    if (args.success !== undefined) {
	      this.success = args.success;
	    }
	    if (args.duplicateUsernameError !== undefined) {
	      this.duplicateUsernameError = args.duplicateUsernameError;
	    }
	    if (args.signUpValidationError !== undefined) {
	      this.signUpValidationError = args.signUpValidationError;
	    }
	  }
	};
	Waverbase_signUp_result.prototype = {};
	Waverbase_signUp_result.prototype.read = function(input) {
	  input.readStructBegin();
	  while (true)
	  {
	    var ret = input.readFieldBegin();
	    var fname = ret.fname;
	    var ftype = ret.ftype;
	    var fid = ret.fid;
	    if (ftype == Thrift.Type.STOP) {
	      break;
	    }
	    switch (fid)
	    {
	      case 0:
	      if (ftype == Thrift.Type.STRUCT) {
	        this.success = new ttypes.User();
	        this.success.read(input);
	      } else {
	        input.skip(ftype);
	      }
	      break;
	      case 1:
	      if (ftype == Thrift.Type.STRUCT) {
	        this.duplicateUsernameError = new ttypes.DuplicateUsernameError();
	        this.duplicateUsernameError.read(input);
	      } else {
	        input.skip(ftype);
	      }
	      break;
	      case 2:
	      if (ftype == Thrift.Type.STRUCT) {
	        this.signUpValidationError = new ttypes.SignUpValidationError();
	        this.signUpValidationError.read(input);
	      } else {
	        input.skip(ftype);
	      }
	      break;
	      default:
	        input.skip(ftype);
	    }
	    input.readFieldEnd();
	  }
	  input.readStructEnd();
	  return;
	};
	
	Waverbase_signUp_result.prototype.write = function(output) {
	  output.writeStructBegin('Waverbase_signUp_result');
	  if (this.success !== null && this.success !== undefined) {
	    output.writeFieldBegin('success', Thrift.Type.STRUCT, 0);
	    this.success.write(output);
	    output.writeFieldEnd();
	  }
	  if (this.duplicateUsernameError !== null && this.duplicateUsernameError !== undefined) {
	    output.writeFieldBegin('duplicateUsernameError', Thrift.Type.STRUCT, 1);
	    this.duplicateUsernameError.write(output);
	    output.writeFieldEnd();
	  }
	  if (this.signUpValidationError !== null && this.signUpValidationError !== undefined) {
	    output.writeFieldBegin('signUpValidationError', Thrift.Type.STRUCT, 2);
	    this.signUpValidationError.write(output);
	    output.writeFieldEnd();
	  }
	  output.writeFieldStop();
	  output.writeStructEnd();
	  return;
	};
	
	Waverbase_signIn_args = function(args) {
	  this.username = null;
	  this.password = null;
	  if (args) {
	    if (args.username !== undefined) {
	      this.username = args.username;
	    }
	    if (args.password !== undefined) {
	      this.password = args.password;
	    }
	  }
	};
	Waverbase_signIn_args.prototype = {};
	Waverbase_signIn_args.prototype.read = function(input) {
	  input.readStructBegin();
	  while (true)
	  {
	    var ret = input.readFieldBegin();
	    var fname = ret.fname;
	    var ftype = ret.ftype;
	    var fid = ret.fid;
	    if (ftype == Thrift.Type.STOP) {
	      break;
	    }
	    switch (fid)
	    {
	      case 1:
	      if (ftype == Thrift.Type.STRING) {
	        this.username = input.readString();
	      } else {
	        input.skip(ftype);
	      }
	      break;
	      case 2:
	      if (ftype == Thrift.Type.STRING) {
	        this.password = input.readString();
	      } else {
	        input.skip(ftype);
	      }
	      break;
	      default:
	        input.skip(ftype);
	    }
	    input.readFieldEnd();
	  }
	  input.readStructEnd();
	  return;
	};
	
	Waverbase_signIn_args.prototype.write = function(output) {
	  output.writeStructBegin('Waverbase_signIn_args');
	  if (this.username !== null && this.username !== undefined) {
	    output.writeFieldBegin('username', Thrift.Type.STRING, 1);
	    output.writeString(this.username);
	    output.writeFieldEnd();
	  }
	  if (this.password !== null && this.password !== undefined) {
	    output.writeFieldBegin('password', Thrift.Type.STRING, 2);
	    output.writeString(this.password);
	    output.writeFieldEnd();
	  }
	  output.writeFieldStop();
	  output.writeStructEnd();
	  return;
	};
	
	Waverbase_signIn_result = function(args) {
	  this.success = null;
	  this.e = null;
	  if (args instanceof ttypes.NotAuthorisedError) {
	    this.e = args;
	    return;
	  }
	  if (args) {
	    if (args.success !== undefined) {
	      this.success = args.success;
	    }
	    if (args.e !== undefined) {
	      this.e = args.e;
	    }
	  }
	};
	Waverbase_signIn_result.prototype = {};
	Waverbase_signIn_result.prototype.read = function(input) {
	  input.readStructBegin();
	  while (true)
	  {
	    var ret = input.readFieldBegin();
	    var fname = ret.fname;
	    var ftype = ret.ftype;
	    var fid = ret.fid;
	    if (ftype == Thrift.Type.STOP) {
	      break;
	    }
	    switch (fid)
	    {
	      case 0:
	      if (ftype == Thrift.Type.STRUCT) {
	        this.success = new ttypes.Auth();
	        this.success.read(input);
	      } else {
	        input.skip(ftype);
	      }
	      break;
	      case 1:
	      if (ftype == Thrift.Type.STRUCT) {
	        this.e = new ttypes.NotAuthorisedError();
	        this.e.read(input);
	      } else {
	        input.skip(ftype);
	      }
	      break;
	      default:
	        input.skip(ftype);
	    }
	    input.readFieldEnd();
	  }
	  input.readStructEnd();
	  return;
	};
	
	Waverbase_signIn_result.prototype.write = function(output) {
	  output.writeStructBegin('Waverbase_signIn_result');
	  if (this.success !== null && this.success !== undefined) {
	    output.writeFieldBegin('success', Thrift.Type.STRUCT, 0);
	    this.success.write(output);
	    output.writeFieldEnd();
	  }
	  if (this.e !== null && this.e !== undefined) {
	    output.writeFieldBegin('e', Thrift.Type.STRUCT, 1);
	    this.e.write(output);
	    output.writeFieldEnd();
	  }
	  output.writeFieldStop();
	  output.writeStructEnd();
	  return;
	};
	
	WaverbaseClient = exports.Client = function(output, pClass) {
	    this.output = output;
	    this.pClass = pClass;
	    this.seqid = 0;
	    this._reqs = {};
	};
	WaverbaseClient.prototype = {};
	WaverbaseClient.prototype.signUp = function(username, password, callback) {
	  this.seqid += 1;
	  this._reqs[this.seqid] = callback;
	  this.send_signUp(username, password);
	};
	
	WaverbaseClient.prototype.send_signUp = function(username, password) {
	  var output = new this.pClass(this.output);
	  output.writeMessageBegin('signUp', Thrift.MessageType.CALL, this.seqid);
	  var args = new Waverbase_signUp_args();
	  args.username = username;
	  args.password = password;
	  args.write(output);
	  output.writeMessageEnd();
	  return this.output.flush();
	};
	
	WaverbaseClient.prototype.recv_signUp = function(input,mtype,rseqid) {
	  var callback = this._reqs[rseqid] || function() {};
	  delete this._reqs[rseqid];
	  if (mtype == Thrift.MessageType.EXCEPTION) {
	    var x = new Thrift.TApplicationException();
	    x.read(input);
	    input.readMessageEnd();
	    return callback(x);
	  }
	  var result = new Waverbase_signUp_result();
	  result.read(input);
	  input.readMessageEnd();
	
	  if (null !== result.duplicateUsernameError) {
	    return callback(result.duplicateUsernameError);
	  }
	  if (null !== result.signUpValidationError) {
	    return callback(result.signUpValidationError);
	  }
	  if (null !== result.success) {
	    return callback(null, result.success);
	  }
	  return callback('signUp failed: unknown result');
	};
	WaverbaseClient.prototype.signIn = function(username, password, callback) {
	  this.seqid += 1;
	  this._reqs[this.seqid] = callback;
	  this.send_signIn(username, password);
	};
	
	WaverbaseClient.prototype.send_signIn = function(username, password) {
	  var output = new this.pClass(this.output);
	  output.writeMessageBegin('signIn', Thrift.MessageType.CALL, this.seqid);
	  var args = new Waverbase_signIn_args();
	  args.username = username;
	  args.password = password;
	  args.write(output);
	  output.writeMessageEnd();
	  return this.output.flush();
	};
	
	WaverbaseClient.prototype.recv_signIn = function(input,mtype,rseqid) {
	  var callback = this._reqs[rseqid] || function() {};
	  delete this._reqs[rseqid];
	  if (mtype == Thrift.MessageType.EXCEPTION) {
	    var x = new Thrift.TApplicationException();
	    x.read(input);
	    input.readMessageEnd();
	    return callback(x);
	  }
	  var result = new Waverbase_signIn_result();
	  result.read(input);
	  input.readMessageEnd();
	
	  if (null !== result.e) {
	    return callback(result.e);
	  }
	  if (null !== result.success) {
	    return callback(null, result.success);
	  }
	  return callback('signIn failed: unknown result');
	};
	WaverbaseProcessor = exports.Processor = function(handler) {
	  this._handler = handler
	}
	WaverbaseProcessor.prototype.process = function(input, output) {
	  var r = input.readMessageBegin();
	  if (this['process_' + r.fname]) {
	    return this['process_' + r.fname].call(this, r.rseqid, input, output);
	  } else {
	    input.skip(Thrift.Type.STRUCT);
	    input.readMessageEnd();
	    var x = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN_METHOD, 'Unknown function ' + r.fname);
	    output.writeMessageBegin(r.fname, Thrift.MessageType.Exception, r.rseqid);
	    x.write(output);
	    output.writeMessageEnd();
	    output.flush();
	  }
	}
	
	WaverbaseProcessor.prototype.process_signUp = function(seqid, input, output) {
	  var args = new Waverbase_signUp_args();
	  args.read(input);
	  input.readMessageEnd();
	  this._handler.signUp(args.username, args.password, function (err, result) {
	    var result = new Waverbase_signUp_result((err != null ? err : {success: result}));
	    output.writeMessageBegin("signUp", Thrift.MessageType.REPLY, seqid);
	    result.write(output);
	    output.writeMessageEnd();
	    output.flush();
	  })
	}
	
	WaverbaseProcessor.prototype.process_signIn = function(seqid, input, output) {
	  var args = new Waverbase_signIn_args();
	  args.read(input);
	  input.readMessageEnd();
	  this._handler.signIn(args.username, args.password, function (err, result) {
	    var result = new Waverbase_signIn_result((err != null ? err : {success: result}));
	    output.writeMessageBegin("signIn", Thrift.MessageType.REPLY, seqid);
	    result.write(output);
	    output.writeMessageEnd();
	    output.flush();
	  })
	}
	


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	//
	// Autogenerated by Thrift Compiler (0.9.1)
	//
	// DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
	//
	var Thrift = __webpack_require__(3).Thrift;
	
	var ttypes = module.exports = {};
	User = module.exports.User = function(args) {
	  this.username = null;
	  if (args) {
	    if (args.username !== undefined) {
	      this.username = args.username;
	    }
	  }
	};
	User.prototype = {};
	User.prototype.read = function(input) {
	  input.readStructBegin();
	  while (true)
	  {
	    var ret = input.readFieldBegin();
	    var fname = ret.fname;
	    var ftype = ret.ftype;
	    var fid = ret.fid;
	    if (ftype == Thrift.Type.STOP) {
	      break;
	    }
	    switch (fid)
	    {
	      case 1:
	      if (ftype == Thrift.Type.STRING) {
	        this.username = input.readString();
	      } else {
	        input.skip(ftype);
	      }
	      break;
	      case 0:
	        input.skip(ftype);
	        break;
	      default:
	        input.skip(ftype);
	    }
	    input.readFieldEnd();
	  }
	  input.readStructEnd();
	  return;
	};
	
	User.prototype.write = function(output) {
	  output.writeStructBegin('User');
	  if (this.username !== null && this.username !== undefined) {
	    output.writeFieldBegin('username', Thrift.Type.STRING, 1);
	    output.writeString(this.username);
	    output.writeFieldEnd();
	  }
	  output.writeFieldStop();
	  output.writeStructEnd();
	  return;
	};
	
	Auth = module.exports.Auth = function(args) {
	  this.user = null;
	  this.token = null;
	  if (args) {
	    if (args.user !== undefined) {
	      this.user = args.user;
	    }
	    if (args.token !== undefined) {
	      this.token = args.token;
	    }
	  }
	};
	Auth.prototype = {};
	Auth.prototype.read = function(input) {
	  input.readStructBegin();
	  while (true)
	  {
	    var ret = input.readFieldBegin();
	    var fname = ret.fname;
	    var ftype = ret.ftype;
	    var fid = ret.fid;
	    if (ftype == Thrift.Type.STOP) {
	      break;
	    }
	    switch (fid)
	    {
	      case 1:
	      if (ftype == Thrift.Type.STRUCT) {
	        this.user = new ttypes.User();
	        this.user.read(input);
	      } else {
	        input.skip(ftype);
	      }
	      break;
	      case 2:
	      if (ftype == Thrift.Type.STRING) {
	        this.token = input.readString();
	      } else {
	        input.skip(ftype);
	      }
	      break;
	      default:
	        input.skip(ftype);
	    }
	    input.readFieldEnd();
	  }
	  input.readStructEnd();
	  return;
	};
	
	Auth.prototype.write = function(output) {
	  output.writeStructBegin('Auth');
	  if (this.user !== null && this.user !== undefined) {
	    output.writeFieldBegin('user', Thrift.Type.STRUCT, 1);
	    this.user.write(output);
	    output.writeFieldEnd();
	  }
	  if (this.token !== null && this.token !== undefined) {
	    output.writeFieldBegin('token', Thrift.Type.STRING, 2);
	    output.writeString(this.token);
	    output.writeFieldEnd();
	  }
	  output.writeFieldStop();
	  output.writeStructEnd();
	  return;
	};
	
	DuplicateUsernameError = module.exports.DuplicateUsernameError = function(args) {
	  Thrift.TException.call(this, "DuplicateUsernameError")
	  this.name = "DuplicateUsernameError"
	  this.errorMessage = null;
	  if (args) {
	    if (args.errorMessage !== undefined) {
	      this.errorMessage = args.errorMessage;
	    }
	  }
	};
	Thrift.inherits(DuplicateUsernameError, Thrift.TException);
	DuplicateUsernameError.prototype.name = 'DuplicateUsernameError';
	DuplicateUsernameError.prototype.read = function(input) {
	  input.readStructBegin();
	  while (true)
	  {
	    var ret = input.readFieldBegin();
	    var fname = ret.fname;
	    var ftype = ret.ftype;
	    var fid = ret.fid;
	    if (ftype == Thrift.Type.STOP) {
	      break;
	    }
	    switch (fid)
	    {
	      case 1:
	      if (ftype == Thrift.Type.STRING) {
	        this.errorMessage = input.readString();
	      } else {
	        input.skip(ftype);
	      }
	      break;
	      case 0:
	        input.skip(ftype);
	        break;
	      default:
	        input.skip(ftype);
	    }
	    input.readFieldEnd();
	  }
	  input.readStructEnd();
	  return;
	};
	
	DuplicateUsernameError.prototype.write = function(output) {
	  output.writeStructBegin('DuplicateUsernameError');
	  if (this.errorMessage !== null && this.errorMessage !== undefined) {
	    output.writeFieldBegin('errorMessage', Thrift.Type.STRING, 1);
	    output.writeString(this.errorMessage);
	    output.writeFieldEnd();
	  }
	  output.writeFieldStop();
	  output.writeStructEnd();
	  return;
	};
	
	NotAuthorisedError = module.exports.NotAuthorisedError = function(args) {
	  Thrift.TException.call(this, "NotAuthorisedError")
	  this.name = "NotAuthorisedError"
	  this.errorMessage = null;
	  if (args) {
	    if (args.errorMessage !== undefined) {
	      this.errorMessage = args.errorMessage;
	    }
	  }
	};
	Thrift.inherits(NotAuthorisedError, Thrift.TException);
	NotAuthorisedError.prototype.name = 'NotAuthorisedError';
	NotAuthorisedError.prototype.read = function(input) {
	  input.readStructBegin();
	  while (true)
	  {
	    var ret = input.readFieldBegin();
	    var fname = ret.fname;
	    var ftype = ret.ftype;
	    var fid = ret.fid;
	    if (ftype == Thrift.Type.STOP) {
	      break;
	    }
	    switch (fid)
	    {
	      case 1:
	      if (ftype == Thrift.Type.STRING) {
	        this.errorMessage = input.readString();
	      } else {
	        input.skip(ftype);
	      }
	      break;
	      case 0:
	        input.skip(ftype);
	        break;
	      default:
	        input.skip(ftype);
	    }
	    input.readFieldEnd();
	  }
	  input.readStructEnd();
	  return;
	};
	
	NotAuthorisedError.prototype.write = function(output) {
	  output.writeStructBegin('NotAuthorisedError');
	  if (this.errorMessage !== null && this.errorMessage !== undefined) {
	    output.writeFieldBegin('errorMessage', Thrift.Type.STRING, 1);
	    output.writeString(this.errorMessage);
	    output.writeFieldEnd();
	  }
	  output.writeFieldStop();
	  output.writeStructEnd();
	  return;
	};
	
	NotAuthenticatedError = module.exports.NotAuthenticatedError = function(args) {
	  Thrift.TException.call(this, "NotAuthenticatedError")
	  this.name = "NotAuthenticatedError"
	  this.errorMessage = null;
	  if (args) {
	    if (args.errorMessage !== undefined) {
	      this.errorMessage = args.errorMessage;
	    }
	  }
	};
	Thrift.inherits(NotAuthenticatedError, Thrift.TException);
	NotAuthenticatedError.prototype.name = 'NotAuthenticatedError';
	NotAuthenticatedError.prototype.read = function(input) {
	  input.readStructBegin();
	  while (true)
	  {
	    var ret = input.readFieldBegin();
	    var fname = ret.fname;
	    var ftype = ret.ftype;
	    var fid = ret.fid;
	    if (ftype == Thrift.Type.STOP) {
	      break;
	    }
	    switch (fid)
	    {
	      case 1:
	      if (ftype == Thrift.Type.STRING) {
	        this.errorMessage = input.readString();
	      } else {
	        input.skip(ftype);
	      }
	      break;
	      case 0:
	        input.skip(ftype);
	        break;
	      default:
	        input.skip(ftype);
	    }
	    input.readFieldEnd();
	  }
	  input.readStructEnd();
	  return;
	};
	
	NotAuthenticatedError.prototype.write = function(output) {
	  output.writeStructBegin('NotAuthenticatedError');
	  if (this.errorMessage !== null && this.errorMessage !== undefined) {
	    output.writeFieldBegin('errorMessage', Thrift.Type.STRING, 1);
	    output.writeString(this.errorMessage);
	    output.writeFieldEnd();
	  }
	  output.writeFieldStop();
	  output.writeStructEnd();
	  return;
	};
	
	SignUpValidationError = module.exports.SignUpValidationError = function(args) {
	  Thrift.TException.call(this, "SignUpValidationError")
	  this.name = "SignUpValidationError"
	  this.errorMessage = null;
	  if (args) {
	    if (args.errorMessage !== undefined) {
	      this.errorMessage = args.errorMessage;
	    }
	  }
	};
	Thrift.inherits(SignUpValidationError, Thrift.TException);
	SignUpValidationError.prototype.name = 'SignUpValidationError';
	SignUpValidationError.prototype.read = function(input) {
	  input.readStructBegin();
	  while (true)
	  {
	    var ret = input.readFieldBegin();
	    var fname = ret.fname;
	    var ftype = ret.ftype;
	    var fid = ret.fid;
	    if (ftype == Thrift.Type.STOP) {
	      break;
	    }
	    switch (fid)
	    {
	      case 1:
	      if (ftype == Thrift.Type.STRING) {
	        this.errorMessage = input.readString();
	      } else {
	        input.skip(ftype);
	      }
	      break;
	      case 0:
	        input.skip(ftype);
	        break;
	      default:
	        input.skip(ftype);
	    }
	    input.readFieldEnd();
	  }
	  input.readStructEnd();
	  return;
	};
	
	SignUpValidationError.prototype.write = function(output) {
	  output.writeStructBegin('SignUpValidationError');
	  if (this.errorMessage !== null && this.errorMessage !== undefined) {
	    output.writeFieldBegin('errorMessage', Thrift.Type.STRING, 1);
	    output.writeString(this.errorMessage);
	    output.writeFieldEnd();
	  }
	  output.writeFieldStop();
	  output.writeStructEnd();
	  return;
	};
	


/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("es6-promisify");

/***/ }
/******/ ]);
//# sourceMappingURL=backend.js.map