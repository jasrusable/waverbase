
var TestComponent = React.createClass({
    render: function() {
        return (
            <div>
                <p>Hello World!</p>
            </div>
        );
    }
});

ReactDOM.render(
    <TestComponent/>,
    document.getElementById('content')
);