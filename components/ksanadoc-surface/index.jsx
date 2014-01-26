/** @jsx React.DOM */

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
    var surfacerect=this.refs.surface.getDOMNode().getBoundingClientRect();
    caretdiv.style.top=rect.top - surfacerect.height -surfacerect.top;
    caretdiv.style.left=rect.left  -surfacerect.left;
    caretdiv.style.height=rect.height;
    this.refs.surface.getDOMNode().focus();
  },

  getSelection:function() {
          var sel = getSelection();
          var range = sel.getRangeAt(0);
          var s=range.startContainer.parentElement;
          var e=range.endContainer.parentElement;
          if (s.nodeName!='TOKEN' || e.nodeName!='TOKEN') return;
          var start=parseInt(s.getAttribute('data-n'),10);
          var end=parseInt(e.getAttribute('data-n'),10);
          if (start==end && sel.anchorOffset==1) {
                  this.setState({selstart:start+1,sellength:0});
                  return;
          }
          var length=end-start+1  ;
          if (length<0) {
                  temp=end;        end=start; start=end;
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
  toXML : function(page,opts) {
    var I=page.getInscription();
    var xml=[];
    var selstart=opts.selstart||0,sellength=opts.sellength||0;
    for (var i=0;i<I.length;i++) {
      var classes="",extraclass="";
      var markupclasses=[];
      var M=page.markupAt(i);
      if (i>=selstart && i<selstart+sellength) extraclass+=' selected';
      //naive solution, need to create many combination class
      //create dynamic stylesheet,concat multiple background image with ,
      M.map(function(m){ markupclasses.push(m.payload.type)});
      var ch=I[i];
      if (ch=="\n") {ch="\u21a9";extraclass+=' br'}
      classes=extraclass+" "+markupclasses.join("_");
      xml.push('<token class="'+classes+'" data-n="'+i+'">'+ch+'</token>');
    };
    xml.push('<token data-n="'+I.length+'"></token>');//end of strign
    return xml.join("");
  },  
  render: function() {
    var opts={selstart:this.state.selstart, sellength:this.state.sellength};
    var xml=this.toXML(this.props.page,opts);
    return (
      <div className="surface">
            
            <div ref="surface" tabIndex="0" onKeyDown={this.keydown} onMouseUp={this.mouseup} 
              dangerouslySetInnerHTML={{__html:xml}}></div>

            <div ref="caretdiv" className="surface-caret-container">
                    <div ref="caret" className="surface-caret"></div>
            </div>
      </div>
    );
  },
  initSurface:function() {
                //this.refs.surface.getDOMNode().focus();
          this.caretnode=document.querySelector(
                  '.surface token[data-n="'+(this.state.selstart+this.state.sellength)+'"]');
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