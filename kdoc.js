var evolveMarkup=function(markup, rev) {
	end=markup.start+markup.len;
	newlen=(rev.payload.length-rev.len);
	revend=rev.start+rev.len;
	var m=JSON.parse(JSON.stringify(markup)); //return a new copy

	if (end<=rev.start) return m;
	else if (revend<=markup.start) {	
		m.start+=newlen;
		return m;
	} else { //overlap
		//  markup    x    xx      xx    xyz      xyyyz        xyz  
		//  delete   ---   ---    ---     ---      ---        ---     
		//  dout     |     |      |		   x        xz          z            
		//  insert   +++   +++    +++     +++      +++        +++
		//  iout     +++x  +++xx  +++xx  x+++yz   x+++yyyz    +++ xyz
		if (rev.start>markup.start) {
			adv=rev.start-markup.start;  //markup in advance of rev
			var remain=( markup.len -adv) + newlen ; // remaining character after 
			if (remain<0) remain=0;
			m.len = adv + remain ;
		} else {
			m.start=rev.start;
			behind=markup.start-rev.start;
			m.len=markup.len - (rev.len-behind);
		}
		if (m.len<0) m.len=0;
		return m;
	}
}
var evolveText=function(sourcetext ,revisions) {
	revisions.sort(function(r1,r2){return r2.start-r1.start});
	var text=sourcetext;
	revisions.map(function(r){
		text=text.substring(0,r.start)+r.payload+text.substring(r.start+r.len);
	});
	return text;
}
var createMarkup=function(start,len,isRevision,payload) {
	return {start:start,len:len,isRevision:isRevision||false,payload:payload};
}
var createDocument = function(opts) {
	var text="";

	opts=opts||{};
	if (opts.parent) text=opts.parent.getText();
	
	var doc={};
	opts.id=opts.id || 0;
	var metadata= {id:opts.id, parent: opts.parent, date: new Date() };
	var revisions= null;

	var markups=[];
	var getText=function() {	return text;	}
	var getId=function() {	return id;	}

	var addMarkup=function(start,len,str) {
		markups.push(createMarkup(start, len, false,str ));
	}
	var addRevision=function(start,len,payload) {
		markups.push(createMarkup(start, len, true,payload ));
	}
	var clearRevisions=function() {
		markups=markups.filter(function(m){ return (!m.isRevision)});
	}
	var evolve=function(rev) {
		text=evolveText(text, rev);
		revisions=rev;
		//evolve markups
		//markups=markupEvolve(markups,revisions);
	}

	var getRevisions=function() {
		return markups.filter(function(m){ return (m.isRevision)});
	}

	//interfaces
	doc.__evolve__=evolve; //internal use only

	doc.getText=getText;
	doc.getId=getId;
	doc.addMarkup=addMarkup;
	doc.addRevision=addRevision;
	doc.getRevisions=getRevisions;
	doc.clearRevisions=clearRevisions;

	return doc;
}

var Database = function() {
	var documents={};
	var doccount=0;

	var createDocumentFromRoot=function(opts) { //helper for creating document from string
		root=documents[0];
		root.clearRevisions();
		root.addRevision(0,0,opts.text);
		return evolveDocument(root);
	}

	var newDocument=function(input) {
		var doc=null;
		if (typeof input=='string') { 
			doc=createDocumentFromRoot({id:id,text:input})
		} else {
			id=doccount++;
			parent=input||root;
			doc=createDocument({id:id,parent:parent});
		}

		documents[id] = doc ;
		return doc;
	}

	var root=newDocument();

	var getDocument=function(id) {return documents[id]};
	var getDocumentCount=function() {return doccount} ;

	var evolveDocument=function(d,opts) {
		var nextgen=newDocument(d);
		nextgen.__evolve__( d.getRevisions() );
		return nextgen;
	}

	return {
		newDocument: newDocument,
		getDocument: getDocument,
		getDocumentCount:getDocumentCount,
		evolveDocument:evolveDocument,
		evolveMarkup:evolveMarkup
	}
}

module.exports={ Database: Database }