// @flow

import React from 'react';
import Table from './table.jsx';
import client from '../util/client.jsx';

const ClassBrowser = React.createClass({
  getInitialState: function(): Object {
    return {
      objectCount: 0,
      query: {},
      results: [],
    }
  },


  _updateQueryResults: function(): void {
    const app = 'app';
    const class_ = 'users';
    const query = JSON.stringify({});
    client.findDocumentsByAppAndClass(app, class_, query).then((resultSet: Object) => {
      // console.log(`Got results ${JSON.stringify(resultSet.results)}`);

      const deserializedResults = resultSet.results.map((result) => JSON.parse(result));

      this.setState({
        results: deserializedResults,
      });
    }).catch(function(exception: any) {
      console.log(exception);
    });
  },

  componentDidMount: function(): void {
    this._updateQueryResults();
  },


  _prepareRows: function(results: Array<Object>): Array<Object> {
    return results;
  },


  _prepareColumns: function(results: Array<Object>): Array<Object> {
    if (results.length === 0) {
      return [];
    }
    const firstResult = results[0];

    //TODO: XXX
    return Object.keys(firstResult).map((key: any): Object => {
      return {
        key: key,
        title: key,
      }
    });
  },


  render: function(): React.Element {
    const readWriteDescription = 'Public Read and Write enabled';
    const columns = this._prepareColumns(this.state.results);
    const rows = this._prepareRows(this.state.results);

    return (
      <div>
        <div>
          {this.props.params.className} {this.state.objectCount} objects | {readWriteDescription}
          <Table columns={columns} rows={rows} />
        </div>
      </div>
    );
  },
})

module.exports = ClassBrowser;
