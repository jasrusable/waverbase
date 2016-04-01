import React from 'react';
import Table from './table.jsx';
import DashboardMenu from './menu.jsx';


const Dashboard = React.createClass({
  render: function(): React.Element {
    return (
      <div>
        <h1>Dashboard</h1>
        <div className="ui grid">
          <div className="two wide column">
            <DashboardMenu />
          </div>
          <div className="ten wide column">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  },
})

module.exports = Dashboard;
