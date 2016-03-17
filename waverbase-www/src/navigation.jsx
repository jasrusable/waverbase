import React from 'react';
import { Link, } from 'react-router';

const Navigation = React.createClass({
  render: function(): React.Element {
    return (
      <div className="ui container">
        <div className="ui large secondary inverted pointing menu">
          <a className="toc item">
            <i className="sidebar icon">
            </i>
          </a>
          <Link to="/" className="active item">Waverbase</Link>
          <div className="right item">
            <Link to='/sign-in' className="ui inverted button">
              Sign In
            </Link>
            <Link to='/sign-up' className="ui inverted button">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  },
})

module.exports = Navigation;
