import React from 'react';
import Table from './table.jsx';
import DashboardMenu from './menu.jsx';
import { withAuth, } from '../util/auth.jsx';
import client from '../util/client.jsx';


const Dashboard = React.createClass({
  getInitialState: function(): Object {
    return {
      apps: [],
    }
  },


  _handleUpdateApps: function(): void {
    withAuth(client.listApps)().then((apps: array<App>) => {
      this.setState({apps: apps, });
    });
  },


  componentDidMount: function(): void {
    this._handleUpdateApps();
  },


  render: function(): React.Element {
    return (
      <div>
        <h1>Dashboard</h1>
        <div className="ui grid">
          <div className="two wide column">
            <DashboardMenu apps={this.state.apps} />
          </div>
          <div className="ten wide column">
            {this.props.children && React.cloneElement(this.props.children, {
              onUpdateApps: this._handleUpdateApps,
            })}
          </div>
        </div>
      </div>
    );
  },
})

module.exports = Dashboard;
