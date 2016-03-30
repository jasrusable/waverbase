import React from 'react';
import Navigation from './navigation.jsx';


const App = React.createClass({
  render: function() {
    return (
      <div>
        <div className="ui inverted vertical masthead center aligned segment">
          <Navigation />
        </div>
        {this.props.children}
      </div>
    );
  },
})


module.exports = App;
