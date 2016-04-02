import React from 'react';
import client from '../util/client.jsx';
import { withAuth, } from '../util/auth.jsx';

const CreateNewApp = React.createClass({
  contextTypes: {
    router: React.PropTypes.object,
  },


  getInitialState: function(): Object {
    return {
      appName: '',
    };
  },

  _createApp: function(): void {
    withAuth(client.createApp)(this.state.appName).then((app: App) => {
      console.log(`Successfully created new app ${JSON.stringify(app)}`);
      this.props.onUpdateApps();
      this.context.router.push(`/dashboard/apps/${app.name}/`);
    });
  },

  _handleAppName: function(e: any) {
    this.setState({appName: e.target.value, });
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
          <button className="ui button" type="submit" onClick={this._createApp}>
            Create app
          </button>
        </form>
      </div>
      );
    },
  });

module.exports = CreateNewApp;
