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

var sculedb = require('../lib/com.scule.db.parser');
var db      = require('../lib/com.scule.db');
var build   = require('../lib/com.scule.db.builder');
var comp    = require('../lib/com.scule.query.interpreter');
var inst    = require('../lib/com.scule.instrumentation');

exports['test QueryTreeVisitor'] = function(beforeExit, assert) {
    
    db.dropAll();
    var collection = db.factoryCollection('scule+dummy://unittest');
    collection.ensureBTreeIndex('a,b', {
        order:100
    });
    collection.ensureHashIndex('b');
    collection.ensureHashIndex('foo', {});
    collection.ensureBTreeIndex('a', {
        order:100
    });
    collection.ensureHashIndex('c');
    collection.ensureBTreeIndex('d', {
        order:100
    });
    collection.ensureHashIndex('d');
    
    var query = {
        a:{
            $gt:2, 
            $in:[4, 5, 7, 8, 9], 
            $eq:666
        },
        b:3,
        c:{
            $in:[2,1,3,9,7], 
            $nin:['a', 'c', 'b', 10, 0, 'z']
        },
        d:{
            $gt:10, 
            $lte:240
        },
        foo:'bar'
    };
    
    var parser  = sculedb.getQueryParser();
    var visitor = build.getQueryTreeIndexSelectionVisitor(collection);
    var tree = parser.parseQuery(query, {}, collection);
    tree.accept(visitor);

    assert.equal(tree.getRoot().getChild(0).getSymbol(), 'd');
    assert.equal(tree.getRoot().getChild(0).getType(), 10);
    assert.equal(tree.getRoot().getChild(1).getSymbol(), 'a');
    assert.equal(tree.getRoot().getChild(1).getType(), 10);
    assert.equal(tree.getRoot().getChild(2).getSymbol(), 'foo');
    assert.equal(tree.getRoot().getChild(2).getType(), 10);
    assert.equal(tree.getRoot().getChild(3).getSymbol(), 'a,b');
    assert.equal(tree.getRoot().getChild(3).getType(), 10);

};

exports['test QueryTreeVisitor2'] = function(beforeExit, assert) {
    
    db.dropAll();
    var collection = db.factoryCollection('scule+dummy://unittest');
    collection.ensureBTreeIndex('a,b', {
        order:100
    });
    collection.ensureHashIndex('b');
    collection.ensureBTreeIndex('a', {
        order:100
    });
    collection.ensureHashIndex('c');
    collection.ensureBTreeIndex('d', {
        order:100
    });
    collection.ensureHashIndex('d');
    
    var query = {
        a:{
            $gt:2, 
            $in:[4, 5, 7, 8, 9], 
            $eq:666
        },
        b:3,
        c:{
            $in:[2,1,3,9,7], 
            $nin:['a', 'c', 'b', 10, 0, 'z']
        },
        d:{
            $gt:10, 
            $lte:240
        },
        foo:'bar'
    };
    
    var parser  = sculedb.getQueryParser();
    var visitor = build.getQueryTreeIndexSelectionVisitor(collection);
    var tree    = parser.parseQuery(query, {}, collection);
    tree.accept(visitor);

    assert.equal(tree.getRoot().getChild(0).getSymbol(), 'd');
    assert.equal(tree.getRoot().getChild(0).getType(), 10);
    assert.equal(tree.getRoot().getChild(1).getSymbol(), 'a');
    assert.equal(tree.getRoot().getChild(1).getType(), 10);
    assert.equal(tree.getRoot().getChild(2).getSymbol(), 'a,b');
    assert.equal(tree.getRoot().getChild(2).getType(), 10);

};

exports['test QueryTreeVisitor3'] = function(beforeExit, assert) {
    
    db.dropAll();
    var collection = db.factoryCollection('scule+dummy://unittest');
    collection.ensureBTreeIndex('d', {
        order:100
    });    
    collection.ensureBTreeIndex('a', {
        order:100
    });
    collection.ensureHashIndex('d');
    
    var query = {
        a:{
            $gt:2, 
            $in:[4, 5, 7, 8, 9], 
            $eq:666
        },
        b:3,
        c:{
            $in:[2,1,3,9,7], 
            $nin:['a', 'c', 'b', 10, 0, 'z']
        },
        d:{
            $gt:10, 
            $lte:240
        },
        foo:'bar'
    };
    
    var parser  = sculedb.getQueryParser();
    var visitor = build.getQueryTreeIndexSelectionVisitor(collection);
    var tree    = parser.parseQuery(query, {}, collection);
    tree.accept(visitor);

    assert.equal(tree.getRoot().getChild(0).getSymbol(), 'a');
    assert.equal(tree.getRoot().getChild(0).getType(), 10);
    assert.equal(tree.getRoot().getChild(1).getSymbol(), 'a');
    assert.equal(tree.getRoot().getChild(1).getType(), 10);
    assert.equal(tree.getRoot().getChild(2).getSymbol(), 'd');
    assert.equal(tree.getRoot().getChild(2).getType(), 10);

};

