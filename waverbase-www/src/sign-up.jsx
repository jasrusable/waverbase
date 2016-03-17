import React from 'react';
import client from './client.js';

const SignUp = React.createClass({
  getInitialState: function() {
    return {
      username: '',
      password: '',
    }
  },


  _signUp: function() {
    client.signUp(this.state.username, this.state.password).then(function(user) {
      console.log('result', user);
    }).catch(function(exception) {
      console.log('exception', exception);
    });
  },


  _handleUsername: function(e) {
    this.setState({username: e.target.value});
  },


  _handlePassword: function(e) {
    this.setState({password: e.target.value});
  },


  render: function(): React.Element {
    return (
      <div className="ui container">
        <h1>Sign Up</h1>
        <form>
          username:
          <input value={this.state.username} onChange={this._handleUsername}/>
          password:
          <input value={this.state.password} onChange={this._handlePassword}/>
        </form>
        <button onClick={this._signUp} >sign up</button>
      </div>
    );
  },
})

module.exports = SignUp
