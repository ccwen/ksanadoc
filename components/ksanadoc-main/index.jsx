/** @jsx React.DOM */

var surface=Require("surface"); 
var controlpanel=Require("controlpanel"); 
var pagelist=Require("pagelist"); 
var kdoc=require('../ksanadoc/kdoc.js');
var samplepage=require('../ksanadoc/samplepage.js');
   
var main = React.createClass({
  getInitialState: function() {
    var doc=kdoc.createDocument();
    return {doc:doc};
  },

  createPage:function() {
    this.state.page=this.state.doc.createPage(samplepage);
  },
  render: function() {
    return (
      <div className="main">
      <controlpanel></controlpanel>
      <div className="row">
      
       <div className="col-md-9">
       <surface page={this.state.page}></surface>
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