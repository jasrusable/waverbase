import React from 'react';
import { Link } from 'react-router';
import Table from './table.jsx';

const DashboardMenuSubsection = React.createClass({
  render: function() {
    return (
      <div className="item">
        <div className="header">{this.props.title}</div>
        <div className="menu">
          {this.props.children}
        </div>
      </div>
    );
  }
})


const DashboardMenuSection = React.createClass({
  render: function() {
    return (
      <div className="item">
        <div className="header" to="/dashboard">{this.props.title}</div>
        <div className="menu">
          {this.props.children}
        </div>
      </div>
    );
  },
})


const DashboardMenuItem = React.createClass({
  render: function() {
    return (
      <Link
        className="item"
        to={this.props.to}
        activeClassName="active" >
        {this.props.title}
      </Link>
    );
  },
})


const BrowserMenuSubsection = React.createClass({
  getInitialState: function() {
    return {classes: ['users', 'roles', 'newlink']}
  },


  render: function() {
    const items = this.state.classes.map(function(className) {
      return (
        <DashboardMenuItem
          key={className}
          to={`/dashboard/browser/${className}`}
          title={className}
        />
      );
    })
    return (
      <DashboardMenuSubsection title="Browser">
        {items}
      </DashboardMenuSubsection>
    );
  },
})


const DashboardMenu = React.createClass({
  render: function() {
    return (
      <div className="ui vertical menu">
        <DashboardMenuSection title="My Account">
          <DashboardMenuItem to="/dashboard/change-password" title="Change password" />
        </DashboardMenuSection>
        <DashboardMenuSection title="Foo App">
            <BrowserMenuSubsection />
            <DashboardMenuSubsection title="Cloud Code"/>
            <DashboardMenuSubsection title="Webhooks"/>
            <DashboardMenuSubsection title="Jobs"/>
            <DashboardMenuSubsection title="Logs"/>
            <DashboardMenuSubsection title="Config"/>
            <DashboardMenuSubsection title="API console"/>
            <DashboardMenuSubsection title="Migration"/>
        </DashboardMenuSection>
      </div>
    );
  },
})



const Dashboard = React.createClass({
  render: function() {
    return (
      <div className="ui container">
        <h1>Dashboard</h1>
        <DashboardMenu/>
        {this.props.children}
      </div>
    );
  },
})

module.exports = Dashboard;
