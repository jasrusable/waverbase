// @flow


function isSignedIn(): bool {
  return localStorage.getItem('auth_token') !== null;
}


function withAuth(f: Function): Function {
  const auth_token = localStorage.getItem('auth_token');
  const that = this;
  return function(...args: Array<any>): any {
    args.unshift(auth_token);
    return f.apply(that, args);
  };
}

module.exports = {
  isSignedIn,
  withAuth,
};
