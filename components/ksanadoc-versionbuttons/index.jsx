/** @jsx React.DOM */

//var othercomponent=Require("other"); 
var versionbuttons = React.createClass({

  preview:function() {
    this.props.onVersion("preview");
  },
  confirm:function() {
    this.props.onVersion("apply");
  },
  cancelpreview:function() {
    this.props.onVersion("cancel");
  },
  render: function() {
    if (this.props.preview) {
      return (
        <div>
        <a ref="action" onClick={this.cancelpreview} className={"btn btn-warning"} >結束預覽</a>
        <a ref="action" onClick={this.confirm} className={"btn btn-success"} >存成新版</a>
        </div>
      );      
    } else {
      var disable=this.props.hasRevision?"":"disabled ";
      return (
        <div>
        <a ref="action" onClick={this.preview} className={disable+"btn btn-warning"} >預覽</a>
        </div>
      );      
    }
  }
});
module.exports=versionbuttons;