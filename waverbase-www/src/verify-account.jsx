import React from 'react';
import client from './client.jsx';

const VerifyAccount = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },


  componentDidMount: function() {
    const token = this.props.location.query.token;
    client.verifyAccount(token).then(function() {
      console.log('Successfully verified account');
      this.context.router.push('/');
    }.bind(this));
  },


  render: function() {
    return (
      <div className="ui container">
        <p>Verifying your account...</p>
      </div>
    );
  },
})

module.exports = VerifyAccount;
