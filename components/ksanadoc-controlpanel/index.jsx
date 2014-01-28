/** @jsx React.DOM */

var textbuttons=Require("textbuttons"); 
var tagbuttons=Require("tagbuttons"); 
var versionbuttons=Require("versionbuttons");
var bootstrap=Require("bootstrap");
var $=Require('jquery');
var controlpanel = React.createClass({
  getInitialState: function() {
    return {selectedTab: "textbuttons"};
  },
  clicktab:function(e) {
    e.preventDefault();
    var target=e.target.getAttribute("href").substring(1);
    $(this.refs[target].getDOMNode()).tab("show");
    this.state.selectedTab=target;
  },
  componentDidMount:function() {
    $("a[href='#"+this.state.selectedTab+"']").click();
  },
  componentDidUpdate:function() {
    $("a[href='#"+this.state.selectedTab+"']").click();
  },
  clearmarkup:function() {
    this.props.onPage("clearMarkups",this.props.selstart,this.props.sellength);
  },
  onMarkup:function(markuptype) {
    if (markuptype=="_clear_") return this.clearmarkup();
    this.props.onPage("addMarkup",this.props.selstart,this.props.sellength,{type:markuptype});
  },
  getSelectedText:function() {
    return this.props.page.getInscription().substr(this.props.selstart,this.props.sellength);
  },
  onText:function(text) {
    this.props.onPage("addRevision",this.props.selstart,this.props.sellength,text);
  },
  render: function() {
    return (
      <div>
        <ul className="nav nav-pills" onClick={this.clicktab}>
          <li className="active">
              <a href="#textbuttons" data-target="[data-id='textbuttons']" data-toggle="tab">Text</a></li>
          <li><a href="#tagbuttons" data-target="[data-id='tagbuttons']" data-toggle="tab">Tag</a></li>
          <li><a href="#versionbuttons" data-target="[data-id='versionbuttons']" data-toggle="tab">Versions</a></li>
        </ul>
        <div className="tab-content">
          <div className="tab-pane active"  data-id="textbuttons" ref="textbuttons">
            <textbuttons onText={this.onText} selectedText={this.getSelectedText()}/>
          </div>
          <div className="tab-pane" data-id="tagbuttons" ref="tagbuttons">
            <tagbuttons disabled={this.props.sellength==0} onMarkup={this.onMarkup} />
          </div>
          <div className="tab-pane" data-id="versionbuttons" ref="versionbuttons">
            <versionbuttons/>
          </div>
        </div>
      </div>
    );
  
  }
});
module.exports=controlpanel;