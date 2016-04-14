import { MongoClient, } from 'mongodb';
import AsyncFactory from './async-factory.js';


const URL = 'mongodb://localhost:27017/db';


module.exports = new AsyncFactory(MongoClient.connect, URL);
