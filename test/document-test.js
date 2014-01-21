var K=require('../kdoc');

console.log('ksana document test suite');


QUnit.test('new document',function(){
	var db=new K.Database();
	var d=db.newDocument();
	equal(d.getText(),"");
	equal(d.getId(),1);
	equal(db.getDocumentCount(),2);
});


QUnit.test('evolve markup (delete)',function(){
	var db=new K.Database();
	deletemiddle={start:3,len:3,payload:""};

	left={start:0,len:3,payload:"***"};
	m=db.evolveMarkup( left , deletemiddle) //
	equal(JSON.stringify(m), JSON.stringify(left));

	right={start:6,len:3,payload:"***"};
	m=db.evolveMarkup( right , deletemiddle) //
	equal(JSON.stringify(m), JSON.stringify({start:3,len:3,payload:"***"}));	

	middle={start:4,len:1,payload:"***"};
	m=db.evolveMarkup( middle , deletemiddle) 
	equal(JSON.stringify(m), JSON.stringify({start:3,len:0,payload:"***"}));

  leftpartial={start:2,len:3,payload:"***"};
	m=db.evolveMarkup( leftpartial , deletemiddle);
	equal(JSON.stringify(m), JSON.stringify({start:2,len:1,payload:"***"}));

	partial={start:2,len:5,payload:"***"};
	m=db.evolveMarkup( partial , deletemiddle) 
	equal(JSON.stringify(m), JSON.stringify({start:2,len:2,payload:"***"}));

  rightpartial={start:4,len:3,payload:"***"};
	m=db.evolveMarkup( rightpartial , deletemiddle);
	equal(JSON.stringify(m), JSON.stringify({start:3,len:1,payload:"***"}));
});
	//insert text
		//  markup    x    xx      xx      xyz      xyyyz        xyz  
		//  delete   ---   ---    ---       ---      ---        ---     
		//  dout     |     |      |		     x        xz          z            
		//  insert   +++ x +++xx  +++ xx   x+++yz   x+++yyyz    +++ xyz
QUnit.test('evolve markup (insert)',function(){
	var db=new K.Database();
	insertmiddle={start:3,len:0,payload:"+++"};

	left={start:0,len:3,payload:"***"};
	m=db.evolveMarkup( left , insertmiddle) // no change
	equal(JSON.stringify(m), JSON.stringify(left));

	right={start:6,len:3,payload:"***"};
	m=db.evolveMarkup( right , insertmiddle) //
	equal(JSON.stringify(m), JSON.stringify({start:9,len:3,payload:"***"}));	

	middle={start:4,len:1,payload:"***"};
	m=db.evolveMarkup( middle , insertmiddle) 
	equal(JSON.stringify(m), JSON.stringify({start:7,len:1,payload:"***"}));

  leftpartial={start:2,len:3,payload:"***"};
	m=db.evolveMarkup( leftpartial , insertmiddle);
	equal(JSON.stringify(m), JSON.stringify({start:2,len:6,payload:"***"}));

	partial={start:2,len:5,payload:"***"};
	m=db.evolveMarkup( partial , insertmiddle) 
	equal(JSON.stringify(m), JSON.stringify({start:2,len:8,payload:"***"}));

  rightpartial={start:4,len:3,payload:"***"};
	m=db.evolveMarkup( rightpartial , insertmiddle);
	equal(JSON.stringify(m), JSON.stringify({start:7,len:3,payload:"***"}));

});
QUnit.test('evolve document',function(){
	var db=new K.Database();

	var origin="道可道非常道名可名非常名";
	var daodejin=db.newDocument(origin);
	equal(daodejin.getId(),1);

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

	equal(db.getDocumentCount(),4);//root,d,daodejin,mawang,punc
	//ng=db.coevolve(mawang,punc);
	//equal(ng.getText(),"道可道，非恆道也；名可名，非恆名也。");


	daodejin.addMarkup(2,1,{name:"動詞"});
	daodejin.addMarkup(8,1,{name:"動詞"});
});


