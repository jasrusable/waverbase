struct User {
  1: required string username
}

exception NotAuthorisedException {
  1: string errorMessage
}

exception NotAuthenticatedException {
  1: string errorMessage
}

service Waverbase {
  User signUp(1: string username, 2: string password)

  User authenticate(1: string username, 2: string password)
    throws (1: NotAuthorisedException e)
}
