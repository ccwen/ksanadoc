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

	daodejin=db.evolveDocument(d);
	equal(daodejin.getText(),origin);

	daodejin.addRevision(4,1,'恆');
	daodejin.addRevision(6,0,'也');
	daodejin.addRevision(10,1,'恆');
	daodejin.addRevision(12,0,'也');

	mawang=db.evolveDocument(daodejin)
	equal(mawang.getText(),"道可道非恆道也名可名非恆名也");

	daodejin.clearRevisions(); //prepare for new evolution
	daodejin.addRevision(3,0,"，");
	daodejin.addRevision(6,0,"；");
	daodejin.addRevision(9,0,"，");
	daodejin.addRevision(12,0,"。");
	punc=db.evolveDocument(daodejin);
	equal(punc.getText(),"道可道，非常道；名可名，非常名。");

	equal(db.getDocumentCount(),5);//root,d,daodejin,mawang,punc
	//ng=db.coevolve(mawang,punc);
	//equal(ng.getText(),"道可道，非恆道也；名可名，非恆名也。");


});


