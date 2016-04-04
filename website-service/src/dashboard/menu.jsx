import React from 'react';
import { withAuth, } from '../util/auth.jsx';
import client from '../util/client.jsx';
import {Link, } from 'react-router';
import classNames from 'classnames';

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
  contextTypes: {
    router: React.PropTypes.object,
  },


  render: function(): React.Element {
    let titleElement = this.props.title;
    const isCollapsed = 'to' in this.props && !this.context.router.isActive(this.props.to);
    if (isCollapsed) {
      titleElement = <Link to={this.props.to}>{this.props.title}</Link>;
    }
    return (
      <div className="item">
        <div className="header" to="/dashboard">
          {titleElement}
        </div>
        <div className={classNames({hidden: isCollapsed, }, 'menu')}>
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
    const items = this.state.classes.map((className: String): React.Element => {
      return (
        <DashboardMenuItem
          key={className}
          to={`/dashboard/apps/${this.props.app.name}/class-browser/${className}`}
        >
          {className}
        </DashboardMenuItem>
      );
    });
    const createNewClassMenuItem =
      <DashboardMenuItem
        key="create-class"
        to={`/dashboard/apps/${this.props.app.name}/create-class`}
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
    const appMenuSections = this.props.apps.map((app: App) =>
      <DashboardMenuSection title={app.name} key={app.name} to={`/dashboard/apps/${app.name}`}>
        <ClassesMenuSubsection app={app}/>
        <DashboardMenuSubsection title="Cloud Code"/>
        <DashboardMenuSubsection title="Webhooks"/>
        <DashboardMenuSubsection title="Jobs"/>
        <DashboardMenuSubsection title="Logs"/>
        <DashboardMenuSubsection title="Config"/>
        <DashboardMenuSubsection title="API Console"/>
        <DashboardMenuSubsection title="Migration"/>
        <DashboardMenuItem to={`/dashboard/apps/${app.name}/delete`}>
          Delete App
        </DashboardMenuItem>
      </DashboardMenuSection>
    );
    return (
      <div className="ui vertical menu">
        <DashboardMenuSection title="My Account" to="/dashboard/change-password">
          <DashboardMenuItem to="/dashboard/change-password">
            Change password
          </DashboardMenuItem>
        </DashboardMenuSection>
        {appMenuSections}
        <DashboardMenuItem to="/dashboard/create-app">
          Create new app
          <i className="plus icon"></i>
        </DashboardMenuItem>
      </div>
    );
  },
})


module.exports = DashboardMenu;
