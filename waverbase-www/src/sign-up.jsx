import React from 'react';
import client from './client.js';

const SignUp = React.createClass({
  getInitialState: function() {
    return {
      emailAddress: '',
      password: '',
    }
  },

  _signUp: function() {
    client.signUp(this.state.emailAddress, this.state.password)
    .then(function(user) {
      console.log('result', user);
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


  render: function(): React.Element {
    return (
      <div className="ui container">
        <h1>Sign Up</h1>
        <form>
          emailAddress:
          <input value={this.state.emailAddress} onChange={this._handleEmailAddress}/>
          password:
          <input value={this.state.password} onChange={this._handlePassword}/>
        </form>
        <button onClick={this._signUp} >sign up</button>
      </div>
    );
  },
})

module.exports = SignUp
