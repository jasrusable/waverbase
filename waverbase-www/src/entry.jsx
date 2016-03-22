require('../semantic/dist/semantic.js');
require('../semantic/dist/semantic.css');
require('./styles.css');

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, hashHistory, } from 'react-router';
import SignIn from './sign-in.jsx';
import SignUp from './sign-up.jsx';
import Landing from './landing.jsx';
import Navigation from './navigation.jsx';
import ResetPassword from './reset-password.jsx';
import ContactUs from './contact-us.jsx';
import TermsAndConditions from './terms-and-conditions.jsx';
import {isSignedIn, } from './auth.jsx';

const App = React.createClass({
  render: function() {
    return (
      <div>
        <div className="ui inverted vertical masthead center aligned segment">
          <Navigation />
        </div>
        {this.props.children}
        <div>
          <Link to="/contact-us">Contact Us</Link>
          <Link to="/terms-and-conditions">Terms and Conditions</Link>
        </div>
      </div>
    );
  },
})

const Dashboard = React.createClass({
  render: function() {
    return (
      <div className="ui container">
        <h1>Dashboard</h1>
      </div>
    );
  },
})

function requireSignedIn(nextState, replace) {
  if (!isSignedIn()) {
    replace('/sign-in');
  }
}

const routes =
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Landing} />
      <Route path="sign-in" component={SignIn} />
      <Route path="sign-up" component={SignUp} />
      <Route path="reset-password" component={ResetPassword} />
      <Route path="dashboard" component={Dashboard} onEnter={requireSignedIn}/>
      <Route path="contact-us" component={ContactUs} />
      <Route path="terms-and-conditions" component={TermsAndConditions} />
    </Route>
  </Router>;

ReactDOM.render(
  routes,
  document.getElementById('reactContent')
);
