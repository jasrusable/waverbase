var Parse = require('./parse-client/node').Parse;
Parse.initialize('foo');
Parse.serverURL = 'http://localhost:1337/parse'

var Foo = Parse.Object.extend('Foo');

var foo = new Foo();
foo.set('n', 6);

foo.save(null, {
  success: function(foo) {
    console.log('success');
  },
  error: function(foo, error) {
    console.log(foo)
    console.log(error)
  },
});
