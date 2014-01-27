/** @jsx React.DOM */

//var othercomponent=Require("other"); 
var tagbuttons = React.createClass({
  markup: function(e) {
    var markuptype=e.target.getAttribute("data-type");
    this.props.onMarkup(markuptype);
  },
  render: function() {
    var classes="btn";
    if (this.props.disabled) classes+=' disabled';
    return (
      <div>
        <a className={"btn-danger "+classes} data-type="_clear_" onClick={this.markup}>清除</a>
        <a className="btn btn-link disabled"> </a>
        <a className={"btn-info "+classes} data-type="verb" onClick={this.markup}>動詞</a>
        <a className={"btn-info "+classes} data-type="noun" onClick={this.markup}>名詞</a>
      </div>
    );
  }
});
module.exports=tagbuttons;