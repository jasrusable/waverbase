// @flow


import React from 'react';
import client from '../util/client.jsx';
import { withAuth, } from '../util/auth.jsx';


const ChangePassword = React.createClass({
  getInitialState: function(): Object{
    return {
      password: '',
      confirmationPassword: '',
    };
  },


  _changePassword: function(): void {
    withAuth(client.changePassword)(this.state.password).then(function() {
      console.log('Successfully changed password.');
    });
  },


  _handlePassword: function(e: any): void {
    this.setState({password: e.target.value, });
  },


  _handleConfirmationPassword: function(e: any): void {
    this.setState({confirmationPassword: e.target.value, });
  },


  render: function(): React.Element {
    return (
      <div className="ui container">
        <h1>Change Password</h1>
        <form className="ui form">
          <div className="field">
            <label>New Password</label>
            <input value={this.state.password} onChange={this._handlePassword} />
          </div>

          <div className="field">
            <label>Confirm new password</label>
            <input value={this.state.confirmationPassword} onChange={this._handleConfirmationPassword} />
          </div>

          <button className="ui button" type="submit" onClick={this._changePassword}>Change password</button>
        </form>
      </div>
    )
  },
});

module.exports = ChangePassword;
