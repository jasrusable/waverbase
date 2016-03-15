
struct Database {
    1: string name,
    2: i32 sizeOnDisk,
    3: bool empty
}

struct Databases {
    1: list<Database> databases,
    2: i32 totalSize,
    3: bool ok
}

# I'll rename this later
service mongo_svc {
    /**
    * List all databases
    */
    Databases listDatabases(1:string instanceUrl),
    list<string> listCollections(1:string instanceUrl, 2:string database),
    list<map<string, string>> listDocuments(1:string instanceUrl, 2:string database, 3:string collection)
}