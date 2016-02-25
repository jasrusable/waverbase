namespace js mongo

struct Result {
       1: bool ok,
       2: string err
}

service MongoService {
	string createServer(
	     1: string appName,
	     2: i32 diskSize,
	     3: i32 ramSize
	),
	Result getServer(
	     1: string appName
	)
}