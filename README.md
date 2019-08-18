qit.js
======================================================================

qit.js is a small iterator library for ES5/ES6 providing lazy operations
on iterator/generator compatible with ES6 iterator protocol.

Getting started
----------------------------------------------------------------------

qit.js has no external dependencies and is only 8kb minified.

### Installation :

```
$ bower install qit
```

or

```
$ npm install qit
```

### In Browsers supporting ES5 / ES6 :

```html
<script src="path/to/qit.min.js"></script>
```

### AMD Loader (require.js) :

```javascript
require(['./qit.min.js'], function (qit) {
  // ...
});
```

### Node.js :

```javascript
var qit = require('qit');
```

Example
----------------------------------------------------------------------

### Lazy map
```javascript
function square(x) {
  console.log('square(' + x + ')');
  return x * x;
}

var it = qit([1,2,3]).map(square);

it.each(function(x){
  console.log(x);
});
```

output:
```
square(1)
1
square(2)
4
square(3)
9
```

### Infinite sequence
```javascript
var nats = qit(1, Infinity);

console.dir(nats.take(5).toArray());


var fibs = qit([1, 1], function(e){
  return [ e[1], e[0] + e[1] ]
}).map(function(e){ return e[0] });

console.dir(fibs.take(10).toArray());
```

output:

```
[ 1, 2, 3, 4, 5 ]
[ 1, 1, 2, 3, 5, 8, 13, 21, 34, 55 ]
```

### Working with ES6 generator
```javascript
function* fibonacci() {
  let a = 1, b = 1;
  while(true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

for(let x of qit(fibonacci()).take(10)) {
  console.log(x);
}
```

Basics
----------------------------------------------------------------------

qit function receives various iterable objects and returns wrapped qit iterators.

### ArrayIterator

```javascript
// qit(array)
var a = qit([1,2,3,4,5]);
```

### StringIterator

```javascript
// qit(string)
var a = qit("ABCDE");
// "A", "B", "C", "D", "E"
```

### ObjectIterator

```javascript
// qit(plain_object)
var a = qit({a:1, b:2, c:3});
// ["a", 1], ["b", 2], ["c", 3]
```

### RangeIterator

```javascript
// qit(first, limit)
var a = qit(1, 5);
// 1, 2, 3, 4, 5

// qit(first, second, limit)
var b = qit(2, 4, 10);
// 2, 4, 6, 8, 10
```

### FollowIterator

```javascript
// qit(first, func)
// qit(x, f) => [ x, f(x), f(f(x)), f(f(f(x))) ... ]
var nats = qit(1, function(n) { return n+1 });
// 1, 2, 3 ...
```

### Lazy methods

#### map
```javascript
// .map(func)
qit([1,2,3]).map(function(x){return x*2}).toArray();
// [2,4,6]
```

#### filter
```javascript
// .filter(func)
qit([1,2,3]).filter(function(x){return x%2 === 1}).toArray();
// [1,3]
```

#### scan
```javascript
// .scan(func, initial_value = this.next().value)
qit([1,2,3]).scan(function(a,b){return a+b}, 0).toArray();
// [0+1,(0+1)+2,((0+1)+2)+3] == [1,3,6]

qit([1,2,3]).scan(function(a,b){return a+b}).toArray();
// [1+2,(1+2)+3] == [3,6]
```

#### take
```javascript
// .take(n)
qit([1,2,3,4,5]).take(3).toArray();
// [1,2,3]
```

#### drop
```javascript
// .drop(n)
qit([1,2,3,4,5]).drop(3).toArray();
// [4,5]
```

#### takeWhile
```javascript
// .takeWhile(func)
qit([1,2,3,4,5]).takeWhile(function(x){return x<3}).toArray();
// [1,2]
```

#### dropWhile
```javascript
// .dropWhile(func)
qit([1,2,3,4,5]).dropWhile(function(x){return x<3}).toArray();
// [3,4,5]
```

