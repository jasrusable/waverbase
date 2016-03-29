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
import Table from './table.jsx';

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


const RolesClass = React.createClass({
  render: function() {
    const CustomRenderer = React.createClass({
      render: function() {
        return <td>C {this.props.children}</td>;
      }
    });

    const columns = [
    {
      title: 'Name',
      key: 'name',
      renderer: CustomRenderer,
    }, {
      title: 'Name2',
      key: 'name2'
    }];

    const rows = [
    {
      name: 1,
      name2: 2
    }, {
      name: 7,
      name2: null
    }
    ];

    return (
      <Table columns={columns} rows={rows}/>
    );
  },
})


const Browser = React.createClass({
  render: function() {
    return (
      <div>
        <h1>Table goes here (Browser)</h1>
        {this.props.children}
      </div>
    );
  },
})


const Menu = React.createClass({
  render: function() {
    return (
      <div className="ui vertical menu">
        <div className="item">
          Browser
          <div className="menu">
            <Link to="/dashboard/browser/users-class" className="item">UsersClass</Link>
            <Link to="/dashboard/browser/roles-class" className="item">RolesClass</Link>
          </div>
        </div>
        <a className="item">
          Cloud Code
        </a>
        <a className="item">
          Webhooks
        </a>
      </div>
    );
  },
})


const Dashboard = React.createClass({
  render: function() {
    return (
      <div className="ui container">
        <h1>Dashboard</h1>
        <div className="ui grid">
          <div className="ui four wide column">
            <Menu />
          </div>
          <div className="ui twelve wide column">
            {this.props.children}
          </div>
        </div>
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
      <Route path="dashboard" component={Dashboard} onEnter={requireSignedIn}>
        <Route path="browser" component={Browser}> 
          <IndexRedirect to="users-class" />
          <Route path="users-class" component={UsersClass} />
          <Route path="roles-class" component={RolesClass} />
        </Route>
      </Route>
      <Route path="contact-us" component={ContactUs} />
      <Route path="terms-and-conditions" component={TermsAndConditions} />
    </Route>
  </Router>;

ReactDOM.render(
  routes,
  document.getElementById('reactContent')
);