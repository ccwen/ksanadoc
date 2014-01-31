/** @jsx React.DOM */

//var othercomponent=Require("other"); 

var childrenbutton = React.createClass({
  gotopage:function(e) {
    var pageid=parseInt(e.target.getAttribute('data-id'),10);
    if (pageid) this.props.onGoPage(pageid);
  },
  render:function() {
    var gotopage=this.gotopage;
    var buttons=this.props.children.map(function(child){
      return <a onClick={gotopage} className="btn btn-primary" data-id={child}>{"#"+child}</a>;
    });

    return <span><span>Children:</span>{buttons}</span>
  }
}); 
var parentbutton = React.createClass({
  gotopage:function(e) {
    var pageid=parseInt(e.target.getAttribute('data-id'),10);
    if (pageid) this.props.onGoPage(pageid);
  },
  render:function() {
    var disable=this.props.parentId?"":"disabled ";
    return <a onClick={this.gotopage} className={disable+"btn btn-primary"} data-id={this.props.parentId}>{"←Parent#"+this.props.parentId}</a>
  }
});

var versionbuttons = React.createClass({

  preview:function() {
    this.props.onVersion("preview");
  },
  confirm:function() {
    this.props.onVersion("apply");
  },
  confirm_clear:function() {
    this.props.onVersion("apply",{clear:true});
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
        <a ref="action" onClick={this.confirm_clear} className={"btn btn-success"} >存成新版並清除修訂標記</a>
        </div>
      );      
    } else {
      var disable=this.props.hasRevision?"":"disabled ";
      return (
        <div>
        <a ref="action" onClick={this.preview} className={disable+"btn btn-warning"} >預覽</a>

        <a className="btn btn-link disabled"> </a>
        <parentbutton onGoPage={this.props.onGoPage} parentId={this.props.parentId}/>
        <a className="btn btn-link disabled"> </a>
        <span className="label label-success">{this.props.pageId}</span>
        <a className="btn btn-link disabled"> </a>
        <childrenbutton onGoPage={this.props.onGoPage} children={this.props.children}/>
        </div>
      );      
    }
  }
});
module.exports=versionbuttons;