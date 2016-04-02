import React from 'react';
import client from '../util/client.jsx';
import {withAuth, } from '../util/auth.jsx';


const DeleteApp = React.createClass({
  _deleteApp: function() {
    const appName = this.props.params.appName;
    console.log(`Deleting app ${appName}`);
    withAuth(client.deleteApp)(appName).then(() => {
      console.log('Successfully deleted app.');
      this.props.onUpdateApps();
    })
  },


  render: function(): React.Element {
    return (
      <div>
        <h1>Delete App</h1>
        <button className="ui button" onClick={this._deleteApp}>Delete App</button>
      </div>
    );
  },
})


module.exports = DeleteApp;
