/**
 * Copyright (c) 2013, Dan Eyles (dan@irlgaming.com)
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of IRL Gaming nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL IRL Gaming BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var db      = require('../lib/com.scule.db');
var inst    = require('../lib/com.scule.instrumentation');

exports['test QueryOperators'] = function(beforeExit, assert) {

    var engine = db.getQueryEngine();
    
    assert.equal(true,  engine.$eq(1, 1));
    assert.equal(false, engine.$eq(2, 1));
    
    assert.equal(false, engine.$ne(1, 1));
    assert.equal(true,  engine.$ne(2, 1));
    
    assert.equal(true,  engine.$gt(2, 1));
    assert.equal(false, engine.$gt(-1, 1));

    assert.equal(true,  engine.$gte(2, 1));
    assert.equal(false, engine.$gte(-1, 1));
    assert.equal(true,  engine.$gte(2, 2));

    assert.equal(false, engine.$lt(2, 1));
    assert.equal(true,  engine.$lt(-1, 1));

    assert.equal(false, engine.$lte(2, 1));
    assert.equal(true,  engine.$lte(-1, 1));
    assert.equal(true,  engine.$lte(-1, -1));

    assert.equal(true,  engine.$in(1, [2, 3, 1, 4, 5]));
    assert.equal(false, engine.$in(-1, [2, 3, 1, 4, 5]));

    assert.equal(false, engine.$nin(1, [2, 3, 1, 4, 5]));
    assert.equal(true,  engine.$nin(-1, [2, 3, 1, 4, 5]));

    assert.equal(true,  engine.$size([1, 2, 3, 4, 5, 6], 6));
    assert.equal(false, engine.$size([1, 2, 3, 4, 5, 6], 9));
    assert.equal(true,  engine.$size({foo:true, bar:true}, 2));
    assert.equal(false, engine.$size({foo:true, bar:true}, 3));

    assert.equal(true,  engine.$exists('foo', true));
    assert.equal(false, engine.$exists('foo', false));

    assert.equal(true,  engine.$all([9, 8, 7, 1, 2, 0, 3], [1, 2, 3]));
    assert.equal(false, engine.$all([9, 8, 7, 1, 2, 0, 3], [1, 2, 3, 11]));
    
    assert.equal(true,  engine.$elemMatch([{a:0, b:1}, {a:1, b:2}, {a:2, b:3}], function(o) { return o.a == 1 && o.b == 2; }));
    assert.equal(false, engine.$elemMatch([{a:0, b:1}, {a:1, b:2}, {a:2, b:3}], function(o) { return o.a == 3 && o.b == 4; }));

    assert.equal(true,  engine.$near({lat:53, lon:-67}, {lat:53, lon:-67, distance:100}));
    assert.equal(false, engine.$near({lat:53, lon:-60}, {lat:53, lon:-67, distance:1000}));

    assert.equal(true,  engine.$within({lat:53, lon:-67}, {lat:53, lon:-67, distance:0}));
    assert.equal(false, engine.$within({lat:40, lon:-30}, {lat:53, lon:-67, distance:30}));

};

exports['test UpdateOperators'] = function(beforeExit, assert) {

    var engine = db.getQueryEngine();
    var o = null;
    
    // $set
    o = {a:1};
    engine.$set(engine.traverseObject('a', o), 3, false);
    assert.equal(o.a, 3);
    engine.$set(engine.traverseObject('b', o), 3, false);
    assert.equal(false, ('b' in o));
    engine.$set(engine.traverseObject('b', o), 3, true);
    assert.equal(o.b, 3);

    // $unset
    o = {a:1};
    assert.equal(true, ('a' in o));
    engine.$unset(engine.traverseObject('a', o), 3, false);
    assert.equal(false, ('a' in o));

    // $inc
    o = {a:1};
    engine.$inc(engine.traverseObject('a', o), null, false);
    assert.equal(o.a, 2);
    engine.$inc(engine.traverseObject('b', o), 3, false);
    assert.equal(false, ('b' in o));
    engine.$inc(engine.traverseObject('b', o), 3, true);
    assert.equal(o.b, 3);
    engine.$inc(engine.traverseObject('b', o), 1, true);
    assert.equal(o.b, 4);
    engine.$inc(engine.traverseObject('b', o), 2.5, true);
    assert.equal(o.b, 5);
    engine.$inc(engine.traverseObject('b', o), -1, true);
    assert.equal(o.b, 4);

    // $push
    o = {a:[]};
    engine.$push(engine.traverseObject('a', o), 'foo', false);
    assert.equal(o.a.length, 1);
    assert.equal(o.a[0], 'foo');
    engine.$push(engine.traverseObject('a', o), 'bar', false);
    assert.equal(o.a.length, 2);
    assert.equal(o.a[0], 'foo');
    assert.equal(o.a[1], 'bar');
    engine.$push(engine.traverseObject('b', o), 'foo', true);
    assert.equal(true, ('b' in o));
    assert.equal(o.b, 'foo');

    // $pushAll
    o = {a:[]};
    engine.$pushAll(engine.traverseObject('a', o), ['foo', 'bar'], false);
    assert.equal(o.a.length, 2);
    assert.equal(o.a[0], 'foo');
    assert.equal(o.a[1], 'bar');
    engine.$pushAll(engine.traverseObject('b', o), ['foo1', 'bar1'], true);
    assert.equal(true, ('b' in o));
    assert.equal(o.b.length, 2);
    assert.equal(o.b[0], 'foo1');
    assert.equal(o.b[1], 'bar1');
    engine.$push(engine.traverseObject('c', o), ['foo2'], true);
    assert.equal(true, ('c' in o));
    assert.equal(o.c.length, 1);
    assert.equal(o.c[0], 'foo2');

    // $pop
    o = {a:['foo', 'bar', 'moo']};
    engine.$pop(engine.traverseObject('a', o), true, false);
    assert.equal(o.a.length, 2);
    assert.equal(o.a[0], 'foo');
    assert.equal(o.a[1], 'bar');
    engine.$pop(engine.traverseObject('a', o), true, false);
    assert.equal(o.a.length, 1);
    assert.equal(o.a[0], 'foo');
    engine.$pop(engine.traverseObject('a', o), true, false);
    assert.equal(o.a.length, 0);

    // $pull
    o = {a:['foo', 'bar', 'moo', 'mah', 'moo']};
    engine.$pull(engine.traverseObject('a', o), 'moo', false);
    assert.equal(o.a.length, 3);
    assert.equal(o.a[0], 'foo');
    assert.equal(o.a[1], 'bar');
    assert.equal(o.a[2], 'mah');
    engine.$pull(engine.traverseObject('a', o), 'bar', false);
    assert.equal(o.a.length, 2);
    assert.equal(o.a[0], 'foo');
    assert.equal(o.a[1], 'mah');
    engine.$pull(engine.traverseObject('a', o), 'moo', false);
    assert.equal(o.a.length, 2);
    assert.equal(o.a[0], 'foo');
    assert.equal(o.a[1], 'mah');

    // $pullAll
    o = {a:['foo', 'bar', 'moo', 'mah', 'moo']};
    engine.$pullAll(engine.traverseObject('a', o), ['moo', 'bar'], false);
    assert.equal(o.a.length, 2);
    assert.equal(o.a[0], 'foo');
    assert.equal(o.a[1], 'mah');
    engine.$pullAll(engine.traverseObject('a', o), ['foo', 'mah'], false);
    assert.equal(o.a.length, 0);

};

exports['test Normalizer'] = function(beforeExit, assert) {

    var normalizer = db.getQueryNormalizer();
    var query = {
        $or:[{
            c:113, 
            a:{
                $lt:14
            }
        }], 
        foo:3, 
        bar:{
            $lte:100, 
            $gt:4
        }, 
        a:11
    };
    query = normalizer.normalize(query);
    assert.equal('{"a":{"$eq":11},"bar":{"$gt":4,"$lte":100},"foo":{"$eq":3},"$or":[{"a":{"$lt":14},"c":113}]}', JSON.stringify(query));

};

exports['test Selector'] = function(beforeExit, assert) {

    db.dropAll();
    var collection = db.factoryCollection('scule+dummy://unittest');
    collection.ensureHashIndex('a');
    collection.ensureBTreeIndex('d', {
        order:1000
    });

    for (var i=0; i < 100000; i++) {
        collection.save({
            a:i,
            b:i+10,
            c:i+30,
            d:i+5
        });
    }

    var selector = db.getIndexSelector();
    var o = selector.resolveIndices(collection, {
        d:{
            $gte:9000, 
            $lt:9100
        }
    });
    assert.equal(o.length, 100);
    
};

exports['test QueryCompiler'] = function(beforeExit, assert) {

    var d = [];
    for(var i=0; i < 100000; i++) {
        var foo = (i%3 == 0) ? 3 : 1;
        var bar = (i%2 == 0) ? 3 : 2;
        d.push({
            foo: foo, 
            bar: bar
        });
    }
    
    var engine = db.getQueryEngine();
    var interpreter = db.getQueryCompiler();
    
    eval(interpreter.compileQuery({
        foo:{
            $eq:1
        }, 
        bar:{
            $gt:2
        }
    }, {
        $sort:['foo', -1]
        }));
    
    var t = inst.getTimer();
    
    t.startInterval('closure');
    var r2 = c(d, engine);
    t.stopInterval('closure');    
    t.logToConsole();

    assert.equal(r2.length, 33333);

};

exports['test ElemMatch'] = function(beforeExit, assert) {
    
    var d = [];
    for(var i=0; i < 100; i++) {
        var foo = (i%3 == 0) ? 3 : 1;
        var bar = (i%2 == 0) ? 3 : 2;
        var o   = {
            foo: foo, 
            bar: bar,
            arr:[]
        };
        for(var j=0; j < 10; j++) {
            if (i%3 == 0) {
                o.arr.push({
                    j: j,
                    f: j%3
                });
            } else {
                o.arr.push({
                    j: Math.floor(i/10)*2,
                    f: j%2
                });                
            }
        }
        d.push(o);
    }    
    
    var engine = db.getQueryEngine();
    var interpreter = db.getQueryCompiler();
    
    eval(interpreter.compileQuery({bar:{$eq:3}, arr:{$elemMatch:{j:18, f:0}}}));
    
    var t = inst.getTimer();
    
    t.startInterval('closure');
    var r = c(d, engine);
    t.stopInterval('closure');    
    t.logToConsole();

    assert.equal(r.length, 3);
    
};

exports['test Update'] = function(beforeExit, assert) {
    
    var collection = db.factoryCollection('scule+dummy://unittest');
    collection.clear();    
    
    for(var i=0; i < 10000; i++) {
        var foo = (i%3 == 0) ? 3 : 1;
        var bar = (i%2 == 0) ? 3 : 2;
        var o   = {
            zoo: {
                elephant: true,
                giraffe: true
            },
            foo: foo, 
            bar: bar,
            arr:[]
        };
        for(var j=0; j < 10; j++) {
            if (i%3 == 0) {
                o.arr.push({
                    j: j,
                    f: j%3
                });
            } else {
                o.arr.push({
                    j: Math.floor(i/10)*2,
                    f: j%2
                });                
            }
        }
        collection.save(o);
    }    
    
    var interpreter = db.getQueryInterpreter();
    interpreter.update(collection, {foo:3}, {$unset:{'zoo.elephant':true}, $set:{bar:1, lol:'bar2'}, $push:{arr:'foo', arr2:'bar'}}, null, true);
    
    for (var key in collection.documents.table) {
        o = collection.documents.table[key];
        if (o.foo == 3) {
            assert.equal(o.bar, 1);
            assert.equal(o.arr[o.arr.length - 1], 'foo');
            assert.equal(false, ('elephant' in o.zoo));
            assert.equal(true, ('giraffe' in o.zoo));
            assert.equal('bar2', o.lol);
            assert.equal('bar', o.arr2[0]);
        }
    }

};