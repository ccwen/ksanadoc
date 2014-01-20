var K=require('../kdoc');

console.log('ksana document test suite');


QUnit.test('new document',function(){
	var db=new K.Database();
	var d=db.newDocument();
	equal(d.getText(),"");
	equal(d.getId(),1);
	equal(db.getDocumentCount(),2);
});

QUnit.test('evolve document',function(){
	var db=new K.Database();
	var d=db.newDocument();
	equal(d.getId(),1);
	d.addRevision(0,0,"first line text");
	equal(d.getText(),""); // text is not changed

	ng=db.evolveDocument(d);
	equal(ng.getText(),"first line text");

	ng.addRevision(11,0,'of ');
	ng2=db.evolveDocument(ng)
	equal(ng2.getText(),"first line of text");
});

