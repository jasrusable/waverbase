import React from 'react';
import { Link, } from 'react-router';
import { withAuth, } from '../util/auth.jsx';
import client from '../util/client.jsx';

const DashboardMenuSubsection = React.createClass({
  render: function(): React.Element {
    return (
      <div className="item">
        <div className="header">{this.props.title}</div>
        <div className="menu">
          {this.props.children}
        </div>
      </div>
    );
  },
})


const DashboardMenuSection = React.createClass({
  render: function(): React.Element {
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
  render: function(): React.Element {
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
  getInitialState: function(): Object {
    return {
      classes: [],
    }
  },


  componentDidMount: function() {
    this.setState({
      classes: ['users', 'roles', 'dildos', ],
    })
  },


  render: function(): React.Element {
    const items = this.state.classes.map(function(className: String): React.Element {
      return (
        <DashboardMenuItem
          key={className}
          to={`/dashboard/class-browser/${className}`}
        >
          {className}
        </DashboardMenuItem>
      );
    });
    const createNewClassMenuItem =
      <DashboardMenuItem
        key="create-new"
        to="/dashboard/create-new-class"
      >
        <i className="plus icon" /> Create new
      </DashboardMenuItem>
    return (
      <DashboardMenuSubsection title="Classes">
        {items}
        {createNewClassMenuItem}
      </DashboardMenuSubsection>
    );
  },
})


const AppMenuSection = React.createClass({
  render: function(): React.Element {
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
  },
});


const DashboardMenu = React.createClass({
  getInitialState: function(): Object {
    return {
      apps: [],
    }
  },


  componentDidMount: function() {
    withAuth(client.listApps)().then(function(apps: Array<App>) {
      this.setState({
        apps: apps,
      });
    }.bind(this));
  },


  render: function(): React.Element {
    return (
      <div className="ui vertical menu">
        <DashboardMenuSection title="My Account">
          <DashboardMenuItem to="/dashboard/change-password">
            Change password
          </DashboardMenuItem>
        </DashboardMenuSection>
        <DashboardMenuItem to="/dashboard/create-new-app">
          Create new app
          <i className="plus icon"></i>
        </DashboardMenuItem>
      </div>
    );
  },
})


module.exports = DashboardMenu;
