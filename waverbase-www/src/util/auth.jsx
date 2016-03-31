function isSignedIn() {
  return localStorage.getItem('auth_token') !== null;
}

function withAuth(f) {
  const auth_token = localStorage.getItem('auth_token');
  const that = this;
  return function(...args) {
    args.unshift(auth_token);
    return f.apply(that, args);
  };
}

module.exports = {
    isSignedIn: isSignedIn,
    withAuth: withAuth,
}