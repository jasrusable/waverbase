const PageContents = React.createClass({
  render: function() {
    return (
      <div className="pusher">
        <div class="ui inverted vertical masthead center aligned segment">
          <div class="ui container">
            <div class="ui large secondary inverted pointing menu">
              <a class="toc item">
                <i class="sidebar icon"></i>
              </a>
              <a class="active item">Home</a>
              <div class="right item">
                <a class="ui inverted button">Log in</a>
                <a class="ui inverted button">Sign Up</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});

ReactDOM.render(<PageContents/>, document.getElementById('reactContent'));