#### zip
```javascript
// .zip(iter1, iter2, iter3 ...)
qit([1,2,3,4,5]).zip(['A','B','C']).toArray();
// [[1,'A'],[2,'B'],[3,'C']]
```

#### zipWith
```javascript
// .zipWith(func, iter1, iter2, iter3 ...)
qit([1,2,3,4,5]).zipWith(function(a,b){return b+a}, ['A','B','C']).toArray();
// ['A1','B2','C3']
```

#### zipLongest
```javascript
// .zipLongest(iter1, iter2, iter3 ...)
qit([1,2,3,4,5]).zipLongest(['A','B','C']).toArray();
// [[1,'A'],[2,'B'],[3,'C'],[4,null],[5,null]]
```

#### zipWithLongest
```javascript
// .zipWithLongest(func, iter1, iter2, iter3 ...)
qit([1,2,3,4,5]).zipWithLongest(function(a,b){return b+a}, ['A','B','C']).toArray();
// ['A1','B2','C3',4,5]
```

#### concat
```javascript
// .concat(iter1, iter2, iter3 ...)
qit([1,2,3,4,5]).concat(['A','B','C']).toArray();
// [1,2,3,4,5,'A','B','C']
```

#### cycle
```javascript
// .cycle()
qit([1,2,3]).cycle().take(8).toArray();
// [1,2,3,1,2,3,1,2]
```

#### chunk
```javascript
// .chunk(n)
qit(1,10).chunk(3).map(function(e){return e.toArray()}).toArray();
// [[1,2,3],[4,5,6],[7,8,9],[10]]
```

#### buffered
```javascript
// .buffered(n)
var it = qit(10,1).buffered(3);
console.log(it.head(0)); // {value: 10, done:false}
console.log(it.head(1)); // {value: 9, done:false}
console.log(it.head(2)); // {value: 8, done:false}
console.log(it.toArray());
// [10,9,8,7,6,5,4,3,2,1]
```

#### flatten (v1.0.0)
```javascript
// .flatten()
qit([1,2,3,[4,5,6],[7,[8,9]]]).flatten().toArray();
// [1,2,3,4,5,6,7,[8,9]]
```

#### flatMap (v1.0.0)
```javascript
// .flatMap(func)
qit([1,2,3]).flatMap(function(e){return [e, e*e]}).toArray();
// [1,2,2,4,3,9]
```

#### product (v1.0.0)
```javascript
// .product(return_as_iterator)
qit([[1,2,3],[4,5,6],[7,8],[9,10]]).product().take(3).toArray();
// [[1,4,7,9],[1,4,7,10],[1,4,8,9]]
```

### Eager methods

#### each
```javascript
// .each(func)
qit("Hello").each(function(c){
  console.log(c);
});
```
output:
```javascript
H
e
l
l
o
```

### reduce
```javascript
// .reduce(func, initial_value = this.next().value)
qit([1,2,3,4,5]).reduce(function(a, b){
  return a + b;
}, 0);
// ((((0+1)+2)+3)+4)+5 = 15
```

### toArray
```javascript
// .toArray()
qit(1,10).toArray();
// [1,2,3,4,5,6,7,8,9,10]
```

### find (v1.0.0)
```javascript
// .find(func)
qit([1,2,3]).find(function(e){ return e === 2 ;});
// 2
```
### every (v1.0.0)
```javascript
// .every(func)
qit([1,2,1]).every(function(e){ return e === 1 ;});
// false
```

### some (v1.0.0)
```javascript
// .some(func)
qit([1,2,1]).some(function(e){ return e === 2 ;});
// true
```

### includes (v1.0.0)
```javascript
// .includes(value)
qit([1,2,1]).includes(2);
// true
```

License
----------------------------------------------------------------------

Copyright (c) 2015-2019 OHARA Hiroyuki Licensed under the MIT license.
