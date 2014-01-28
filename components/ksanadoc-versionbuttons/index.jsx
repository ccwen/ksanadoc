/** @jsx React.DOM */

//var othercomponent=Require("other"); 
var versionbuttons = React.createClass({
  getInitialState: function() {
    return {bar: "world"};
  },
  render: function() {
    return (
      <div>
        Hello,{this.state.bar}
      </div>
    );
  }
});
module.exports=versionbuttons;