import React from 'react';
import client from './client.jsx';

const ResetPassword = React.createClass({
  getInitialState: function() {
    return {
      emailAddress: '',
    }
  },

  _handleEmailAddress: function(e) {
    this.setState({emailAddress: e.target.value});
  },


  _resetPassword: function() {
    console.log(`Resetting password for email address ${this.state.emailAddress}`);
    client.resetPassword(this.state.emailAddress).then(function() {
      console.log('Successfully reset password.');
      }).catch(function(error) {
      if (error instanceof EmailAddressNotFoundError) {
        console.log('No user with that email address exists.');
      } else {
        throw error;
      }
    })
  },

  render: function() {
    return (
      <div className="ui container">
        <h1>Reset Password</h1>
        <form className="ui form">
          <div className="field">
            <label>Email address</label>
            <input value={this.state.emailAddress} onChange={this._handleEmailAddress} />
          </div>
          <button className="ui button" type="submit" onClick={this._resetPassword}>Reset password</button>
        </form>
      </div>
    )
  }
})

module.exports = ResetPassword;
