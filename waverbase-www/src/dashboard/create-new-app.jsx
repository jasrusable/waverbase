import React from 'react';
import client from '../util/client.jsx';

const CreateNewApp = React.createClass({
    getInitialState: function() {
        return {
            appName: '',
        };
    },

    _createApp: function() {
        console.log('Fuck you pay us.');
        client.createNewApp(this.state.appName);
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