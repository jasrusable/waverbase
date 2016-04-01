import React from 'react';
import {Link, } from 'react-router';
import client from '../util/client.jsx';

const SignIn = React.createClass({
  contextTypes: {
    router: React.PropTypes.object,
  },


  getInitialState: function(): Object {
    return {
      emailAddress: '',
      password: '',
    }
  },


  _signIn: function(): void {
    const router = this.context.router;
    client.signIn(this.state.emailAddress, this.state.password).then(function(auth: Auth) {
      console.log(`Successfully signed in, got auth ${JSON.stringify(auth)}`);
      localStorage.setItem('auth_token', auth.token);
      router.push('/dashboard');
    }).catch(function (exception: Exception) {
      if (exception instanceof NotAuthenticatedError) {
        console.log(exception.errorMessage);
      } else {
        throw exception;
      }
    });
  },

  _handleEmailAddress: function(e: SyntheticEvent): void {
    this.setState({emailAddress: e.target.value, });
  },

  _handlePassword: function(e: SyntheticEvent): void {
    this.setState({password: e.target.value, });
  },

  render: function(): React.Element {
    return (
      <div className="ui container">
        <h1>Sign In</h1>
        <form className="ui form">
          <div className="field">
            <label>Email address</label>
            <input value={this.state.emailAddress} onChange={this._handleEmailAddress} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={this.state.password} onChange={this._handlePassword} />
          </div>
          <button className="ui button" type="submit" onClick={this._signIn}>Sign In</button>
        </form>
        Forgot your password? <Link to='/reset-password'> Reset password</Link>
        <br />
        Don't have an account? <Link to='/sign-up'>Sign up</Link>
      </div>
    );
  },
});

module.exports = SignIn