import React from 'react';
import { Link } from 'react-router';
import Table from './table.jsx';
  
const RolesClass = React.createClass({
  render: function() {
    const CustomRenderer = React.createClass({
      render: function() {
        return <td>C {this.props.children}</td>;
      }
    });

    const columns = [
    {
      title: 'Name',
      key: 'name',
      renderer: CustomRenderer,
    }, {
      title: 'Name2',
      key: 'name2'
    }];

    const rows = [
    {
      name: 1,
      name2: 2
    }, {
      name: 7,
      name2: null
    }
    ];

    return (
      <Table columns={columns} rows={rows}/>
    );
  },
})

const Menu = React.createClass({
  getInitialState: function() {
    return {classes: ['users', 'roles', 'newlink']}
  },


  render: function() {
    return (
      <div className="ui vertical menu">
        <div className="item">
          <div className="header">Core</div>
          <div className="menu">
            <div className="item">
              <div className="header">Browser</div>
              <div className="menu">
                {this.state.classes.map(function(className) {
                  return <Link key={className} className="item" to={`/dashboard/browser/${className}`}>{className}</Link>
                })}
              </div>
            </div>
            <div className="item">
              <div className="header">Cloud Code</div>
              <div className="menu">
                <a className="item">Cloud Code sub menu item</a>
              </div>
            </div>
            <div className="item">
              <div className="header">Webhooks</div>
              <div className="menu">
                <a className="item">Webhooks sub menu item</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
})


const Browser = React.createClass({
  render: function() {
    if(this.props.params.className != 'roles')
      return (
        <div>
          {this.props.params.className}
        </div>
      )
    else
      return (
        <div>
          <RolesClass />
        </div>
      )
  },
})


const Dashboard = React.createClass({
  render: function() {
    return (
      <div className="ui container">
        <Menu />
        <h1>Dashboard</h1>
        {this.props.children}
      </div>
    );
  },
})


module.exports = {
  Dashboard,
  Browser
};
