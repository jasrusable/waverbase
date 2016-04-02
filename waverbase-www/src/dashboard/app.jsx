import React from 'react';


const App = React.createClass({
  render: function(): React.Element {
    console.log(this.props);
    return this.props.children;
  },
});


module.exports = App;
