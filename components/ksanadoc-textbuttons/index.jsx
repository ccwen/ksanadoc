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
  clearinput:function() {
    this.refs.textinput.getDOMNode().value="";
    this.textChanged();
  },
  render: function() {    
    var disable=this.buttondisable()?"disabled ":"";
    return (
      <div>
      <input type="text" className="textinput readonly" value={this.props.selectedText}></input>
      <a ref="action" onClick={this.ontext} className={disable+"btn btn-info"} >{this.getActionText()}</a>
      <input ref="textinput" onChange={this.textChanged} className="textinput" defaultValue={this.state.replacetext}></input>
        <button className="btn btn-danger" type="button" onClick={this.clearinput}>
       {String.fromCharCode(0xd7)}
       </button>

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