exports['test QueryCompiler'] = function(beforeExit, assert) {

    db.dropAll();
    var collection = db.factoryCollection('scule+dummy://unittest');
    collection.ensureBTreeIndex('a,b', {
        order:100
    });
    collection.ensureHashIndex('b');
    collection.ensureHashIndex('foo', {});
    collection.ensureBTreeIndex('a', {
        order:100
    });
    collection.ensureHashIndex('c');
    collection.ensureBTreeIndex('d', {
        order:100
    });
    collection.ensureHashIndex('d');
    
    var query = {
        a:{
            $gt:2, 
            $in:[4, 5, 7, 8, 9]
        },
        b:3,
        c:{
            $in:[2,1,3,9,7], 
            $nin:['a', 'c', 'b', 10, 0, 'z']
        },
        d:{
            $gt:10, 
            $lte:240
        },
        foo:'bar'
    };

    var compiler = build.getQueryCompiler();
    var program  = compiler.compileQuery(query, {}, collection);

    assert.equal(program.length, 15);
    assert.equal(program[0][0], 0x1D);
    assert.equal(program[1][0], 0x1D);
    assert.equal(program[2][0], 0x1B);
    assert.equal(program[3][0], 0x1B);
    assert.equal(program[4][0], 0x23);
    assert.equal(program[5][0], 0x21);
    assert.equal(program[6][0], 0x27);
    assert.equal(program[14][0], 0x00);
    
};

exports['test QueryCompiler2'] = function(beforeExit, assert) {

    db.dropAll();
    var collection = db.factoryCollection('scule+dummy://unittest');
    collection.ensureBTreeIndex('a,b', {
        order:100
    });
    collection.ensureHashIndex('a,b');
    
    var query = {
        a:666,
        b:3
    };

    var compiler = build.getQueryCompiler();    
    var program  = compiler.compileQuery(query, {}, collection);
    
    assert.equal(program.length, 5);
    assert.equal(program[0][0], 0x1B);
    assert.equal(program[1][0], 0x23);
    assert.equal(program[2][0], 0x21);
    assert.equal(program[3][0], 0x28);
    assert.equal(program[4][0], 0x00);
    
};

/*
exports['test ElemMatch'] = function(beforeExit, assert) {


    var e = {
        isArray: function(o) {
            return (Object.prototype.toString.call(o) === '[object Array]');
        },
        contains: function(o, key) {
             return o.hasOwnProperty(key);
        },
        $eq: function(a, b) {
            return a == b;
        },
        $gt: function(a, b) {
            return a > b;
        }
    }

    eval("var queryClosure = function(documents, engine) {\
        var results   = [];\
        var document  = null;\
        documents.forEach(function(document) {\
            if (!engine.$eq(document.foo, 3)) {\
                return;\
            }\
            if (!engine.$gt(document.bar, 2)) {\
                return;\
            }\
            results.push(document);\
        });\
        return results;\
    }");

//    var queryClosure = function(documents, engine) {
//        var results = [];
//        var o       = null;
//        documents.forEach(function(o) {
//            if (!engine.$eq(o.foo, 3)) {
//                return;
//            }
//            if (!engine.$gt(o.bar, 2)) {
//                return;
//            }
//            results.push(o);
//        });
//        return results;
//    };

    db.dropAll();
    var collection = db.factoryCollection('scule+dummy://unittest');
    collection.ensureHashIndex('foo,bar');
    
    var d = [];
    for(var i=0; i < 1000; i++) {
        var foo = (i%3 == 0) ? 3 : 1;
        var bar = (i%2 == 0) ? 3 : 2;
        d.push({foo: foo, bar: bar});
        collection.save({foo: foo, bar: bar});
    }

    var t = inst.getTimer();

    t.startInterval('query1');
    var r1 = collection.find({foo:3, bar:{$gt:2}});
    t.stopInterval('query1');

    t.startInterval('query2');
    var r2 = collection.find({foo:3, bar:{$gt:2}});
    t.stopInterval('query2');

    t.startInterval('closure');
    var r3 = queryClosure(d, e);
    t.stopInterval('closure');    
    
    t.logToConsole();
    
    console.log(r1.length);
    console.log(r2.length);
    console.log(r3.length);
    
};

exports['test Normalizer'] = function(beforeExit, assert) {

    var normalizer = comp.getQueryNormalizer();
    var query = {$or:{c:113, a:{$lt:14}}, foo:3, bar:{$lte:100, $gt:4}, a:11};
    query = normalizer.normalize(query);
    console.log(query);

};
*/

exports['test Selector'] = function(beforeExit, assert) {

    db.dropAll();
    var collection = db.factoryCollection('scule+dummy://unittest');
    collection.ensureHashIndex('a');
    collection.ensureBTreeIndex('d', {order:1000});

    for (var i=0; i < 100000; i++) {
        collection.save({
            a:i,
            b:i+10,
            c:i+30,
            d:i+5
        });
    }

    var selector = comp.getIndexSelector();
    var o = selector.resolveIndices(collection, {d:{$gte:9000, $lt:9100}});

    console.log(o);
    
};

/*
exports['test LOL'] = function(beforeExit, assert) {

    var d = [];
    for(var i=0; i < 1000000; i++) {
        var foo = (i%3 == 0) ? 3 : 1;
        var bar = (i%2 == 0) ? 3 : 2;
        d.push({
            foo: foo, 
            bar: bar
        });
    }
    
    var engine = comp.getQueryEngine();
    var interpreter = comp.getQueryCompiler();
    
    interpreter.explainQuery({
        foo:{
            $eq:1
        }, 
        bar:{
            $gt:2
        }
    }, {$sort:['foo', -1]});    
    
    eval(interpreter.compileQuery({
        foo:{
            $eq:1
        }, 
        bar:{
            $gt:2
        }
    }, {$sort:['foo', -1]}));
    
    var t = inst.getTimer();
    
    t.startInterval('closure');
    var r2 = c(d, engine);
    t.stopInterval('closure');    
    t.logToConsole();
   
    console.log('len: ' + r2.length);
   
}
*/