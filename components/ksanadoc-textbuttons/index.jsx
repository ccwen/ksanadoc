/** @jsx React.DOM */

//var othercomponent=Require("other"); 
var textbuttons = React.createClass({
  getInitialState:function() {
      return {action:"delete",replacetext:""}
  },
  textChanged:function() {
    var value=this.refs.textinput.getDOMNode().value;
    if (value.length>0) {
      if (this.props.selectedText.length>0) this.setState({action:"modify"});
      else this.setState({action:"insert"});
    } else {
      if (this.props.selectedText.length>0) this.setState({action:"delete"});
      else this.forceUpdate();
    }
  },
  getActionText:function() {
    return {
      "insert":"在游標處新增",
      "modify":"選取區替換為",
      "delete":"刪除選取文字"
    }[this.state.action]
  },
  buttondisable:function() {
    var emptyinput=true;
    if (this.refs&&this.refs.textinput) {
      emptyinput=this.refs.textinput.getDOMNode().value.length==0 
    }
    return this.props.selectedText.length==0 && emptyinput;
  },
  ontext:function() {
    this.props.onText(this.refs.textinput.getDOMNode().value);
  },
  clearRevision:function() {
    this.props.onText("_clear_");
  }, 
  clearinput:function() {
    this.refs.textinput.getDOMNode().value="";
    this.textChanged();
  }, 
  render: function() {    
    var disable=this.buttondisable()?"disabled ":"";
    var disable2=!this.props.selectedText.length?"disabled ":"";
    return (
      <div className="row">
        <div className="col-xs-2">
           <input type="text" className="textinput readonly form-control" value={this.props.selectedText}></input>
        </div>
        <div className="col-xs-2">
        <a ref="action" onClick={this.ontext} className={disable+"btn btn-info form-control"} >{this.getActionText()}</a>
        </div>
        <div className="col-xs-2">
          <input ref="textinput" onChange={this.textChanged} className="textinput form-control" defaultValue={this.state.replacetext}></input>
        </div>
        <div className="col-xs-1">
        <button className={disable2+"btn btn-danger"} type="button" onClick={this.clearRevision}>
             清除選取區
             </button>
        </div>        
      </div>
    );
  },
  componentDidMount:function() {
    //this.refs.textinput.getDOMNode().focus();
  },
  componentDidUpdate:function() {
   // this.refs.textinput.getDOMNode().focus();
  }
});
module.exports=textbuttons;