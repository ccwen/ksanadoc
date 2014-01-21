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
	deletemiddle={start:3,len:3,payload:{text:""}};
	payload={nothing:true}
	left={start:0,len:3,payload:payload};
	m=db.evolveMarkup( left , deletemiddle) //
	equal(m.start,0);equal(m.len,3);

	right={start:6,len:3,payload:payload};
	m=db.evolveMarkup( right , deletemiddle) //
	equal(m.start,3);equal(m.len,3);

	middle={start:4,len:1,payload:payload};
	m=db.evolveMarkup( middle , deletemiddle) 
	equal(m.start,3);equal(m.len,0);

  leftpartial={start:2,len:3,payload:payload};
	m=db.evolveMarkup( leftpartial , deletemiddle);
	equal(m.start,2);equal(m.len,1);

	partial={start:2,len:5,payload:payload};
	m=db.evolveMarkup( partial , deletemiddle) 
	equal(m.start,2);equal(m.len,2);

  rightpartial={start:4,len:3,payload:payload};
	m=db.evolveMarkup( rightpartial , deletemiddle);
	equal(m.start,3);equal(m.len,1);
});
	//insert text
		//  markup    x    xx      xx      xyz      xyyyz        xyz  
		//  delete   ---   ---    ---       ---      ---        ---     
		//  dout     |     |      |		     x        xz          z            
		//  insert   +++ x +++xx  +++ xx   x+++yz   x+++yyyz    +++ xyz
QUnit.test('evolve markup (insert)',function(){
	var db=new K.Database();
	payload={nothing:true}
	insertmiddle={start:3,len:0,payload:{text:"+++"}};

	left={start:0,len:3,payload:payload};
	m=db.evolveMarkup( left , insertmiddle) // no change
	equal(m.start,0);equal(m.len,3);

	right={start:6,len:3,payload:payload};
	m=db.evolveMarkup( right , insertmiddle) //
	equal(m.start,9);equal(m.len,3);

	middle={start:4,len:1,payload:payload};
	m=db.evolveMarkup( middle , insertmiddle) 
	equal(m.start,7);equal(m.len,1);

  leftpartial={start:2,len:3,payload:payload};
	m=db.evolveMarkup( leftpartial , insertmiddle);
	equal(m.start,2);equal(m.len,6);

	partial={start:2,len:5,payload:payload};
	m=db.evolveMarkup( partial , insertmiddle) 
	equal(m.start,2);equal(m.len,8);

  rightpartial={start:4,len:3,payload:payload};
	m=db.evolveMarkup( rightpartial , insertmiddle);
	equal(m.start,7);equal(m.len,3);

});

var origin="道可道非常道名可名非常名";

QUnit.test('evolve document',function(){
	var db=new K.Database();
	var daodejin=db.newDocument(origin);
	equal(daodejin.getId(),1);

	equal(daodejin.getText(),origin);

	daodejin.addRevision(4,1,'恆');
	daodejin.addRevision(6,0,'也');
	daodejin.addRevision(10,1,'恆');
	daodejin.addRevision(12,0,'也');
	daodejin.addMarkup(2,1,{name:"動詞"});
	daodejin.addMarkup(8,1,{name:"動詞"});

	mawang=db.evolveDocument(daodejin)
	equal(mawang.getText(),"道可道非恆道也名可名非恆名也");
	markups=mawang.getMarkups();

	equal(markups[0].start, 2);
	equal(markups[1].start, 9); 

	daodejin.clearRevisions(); //prepare for new evolution
	daodejin.addRevision(3,0,"，");
	daodejin.addRevision(6,0,"；");
	daodejin.addRevision(9,0,"，");
	daodejin.addRevision(12,0,"。");
	punc=db.evolveDocument(daodejin);
	equal(punc.getText(),"道可道，非常道；名可名，非常名。");

	equal(db.getDocumentCount(),4);//root,daodejin,mawang,punc

	//ng=db.coevolve(mawang,punc);
	//equal(ng.getText(),"道可道，非恆道也；名可名，非恆名也。");
});

QUnit.test('validate markup position',function() {
	var db=new K.Database();
	var daodejin=db.newDocument(origin);
	daodejin.addMarkup(0,-1,{empty:true});
	daodejin.addMarkup(-10,-1,{empty:true});
	daodejin.addMarkup(-10,5,{empty:true});
	daodejin.addMarkup(13,2,{empty:true});
	daodejin.addMarkup(10,10,{empty:true});

	markups=daodejin.getMarkups();
	equal(markups[0].start,0,'markup 1 start');
	equal(markups[0].len,origin.length,'markup 1 length');
	equal(markups[1].start,0,'markup 2 start');
	equal(markups[1].len,origin.length,'markup 2 length');
	equal(markups[2].start,0,'markup 3 start');
	equal(markups[2].len,5,'markup 3 length');
	equal(markups[3].start,12,'markup 4 start');
	equal(markups[3].len,0,'markup 4 length');
	equal(markups[4].start,10,'markup 5 start');
	equal(markups[4].len,2,'markup 5 length');

});
QUnit.test('devolve markups',function(){
	var db=new K.Database();
	var daodejin=db.newDocument(origin+"。");
	daodejin.addRevision(6,0,'也');
	daodejin.addRevision(12,0,'也');
	mawang=db.evolveDocument(daodejin);
	//道可道非常道也名可名非常名也。
	reverse=db.reverseRevision(daodejin.getRevisions(),daodejin.getText());
	mawang.addRevisions(reverse);
	//道可道非常道名可名非常名。
	daodejin2=db.evolveDocument(mawang);
	equal(daodejin2.getText(),origin+"。","rollback with reverse revision"); 

	mawang.addMarkup(13,1,{name:"虛字"});
	mawang.addMarkup(9,1,{name:"動詞"});
	mawang.addMarkup(5,3,{name:"道也名"}); 

	M=db.migrate(mawang);
	
	equal(M[0].start,12,'markup 1 start');
	equal(M[0].len,0,'markup 1 len'); //vanish

	equal(M[1].start,8,'markup 2 start');
	equal(M[1].len,1,'markup 2 len'); //survive
	equal(daodejin2.getText().substr(M[1].start,M[1].len),"名");
	
	equal(M[2].start,5,'markup 3 start');
	equal(M[2].len,2,'markup 3 len'); //survive but content changed
	equal(daodejin2.getText().substr(M[2].start,M[2].len),"道名");
	
});
QUnit.test('coevolve document',function(){
	equal(true,true)
});