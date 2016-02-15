namespace js mongo

service MongoService {
	void createServer(
	     1: string appName,
	     2: i32 diskSize,
	     3: i32 ramSize
	),
	string getServer(
	     1: string appName
	)
}