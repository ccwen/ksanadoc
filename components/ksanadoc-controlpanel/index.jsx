/** @jsx React.DOM */

var textbuttons=Require("textbuttons"); 
var tagbuttons=Require("tagbuttons"); 
var revbuttons=Require("revbuttons");
var bootstrap=Require("bootstrap");
var $=Require('jquery');
var controlpanel = React.createClass({
  getInitialState: function() {
    return {selectedTab: "tagbuttons"};
  },
  clicktab:function(e) {
    e.preventDefault();
    var target=e.target.getAttribute("href").substring(1);
    $(this.refs[target].getDOMNode()).tab("show");
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
  render: function() {
    return (
      <div>
        <ul className="nav nav-pills" onClick={this.clicktab}>
          <li className="active">
              <a href="#textbuttons" data-target="[data-id='textbuttons']" data-toggle="tab">Text</a></li>
          <li><a href="#tagbuttons" data-target="[data-id='tagbuttons']" data-toggle="tab">Tag</a></li>
          <li><a href="#revbuttons" data-target="[data-id='revbuttons']" data-toggle="tab">revisions</a></li>
        </ul>
        <div className="tab-content">
          <div className="tab-pane active" data-id="textbuttons" ref="textbuttons">
            <textbuttons/>
          </div>
          <div className="tab-pane" data-id="tagbuttons" ref="tagbuttons">
            <tagbuttons disabled={this.props.sellength==0} onMarkup={this.onMarkup} />
          </div>
          <div className="tab-pane" data-id="revbuttons" ref="revbuttons">
            <revbuttons/>
          </div>
        </div>
      </div>
    );
  
  }
});
module.exports=controlpanel;