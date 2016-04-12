module.exports = function* throwIfDuplicateUser(users: Object, emailAddress: String) {
    const count = yield users.count({emailAddress: emailAddress, });
    if (count > 0) {
      throw new DuplicateUsernameError({
        errorMessage: `User with email address ${emailAddress} already exists.`,
      });
    }
}
