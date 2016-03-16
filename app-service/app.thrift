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
  void create_app(
    1: string name,
    2: string creator
  ),
  bool delete_app(
    1: string name,
    2: string creator
   ),
  App get_app(
    1: string name,
    2: string creator
  ),
  Address get_parse_server_address(
    1: App app
  ),
  list<Address> get_mongo_connection_string(
    1: App app
  ),
  string ping()
}
