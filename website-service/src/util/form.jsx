import React from 'react';


const Form = React.createClass({
  render: function(): React.Element {
    return (
      <form className="ui error form">
        {this.props.children}
      </form>
    )
  },
})


module.exports = Form;
