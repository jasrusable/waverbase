module.exports.isSignedIn = function isSignedIn() {
  return localStorage.getItem('auth_token') !== null;
}
