/** @jsx React.DOM */

//var othercomponent=Require("other"); 
var textbuttons = React.createClass({
  getInitialState: function() {
    return {bar: "world"};
  },
  render: function() {
    return (
      <div>
        text buttons
      </div>
    );
  }
});
module.exports=textbuttons;