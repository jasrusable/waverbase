import React from 'react';
import client from '../util/client.jsx';

// TODO: change this to an import (currently in change-password.jsx)
function withAuth(f) {
  const auth_token = localStorage.getItem('auth_token');
  const that = this;
  return function(...args) {
    args.unshift(auth_token);
    return f.apply(that, args);
  };
}

const CreateNewApp = React.createClass({
    getInitialState: function() {
        return {
            appName: '',
        };
    },

    _createApp: function() {
        console.log('Fuck you pay us.');
        withAuth(client.createNewApp)(this.state.appName);
    },

    _handleAppName: function(e) {
        this.setState({appName: e.target.value});
    },

    render: function() {
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