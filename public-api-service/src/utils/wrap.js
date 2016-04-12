import co from 'co';
import promisify from 'es6-promisify';
import winston from 'winston';
import { Thrift, } from 'thrift';

module.exports = function wrap(f: Function): Function {
  const that = this;

  return function(...args: any) {
    const resultCallback = args.pop();

    function wrapped(): any {
      return f.apply(that, args);
    }

    co(wrapped).then(function(result: any) {
       resultCallback(null, result);
    }).catch(function(error: any) {
      if (error instanceof Thrift.TException) {
        resultCallback(error);
      } else {
        winston.error(error);
        winston.error(error.stack);
        resultCallback(new Thrift.TException('Server side error.'));
      }
    });
  }
}
