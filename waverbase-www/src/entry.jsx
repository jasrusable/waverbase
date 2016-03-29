require('../semantic/dist/semantic.js');
require('../semantic/dist/semantic.css');
require('./styles.css');

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, IndexRedirect, hashHistory, } from 'react-router';
import SignIn from './sign-in.jsx';
import SignUp from './sign-up.jsx';
import Landing from './landing.jsx';
import Navigation from './navigation.jsx';
import ResetPassword from './reset-password.jsx';
import ContactUs from './contact-us.jsx';
import TermsAndConditions from './terms-and-conditions.jsx';
import {isSignedIn, } from './auth.jsx';
import { Dashboard, Browser, } from './dashboard.jsx';

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

const UsersClass = React.createClass({
  render: function() {
    return (
      <div>
        <h1>Users</h1>
        <table className="ui celled table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr className="disabled">
              <td>Jamie</td>
              <td>Approved</td>
              <td>Requires call</td>
            </tr>
            <tr>
              <td>John</td>
              <td>Selected</td>
              <td>None</td>
            </tr>
            <tr>
              <td>Jamie</td>
              <td>Approved</td>
              <td>Requires call</td>
            </tr>
            <tr>
              <td className="disabled">Jill</td>
              <td>Approved</td>
              <td>None</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
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
      <Route path="dashboard" component={Dashboard} onEnter={requireSignedIn}>
        <Route path="browser/:className" component={Browser} />
      </Route>
      <Route path="contact-us" component={ContactUs} />
      <Route path="terms-and-conditions" component={TermsAndConditions} />
    </Route>  
  </Router>;

ReactDOM.render(
  routes,
  document.getElementById('reactContent')
);