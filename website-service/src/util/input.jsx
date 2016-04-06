import React from 'react';
import Formsy from 'formsy-react';
import classNames from 'classnames';



const Input = React.createClass({
  propTypes: {
    name: React.PropTypes.string,
    type: React.PropTypes.oneOf([
      'password',
      'text',
    ]),
  },


  contextTypes: {
    getInputViolations: React.PropTypes.func,
    registerInput: React.PropTypes.func,
    validateInputs: React.PropTypes.func,
  },


  getInitialState: function(): Object {
    return {
      value: '',
      isPristine: true,
    }
  },


  getDefaultProps: function(): Object {
    return {
      type: 'text',
    }
  },


  componentWillMount: function(): void {
    this.context.registerInput(this.props.name, this);
  },


  getIsPristine: function(): bool {
    return this.state.isPristine;
  },


  getValue: function(): string {
    return this.state.value;
  },


  _handleChange: function(event: any): void {
    this.setState({
      value: event.currentTarget.value,
      isPristine: false,
    }, () => this.context.validateInputs());
  },


  render: function(): React.Element {
    const violations = this.context.getInputViolations(this.props.name);
    const isRequiredAffordance = this.props.showIsRequired ? '*' : null;
    const errorMessageClassNames = classNames(
      'ui',
      {
        hidden: violations === null,
        error: violations !== null,
      },
      'message'
    );
    return (
      <div>
        <div className="field">
          <label>{this.props.label} {isRequiredAffordance}</label>
          <input
            type={this.props.type}
            onChange={this._handleChange}
            value={this.state.value}
          />
        </div>
        <div className={errorMessageClassNames}>
          <p>{violations}</p>
        </div>
      </div>
    )
  },
});


module.exports = Input;
