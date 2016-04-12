import changePassword from './change-password';
import winston from 'winston';


function unwrap(f: Function): Function {
  return function(...args: any): any {
    return new Promise(function(resolve: Function, reject: Function) {
      f(...args, function(err: any, result: any) {
        if (err !== null) {
          resolve(result);
        } else {
          reject(err);
        }
      })
    });
  }
}


describe('change-password', () => {
  it('Should change the users password.', () => {
    const userDocument = {_id: 5, };
    const password = 'newPassword';
    unwrap(changePassword)(userDocument, password)
    .then(() => {
      winston.info('Done changing password.');
    })
    .catch((error: any) => {
      winston.error(error)
    });
  }),
  it('Should do some other awesome stuff.', () => {
  })
});
