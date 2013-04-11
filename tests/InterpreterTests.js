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

/*
exports['test Normalizer'] = function(beforeExit, assert) {

    var normalizer = comp.getQueryNormalizer();
    var query = {
        $or:{
            c:113, 
            a:{
                $lt:14
            }
        }, 
        foo:3, 
        bar:{
            $lte:100, 
            $gt:4
        }, 
        a:11
    };
    query = normalizer.normalize(query);
    assert.equal('{"a":{"$eq":11},"bar":{"$gt":4,"$lte":100},"foo":{"$eq":3},"$or":{"a":{"$lt":14},"c":{"$eq":113}}}', JSON.stringify(query));

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

    var selector = comp.getIndexSelector();
    var o = selector.resolveIndices(collection, {
        d:{
            $gte:9000, 
            $lt:9100
        }
    });
    assert.equal(o.length, 100);
    
};

exports['test Compiler'] = function(beforeExit, assert) {

    var d = [];
    for(var i=0; i < 100000; i++) {
        var foo = (i%3 == 0) ? 3 : 1;
        var bar = (i%2 == 0) ? 3 : 2;
        d.push({
            foo: foo, 
            bar: bar
        });
    }
    
    var engine = comp.getQueryEngine();
    var interpreter = comp.getQueryCompiler();
    
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

exports['test Interpreter'] = function(beforeExit, assert) {
    
    db.dropAll();
    
    var t = inst.getTimer();
    var collection = db.factoryCollection('scule+dummy://unittest');
    
//    collection.ensureHashIndex('foo');
//    collection.ensureBTreeIndex('foo', {
//        order:1000
//    });    
    
    collection.clear();    
    
    for(var i=0; i < 10000; i++) {
        var foo = (i%3 == 0) ? 3 : 1;
        var bar = (i%2 == 0) ? 3 : 2;
        collection.save({
            foo: foo, 
            bar: bar
        });
    }

    for (var i=0; i < 30; i++) {
        t.startInterval('interpreter');
        var interpreter = comp.getQueryInterpreter();
        interpreter.interpret(collection, {
            foo:{
                $eq:1
            }, 
            bar:{
                $gt:2
            }
        }, {
            $sort:['foo', -1]
        });
        t.stopInterval('interpreter');
    }
    
    for (var i=0; i < 30; i++) {
        t.startInterval('vm');
        var interpreter = comp.getQueryInterpreter();
        collection.find({
            foo:{
                $eq:1
            }, 
            bar:{
                $gt:2
            }
        }, {
            $sort:['foo', -1]
        });
        t.stopInterval('vm');    
    }    
    
    t.logToConsole();

};
*/

exports['test ElemMatch'] = function(beforeExit, assert) {
    
    var interpreter = comp.getQueryCompiler();
    
    console.log(interpreter.compileQuery({
        foo:{
            $eq:1
        }, 
        bar:{
            $gt:2
        },
        'lol.k':{$elemMatch:{a:100, b:{$gt:300}}}
    }, {
        $sort:['foo', -1]
    }));
    
};