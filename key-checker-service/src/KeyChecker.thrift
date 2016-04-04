typedef string PublicKey
typedef string Repository

service KeyChecker {
   void ping(),
   bool isAuthorized(1:PublicKey publicKey, 2:Repository repository),
}
