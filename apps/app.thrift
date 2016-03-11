namespace py app
namespace js app

struct IP {
  
}

struct Address {
  1: string dns,
  2: IP ipAddress
}


struct App {
  1: required string name,
  2: required string creator,
  3: required i32 rps,
}


service AppService {
  App getApp(
    1: string name,
    2: string creator
  ),
  void initialiseApp(
    1: App app
  ),
  Address getParseServerAddress(
    1: App app
  ),
  list<Address> getMongoAddress(
    1: App app
  )
}
