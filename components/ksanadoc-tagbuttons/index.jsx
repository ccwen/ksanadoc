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
    var saved=this.props.saved?"#"+this.props.saved:"";
    return (
      <div>
        <a className={"btn-danger "+classes} data-type="_clear_" onClick={this.markup}>清除</a>
        <a className="btn btn-link disabled"> </a>
        <a className={"btn btn-success"} data-type="_export_" onClick={this.markup}>{"匯出"+saved}</a>
        <a className={"btn btn-success"} data-type="_import_" onClick={this.markup}>匯入</a>

        <a className="btn btn-link disabled"> </a>
        <a className={"btn-info "+classes} data-type="verb" onClick={this.markup}>動詞</a>
        <a className={"btn-info "+classes} data-type="noun" onClick={this.markup}>名詞</a>
        <a className={"btn-info "+classes} data-type="abstract" onClick={this.markup}>虛字</a>

        <a className={"btn btn-info"} data-type="fullstop" onClick={this.markup}>。</a>

      </div>
    );
  }
});
module.exports=tagbuttons;