import React from 'react';
import { Link, } from 'react-router';
import Navigation from './navigation.jsx';

const Waverbase = React.createClass({
  render: function() {
    return (
      <div>
        <div className="ui inverted vertical masthead center aligned segment">
          <Navigation />
        </div>
        {this.props.children}
        <div className="ui container">
          <hr />
          <Link to="/contact-us">Contact Us</Link>
          <Link to="/terms-and-conditions">Terms and Conditions</Link>
        </div>
      </div>
    );
  },
})

module.exports = Waverbase;
