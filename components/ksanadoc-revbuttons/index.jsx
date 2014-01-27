/** @jsx React.DOM */

//var othercomponent=Require("other"); 
var revbuttons = React.createClass({
  getInitialState: function() {
    return {bar: "world"};
  },
  render: function() {
    return (
      <div>
        revisions
      </div>
    );
  }
});
module.exports=revbuttons;