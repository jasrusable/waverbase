struct User {
  1: required string emailAddress
}

struct Auth {
  1: required User user,
  2: required string token
}

struct Query {
  1: string filter = "{}",
  2: string fields = "{}"
}

struct FindOptions {
  1: optional Query query,
  2: optional i32 skip,
  3: optional i32 limit
}

exception TokenNotFoundError {
  1: string errorMessage
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

exception EmailAddressNotFoundError {
  1: string errorMessage,
}

service Waverbase {
  Auth signUp(1: string emailAddress, 2: string password)
    throws (
      1: DuplicateUsernameError e,
      2: SignUpValidationError f,
    )

  void verifyAccount(1: string token)
    throws (1: TokenNotFoundError e)

  Auth signIn(1: string emailAddress, 2: string password)
    throws (1: NotAuthenticatedError e)

  void resetPassword(1: string emailAddress)
    throws (1: EmailAddressNotFoundError e)

  void chooseNewPassword(1: string token, 2: string newPassword)
    throws (1: TokenNotFoundError e)

  void changePassword(1: string auth_token, 2: string newPassword)
    throws (1: NotAuthenticatedError e, 2: NotAuthorisedError f)

  void createNewApp(1:string auth_token, 2:string appName)
    throws (1: NotAuthenticatedError e, 2: NotAuthorisedError f)

  string listApps(1:string auth_token)
    throws (1: NotAuthenticatedError e, 2: NotAuthorisedError f)

  string listDatabases(1:string instanceUrl)

  string listCollections(1:string instanceUrl, 2:string database)

  string findDocuments(1:string instanceUrl, 2:string database,
    3:string collection, 4:FindOptions options)

  void updateDocuments(1:string instanceUrl, 2:string database,
    3:string collection, 4:string selector, 5:string doc)

  void insertDocument(1:string instanceUrl, 2:string database,
    3:string collection, 4:string doc)
}
