import React from 'react';

const Row = React.createClass({
  render: function(): React.Element {
    const DefaultRenderer = React.createClass({
      render: function(): React.Element {
        return <td>{this.props.children}</td>;
      },
    });

    const row = this.props.columns.map(function(col: Object): Array {
      const Renderer = 'renderer' in col ? col.renderer : DefaultRenderer;
      return <Renderer key={this.props.index + col.key}>{this.props.row[col.key]}</Renderer>;
    }.bind(this));

    return <tr>{row}</tr>;
  },
})


const Body = React.createClass({
  render: function(): React.Element {

    const rows = [];
    for (let index in this.props.rows) {
      let row = this.props.rows[index];
      rows.push(<Row key={index} index={index} row={row} columns={this.props.columns} />);
    }

    return <tbody>{rows}</tbody>;
  },
})


const Header = React.createClass({
  render: function(): React.Element {
    const cols = this.props.columns.map(function(col: Object): Array {
      return <th key={col.key}>{col.title}</th>;
    });

    return (
      <thead>
        <tr>{cols}</tr>
      </thead>
    );
  },
})


const Table = React.createClass({
  render: function(): React.Element {
    return (
      <table className="ui celled table">
        <Header columns={this.props.columns}/>
        <Body columns={this.props.columns} rows={this.props.rows} />
      </table>
    );
  },
})

module.exports = Table;
