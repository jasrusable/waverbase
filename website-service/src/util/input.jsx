import React from 'react';
import Formsy from 'formsy-react';
import classNames from 'classnames';



const Input = React.createClass({
  propTypes: {
    type: React.PropTypes.oneOf([
      'password',
      'text',
    ]),
  },

  getDefaultProps: function(): Object {
    return {
      type: 'text',
    }
  },


  _handleChange: function(event: any): void {
    const value = event.currentTarget.value;
    this.setValue(value);
    // this.props.onChange(this.props.name, value);
  },


  getErrorMessage: function() {
    return 'there is a problem';
  },


  getValue: function() {
    return 'hello';
  },


  render: function(): React.Element {
    const errorMessage = this.getErrorMessage();
    const isErrorMessage = errorMessage !== null;
    const errorMessageClassNames = classNames(
      'ui',
      {
        error: isErrorMessage,
        hidden: !isErrorMessage,
      },
      'message'
    );
    return (
      <div>
        <div className="field">
          <label>{this.props.label}</label>
          <input
            type={this.props.type}
            onChange={this._handleChange}
            value={this.getValue()}
          />
        </div>
        <div className={errorMessageClassNames}>
          <p>{errorMessage}</p>
        </div>
      </div>
    )
  },
});


module.exports = Input;
