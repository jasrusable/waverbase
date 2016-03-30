import React from 'react';
import client from './client.jsx';

const ChooseNewPassword = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },


  getInitialState: function() {
    return {
      password: '',
      confirmationPassword: '',
    }
  },


  _chooseNewPassword: function() {
    const token = this.props.location.query.token;
    const router = this.context.router;
    client.chooseNewPassword(token, this.state.password).then(function() {
      console.log('Successfully chose new password.');
      router.push('/sign-in');
    }).catch(function (error) {
      if (error instanceof TokenNotFoundError) {
        console.log('No record of that token.');
      } else {
        throw error;
      }
    });
  },


  _handlePassword: function(e) {
    this.setState({password: e.target.value});
  },


  _handleConfirmationPassword: function(e) {
    this.setState({confirmationPassword: e.target.value});
  },


  render: function() {
    return (
      <div className="ui container">
        <h1>Choose new password</h1>
        <form className="ui form">
          <div className="field">
            <label>New Password</label>
            <input value={this.state.password} onChange={this._handlePassword} />
          </div>
          <div className="field">
            <label>Confirm new Password</label>
          <input value={this.state.confirmationPassword} onChange={this._handleConfirmationPassword} />
          </div>
          <button className="ui button" type="submit" onClick={this._chooseNewPassword}>Choose new password</button>
        </form>
      </div>
    )
  },
});

module.exports = ChooseNewPassword;
