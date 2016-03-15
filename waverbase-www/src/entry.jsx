require('../semantic/dist/semantic.js');
require('../semantic/dist/semantic.css');
require('./styles.css');
// require('script!../thrift.js');
// require('script!../gen-js/hello_svc.js');

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, hashHistory, } from 'react-router';
import SignIn from './sign-in.jsx';
import SignUp from './sign-up.jsx';
import Landing from './landing.jsx';
import Navigation from './navigation.jsx';


var client = require('thrift-loader!../../waverbase-thrift-api/api.thrift');

client.get_message('hello', function(err, result) {
  console.log(result);
});

const App = React.createClass({
  render: function() {
    return (
      <div>
        <div className="ui inverted vertical masthead center aligned segment">
          <Navigation />
        </div>
        {this.props.children}
      </div>
    );
  },
})

const routes =
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Landing} />
      <Route path="sign-in" component={SignIn} />
      <Route path="sign-up" component={SignUp} />
    </Route>
  </Router>;

ReactDOM.render(
  routes,
  document.getElementById('reactContent')
);
