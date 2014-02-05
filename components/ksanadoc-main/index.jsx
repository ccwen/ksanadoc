/** @jsx React.DOM */

var surface=Require("surface"); 
var controlpanel=Require("controlpanel"); 
var pagelist=Require("pagelist"); 
var kdoc=Require('yaml').kdoc;
var samplepage=require('../ksanadoc/samplepage.js');
   
var main = React.createClass({
  getInitialState: function() {
    var doc=kdoc.createDocument();
    return {doc:doc, selstart:0, selectedTab: "tagbuttons",sellength:0, preview:false};
  },
  onSelection:function(start,len) {
    this.setState({selstart:start,sellength:len});
  },
  onPage:function() {
    var args = [];
    Array.prototype.push.apply( args, arguments );

    var api=args.shift();
    this.state.page[api].apply(this.state.page,args);
    var newstart=this.state.selstart+this.state.sellength;
    this.setState({selstart:newstart,sellength:0});
  },
  onGoPage:function(pageid) {
    if (!pageid) return;
    this.previewpage=null;
    this.editingpage=this.state.doc.getPage(pageid);
    this.setState({page:this.editingpage});
  },
  onVersion:function(action,opts){
    if (action=="preview") {
      this.previewpage=this.state.doc.evolvePage(this.editingpage, {preview:true});
      this.setState({preview:true,page:this.previewpage});
    } else if (action=="apply") {
      var temp=this.editingpage;
      this.editingpage=this.state.doc.evolvePage(this.editingpage);
      if (opts &&opts.clear) {
        temp.clearRevisions();
      }
      this.setState({preview:false,page:this.editingpage}); 
    } else if (action=="cancel") {
      this.setState({preview:false,page:this.editingpage});
    }     
  },

  createPage:function() {
    this.editingpage=this.state.doc.createPage(samplepage);
    this.state.page=this.editingpage;
  }, 
  setSelectedTab:function(selectedTab) {
    this.state.selectedTab=selectedTab;
  },
  render: function() {
    return (
      <div className="main">
      <controlpanel selstart={this.state.selstart} 
                    sellength={this.state.sellength}
                    onPage={this.onPage}
                    onGoPage={this.onGoPage}
                    preview={this.state.preview} 
                    onVersion={this.onVersion}
                    selectedTab={this.state.selectedTab}
                    setSelectedTab={this.setSelectedTab}
                    page={this.state.page}
                    doc={this.state.doc}>
                    </controlpanel>
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