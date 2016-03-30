import React from 'react';
import Table from './table.jsx';

const ClassBrowser = React.createClass({
  getInitialState: function() {
    return {
      rows: [],
      columns: [],
      objectCount: 0,
    }
  },


  componentDidMount: function(){
    this.setState({
      rows: [{
          foo: 6,
          bar: 7,
        }, {
          foo: 6,
          bar: 7,
        }],
      columns: [{
        title: 'Foo',
        key: 'foo',
      }, {
        title: 'Bar',
        key: 'bar',
      }],
      objectCount: 2,
    })
  },


  render: function() {
    const readWriteDescription = 'Public Read and Write enabled';

    return (
      <div>
        <div>
          {this.props.params.className} {this.state.objectCount} objects | {readWriteDescription}
          <Table columns={this.state.columns} rows={this.state.rows} />
        </div>
      </div>
    );
  },
})

module.exports = ClassBrowser;
