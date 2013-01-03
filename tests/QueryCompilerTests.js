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
        a:{$gt:2, $in:[4, 5, 7, 8, 9], $eq:666},
        b:3,
        c:{$in:[2,1,3,9,7], $nin:['a', 'c', 'b', 10, 0, 'z']},
        d:{$gt:10, $lte:240},
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
        a:{$gt:2, $in:[4, 5, 7, 8, 9], $eq:666},
        b:3,
        c:{$in:[2,1,3,9,7], $nin:['a', 'c', 'b', 10, 0, 'z']},
        d:{$gt:10, $lte:240},
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
        a:{$gt:2, $in:[4, 5, 7, 8, 9], $eq:666},
        b:3,
        c:{$in:[2,1,3,9,7], $nin:['a', 'c', 'b', 10, 0, 'z']},
        d:{$gt:10, $lte:240},
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
        a:{$gt:2, $in:[4, 5, 7, 8, 9]},
        b:3,
        c:{$in:[2,1,3,9,7], $nin:['a', 'c', 'b', 10, 0, 'z']},
        d:{$gt:10, $lte:240},
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