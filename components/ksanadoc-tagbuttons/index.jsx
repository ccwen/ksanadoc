/** @jsx React.DOM */

//var othercomponent=Require("other"); 
var tagbuttons = React.createClass({
  getInitialState: function() {
    return {bar: "world"};
  },
  render: function() {
    return (
      <div>
        tags
      </div>
    );
  }
});
module.exports=tagbuttons;