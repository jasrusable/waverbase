import React from 'react';
import { Link, } from 'react-router';
import {isSignedIn, } from './auth.jsx';

const Navigation = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },

  _signOut: function() {
    console.log('Signing out.');
    localStorage.removeItem('auth_token');
    this.context.router.push('/');
  },

  render: function(): React.Element {
    const homeLinkTo = isSignedIn() ? '/dashboard' : '/';
    const rightItemLinks = isSignedIn() ? [
        <a key='sign-in' className="ui inverted button" onClick={this._signOut}>
          Sign Out
        </a>,
    ] : [
        <Link key='sign-in' to='/sign-in' className="ui inverted button">
          Sign In
        </Link>,
        <Link key='sign-up' to='/sign-up' className="ui inverted button">
          Sign Up
        </Link>
    ]
    return (
      <div className="ui container">
        <div className="ui large secondary inverted pointing menu">
          <a className="toc item">
            <i className="sidebar icon">
            </i>
          </a>
          <Link to={homeLinkTo} className="active item">Waverbase</Link>
          <div className="right item">
            {rightItemLinks}
          </div>
        </div>
      </div>
    );
  },
})

module.exports = Navigation;
