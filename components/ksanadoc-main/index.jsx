/** @jsx React.DOM */

var surface=Require("surface"); 
var controlpanel=Require("controlpanel"); 
var pagelist=Require("pagelist"); 
var kdoc=require('../ksanadoc/kdoc.js');
var samplepage=require('../ksanadoc/samplepage.js');
   
var main = React.createClass({
  getInitialState: function() {
    var doc=kdoc.createDocument();
    return {doc:doc, selstart:0, sellength:0};
  },
  onSelection:function(start,len) {
    this.setState({selstart:start,sellength:len})
  },
  onPage:function() {
    var args = [];
    Array.prototype.push.apply( args, arguments );

    var api=args.shift();
    this.state.page[api].apply(this.state.page,args);
    var newstart=this.state.selstart+this.state.sellength;
    this.setState({selstart:newstart,sellength:0});
  },
  createPage:function() {
    this.state.page=this.state.doc.createPage(samplepage);
  }, 
  render: function() {
    return (
      <div className="main">
      <controlpanel selstart={this.state.selstart} 
                    sellength={this.state.sellength}
                    onPage={this.onPage} 
                    page={this.state.page}></controlpanel>
      <div className="row">

       <div className="col-md-9">
       <surface page={this.state.page}
                selstart={this.state.selstart} 
                sellength={this.state.sellength}
                onSelection={this.onSelection}>
       </surface>
       </div>
     <div className="col-md-3">
       <pagelist></pagelist>
       </div>  
      </div>
      </div>
    );  
  },
  componentWillMount:function() {
    this.createPage();
  },
  componentDidMount:function() {
    //this.refs.editor.getDOMNode().addEventListener('keydown', this.ontextinput.bind(this), false);
    //this.refs.editor.getDOMNode().addEventListener('paste', this.ontextinput.bind(this), false);
  }
});
module.exports=main;