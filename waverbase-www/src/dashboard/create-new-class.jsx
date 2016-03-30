import React from 'react';


const CreateNewClass = React.createClass({
  getInitialState: function() {
    return {
      className: '',
    };
  },


  _createClass: function() {
    console.log('Fuck you pay us.');
  },


  _handleClassName: function(e) {
    this.setState({className: e.target.value})
  },


  render: function() {
    return (
      <div className="ui container">
        <h1>Create a new class</h1><i className="plus icon"></i>
        <h2>Create a new collection of objects.</h2>
        <hr />
        <form className="ui form">
          <div className="field">
            <label>Class name</label>
            <input
              value={this.state.className}
              onChange={this._handleClassName}
            />
          </div>
          <button className="ui button" type="submit" onClick={this._createClass}>Create class</button>
        </form>
      </div>
    );
  },
})


module.exports = CreateNewClass;
