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


// THIS IS NOT A PUBLIC FACING INTERFACE AND SHOULD BE FIREWALLED
// OFF FROM THE WORLD
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
    1: string name,
    2: string creator,
  ),
  list<string> get_mongo_connection_string(
    1: string name,
    2: string creator,
  ),
  bool set_mongo_password(
    1: string name,
    2: string creator,
    3: string password),
  string get_mongo_password(
    1: string name,
    2: string creator),
  void add_mongo_server(
    1: string name,
    2: string creator,
    3: string mongo_connection_string),
  string ping()
}
