import React from 'react';
import classNames from 'classnames';
import validate from 'validate.js';

function* entries(obj: Object) {
   for (let key of Object.keys(obj)) {
     yield [key, obj[key], ];
   }
}

const Form = React.createClass({
  propTypes: {
    onSubmit: React.PropTypes.func,
  },


  getInitialState: function(): Object {
    return {
      inputs: new Map(),
      internalViolations: {},
      externalViolations: {},
      externalErrorMessage: null,
      isSubmitting: false,
    };
  },


  childContextTypes: {
    registerInput: React.PropTypes.func,
    getInputViolations: React.PropTypes.func,
    validateInputs: React.PropTypes.func,
  },


  getChildContext: function(): void {
    return {
      registerInput: this.registerInput,
      getInputViolations: this.getInputViolations,
      validateInputs: this.validateInputs,
    }
  },


  registerInput: function(name: string, input: Object): void {
    const inputs = this.state.inputs;
    inputs.set(name, input);
    this.setState({inputs: inputs, });
  },


  _getModel: function(): Object {
    const model = {};
    for (let [name, input, ] of this.state.inputs) {
      model[name] = this.state.inputs.get(name).getValue();
    }
    return model;
  },


  validateInputs: function() {
    this.setState({
      internalViolations: validate(
        this._getModel(),
        this.props.constraints
      ) || {},
    });
  },


  _getInputInternalViolations: function(name: string): string {
    return name in this.state.internalViolations ? this.state.internalViolations[name] : null;
  },


  _getInputExternalViolations: function(name: string): string {
    if (!(name in this.state.externalViolations)) {
      return null;
    }
    const violatingValue = this.state.externalViolations[name].value;
    const currentValue = this.state.inputs.get(name).getValue();
    if (violatingValue === currentValue) {
      return this.state.externalViolations[name].violation;
    }
    return null;
  },


  getInputViolations: function(name: string): string {
    if (this.state.inputs.get(name).getIsPristine()) {
      return null;
    }
    const externalViolations = this._getInputExternalViolations(name);
    if (externalViolations) {
      return externalViolations;
    }
    const internalViolations = this._getInputInternalViolations(name);
    if (internalViolations) {
      return internalViolations;
    }
    return null;
  },


  _isError: function(): void {
    if (this.state.externalErrorMessage !== null) {
      return true;
    }
    return false;
  },


  _getErrorMessage: function(): ?string {
    if (this.state.externalErrorMessage !== null) {
      return this.state.externalErrorMessage;
    }

    for (let [name, input, ] of this.state.inputs) {
      if (this.getInputViolations(name)) {
        return 'There was a problem with the values you entered.';
      }
    }

    return null;
  },


  _wrapExternalViolations: function(violations: Object): Object {
    const model = this._getModel();
    const wrappedViolations = {};
    for (let [name, violation, ] of entries(violations)) {
      wrappedViolations[name] = {
        value: model[name],
        violation: violation,
      };
    }
    return wrappedViolations;
  },


  _handleSubmit: function(): void {
    this.setState({isSubmitting: true, });
    const model = this._getModel();
    this.props.onSubmit(model)
    .then(() =>
      this.setState({isSubmitting: false, })
    ).catch((error: Object) =>
      this.setState({
        isSubmitting: false,
        externalViolations: this._wrapExternalViolations(error.violations || {}),
        externalErrorMessage: error.message || null,
      })
    );
  },


  render: function(): React.Element {
    const errorMessage = this._getErrorMessage();
    const isError = errorMessage !== null;
    const formClass = classNames('ui', 'form', {error: isError, });
    const buttonClass = classNames(
      'ui',
      {
        disabled: isError || this.state.isSubmitting,
      },
      'button'
    );
    return (
      <form className={formClass}>
        {this.props.children}
        <div className="ui error message">
          <div className="header">Error</div>
          <p>{errorMessage}</p>
        </div>
        <button className={buttonClass} onClick={this._handleSubmit}>
          {this.state.isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    )
  },
})


module.exports = Form;
