/** @jsx React.DOM */

//var othercomponent=Require("other"); 
 
var surface = React.createClass({
  getInitialState: function() {
		return {selstart:0,sellength:0 } 
  }, 
  moveCaret:function(node) {
  	if (!node) return;
  	this.caretnode=node;
  	var rect=node.getBoundingClientRect();
  	var caretdiv=this.refs.caretdiv.getDOMNode();
  	var caret=this.refs.caret.getDOMNode();
  	caretdiv.style.top=rect.top-5;
  	caretdiv.style.left=rect.left - 3;
  	caret.style.height=rect.height+10;
  	this.refs.surface.getDOMNode().focus();
  },

  getSelection:function() {
  	var sel = getSelection();
  	var range = sel.getRangeAt(0);
  	var s=range.startContainer.parentElement;
  	var e=range.endContainer.parentElement;
  	if (s.nodeName!='TOKEN' || e.nodeName!='TOKEN') return;
  	var start=parseInt(s.getAttribute('n'),10);
  	var end=parseInt(e.getAttribute('n'),10);
  	if (start==end && sel.anchorOffset==1) {
  		this.setState({selstart:start+1,sellength:0});
  		return;
  	}
  	var length=end-start+1  ;
  	if (length<0) {
  		temp=end;	end=start; start=end;
  	}
  	this.setState({selstart:start,sellength:length});
  	sel.empty();
  	//this.refs.surface.getDOMNode().focus();
  },
  mouseup:function(e) {
  	this.getSelection();
  	//this.moveCaret(e.target);
  },
  keydown:function(evt) {
  	var kc=evt.keyCode;
  	if (kc==37) this.moveCaret(this.caretnode.previousSibling);
  	else if (kc==39) this.moveCaret(this.caretnode.nextSibling);
  },
  render: function() {
  	var opts={selstart:this.state.selstart, sellength:this.state.sellength}
    return (
    	<div className="surface">
    	<div ref="caretdiv" className="surface-caret-container">
    		<div ref="caret" className="surface-caret"></div>
    	</div>
    	
      <div ref="surface" tabIndex="0" onKeyDown={this.keydown} onMouseUp={this.mouseup} 
      	dangerouslySetInnerHTML={{__html:this.props.page.toXML(opts)}}></div>
      </div>
    );
  },
  initSurface:function() {
		//this.refs.surface.getDOMNode().focus();
  	this.caretnode=document.querySelector(
  		'.surface token[n="'+(this.state.selstart+this.state.sellength)+'"]');
  	this.moveCaret(this.caretnode);
  },
  componentDidMount:function() {
  	this.initSurface();
  },
  componentDidUpdate:function() {
		this.initSurface();
  }
});
//<input onKeyDown={this.keydown} ref="hiddeninput"></input>
module.exports=surface;