require('../semantic/dist/semantic.js');
require('../semantic/dist/semantic.css');
require('./styles.css');

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, hashHistory, } from 'react-router';
import SignIn from './sign-in.jsx';
import SignUp from './sign-up.jsx';
import Landing from './landing.jsx';
import ResetPassword from './reset-password.jsx';
import ChooseNewPassword from './choose-new-password.jsx';
import ChangePassword from './change-password.jsx';
import Dashboard from './dashboard.jsx';
import VerifyAccount from './verify-account.jsx';
import App from './app.jsx';
import {isSignedIn, } from './auth.jsx';

function requireSignedIn(nextState, replace) {
  if (!isSignedIn()) {
    replace('/sign-in');
  }
}

function redirectIfSignedIn(nextState, replace) {
  if (isSignedIn()) {
    replace('/dashboard');
  }
}

const routes =
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Landing} onEnter={redirectIfSignedIn}/>
      <Route path="sign-in" component={SignIn} />
      <Route path="sign-up" component={SignUp} />
      <Route path="reset-password" component={ResetPassword} />
      <Route path="choose-new-password" component={ChooseNewPassword} />
      <Route path="dashboard" component={Dashboard} onEnter={requireSignedIn}/>
      <Route path="change-password" component={ChangePassword} />
      <Route path="verify-account" component={VerifyAccount} />
    </Route>
  </Router>;

ReactDOM.render(
  routes,
  document.getElementById('reactContent')
);
