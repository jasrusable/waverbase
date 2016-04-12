module.exports = function unwrap(f: Function): Function {
  return function(...args: any): any {
    return new Promise(function(resolve: Function, reject: Function) {
      f(...args, function(err: any, result: any) {
        if (err !== null) {
          reject(err);
        } else {
          resolve(err);
        }
      })
    });
  }
}
