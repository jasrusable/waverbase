import React from 'react';
import client from './client.js';

const SignIn = React.createClass({
  _onClick: function() {
    client.signIn('username', 'password').then(function(auth) {
      console.log('auth', auth);
    });
  },

  render: function(): React.Element {
    return (
      <div className="ui container">
        <button onClick={this._onClick}>sign in</button>
      </div>
    );
  },
});

module.exports = SignIn
