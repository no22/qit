var qit = require("../qit.min.js"),
  assert = require("assert"),
  should = require("should");

describe("ObjectIterator", function(){
  it("returns instance of Iterator when plain object was given on qit function.", function(){
    var seq = qit({foo: 1, bar: 'abc'});
    seq.should.be.an.instanceof(qit.Iterator);
  });
  it("iterates callback function when 'each' method was called.", function(){
    var seq = qit({foo: 1, bar: 'abc'}), acc = [];
    seq.each(function(e){
      acc.push(e);
    });
    acc.should.eql([["foo", 1], ["bar", 'abc']]);
  });
  it("reduces values when 'reduce' method was called.", function(){
    var seq = qit({foo: 1, bar: 2});
    seq.reduce(function(a,b){
      return a+b[1];
    }, 0).should.eql(3);
  });
  it("reduces values when 'reduce' method was called. (no initial value)", function(){
    var seq = qit({foo: 1, bar: 2});
    seq.reduce(function(a,b){
      return ["acc", a[1]+b[1]];
    }).should.eql(["acc", 3]);
  });
  it("returns array object when toArray method was called.", function(){
    var seq = qit({foo: 1, bar: 'abc'});
    seq.toArray().should.eql([["foo", 1], ["bar", 'abc']]);
  });
  it("maps values when 'map' method was called.", function(){
    var seq = qit({foo: 1, bar: 2});
    seq.map(function(x){return x[1]*2}).toArray().should.eql([2,4]);
  });
  it("chaining maps values.", function(){
    var seq = qit({foo: 1, bar: 2});
    seq.map(function(x){return [x[0], x[1]*2]}).map(function(x){return x[1]*x[1]}).toArray().should.eql([4,16]);
  });
  it("filter values.", function(){
    var seq = qit({foo: 1, bar: 2});
    seq.filter(function(x){return x[1] % 2 === 0}).toArray().should.eql([["bar", 2]]);
  });
  it("scans values with initial value.", function(){
    var seq = qit({foo: 1, bar: 2});
    seq.scan(function(a,b){return a+b[1]}, 0).toArray().should.eql([1,3]);
  });
  it("scans values with no initial value.", function(){
    var seq = qit({foo: 1, bar: 2, baz: 3});
    seq.scan(function(a,b){return ["acc", a[1]+b[1]]}).toArray().should.eql([["acc", 3],["acc", 6]]);
  });
  it("takes values.", function(){
    var seq = qit({foo: 1, bar: 2, baz: 3});
    seq.take(2).toArray().should.eql([["foo", 1],["bar", 2]]);
  });
  it("drops values.", function(){
    var seq = qit({foo: 1, bar: 2, baz: 3});
    seq.drop(2).toArray().should.eql([["baz", 3]]);
  });
  it("takes values while callback function returns true.", function(){
    var seq = qit({foo: 1, bar: 2, baz: 3});
    seq.takeWhile(function(x){return x[1]<=2}).toArray().should.eql([["foo", 1],["bar", 2]]);
  });
  it("drops values while callback function returns true.", function(){
    var seq = qit({foo: 1, bar: 2, baz: 3});
    seq.dropWhile(function(x){return x[1]<=2}).toArray().should.eql([["baz", 3]]);
  });
  it("zips sequences.", function(){
    var seq = qit({foo: 1, bar: 2, baz: 3});
    seq.zip([1,2,3,4,5]).toArray().should.eql(
      [
        [["foo", 1], 1],
        [["bar", 2], 2],
        [["baz", 3], 3]
      ]
    );
  });
  it("zips sequences with callback function.", function(){
    var seq = qit({foo: 1, bar: 2, baz: 3});
    seq.zipWith(function(a,b){return a[1]+b}, [1,2,3,4,5]).toArray().should.eql([2,4,6]);
  });
  it("zips sequences. (zipLongest)", function(){
    var seq = qit({foo: 1, bar: 2, baz: 3});
    seq.zipLongest([1,2,3,4,5]).toArray().should.eql(
      [
        [["foo", 1], 1],
        [["bar", 2], 2],
        [["baz", 3], 3],
        [null, 4],
        [null, 5]
      ]
    );
  });
  it("zips sequences with callback function. (zipLongest)", function(){
    var seq = qit({foo: 1, bar: 2, baz: 3});
    seq.zipWithLongest(function(a,b){return a ? a[1]+b : b}, [1,2,3,4,5]).toArray().should.eql([2,4,6,4,5]);
  });
  it("concatenates sequences.", function(){
    var seq = qit({foo: 1, bar: 2, baz: 3});
    seq.concat({hoge: 4, fuga: 5}).toArray().should.eql([
      ["foo", 1],
      ["bar", 2],
      ["baz", 3],
      ["hoge", 4],
      ["fuga", 5]
    ]);
  });
  it("repeats sequences.", function(){
    var seq = qit({foo: 1, bar: 2, baz: 3});
    seq.cycle().take(10).toArray().should.eql([
      ["foo", 1],
      ["bar", 2],
      ["baz", 3],
      ["foo", 1],
      ["bar", 2],
      ["baz", 3],
      ["foo", 1],
      ["bar", 2],
      ["baz", 3],
      ["foo", 1]
    ]);
  });
  it("chunks sequences.", function(){
    var seq = qit({foo: 1, bar: 2, baz: 3});
    seq.chunk(2).map(function(e){return e.toArray()}).toArray().should.eql([
      [["foo", 1], ["bar", 2]],
      [["baz", 3]]
    ]);
  });
  it("has buffer.", function(){
    var _seq = qit({foo: 1, bar: 2, baz: 3}),
      seq = _seq.buffered(1);
    seq.head(0).should.eql({value: ["foo", 1], done:false});
    (typeof seq.head(1)).should.eql('undefined');
    seq.toArray().should.eql([
      ["foo", 1],
      ["bar", 2],
      ["baz", 3]
    ]);
  });
});
