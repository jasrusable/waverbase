struct User {
  1: required string emailAddress
}

struct Auth {
  1: required User user,
  2: required string token
}

exception DuplicateUsernameError {
  1: string errorMessage
}

exception NotAuthorisedError {
  1: string errorMessage
}

exception NotAuthenticatedError {
  1: string errorMessage
}

exception SignUpValidationError {
  1: string errorMessage,
}

service Waverbase {
  User signUp(1: string emailAddress, 2: string password)
    throws (
      1: DuplicateUsernameError duplicateUsernameError,
      2: SignUpValidationError signUpValidationError,
    )

  Auth signIn(1: string emailAddress, 2: string password)
    throws (1: NotAuthorisedError e)
}
