// @flow


import React from 'react';
import { Link, } from 'react-router';
import client from '../util/client.jsx';
import Input from '../util/input.jsx';
import Form from '../util/form.jsx';

const SIGN_UP_CONSTRAINTS = {
  emailAddress: {
    presence: true,
    email: true,
  },
  password: {
    presence: true,
  },
  confirmPassword: {
    presence: true,
    equality: 'password',
  },
}


const SignUp = React.createClass({
  contextTypes: {
    router: React.PropTypes.object,
  },


  getInitialState: function(): Object {
    return {
      serverSideConstraintViolations: {},
    };
  },


  _handleSignUpAttempt: function(model: Object): Promise {
    return new Promise((resolve: Function, reject: Function) => {
      client.signUp(model.emailAddress, model.password)
      .then((auth: Auth) => {
        localStorage.setItem('auth_token', auth.token);
        this.context.router.push('/dashboard');
        resolve();
      })
      .catch((error: any) => {
        if (error.name === 'DuplicateUsernameError') {
          reject({
            violations: {'emailAddress': [error.errorMessage, ], },
          });
        } else {
          reject({
            message: 'An unexpected error has occured, please try again later.',
          });
          throw error;
        }
      })
    });
  },


  render: function(): React.Element {
    return (
      <div className="ui container">
        <h1>Sign Up</h1>
        <Form
          constraints={SIGN_UP_CONSTRAINTS}
          onSubmit={this._handleSignUpAttempt}>
          <Input name="emailAddress" label="Email Address" type="text" showIsRequired/>
          <Input name="password" label="Password" type="password" showIsRequired/>
          <Input name="confirmPassword" label="Confirm password" type="password" showIsRequired/>
        </Form>
        Already have an account? <Link to='/sign-in'>Sign in</Link>
      </div>
    );
  },
})


module.exports = SignUp
