import React from 'react';
import client from '../util/client.jsx';
import {withAuth, } from '../util/auth.jsx';

const CreateNewApp = React.createClass({
  getInitialState: function(): Object {
    return {
      appName: '',
    };
  },

  _createApp: function() {
    withAuth(client.createNewApp)(this.state.appName);
  },

  _handleAppName: function(event: any): void {
    this.setState({appName: event.target.value, });
  },

  render: function(): React.Element {
    return (
      <div className="ui container">
        <h1> Create application</h1>
        <hr />
        <form className="ui form">
          <div className="field">
            <label>App name</label>
            <input
              value={this.state.appName}
              onChange={this._handleAppName}
            />
          </div>
          <button className="ui button" type="submit" onClick={this._createApp}>Create app</button>
        </form>
      </div>
    );
  },
});

module.exports = CreateNewApp;
