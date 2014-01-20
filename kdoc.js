var textEvolve=function(sourcetext ,revisions) {
	revisions.sort(function(r1,r2){return r2.start-r1.start});
	var text=sourcetext;
	revisions.map(function(r){
		text=text.substring(0,r.start)+r.str+text.substring(r.start+r.len);
	});
	return text;
}
var createDocument = function(opts) {
	opts=opts||{};
	var doc={};
	opts.id=opts.id || 0;
	var metadata= {id:opts.id, parent: opts.parent, date: new Date() };
	var revisions= null;
	var text="";
	if (opts.id && opts.parent) text=opts.parent.getText();

	var markups=[];
	var getText=function() {	return text;	}
	var getId=function() {	return id;	}

	var addRevision=function(start,len,str) {
		markups.push({type:"REV", start:start, len:len , str:str} );
		console.log(markups)
	}

	var evolve=function(revisions) {
		text=textEvolve(text, revisions);
		//evolve markups
		//markups=markupEvolve(markups,revisions);
	}


	var getRevisions=function() {
		return markups.filter(function(m){ return (m.type=="REV")});
	}

	//interfaces
	doc.getText=getText;
	doc.getId=getId;
	doc.addRevision=addRevision;
	doc.getRevisions=getRevisions;
	doc.__evolve=evolve;

	return doc;
}

var Database = function() {
	var documents={};
	var doccount=0;

	var newDocument=function(parent) {
		id=doccount++;
		if (!parent) parent=root;
		doc=createDocument({id:id,parent:parent});
		documents[id] = doc ;
		return doc;
	}

	var root=newDocument();

	var getDocument=function(id) {return documents[id]};
	var getDocumentCount=function() {return doccount} ;

	var evolveDocument=function(d,opts) {
		var nextgen=newDocument(d);
		nextgen.__evolve( d.getRevisions() );
		return nextgen;
	}

	return {
		newDocument: newDocument,
		getDocument: getDocument,
		getDocumentCount:getDocumentCount,
		evolveDocument:evolveDocument
	}
}

module.exports={ Database: Database }