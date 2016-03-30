import React from 'react';
import { Link, } from 'react-router';


const Dashboard = React.createClass({
  render: function() {
    return (
      <div className="ui container">
        <h1>Dashboard</h1>
        <Link to="/change-password">change password</Link>
      </div>
    );
  },
})


module.exports = Dashboard;
