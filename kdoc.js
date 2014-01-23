/*
  Multiversion text with external durable markups
*/
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

var migrateMarkup=function(markup, rev) {
	var end=markup.start+markup.len;
	var newlen=(rev.payload.text.length-rev.len);
	var revend=rev.start+rev.len;
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
var upgradeText=function(sourcetext ,revisions) {
	revisions.sort(function(r1,r2){return r2.start-r1.start});
	var text2=sourcetext;
	revisions.map(function(r){
		text2=text2.substring(0,r.start)+r.payload.text+text2.substring(r.start+r.len);
	});
	return text2;
}

var addMarkup=function(start,len,payload) {
	this.getMarkups().push(createMarkup(this.getInscription().length,start, len, payload ));
}
var addRevision=function(start,len,str) {
	var valid=this.getRevisions().every(function(r) {
		return (r.start+r.len<=start || r.start>=start+len);
	})
	var newrevision=createMarkup(this.getInscription().length,start,len,{text:str});
	if (valid) this.getRevisions().push(newrevision);
	return valid;
}

var addMarkups=function(newmarkups,opts) {
	if (opts &&ops.clear) this.clearMarkups();
	for (var i in newmarkups) {
		m=newmarkups[i];
		var newmarkup=createMarkup(this.getInscription().length, m.start, m.len, m.payload )
		this.getMarkups().push(newmarkup);
	};
}

var addRevisions=function(newrevisions,opts) {
	if (opts &&ops.clear) this.clearRevisions();
	for (var i in newrevisions) {
		var m=newrevisions[i];
		var newrevision=createMarkup(this.getInscription().length, m.start, m.len, m.payload );
		this.getRevisions().push(newrevision);	
	}
}	
var downgradeMarkups=function(markups) {
	var downgraded=[];
	for (var i in markups) {
		var m=markups[i];
		this.getRevert().map(function(rev){
			m=migrateMarkup(m,rev);
		});
		downgraded.push(m);
	}
	return downgraded;
}
var upgradeMarkups=function(markups,revs) {
	var migratedmarkups=[];
	markups.map(function(m){
		revs.map(function(revs){
			m=migrateMarkup(m,revs);
		});
		migratedmarkups.push(m);
	})
	return migratedmarkups;
}

var upgradeMarkupsTo=function(M,targetDoc) {
	var d=targetDoc, lineage=[], db=this.getDB();
	while (true) {
			var pid=d.getParentId();
			if (!pid) break; // root	
			if (pid==getId())break;
			lineage.unshift(d);
			d=db.getDocument(pid);
	}
	lineage.map(function(D){
		var parentDoc=db.getDocument(D.getParentId());
		var rev=revertRevision(D.getRevert(),parentDoc.getInscription());
		M=parentDoc.upgradeMarkups(M,rev);
	})
	return M;
}

var downgradeMarkupsTo=function(M,targetDoc) {
	var d=this,db=this.getDB();
	var ancestorId=targetDoc.getId();
	while (true) {
			var pid=d.getParentId();
			if (!pid) break; // root	
			M=d.downgradeMarkups(M);
			if (pid==ancestorId)break;
			d=db.getDocument(pid);
	}
	return M;
}

var hasAncestor=function(ancestor) {
	var ancestorId=ancestor.getId();
	var d=this,db=this.getDB();
	
	while (true) {
		if (!d.getParentId()) return false; // root	
		if (d.getParentId()==ancestorId) return true;
		d=db.getDocument(d.getParentId());
	}
	return false;
}

var getAncestors=function() {
	var d=this,ancestor=[], db=this.getDB();
	while (true) {
			var pid=d.getParentId();
			if (!pid) break; // root	
			d=db.getDocument(pid);
			ancestor.unshift(d);
	}
}
var revertRevision=function(revs,parentinscription) {
	var revert=[], offset=0;
	revs.sort(function(m1,m2){return m1.start-m2.start});
	revs.map(function(r){
		var newinscription="";
		var	m=cloneMarkup(r);
		var newtext=parentinscription.substr(r.start,r.len);
		m.start+=offset;
		m.len=m.payload.text.length;
		m.payload.text=newtext;
		offset+=m.len-newtext.length;
		revert.push(m);
	})
	revert.sort(function(a,b){return b.start-a.start});
	return revert;
}

var _newDocument_ = function(opts) {
	var DOC={}; // the instance
	var _inscription_="";
	var markups=[];
	var revisions=[];

	opts=opts||{};
	opts.id=opts.id || 0; //root id==0
	var parentId=0;
	if (opts.parent) {
		_inscription_=opts.parent.getInscription();
		parentId=opts.parent.getId();
	} 
	var meta= {id:opts.id, parentId:parentId, revert:null, db: opts.db };

	//this is the only function changing inscription,use by DB only
	DOC.__selfEvolve__  = selfEvolve=function(revs,M) { 
		var newinscription=upgradeText(_inscription_, revs);
		var migratedmarkups=[];
		meta.revert=revertRevision(revs,_inscription_);
		_inscription_=newinscription;
		markups=upgradeMarkups(M,revs);
	}

	DOC.getId           = function() { return meta.id;	}
	DOC.getDB           = function() { return meta.db;	}
	DOC.getParentId     = function() { return meta.parentId;	}
	DOC.getMarkups      = function() { return markups	 }
	DOC.getRevert       = function() { return meta.revert	}
	DOC.getRevisions    = function() { return revisions;	}
	DOC.getRevisionCount= function() { return revisions.length}
	DOC.getInscription  = function() { return _inscription_;	}
	DOC.clearRevisions  = function() { revisions.splice(0, revisions.length);}
	DOC.clearMarkups    = function() { markups.splice(0, markups.length);	}
	DOC.addMarkup=addMarkup;
	DOC.addMarkups=addMarkups;
	DOC.addRevision=addRevision;
	DOC.addRevisions=addRevisions;
	DOC.downgradeMarkups=downgradeMarkups;
	DOC.hasAncestor=hasAncestor;
	DOC.downgradeMarkupsTo=downgradeMarkupsTo;
	DOC.upgradeMarkupsTo=upgradeMarkupsTo;
	DOC.getAncestors=getAncestors;
	return DOC;
}

var createDatabase = function() {
	var DB={};
	var documents={};
	var doccount=0;

	var createDocument=function(input) {
		var id=doccount;
		if (typeof input=='string') { 
			root.clearRevisions();
			root.addRevision(0,0,input);			
			var doc=evolveDocument(root);
		} else {
			var parent=input||0;
			var doc=_newDocument_({id:id,parent:parent,db:DB});
			doccount++;
		}
		documents[id] = doc ;
		return doc;
	}

	var root=createDocument();

	var evolveDocument=function(d) {
		var nextgen=createDocument(d);
		nextgen.__selfEvolve__( d.getRevisions() , d.getMarkups() );
		return nextgen;
	}

	var findMRCA=function(doc1,doc2) {
		var ancestors1=doc1.getAncestors();
		var ancestors2=doc2.getAncestors();
	}

	var migrate=function(from,to) {
		var M=from.getMarkups();
		if (typeof to=='undefined') {
			M=from.downgradeMarkups(M);
		} else {
			if (to.hasAncestor(from)) {
				M=from.upgradeMarkupsTo(M,to);
			} else if (from.hasAncestor(to)){
				M=from.downgradeMarkupsTo(M,to);
			} else {
				var ancestor=findMRCA(from,to);
				M=from.downgradeMarkupsTo(M,ancestor);
				M=ancestor.upgradeMarkupsTo(to);
			}
		}
		return M;
	}

	DB.getDocument=function(id) {return documents[id]};
	DB.getDocumentCount=function() {return doccount} ;
	DB.createDocument=createDocument;
	DB.evolveDocument=evolveDocument;
	DB.findMRCA=findMRCA;
	DB.migrate=migrate;
	DB.migrateMarkup=migrateMarkup; //for testing

	return DB;
}

module.exports={ createDatabase: createDatabase }