import React from 'react';
import {Link, } from 'react-router';


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


const DashboardMenu = React.createClass({
  render: function() {
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
      </div>
    );
  },
})


module.exports = DashboardMenu;
