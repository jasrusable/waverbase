import thriftClientFactory from './thrift-client-factory.js';
import {Client, } from 'thrift-loader?service=Waverbase!../../../waverbase-thrift-api/waverbase.thrift';

const shittyClient = thriftClientFactory(Client, 'http://localhost:9099/waverbase');

function promisifyClientMethod(original, client) {
  return function(...args) {
    return new Promise(function(resolve, reject) {
      args.push(true);
      const promise = original.apply(client, args);
      promise.then(function(result, status) {
        resolve(result);
      }, function(_, __, exception) {
        reject(exception);
      })
    });
  }
}

function promisifyClient(client) {
  var pclient = {};
  for (let key in client) {
    pclient[key] = promisifyClientMethod(client[key], client);
  }
  return pclient;
}

module.exports = promisifyClient(shittyClient);
