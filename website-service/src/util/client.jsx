import thriftClientFactory from './thrift-client-factory.jsx';
import {Client, } from 'thrift-loader?service=Waverbase!../../../public-api-service/public-api.thrift';

const shittyClient = thriftClientFactory(Client, 'http://localhost:9099/waverbase');

function promisifyClientMethod(original: Function, client: Object): Function {
  return function(...args: array): Promise{
    return new Promise(function(resolve: Function, reject: Function) {
      args.push(true);
      const promise = original.apply(client, args);
      promise.then(function(result: mixed, status: mixed) {
        resolve(result);
      }, function(_: Object, __: Object, exception: Exception) {
        reject(exception);
      })
    });
  }
}

function promisifyClient(client: Object): Object{
  var pclient = {};
  for (let key in client) {
    pclient[key] = promisifyClientMethod(client[key], client);
  }
  return pclient;
}

module.exports = promisifyClient(shittyClient);
