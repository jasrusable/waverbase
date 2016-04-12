

  findDocumentsByAppAndClass: wrap(function* (app: string, class_: string, query: string): any {
    //TODO: XXX
    winston.info(`Querying with app ${app}, ${class_} and ${query}`);
    const db = yield MongoClient.connect(URL);
    const collection = db.collection(class_);

    const results = yield collection.find().toArray();
    const serializedResults = results.map((result: Object) => JSON.stringify(result))

    return new ResultSet({results: serializedResults, });
  }),
  listDatabases: wrap(function*(instanceUrl: string): any {
    const db = yield MongoClient.connect(instanceUrl);
    const dbs = yield db.admin().listDatabases();

    db.close();
    return JSON.stringify(dbs);
  }),


  findDocuments: wrap(function* (instanceUrl: string, database: string, collection: string, options: Object): string {
    const db = yield MongoClient.connect(instanceUrl + '/' + database);
    const col = db.collection(collection);

    const filter = options.query ? JSON.parse(options.query.filter) : {};
    const fields = options.query ? JSON.parse(options.query.fields) : {};
    const skip = options.skip ? options.skip : 0;

    p = col.find(filter, fields).skip(skip);
    if (options.limit) {
      p.limit(options.limit);
    }

    const docs = yield p.toArray();

    db.close();

    return JSON.stringify(docs);
  }),

  updateDocuments: wrap(function* (instanceUrl: string, database: string, collection: string, selector: string, update: Object) {
    const db = yield MongoClient.connect(instanceUrl + '/' + database);
    const col = db.collection(collection);

    yield col.updateMany(JSON.parse(selector), JSON.parse(update));
  }),


  insertDocument: wrap(function* (instanceUrl: string, database: string, collection: string, doc: string) {
    const db = yield MongoClient.connect(instanceUrl + '/' + database);
    const col = db.collection(collection);

    yield col.insert(JSON.parse(doc));

    db.close();
  }),

  deleteDocuments: wrap(function* (instanceUrl: string, database: string, collection: string, filter: string) {
    const db = yield MongoClient.connect(instanceUrl + '/' + database);
    const col = db.collection(collection);

    col.deleteMany(JSON.parse(filter));

    db.close();
  }),
