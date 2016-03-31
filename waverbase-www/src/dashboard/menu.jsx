import React from 'react';
import {Link, } from 'react-router';
import {withAuth, } from '../util/auth.jsx';
import client from '../util/client.jsx';

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
        {this.props.children}
      </Link>
    );
  },
})


const ClassesMenuSubsection = React.createClass({
  getInitialState: function() {
    return {
      classes: [],
    }
  },


  componentDidMount: function() {
    this.setState({
      classes: ['users', 'roles', 'dildos'],
    })
  },


  render: function() {
    const items = this.state.classes.map(function(className) {
      return (
        <DashboardMenuItem
          key={className}
          to={`/dashboard/class-browser/${className}`}
        >
          {className}
        </DashboardMenuItem>
      );
    })
    const createNewClassMenuItem = (
      <DashboardMenuItem
        key="create-new"
        to="/dashboard/create-new-class"
      >
        <i className="plus icon" /> Create new
      </DashboardMenuItem>
    )
    return (
      <DashboardMenuSubsection title="Classes">
        {items}
        {createNewClassMenuItem}
      </DashboardMenuSubsection>
    );
  },
})


const AppMenuSection = React.createClass({
  render: function() {
    return (
      <DashboardMenuSection title={this.props.appName}>
        <ClassesMenuSubsection />
        <DashboardMenuSubsection title="Cloud Code"/>
        <DashboardMenuSubsection title="Webhooks"/>
        <DashboardMenuSubsection title="Jobs"/>
        <DashboardMenuSubsection title="Logs"/>
        <DashboardMenuSubsection title="Config"/>
        <DashboardMenuSubsection title="API console"/>
        <DashboardMenuSubsection title="Migration"/>
      </DashboardMenuSection>
    );
  }
});


const DashboardMenu = React.createClass({
  getInitialState: function() {
    return {
      apps: [],
    }
  },


  componentDidMount: function() {
    const that = this;
    withAuth(client.listApps)().then(function(apps){
      that.setState({
        apps: JSON.parse(apps),
      });
    });
  },


  render: function() {
    const sections = this.state.apps.map(function (appName) {
      return (
        <AppMenuSection key={appName} appName={appName} />
      );
    });

    return (
      <div className="ui vertical menu">
        <DashboardMenuSection title="My Account">
          <DashboardMenuItem to="/dashboard/change-password">
            Change password
          </DashboardMenuItem>
        </DashboardMenuSection>
        <DashboardMenuSection title="Foo App">
            <ClassesMenuSubsection />
            <DashboardMenuSubsection title="Cloud Code"/>
            <DashboardMenuSubsection title="Webhooks"/>
            <DashboardMenuSubsection title="Jobs"/>
            <DashboardMenuSubsection title="Logs"/>
            <DashboardMenuSubsection title="Config"/>
            <DashboardMenuSubsection title="API console"/>
            <DashboardMenuSubsection title="Migration"/>
        </DashboardMenuSection>
        {sections}
        <DashboardMenuItem to="/dashboard/create-new-app">
          <i className="plus icon" /> Create App
        </DashboardMenuItem>
      </div>
    );
  },
})


module.exports = DashboardMenu;
