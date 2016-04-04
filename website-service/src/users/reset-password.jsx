import React from 'react';
import client from '../util/client.jsx';

const ResetPassword = React.createClass({
  getInitialState: function(): Object {
    return {
      emailAddress: '',
    }
  },

  _handleEmailAddress: function(e: React.SytheticEvent): void {
    this.setState({emailAddress: e.target.value, });
  },


  _resetPassword: function(): void {
    console.log(`Requesting password reset for email address ${this.state.emailAddress}`);
    client.resetPassword(this.state.emailAddress).then(function() {
      console.log('Successfully requested password reset.');
    }).catch(function(exception: Exception) {
      if (exception instanceof EmailAddressNotFoundError) {
        console.log('No user with that email address exists.');
      } else {
        throw exception;
      }
    })
  },

  render: function(): React.Element {
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
  },
})

module.exports = ResetPassword;
