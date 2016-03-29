import React from 'react';
import client from './client.jsx';
import {Link, } from 'react-router';

const SignUp = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },

  getInitialState: function() {
    return {
      emailAddress: '',
      password: '',
      isTACChecked: false,
    }
  },


  _signUp: function() {
    const router = this.context.router;
    client.signUp(this.state.emailAddress, this.state.password)
    .then(function(auth) {
      console.log(`Sucessfully signed up, got auth ${JSON.stringify(auth)}`);
      localStorage.setItem('auth_token', auth.token);
      router.push('/dashboard');
    }).catch(function(exception) {
      console.log('exception', exception);
    });
  },


  _handleEmailAddress: function(e) {
    this.setState({emailAddress: e.target.value});
  },


  _handlePassword: function(e) {
    this.setState({password: e.target.value});
  },


  _toggleIsTACChecked: function() {
    this.setState({isTACChecked: !this.state.isTACChecked});
  },


  render: function(): React.Element {
    return (
      <div className="ui container">
        <h1>Sign Up</h1>
        <form className="ui form">
          <div className="field">
            <label>Email address</label>
            <input value={this.state.emailAddress} onChange={this._handleEmailAddress} />
          </div>
          <div className="field">
            <label>Password</label>
            <input value={this.state.password} type="password" onChange={this._handlePassword} />
          </div>
          <div className="field">
            <div className="ui checkbox" onClick={this._toggleIsTACChecked}>
              <input type="checkbox" tabIndex="0" className="hidden" checked={this.state.isTACChecked}/>
              <label>I agree to the <Link to="/terms-and-conditions">Terms and Conditions</Link></label>
            </div>
          </div>
          <button className="ui button" type="submit" onClick={this._signUp}>Sign Up</button>
        </form>
        Already have an account? <Link to='/sign-in'>Sign in</Link>
      </div>
    );
  },
})

module.exports = SignUp
