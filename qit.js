/*
 * qit.js
 *
 * qit.js is a small iterator library for ES5/ES6
 * providing lazy operations on iterator/generator
 * compatible with ES6 iterator protocol.
 *
 * @version 1.0.0
 * @author OHARA Hiroyuki <Hiroyuki.no22@gmail.com>
 * @see https://github.com/no22/qit
 */
/*! qit.js v1.0.0 (c) 2015-2019 OHARA Hiroyuki @license MIT */
(function (root, globalName, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports === "object") {
    module.exports = factory();
  } else {
    root[globalName] = factory();
  }
})(this, "qit", function (undefined) {
  "use strict"
  // Helper functions
  var getPrototypeOf = Object.getPrototypeOf, prototype = Object.prototype, slice = Array.prototype.slice,
    toString = prototype.toString, id = Object().toString(), root = this || (0, eval)('this'),
    symb = root.Symbol ? root.Symbol : {iterator: "@@iterator"}, qoo = root.qoo ? root.qoo : false ;

  function isPlainObject(value) {
    var proto, constructor;
    if (!value || (typeof value !== 'object') || (toString.call(value) !== id)) {
      return false;
    }
    proto = getPrototypeOf(value);
    if (proto === null) {
      constructor = value.constructor;
      if (typeof constructor !== 'function') return true;
      return (constructor.prototype !== value);
    }
    return (proto === prototype) || (getPrototypeOf(proto) === null);
  };

  function inherit(child, parent, obj) {
    var proto = parent.prototype;
    child.prototype = Object.create(proto, {
      constructor: { value: child, enumerable: false, writable: true, configurable: true }
    });
    if (parent._inherit_) parent._inherit_.call(parent, child);
    child.super_ = parent;
    child._super_ = proto;
    if (obj) methods(child, obj);
    return child;
  }

  function methods(klass, obj) {
    var k, proto = klass.prototype;
    for (k in obj) proto[k] = obj[k];
  }

  function StopChunkIteration(){}

  function qit(iter, func, last) {
    return new Iterator(iter, func, last);
  }

  function _iters(iters) {
    var i, iterators = [];
    for (var i = 0, len = iters.length; i < len; ++i) {
      iterators.push(new Iterator(iters[i]));
    }
    return iterators;
  }

  // Iterator
  function Iterator(iter, func, last) {
    var ret = null;
    if (func !== undefined) {
      if (typeof(func) === "function") {
        ret = new FollowIterator(iter, func);
      } else if (typeof iter === "number" && typeof func === "number") {
        ret = new RangeIterator(iter, func, last);
      }
    } else if (iter instanceof Iterator) {
      iter.rewind();
      ret = iter;
    } else if (typeof iter === "string") {
      ret = new StringIterator(iter);
    } else if (Array.isArray(iter)) {
      ret = new ArrayIterator(iter);
    } else if (isPlainObject(iter)) {
      if (iter.next && typeof iter.next === "function") {
        this.iter = iter;
      } else {
        ret = new ObjectIterator(iter);
      }
    } else if (iter[symb.iterator]) {
      this.iter = iter[symb.iterator].call(iter);
    } else {
      this.iter = iter;
    }
    if (ret) return ret;
    this.rewind();
  }

  Iterator.prototype[symb.iterator] = function() {
    return this;
  };

  methods(Iterator, {
    _next: function() {
      if (this.finished) return {done: true};
      var e = this.iter.next();
      if (e.done) this.finished = true;
      return e;
    },
    next: function() { return this._next(); },
    rewind: function() {
      this.finished = false;
      if (this.iter && this.iter.rewind) this.iter.rewind();
      return this;
    },
    each: function(func) {
      var e;
      while(e = this.next(), !e.done) func(e.value);
    },
    reduce: function(func, init) {
      var e, acc = init;
      if (init === undefined) {
        e = this.next();
        if (e.done) return acc;
        acc = e.value;
      }
      while(e = this.next(), !e.done) {
        acc = func(acc, e.value);
      }
      return acc;
    },
    toArray: function() {
      return this.reduce(function(arr, e) {
        arr.push(e);
        return arr;
      }, []);
    },
    head: function(n) { return undefined; },
    concat: function(iters) { return new AppendIterator([this].concat(slice.call(arguments))); },
    map: function(func) { return new MapIterator(this, func); },
    take: function(n) { return new LimitIterator(this, 0, n); },
    drop: function(n) { return new LimitIterator(this, n); },
    filter: function(func) { return new FilterIterator(this, func); },
    takeWhile: function(func) { return new TakeWhileIterator(this, func); },
    dropWhile: function(func) { return new DropWhileIterator(this, func); },
    scan: function(func, init) { return new ScanIterator(this, func, init); },
    zipWith: function(func, iters) { return new ZipIterator([this].concat(slice.call(arguments,1)), func); },
    zipWithLongest: function(func, iters) { return new ZipIterator([this].concat(slice.call(arguments,1)), func, true); },
    zip: function(iters) { return new ZipIterator([this].concat(slice.call(arguments))); },
    zipLongest: function(iters) { return new ZipIterator([this].concat(slice.call(arguments)),undefined,true); },
    cycle: function() { return new CycleIterator(this); },
    buffered: function(n) { return new BufferedIterator(this, n); },
    chunk: function(n) {
      var self = this, 
        iters = Array.apply(null, Array(n)).map(function(){
          return self;
        }); 
      return new ZipIterator(iters, undefined, true, StopChunkIteration).map(function(arr){
        return qit(arr).takeWhile(function(e){
          return e !== StopChunkIteration;
        });
      }); 
    },
    flatten: function() { return new FlattenIterator(this); },
    flatMap: function(func) { return this.map(func).flatten(); },
    product: function(asIter){
      var prd = this.reduce(function(a,b) {
        return qit(a).flatMap(function(x){
            return qit(b).map(function(y){
                return qit(x).concat([y]);
            });
		    });
      }, [[]]);
      if (asIter) return prd;
      return prd.map(function(it){
        return it.toArray();
      });
    },
    find: function(func) {
      var e;
      while(e = this.next(), !e.done) {
        if (func(e.value)) return e.value;
      }
		  return undefined;
    }, 
    every: function(func) {
      var e;
      while(e = this.next(), !e.done) {
        if(!func(e.value)) return false;
      }
      return true;
    },
    some: function(func) {
      var e;
      while(e = this.next(), !e.done) {
        if(func(e.value)) return true;
      }
      return false;
    },
    includes: function(val) {
      return this.some(function(e) {
        return e === val;
      });
    }
  });

  // String Iterator
  function StringIterator(str) {
    this.str = str;
    this.len = str.length;
    this.rewind();
  }

  inherit(StringIterator, Iterator, {
    rewind: function() {
      this.idx = 0;
      return StringIterator._super_.rewind.call(this);
    },
    next: function() {
      if (this.idx >= this.len) {
        this.finished = true;
        return {done: true};
      }
      return {value: this.str[this.idx++], done: false};
    }
  });

  // Array Iterator
  function ArrayIterator(arr) {
    this.arr = arr;
    this.len = arr.length;
    this.rewind();
  }

  inherit(ArrayIterator, Iterator, {
    rewind: function() {
      this.idx = 0;
      return ArrayIterator._super_.rewind.call(this);
    },
    next: function() {
      if (this.idx >= this.len) {
        this.finished = true;
        return {done: true};
      }
      return {value: this.arr[this.idx++], done: false};
    }
  });

  // Object Iterator
  function ObjectIterator(obj) {
    this.obj = obj;
    this.keys = Object.keys(obj);
    this.len = this.keys.length;
    this.rewind();
  }

  inherit(ObjectIterator, Iterator, {
    rewind: function() {
      this.idx = 0;
      return ObjectIterator._super_.rewind.call(this);
    },
    next: function() {
      if (this.idx >= this.len) {
        this.finished = true;
        return {done: true};
      }
      var key = this.keys[this.idx++];
      return {value: [ key, this.obj[key] ], done: false};
    }
  });

  // Follow Iterator
  function FollowIterator(first, func) {
    this.first = first;
    this.func = func;
    this.rewind();
  }

  inherit(FollowIterator, Iterator, {
    rewind: function() {
      this.isFirst = true;
      this.curr = null;
      return FollowIterator._super_.rewind.call(this);
    },
    next: function() {
      if (this.isFirst) {
        this.isFirst = false;
        this.curr = this.first === undefined ? this.func() : this.first ;
      } else {
        this.curr = this.func(this.curr);
      }
      if (this.curr === undefined) {
        this.finished = true;
        return {done: true};
      }
      return {value: this.curr, done: false};
    }
  });

  // Range Iterator
  function RangeIterator(first, second, last) {
    this.first = first;
    if (last === undefined) {
      this.last = second;
      this.step = first <= second ? 1 : -1 ;
    } else {
      this.last = last;
      this.step = second - first;
    }
    this.rewind();
  }

  inherit(RangeIterator, Iterator, {
    rewind: function() {
      this.curr = this.first;
      return RangeIterator._super_.rewind.call(this);
    },
    next: function() {
      if ((this.step > 0 && this.curr > this.last) || (this.step < 0 && this.curr < this.last)) {
        this.finished = true;
        return {done: true};
      }
      var nextVal = this.curr;
      this.curr += this.step;
      return {value: nextVal, done: false};
    }
  });

  // Append Iterator
  function AppendIterator(iters) {
    this.iters = _iters(iters);
    this.rewind();
  }

  inherit(AppendIterator, Iterator, {
    rewind: function() {
      this.idx = 0;
      this.len = this.iters.length;
      for (var i = 0, len = this.len; i < len; ++i) {
        this.iters[i].rewind();
      }
      return AppendIterator._super_.rewind.call(this);
    },
    next: function() {
      var e = this.iters[this.idx].next();
      if (!e.done) return e;
      do {
        if (++this.idx >= this.len) {
          this.finished = true;
          return {done: true};
        }
        e = this.iters[this.idx].next();
      } while(e.done);
      return e;
    }
  });

  // Map Iterator
  function MapIterator(iter, func) {
    this.iter = iter;
    this.func = func;
    this.rewind();
  }

  inherit(MapIterator, Iterator, {
    next: function() {
      var e = this._next();
      if (e.done) return e;
      return {value: this.func(e.value), done: false};
    }
  });

  // Limit Iterator
  function LimitIterator(iter, offset, len, norewind) {
    this.iter = iter;
    this.offset = offset;
    this.len = len;
    this.norewind = norewind;
    this.rewind();
  }

  inherit(LimitIterator, Iterator, {
    rewind: function() {
      this.isFirst = true;
      this.idx = 0;
      if (!this.norewind) return LimitIterator._super_.rewind.call(this);
      this.finished = false;
      return this;
    },
    next: function() {
      var e, i;
      if (this.isFirst) {
        for (i = 0; i < this.offset; ++i) {
          e = this._next();
          if (e.done) return e;
        }
        this.isFirst = false;
      }
      if (this.len === undefined || this.idx < this.len) {
        e = this._next();
        this.idx++;
        if (!e.done) return e;
      }
      this.finished = true;
      return {done: true}
    }
  });

  // Filter Iterator
  function FilterIterator(iter, func) {
    this.iter = iter;
    this.func = func;
    this.rewind();
  }

  inherit(FilterIterator, Iterator, {
    next: function() {
      var e;
      do {
        e = this._next();
        if (e.done) return e;
      } while(!this.func(e.value));
      return e;
    }
  });

  // TakeWhile Iterator
  function TakeWhileIterator(iter, func) {
    this.iter = iter;
    this.func = func;
    this.rewind();
  }

  inherit(TakeWhileIterator, Iterator, {
    next: function() {
      var e;
      e = this._next();
      if (e.done || this.func(e.value)) return e;
      this.finished = true;
      return {done: true};
    }
  });

  // DropWhile Iterator
  function DropWhileIterator(iter, func) {
    this.iter = iter;
    this.func = func;
    this.rewind();
  }

  inherit(DropWhileIterator, Iterator, {
    rewind: function() {
      this.isFirst = true;
      return DropWhileIterator._super_.rewind.call(this);
    },
    next: function() {
      var e;
      e = this._next();
      if (e.done) return e;
      if (this.isFirst) {
        while(this.func(e.value)) {
          e = this._next();
          if (e.done) return e;
        }
        this.isFirst = false;
      }
      return e;
    }
  });

  // Scan Iterator
  function ScanIterator(iter, func, init) {
    this.iter = iter;
    this.func = func;
    this.init = init;
    this.rewind();
  }

  inherit(ScanIterator, Iterator, {
    rewind: function() {
      this.acc = null;
      this.isFirst = true;
      return ScanIterator._super_.rewind.call(this);
    },
    next: function() {
      var e = this._next();
      if (!e.done && this.isFirst) {
        if (this.init === undefined) {
          this.acc = e.value;
          e = this._next();
        } else {
          this.acc = this.init;
        }
        this.isFirst = false;
      }
      if (e.done) return e;
      this.acc = this.func(this.acc, e.value);
      return {value: this.acc, done: false}
    }
  });

  // Zip Iterator
  function ZipIterator(iters, func, longest, fillvalue) {
    this.iters = _iters(iters);
    this.func = func;
    this.longest = longest;
    this.fillvalue = fillvalue === undefined ? null : fillvalue ;
    this.rewind();
  }

  inherit(ZipIterator, Iterator, {
    rewind: function() {
      var i, it, len = this.len = this.iters.length;
      for (i = 0; i < len; ++i) {
        this.iters[i].rewind();
      }
      return ZipIterator._super_.rewind.call(this);
    },
    next: function() {
      var e, i, count = 0, len = this.len, args = [];
      for (i = 0; i < len; ++i) {
        e = this.iters[i].next();
        if (e.done) {
          count++;
          if (!this.longest || count >= len) {
            this.finished = true;
            return e;
          }
          e.value = this.fillvalue;
        }
        args.push(e.value);
      }
      if (this.func === undefined) return {value: args, done: false};
      return {value: this.func.apply(this, args), done: false};
    }
  });

  // Cycle Iterator
  function CycleIterator(iter) {
    this.iter = iter;
    this.rewind();
  }

  inherit(CycleIterator, Iterator, {
    next: function() {
      var e = this._next();
      if (!e.done) return e;
      this.rewind();
      return this._next();
    }
  });

  // Buffered Iterator
  function BufferedIterator(iter, len) {
    this.iter = iter;
    this.len = len;
    this.rewind();
  }

  inherit(BufferedIterator, Iterator, {
    rewind: function() {
      this.isFirst = true;
      this.buffer = [];
      return BufferedIterator._super_.rewind.call(this);
    },
    head: function(n) {
      n = n === undefined ? 0 : n ;
      if (this.isFirst) this.prepare();
      return this.buffer[n];
    },
    prepare: function() {
      var i,e;
      for(i = 0; i < this.len; ++i) {
        e = this.iter.next();
        this.buffer.push(e);
      }
      this.isFirst = false;
    },
    next: function() {
      if (this.finished) return {done: true};
      if (this.isFirst) this.prepare();
      var e = this.iter.next(), c = this.buffer.shift();
      this.buffer.push(e);
      if (c.done) this.finished = true;
      return c;
    }
  });

  // Flatten Iterator
  function FlattenIterator(iter) {
    this.iter = iter;
    this.rewind();
  }

  inherit(FlattenIterator, Iterator, {
    rewind: function() {
      this.currentIter = null;
      return FlattenIterator._super_.rewind.call(this);
    },
    next: function() {
      do {
        if (!this.currentIter) {
          var curr = this.iter.next();
          if (curr.done) {
            this.finished = true;
            return {done: true};
          }
          this.currentIter = new Iterator(curr.value);
        }
        var e = this.currentIter.next();
        if (!e.done) return e;
        this.currentIter = null;
      } while(true);
    }
  });
  
  qit.isPlainObject = isPlainObject;
  qit.Iterator = Iterator;
  qit.StringIterator = StringIterator;
  qit.ArrayIterator = ArrayIterator;
  qit.ObjectIterator = ObjectIterator;
  qit.FollowIterator = FollowIterator;
  qit.RangeIterator = RangeIterator;
  qit.AppendIterator = AppendIterator;
  qit.MapIterator = MapIterator;
  qit.LimitIterator = LimitIterator;
  qit.FilterIterator = FilterIterator;
  qit.TakeWhileIterator =  TakeWhileIterator;
  qit.DropWhileIterator = DropWhileIterator;
  qit.ScanIterator = ScanIterator;
  qit.ZipIterator = ZipIterator;
  qit.CycleIterator = CycleIterator;
  qit.BufferedIterator = BufferedIterator;
  qit.FlattenIterator = FlattenIterator;
  qit.Symbol = symb;

  return qit;
});
