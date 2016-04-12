import { MongoClient, } from 'mongodb';
const URL = 'mongodb://localhost:27017/db';


module.exports = function* getDatabase(): any {
  return yield MongoClient.connect(URL);
}
