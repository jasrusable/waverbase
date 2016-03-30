require('../semantic/dist/semantic.js');
require('../semantic/dist/semantic.css');
require('./styles.css');

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, IndexRedirect, hashHistory, } from 'react-router';

import SignIn from './users/sign-in.jsx';
import SignUp from './users/sign-up.jsx';
import ResetPassword from './users/reset-password.jsx';
import ChooseNewPassword from './users/choose-new-password.jsx';
import ChangePassword from './users/change-password.jsx';
import VerifyAccount from './users/verify-account.jsx';
import ContactUs from './landing/contact-us.jsx';
import TermsAndConditions from './landing/terms-and-conditions.jsx';
import Landing from './landing/landing.jsx';
import Dashboard from './dashboard/dashboard.jsx';
import Browser from './dashboard/browser.jsx';
import Waverbase from './common/waverbase.jsx';
import {isSignedIn, } from './util/auth.jsx';


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
    <Route path="/" component={Waverbase}>
      <IndexRoute component={Landing} onEnter={redirectIfSignedIn}/>
      <Route path="sign-in" component={SignIn} />
      <Route path="sign-up" component={SignUp} />
      <Route path="reset-password" component={ResetPassword} />
      <Route path="choose-new-password" component={ChooseNewPassword} />
      <Route path="dashboard" component={Dashboard} onEnter={requireSignedIn}/>
      <Route path="verify-account" component={VerifyAccount} />
      <Route path="dashboard" component={Dashboard} onEnter={requireSignedIn}>
        <Route path="change-password" component={ChangePassword} />
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
