import React from 'react';
import { Link, } from 'react-router';
import client from '../util/client.jsx';
import Form from '../util/form.jsx';
import Input from '../util/input.jsx';


const SIGN_IN_CONSTRAINTS = {
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


const SignIn = React.createClass({
  contextTypes: {
    router: React.PropTypes.object,
  },


  _handleSignInAttempt: function(model: Object): void {
    return new Promise((resolve: Function, reject: Function) => {
      client.signIn(model.emailAddress, model.password)
      .then((auth: Auth) => {
        console.log(`Successfully signed in, got auth ${JSON.stringify(auth)}`);
        localStorage.setItem('auth_token', auth.token);
        this.context.router.push('/dashboard');
        resolve();
      })
      .catch((error: any) => {
        if (error.name === 'NotAuthenticatedError') {
          reject({message: error.errorMessage, });
        } else {
          throw error;
        }
      });
    });
  },

  render: function(): React.Element {
    return (
      <div className="ui container">
        <h1>Sign In</h1>
        <Form
          constraints={SIGN_IN_CONSTRAINTS}
          onSubmit={this._handleSignInAttempt}>
          <Input name="emailAddress" label="Email Address" type="text" showIsRequired/>
          <Input name="password" label="Password" type="password" showIsRequired/>
        </Form>
        Forgot your password? <Link to='/reset-password'> Reset password</Link>
        <br />
        Don't have an account? <Link to='/sign-up'>Sign up</Link>
      </div>
    );
  },
});

module.exports = SignIn
