/*
  Multiversion text with external durable markups
*/

var reverseRevision=function(revs,parenttext) {
	var reversed=[];
	revs.sort(function(m1,m2){return m1.start-m2.start});
	var offset=0;
	revs.map(function(r){
		m=cloneMarkup(r);
		if (parenttext) {
			newtext=parenttext.substr(r.start,r.len);
		} else {//just a dummy text with same len
			newtext=Array(m.len+1).join("-");
		}
		m.start+=offset;
		m.len=m.payload.text.length;
		m.payload.text=newtext;
		offset+=m.len-newtext.length;
		reversed.push(m);
	})
	return reversed;
}
var evolveMarkup=function(markup, rev) {
	end=markup.start+markup.len;
	newlen=(rev.payload.text.length-rev.len);
	revend=rev.start+rev.len;

	var m=cloneMarkup(markup); //return a new copy

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
		text=text.substring(0,r.start)+r.payload.text+text.substring(r.start+r.len);
	});
	return text;
}
var createMarkup=function(textlen,start,len,payload) {
	if (textlen==-1) textlen=1024*1024*1024; //max string size 1GB
	//the only function create a new markup instance, be friendly to V8 Hidden Class

	if (len<0) len=textlen;
	if (start<0) start=0;
	if (start>textlen) start=textlen;
	if (start+len>textlen) {
		len-=start+len-textlen;
		if (len<0) len=0;
	}

	return {start:start,len:len,payload:payload};
}
var cloneMarkup=function(m) {
	return createMarkup(-1,m.start,m.len,JSON.parse(JSON.stringify(m.payload)));
}
var createDocument = function(opts) {
	var text="";

	opts=opts||{};
	parentId=0;
	if (opts.parent) {
		text=opts.parent.getText();
		parentId=opts.parent.getId();
	} 
	
	var doc={};
	opts.id=opts.id || 0;
	var meta= {id:opts.id, parentId:parentId, date: new Date() , revisions:null};

	var markups=[];
	var revisions=[];
	var getText=function() {	return text;	}
	var getId=function() {	return id;	}
	var getParentId=function() {	return parentId;	}

	var addMarkup=function(start,len,payload) {
		markups.push(createMarkup(text.length,start, len, payload ));
	}
	var addMarkups=function(newmarkups,clear) {
		if (clear) markups=[];
		newmarkups.map(function(m){
			markups.push(createMarkup(text.length, m.start, m.len, m.payload ));	
		})
	}
	var addRevisions=function(newrevisions,clear) {
		if (clear) revisions=[];
		newrevisions.map(function(m){
			revisions.push(createMarkup(text.length, m.start, m.len, m.payload ));	
		})
	}

	var addRevision=function(start,len,str) {
		revisions.push(createMarkup(text.length,start, len, {text:str} ));
	}
	var clearRevisions=function() {
		revisions=[];
	}
	var evolve=function(revs,M) {
		text=evolveText(text, revs);
		meta.revisions=revs;
		evolvedmarkups=[];
		M.map(function(m){
			revs.map(function(rev){
				m=evolveMarkup(m,rev);
			});
			evolvedmarkups.push(m);
		})
		markups=evolvedmarkups;
	}

	var devolveMarkups=function(markups) {
		reverse=reverseRevision(meta.revisions);
		devolvedmarkups=[];
		reverse.sort(function(a,b){return b.start-a.start});
		markups.map(function(m){
			reverse.map(function(rev){
				m=evolveMarkup(m,rev);
			});
			devolvedmarkups.push(m);
		})
		return devolvedmarkups;
	}

	var getRevisions=function() {
		return revisions;
	}
	var getMarkups=function() {
		return markups;
	}

	//interfaces
	doc.__evolve__=evolve; //internal use only

	doc.getText=getText;
	doc.getId=getId;
	doc.getParentId=getParentId;
	doc.addMarkup=addMarkup;
	doc.addMarkups=addMarkups;
	doc.addRevision=addRevision;
	doc.addRevisions=addRevisions;
	doc.getRevisions=getRevisions;
	doc.getMarkups=getMarkups;
	doc.devolveMarkups=devolveMarkups;
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
			parent=input||0;
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
		nextgen.__evolve__( d.getRevisions() , d.getMarkups() );
		return nextgen;
	}

	var migrateTo=function(markups,revs) {

	}
	var migrate=function(from,to) {
		var M=null;
		if (typeof to=='undefined') {
			M=from.devolveMarkups(from.getMarkups());
		}

		return M;
	}

	return {
		newDocument: newDocument,
		getDocument: getDocument,
		getDocumentCount:getDocumentCount,
		evolveDocument:evolveDocument,
		evolveMarkup:evolveMarkup,
		reverseRevision:reverseRevision,
		migrate:migrate
	}
}

module.exports={ Database: Database }