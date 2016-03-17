struct Query {
  1: string filter = "{}",
  2: string fields = "{}"
}

struct FindOptions {
  1: optional Query query,
  2: optional i32 skip,
  3: optional i32 limit
}


# I'll rename this later
service mongo_svc {
  /**
  * List all databases
  */
  string listDatabases(1:string instanceUrl),
  string listCollections(1:string instanceUrl, 2:string database),
  string listDocuments(1:string instanceUrl, 2:string database, 3:string collection),
  string findDocuments(1:string instanceUrl, 2:string database, 3:string collection, 4:FindOptions options)
}