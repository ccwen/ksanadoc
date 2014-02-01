/** @jsx React.DOM */
var $=Require("jquery");
var token = React.createClass({
  render:function() {
    if (this.props.replaceto)
          return <span className={this.props.cls} data-to={this.props.replaceto} data-n={this.props.n}>{this.props.ch}</span>
    else  return <span className={this.props.cls} data-n={this.props.n}>{this.props.ch}</span>
  }
})
var surface = React.createClass({
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
    if (s.nodeName!='SPAN' || e.nodeName!='SPAN') return;
    var start=parseInt(s.getAttribute('data-n'),10);
    var end=parseInt(e.getAttribute('data-n'),10);
    if (start==end && sel.anchorOffset==1) {
      //      this.setState({selstart:start+1,sellength:0});
      this.props.onSelection(start+1,0);
      return {selstart:start,sellength:length};
    }
    var length=end-start+1  ;
    if (length<0) {
            temp=end; end=start; start=end;
    }
    //this.setState({selstart:start,sellength:length});
    this.props.onSelection(start,length);
    sel.empty();
    this.refs.surface.getDOMNode().focus();
    return {selstart:start,sellength:length};
  },
  mouseup:function(e) {
    var sel=this.getSelection();
    if (e.target.getAttribute("class")=="link") {
      var M=this.props.page.markupAt(sel.selstart);
      if (this.props.onLink) this.props.onLink(M[0].payload);
    }
  },
  keydown:function(evt) {
    var kc=evt.keyCode;
    if (kc==37) this.moveCaret(this.caretnode.previousSibling);
    else if (kc==39) this.moveCaret(this.caretnode.nextSibling);
  },
  toXML : function(page,opts) {
    if (!page) return [];
    var I=page.getInscription();
    var xml=[];
    var selstart=opts.selstart||0,sellength=opts.sellength||0;
    
    for (var i=0;i<I.length;i++) {
      var classes="",extraclass="";
      var markupclasses=[];
      var M=page.markupAt(i);
      var R=page.revisionAt(i),replaceto="";
      if (i>=selstart && i<selstart+sellength) extraclass+=' selected';
      if (R.length) {
        if (R[0].len==0) {
          extraclass+=" insert"; 
//          replaceto=R[0].payload.text;
          xml.push(<span className={extraclass+" inserttext"}>{R[0].payload.text}</span>);
        } else  {
          if (R[0].payload.text) {
            if (i>=R[0].start && i<R[0].start+R[0].len) extraclass+=" replace";  
            if (i==R[0].start+R[0].len) {
              xml.push(<span className={extraclass+" replacetext"}>{R[0].payload.text}</span>);
            } 
          }
          else if (i>=R[0].start && i<R[0].start+R[0].len) extraclass+=" delete";  
        }
        if (R[0].start!=i)replaceto="";
      }

      //naive solution, need to create many combination class
      //create dynamic stylesheet,concat multiple background image with ,
      M.map(function(m){ markupclasses.push(m.payload.type)});
      markupclasses.sort();
      var ch=I[i];
      if (ch=="\n") {ch="\u21a9";extraclass+=' br'}
      classes=(extraclass+" "+markupclasses.join("_")).trim();
      xml.push(<token key={i} cls={classes} n={i} ch={ch} replaceto={replaceto}></token>);
    };
    xml.push(<token key={I.length} n={I.length}/>);
    return xml;
  },  
  render: function() {
    var opts={selstart:this.props.selstart, sellength:this.props.sellength};
    var xml=this.toXML(this.props.page,opts);
    return (
      <div className="surface">
            <div ref="surface" tabIndex="0" onKeyDown={this.keydown} onMouseUp={this.mouseup} 
              >{xml}</div>
            <div ref="caretdiv" className="surface-caret-container">
                    <div ref="caret" className="surface-caret"></div>
            </div>
      </div>
    );
  },
  scrollToSelection:function() {
    var node = this.getDOMNode();
    var scrollto=$(this.refs.caretdiv.getDOMNode()).offset().top;
    node.scrollTop=scrollto-100;
      
    //  $(this.refs.surface.getDOMNode()).scrollTop(scrollto);
  },
  initSurface:function() {
    //this.refs.surface.getDOMNode().focus();
    this.caretnode=this.refs.surface.getDOMNode().querySelector(
      'span[data-n="'+(this.props.selstart+this.props.sellength)+'"]');
    this.moveCaret(this.caretnode);
  },
  componentDidMount:function() {
    this.initSurface();
  },
  componentDidUpdate:function() {
    this.initSurface();
    if (this.props.scrollto) this.scrollToSelection();
  }
});

module.exports=surface;