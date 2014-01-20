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
	var origin="道可道非常道名可名非常名";
	equal(d.getId(),1);
	d.addRevision(0,0,origin);
	equal(d.getText(),""); // text is not changed

	ng=db.evolveDocument(d);
	equal(ng.getText(),origin);

	ng.addRevision(4,1,'恆');
	ng.addRevision(6,0,'也');
	ng.addRevision(10,1,'恆');
	ng.addRevision(12,0,'也');

	ng2=db.evolveDocument(ng)
	equal(ng2.getText(),"道可道非恆道也名可名非恆名也");

	ng3=db.newDocument(ng)
	
	ng3.addRevision(3,0,"，")
	ng3.addRevision(6,0,"；")
	ng3.addRevision(9,0,"，")
	ng3.addRevision(12,0,"。")
	punc=db.evolveDocument(ng3);
	equal(punc.getText(),"道可道，非常道；名可名，非常名。");


	//ng4=db.coevolve(ng2,ng3);
	//equal(ng4.getText(),"道可道，非恆道也；名可名，非恆名也。");


});


