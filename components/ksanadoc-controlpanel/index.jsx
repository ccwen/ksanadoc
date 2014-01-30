/** @jsx React.DOM */

var textbuttons=Require("textbuttons"); 
var tagbuttons=Require("tagbuttons"); 
var versionbuttons=Require("versionbuttons");
var bootstrap=Require("bootstrap");
var $=Require('jquery');
var controlpanel = React.createClass({
  getInitialState:function() {
    return {saved:""}
  },
  clicktab:function(e) {
    //e.preventDefault();
    //if (this.state.preview) return false;
    var target=e.target.getAttribute("href").substring(1);
    this.props.setSelectedTab(target);
    /*
    $(this.refs[target].getDOMNode()).tab("show");
    this.state.selectedTab=target;
    */
  },
  
  componentDidMount:function() {
    $("a[data-target2='"+this.props.selectedTab+"']").click();
  },
  componentDidUpdate:function() {
    $("a[data-target2='"+this.props.selectedTab+"']").click();
  },
  clearmarkup:function() {
    this.props.onPage("clearMarkups",this.props.selstart,this.props.sellength);
  },
  exportMarkup:function() {
    this.setState({saved:this.props.page.getId()});
  }, 
  importMarkup:function() {
    if (!this.state.saved)return;
    if (this.props.page.getId()==this.state.saved) return;
    var M=this.props.doc.migrate(this.state.saved,this.props.page.getId());
    this.props.onPage("addMarkups",M);
    this.setState({saved:0});
  },
  onMarkup:function(markuptype) {
    if (markuptype=="_clear_") return this.clearmarkup(); 
    if (markuptype=="_export_") return this.exportMarkup();
    if (markuptype=="_import_") return this.importMarkup();

    this.props.onPage("addMarkup",this.props.selstart,this.props.sellength,{type:markuptype});
  },
  getSelectedText:function() {
    return this.props.page.getInscription().substr(this.props.selstart,this.props.sellength);
  },
  clearRevision:function() {
    this.props.onPage("clearRevisions",this.props.selstart,this.props.sellength);
  },
  onText:function(text) {
    if (text=="_clear_") return this.clearRevision();
    if (this.props.selstart==0) return; //cannot insert at beginning
    this.props.onPage("addRevision",this.props.selstart,this.props.sellength,text);
  },
  onVersion:function(action) {
    this.props.onVersion(action);
  },
  onGoPage:function(pageid) {
    this.props.onGoPage(pageid);
  },
  render: function() {
    var enabletab=this.props.preview?"":"tab";
    return (
      <div>
        <ul className="nav nav-pills" >
          <li className="active"><a href="#"  onClick={this.clicktab} data-target2="tagbuttons" data-target="[data-id='tagbuttons']" data-toggle={enabletab}>Content Markup</a></li>
          <li><a href="#"  onClick={this.clicktab} data-target2="textbuttons" data-target="[data-id='textbuttons']" data-toggle={enabletab}>Text</a></li>
          <li><a href="#"  onClick={this.clicktab} data-target2="versionbuttons" data-target="[data-id='versionbuttons']" data-toggle={enabletab}>Versions</a></li>
        </ul>
        <div className="tab-content">
          <div className="tab-pane active"  data-id="tagbuttons" ref="tagbuttons">
            <tagbuttons
             disabled={this.props.sellength==0} 
             onMarkup={this.onMarkup} 
             saved={this.state.saved} />
          </div>
          <div className="tab-pane" data-id="textbuttons" ref="textbuttons">
            <textbuttons onText={this.onText} selectedText={this.getSelectedText()}/>
          </div>
          <div className="tab-pane" data-id="versionbuttons" ref="versionbuttons">
            <versionbuttons 
              hasRevision={this.props.page.hasRevision()} 
              onVersion={this.onVersion} 
              preview={this.props.preview}
              onChangePage={this.onChangePage}
              pageId={this.props.page.getId()}
              parentId={this.props.page.getParentId()}
              onGoPage={this.onGoPage}
              children={this.props.page.getChildren()}
            />
          </div>
        </div>
      </div>
    );
  
  }
});
module.exports=controlpanel;