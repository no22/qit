var qit = require("../qit.min.js"),
  assert = require("assert"),
  should = require("should");

describe("StringIterator", function(){
  it("returns instance of Iterator when string was given on qit function.", function(){
    var seq = qit("abc");
    seq.should.be.an.instanceof(qit.Iterator);
  });
  it("iterates callback function when 'each' method was called.", function(){
    var seq = qit("abc"), acc = [];
    seq.each(function(e){
      acc.push(e);
    });
    acc.should.eql(['a','b','c']);
  });
  it("reduces values when 'reduce' method was called.", function(){
    var seq = qit("abc");
    seq.reduce(function(a,b){
      return a+b;
    }, "*").should.eql("*abc");
  });
  it("reduces values when 'reduce' method was called. (no initial value)", function(){
    var seq = qit("abc");
    seq.reduce(function(a,b){
      return b+a;
    }).should.eql("cba");
  });
  it("returns array object when toArray method was called.", function(){
    var seq = qit("abc");
    seq.toArray().should.eql(['a','b','c']);
  });
  it("maps values when 'map' method was called.", function(){
    var seq = qit("abc");
    seq.map(function(x){return x+"1"}).toArray().should.eql(['a1','b1','c1']);
  });
  it("chaining maps values.", function(){
    var seq = qit("abc");
    seq.map(function(x){return x+"1"}).map(function(x){return "("+x+")"}).toArray().should.eql(['(a1)','(b1)','(c1)']);
  });
  it("filter values.", function(){
    var seq = qit("abc");
    seq.filter(function(x){return x !== 'b'}).toArray().should.eql(['a', 'c']);
  });
  it("scans values with initial value.", function(){
    var seq = qit("abc");
    seq.scan(function(a,b){return a+b}, '*').toArray().should.eql(['*a','*ab','*abc']);
  });
  it("scans values with no initial value.", function(){
    var seq = qit("abc");
    seq.scan(function(a,b){return b+a}).toArray().should.eql(['ba','cba']);
  });
  it("takes values.", function(){
    var seq = qit("abcdefg");
    seq.take(5).toArray().should.eql(["a","b","c","d","e"]);
  });
  it("drops values.", function(){
    var seq = qit("abcdefg");
    seq.drop(5).toArray().should.eql(["f","g"]);
  });
  it("takes values while callback function returns true.", function(){
    var seq = qit("abcdefg");
    seq.takeWhile(function(x){return x<='d'}).toArray().should.eql(["a","b","c","d"]);
  });
  it("drops values while callback function returns true.", function(){
    var seq = qit("abcdefg");
    seq.dropWhile(function(x){return x<='d'}).toArray().should.eql(["e","f","g"]);
  });
  it("zips sequences.", function(){
    var seq = qit("abcde");
    seq.zip("fghi").toArray().should.eql([['a','f'],['b','g'],['c','h'],['d','i']]);
  });
  it("zips sequences with callback function.", function(){
    var seq = qit("abcde");
    seq.zipWith(function(a,b){return a+b}, "1234").toArray().should.eql(['a1','b2','c3','d4']);
  });
  it("zips sequences. (zipLongest)", function(){
    var seq = qit("abcde");
    seq.zipLongest("fghi").toArray().should.eql([['a','f'],['b','g'],['c','h'],['d','i'],['e', null]]);
  });
  it("zips sequences with callback function. (zipLongest)", function(){
    var seq = qit("abcde");
    seq.zipWithLongest(function(a,b){return a+b}, "1234").toArray().should.eql(['a1','b2','c3','d4','enull']);
  });
  it("concatenates sequences.", function(){
    var seq = qit("abc");
    seq.concat("defg").toArray().should.eql(["a","b","c","d","e","f","g"]);
  });
  it("repeats sequences.", function(){
    var seq = qit("abc");
    seq.cycle().take(10).toArray().should.eql(["a","b","c","a","b","c","a","b","c","a"]);
  });
  it("chunks sequences.", function(){
    var seq = qit("abcdefghij");
    seq.chunk(3).map(function(e){return e.toArray()}).toArray().should.eql([["a","b","c"],["d","e","f"],["g","h","i"],["j"]]);
  });
  it("has buffer.", function(){
    var _seq = qit("abcdef"),
      seq = _seq.buffered(3);
    seq.head(0).should.eql({value: 'a', done:false});
    seq.head(1).should.eql({value: 'b', done:false});
    seq.head(2).should.eql({value: 'c', done:false});
    (typeof seq.head(3)).should.eql('undefined');
    seq.toArray().should.eql(["a","b","c","d","e","f"]);
  });
});
