/** @jsx React.DOM */

var surface=Require("surface"); 
var kdoc=require('../ksanadoc/kdoc.js');
var samplepage=require('../ksanadoc/samplepage.json');
  
var main = React.createClass({
  getInitialState: function() {
    var doc=kdoc.createDocument();
    return {doc:doc};
  },
  ontextinput:function(evt) {
    var k=evt.keyCode;
    if (k==16 || (k>=35 &&k<=40) ) return true;
    evt.preventDefault();
    return false;
  },
  createPage:function() {
    this.state.page=this.state.doc.createPage(samplepage);
  },
  render: function() {
    return (
      <div className="main">
      xxxx
       <surface page={this.state.page}></surface>
       yyyy
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