var qit = require("../qit.min.js"),
  assert = require("assert"),
  should = require("should");

describe("RangeIterator", function(){
  it("returns instance of Iterator when first and last value were given on qit function.", function(){
    var seq = qit(1, 3);
    seq.should.be.an.instanceof(qit.Iterator);
  });
  it("iterates callback function when 'each' method was called.", function(){
    var seq = qit(1, 3), acc = [];
    seq.each(function(e){
      acc.push(e);
    });
    acc.should.eql([1,2,3]);
  });
  it("reduces values when 'reduce' method was called.", function(){
    var seq = qit(1, 4);
    seq.reduce(function(a,b){
      return a+b;
    }, 0).should.eql(10);
  });
  it("reduces values when 'reduce' method was called. (no initial value)", function(){
    var seq = qit(1, 4);
    seq.reduce(function(a,b){
      return a*b;
    }).should.eql(24);
  });
  it("returns array object when toArray method was called.", function(){
    var seq = qit(1, 3);
    seq.toArray().should.eql([1,2,3]);
  });
  it("returns arithmetic sequence when first and second and limit value were given on qit function.", function(){
    var seq = qit(1, 3, 10);
    seq.toArray().should.eql([1,3,5,7,9]);
    seq = qit(5, 3, -6);
    seq.toArray().should.eql([5,3,1,-1,-3,-5]);
  });
  it("returns infinite sequence when Infinity as last value were given on qit function.", function(){
    var seq = qit(1, Infinity);
    seq.take(10).toArray().should.eql([1,2,3,4,5,6,7,8,9,10]);
    seq = qit(1, 3, Infinity);
    seq.take(5).toArray().should.eql([1,3,5,7,9]);
  });
  it("maps values when 'map' method was called.", function(){
    var seq = qit(1, 3);
    seq.map(function(x){return x*x}).toArray().should.eql([1,4,9]);
  });
  it("chaining maps values.", function(){
    var seq = qit(1, 3);
    seq.map(function(x){return x+1}).map(function(x){return x*x}).toArray().should.eql([4,9,16]);
  });
  it("filter values.", function(){
    var seq = qit(1, 5);
    seq.filter(function(x){return x%2 === 1}).toArray().should.eql([1,3,5]);
  });
  it("scans values with initial value.", function(){
    var seq = qit(1, 5);
    seq.scan(function(a,b){return a+b}, 0).toArray().should.eql([1,3,6,10,15]);
  });
  it("scans values with no initial value.", function(){
    var seq = qit(1, 5);
    seq.scan(function(a,b){return a+b}).toArray().should.eql([3,6,10,15]);
  });
  it("takes values.", function(){
    var seq = qit(1, 10);
    seq.take(5).toArray().should.eql([1,2,3,4,5]);
  });
  it("drops values.", function(){
    var seq = qit(1, 10);
    seq.drop(5).toArray().should.eql([6,7,8,9,10]);
  });
  it("takes values while callback function returns true.", function(){
    var seq = qit(1, 10);
    seq.takeWhile(function(x){return x<=5}).toArray().should.eql([1,2,3,4,5]);
  });
  it("drops values while callback function returns true.", function(){
    var seq = qit(1, 10);
    seq.dropWhile(function(x){return x<=5}).toArray().should.eql([6,7,8,9,10]);
  });
  it("zips sequences.", function(){
    var seq = qit(1, 5);
    seq.zip(qit(6, 9)).toArray().should.eql([[1,6],[2,7],[3,8],[4,9]]);
  });
  it("zips sequences with callback function.", function(){
    var seq = qit(1, 5);
    seq.zipWith(function(a,b){return a*b}, qit(6, 9)).toArray().should.eql([6,14,24,36]);
  });
  it("zips sequences. (zipLongest)", function(){
    var seq = qit(1, 5);
    seq.zipLongest(qit(6, 9)).toArray().should.eql([[1,6],[2,7],[3,8],[4,9],[5,null]]);
  });
  it("zips sequences with callback function. (zipLongest)", function(){
    var seq = qit(1, 5);
    seq.zipWithLongest(function(a,b){return a*b}, qit(6, 9)).toArray().should.eql([6,14,24,36,0]);
  });
  it("concatenates sequences.", function(){
    var seq = qit(1, 5);
    seq.concat(qit(6, 10)).toArray().should.eql([1,2,3,4,5,6,7,8,9,10]);
  });
  it("repeats sequences.", function(){
    var seq = qit(1, 3);
    seq.cycle().take(10).toArray().should.eql([1,2,3,1,2,3,1,2,3,1]);
  });
  it("chunks sequences.", function(){
    var seq = qit(1, 10);
    seq.chunk(3).map(function(e){return e.toArray()}).toArray().should.eql([[1,2,3],[4,5,6],[7,8,9],[10]]);
  });
  it("has buffer.", function(){
    var _seq = qit(1, 10),
      seq = _seq.buffered(3);
    seq.head(0).should.eql({value: 1, done:false});
    seq.head(1).should.eql({value: 2, done:false});
    seq.head(2).should.eql({value: 3, done:false});
    (typeof seq.head(3)).should.eql('undefined');
    seq.toArray().should.eql([1,2,3,4,5,6,7,8,9,10]);
  });
  it("flatten sequences.", function(){
    var seq1to2 = qit(1, 2);
    var seq3to5 = qit(3, 5);
    var seq6to7 = qit(6, 7);
    var seq8to10 = qit(8, 10);
    var seq = qit([seq1to2,seq3to5,seq6to7,seq8to10]);
    seq.flatten().toArray().should.eql([1,2,3,4,5,6,7,8,9,10]);
  });
  it("flatMap sequences.", function(){
    var seq = qit(1, 3);
    seq.flatMap(function(e){return [e, e*e]}).toArray().should.eql([1,1,2,4,3,9]);
  });
  it("product sequences.", function(){
    var seq = qit([qit(1,3), qit(4,6), qit(7,8), qit(9,10)]);
    seq.product().take(3).toArray().should.eql([[1,4,7,9],[1,4,7,10],[1,4,8,9]]);
  });
  it("find sequences.", function(){
    var seq = qit(1, 10);
    seq.find(function(e){return e === 3;}).should.eql(3);
  });
  it("every sequences.", function(){
    var seq = qit(1, 10);
    seq.every(function(e){return e === 1;}).should.eql(false);
  });
  it("some sequences.", function(){
    var seq = qit(1, 10);
    seq.some(function(e){return e === 2;}).should.eql(true);
  });
  it("includes sequences.", function(){
    var seq = qit(1, 10);
    seq.includes(2).should.eql(true);
  });
  it("chunked and flatten sequences.", function(){
    var seq = qit(1, 10);
    seq.chunk(3).flatten().toArray().should.eql([1,2,3,4,5,6,7,8,9,10]);
  });
});
