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
	this.__getMarkups__().push(createMarkup(this.getInscription().length,start, len, payload ));
}
var addRevision=function(start,len,str) {
	var valid=this.__getRevisions__().every(function(r) {
		return (r.start+r.len<=start || r.start>=start+len);
	})
	var newrevision=createMarkup(this.getInscription().length,start,len,{text:str});
	if (valid) this.__getRevisions__().push(newrevision);
	return valid;
}
var addMarkups=function(newmarkups,opts) {
	if (opts &&ops.clear) this.clearMarkups();
	var maxlength=this.getInscription().length;
	var markups=this.getMarkups();
	for (var i in newmarkups) {
		m=newmarkups[i];
		var newmarkup=createMarkup(maxlength, m.start, m.len, m.payload)
		markups.push(newmarkup);
	};
}
var addRevisions=function(newrevisions,opts) {
	if (opts &&ops.clear) this.clearRevisions();
	var revisions=this.__getRevisions__();
	var maxlength=this.getInscription().length;
	for (var i in newrevisions) {
		var m=newrevisions[i];
		var newrevision=createMarkup(maxlength, m.start, m.len, m.payload );
		revisions.push(newrevision);	
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

var upgradeMarkupsTo=function(M,targetPage) {
	var d=targetPage, lineage=[], db=this.getDB();
	while (true) {
			var pid=d.getParentId();
			if (!pid) break; // root	
			if (pid==d.getId())break;
			lineage.unshift(d);
			d=db.getPage(pid);
	}
	lineage.map(function(D){
		var parentPage=db.getPage(D.getParentId());
		var rev=revertRevision(D.getRevert(),parentPage.getInscription());
		M=parentPage.upgradeMarkups(M,rev);
	})
	return M;
}

var downgradeMarkupsTo=function(M,targetPage) {
	var d=this,db=this.getDB();
	var ancestorId=targetPage.getId();
	while (true) {
			var pid=d.getParentId();
			if (!pid) break; // root	
			M=d.downgradeMarkups(M);
			if (pid==ancestorId)break;
			d=db.getPage(pid);
	}
	return M;
}

var hasAncestor=function(ancestor) {
	var ancestorId=ancestor.getId();
	var d=this,db=this.getDB();
	
	while (true) {
		if (!d.getParentId()) return false; // root	
		if (d.getParentId()==ancestorId) return true;
		d=db.getPage(d.getParentId());
	}
	return false;
}
var getAncestors=function() {
	var d=this,ancestor=[], db=this.getDB();
	while (true) {
			var pid=d.getParentId();
			if (!pid) break; // root	
			d=db.getPage(pid);
			ancestor.unshift(d);
	}
	return ancestor;
}

var clear=function(M,start,len) { //return number of item removed
	var count=0;
	if (typeof start=='undefined') {
		count=M.length;
	  M.splice(0, M.length);
	  return count;
	}
	if (len<0) len=this.getInscription().length;
	var end=start+len;
	for (var i=M.length-1;i>=0;--i) {
		if (M[i].start>=start && M[i].start+M[i].len<=end) {
			M.splice(i,1);
			count++;
		}
	}
	return count;
}
var clearRevisions=function(start,len) {
	clear.apply(this,[this.__getRevisions__(),start,len]);
}
var clearMarkups=function(start,len) {
	clear.apply(this,[this.__getMarkups__(),start,len]);
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
var newPage = function(opts) {
	var PG={}; // the instance
	var inscription="";
	var markups=[];
	var revisions=[];

	opts=opts||{};
	opts.id=opts.id || 0; //root id==0
	var parentId=0;
	if (typeof opts.parent==='object') {
		inscription=opts.parent.getInscription();
		parentId=opts.parent.getId();
	}
	var db=opts.db;
	var meta= {id:opts.id, parentId:parentId, revert:null };

	//this is the only function changing inscription,use by DB only
	PG.__selfEvolve__  =function(revs,M) { 
		var newinscription=upgradeText(inscription, revs);
		var migratedmarkups=[];
		meta.revert=revertRevision(revs,inscription);
		inscription=newinscription;
		markups=upgradeMarkups(M,revs);
	}
	//protected functions
	PG.__getMarkups__  = function() { return markups; }	
	PG.__getRevisions__= function() { return revisions;	}

	PG.getId           = function() { return meta.id;	}
	PG.getDB           = function() { return db;	}
	PG.getParentId     = function() { return meta.parentId;	}
	PG.getMarkup       = function(i){ return cloneMarkup(markups[i])} //protect from modification
	PG.getMarkupCount  = function() { return markups.length}
	PG.getRevert       = function() { return meta.revert	}
	PG.getRevision     = function(i){ return cloneMarkup(revisions[i])}
	PG.getRevisionCount= function() { return revisions.length}
	PG.getInscription  = function() { return inscription;	}
	PG.clearRevisions  = clearRevisions;
	PG.clearMarkups    = clearMarkups;
	PG.addMarkup       = addMarkup;
	PG.addMarkups      = addMarkups;
	PG.addRevision     = addRevision;
	PG.addRevisions    = addRevisions;
	PG.hasAncestor     = hasAncestor;
	PG.upgradeMarkups  = upgradeMarkups;
	PG.downgradeMarkups= downgradeMarkups;
	PG.upgradeMarkupsTo= upgradeMarkupsTo;
	PG.downgradeMarkupsTo=downgradeMarkupsTo;
	PG.getAncestors    = getAncestors;

	return PG;
}

var createDocument = function() {
	var DB={};
	var pages={};
	var pagecount=0;

	var createPage=function(input) {
		var id=pagecount;
		if (typeof input=='string') { 
			rootPage.clearRevisions();
			rootPage.addRevision(0,0,input);			
			var page=evolvePage(rootPage);
		} else {
			var parent=input||0;
			var page=newPage({id:id,parent:parent,db:DB});
			pagecount++;
		}
		pages[id] = page ;
		return page;
	}

	var rootPage=createPage();   

	var evolvePage=function(d) {//apply revisions and upgrate markup
		var nextgen=createPage(d);
		nextgen.__selfEvolve__( d.__getRevisions__() , d.__getMarkups__() );
		return nextgen;
	}

	var findMRCA=function(pg1,pg2) {
		var ancestors1=pg1.getAncestors();
		var ancestors2=pg2.getAncestors();
		var common=0; //rootPage id
		while (ancestors1.length && ancestors2.length
			  && ancestors1[0].getId()==ancestors2[0].getId()) {
			common=ancestors1[0];
			ancestors1.shift();ancestors2.shift();
		}
		return common;
	}

	var migrate=function(from,to) { //migrate markups of A to B
		var M=from.__getMarkups__();
		var out=null;
		if (typeof to=='undefined') {
			out=from.downgradeMarkups(M);
		} else {
			if (to.hasAncestor(from)) {
				out=from.upgradeMarkupsTo(M,to);
			} else if (from.hasAncestor(to)){
				out=from.downgradeMarkupsTo(M,to);
			} else {
				var ancestor=findMRCA(from,to);
				out=from.downgradeMarkupsTo(M,ancestor);
				out=ancestor.upgradeMarkupsTo(out,to);
			}
		}
		return out;
	}

	DB.getPage=function(id) {return pages[id]};
	DB.getPageCount=function() {return pagecount} ;
	DB.createPage=createPage;
	DB.evolvePage=evolvePage;
	DB.findMRCA=findMRCA;
	DB.migrate=migrate; 
	DB.downgrade=migrate; //downgrade to parent
	DB.migrateMarkup=migrateMarkup; //for testing

	return DB;
}

module.exports={ createDocument: createDocument }