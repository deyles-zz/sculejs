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
 *     * Neither the name of the <organization> nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
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
var jsunit  = require('../lib/com.scule.jsunit');

function testQueryTreeVisitor() {
    
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

    jsunit.assertEquals(tree.getRoot().getChild(0).getSymbol(), 'd');
    jsunit.assertEquals(tree.getRoot().getChild(0).getType(), 10);
    jsunit.assertEquals(tree.getRoot().getChild(1).getSymbol(), 'a');
    jsunit.assertEquals(tree.getRoot().getChild(1).getType(), 10);
    jsunit.assertEquals(tree.getRoot().getChild(2).getSymbol(), 'foo');
    jsunit.assertEquals(tree.getRoot().getChild(2).getType(), 10);
    jsunit.assertEquals(tree.getRoot().getChild(3).getSymbol(), 'a,b');
    jsunit.assertEquals(tree.getRoot().getChild(3).getType(), 10);

};

function testQueryTreeVisitor2() {
    
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

    jsunit.assertEquals(tree.getRoot().getChild(0).getSymbol(), 'd');
    jsunit.assertEquals(tree.getRoot().getChild(0).getType(), 10);
    jsunit.assertEquals(tree.getRoot().getChild(1).getSymbol(), 'a');
    jsunit.assertEquals(tree.getRoot().getChild(1).getType(), 10);
    jsunit.assertEquals(tree.getRoot().getChild(2).getSymbol(), 'a,b');
    jsunit.assertEquals(tree.getRoot().getChild(2).getType(), 10);

};

function testQueryTreeVisitor3() {
    
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

    jsunit.assertEquals(tree.getRoot().getChild(0).getSymbol(), 'a');
    jsunit.assertEquals(tree.getRoot().getChild(0).getType(), 10);
    jsunit.assertEquals(tree.getRoot().getChild(1).getSymbol(), 'a');
    jsunit.assertEquals(tree.getRoot().getChild(1).getType(), 10);
    jsunit.assertEquals(tree.getRoot().getChild(2).getSymbol(), 'd');
    jsunit.assertEquals(tree.getRoot().getChild(2).getType(), 10);

};

function testQueryCompiler() {

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
    compiler.explainQuery(query, {}, collection);
    var program  = compiler.compileQuery(query, {}, collection);

    jsunit.assertEquals(program.length, 15);
    jsunit.assertEquals(program[0][0], 0x1D);
    jsunit.assertEquals(program[1][0], 0x1D);
    jsunit.assertEquals(program[2][0], 0x1B);
    jsunit.assertEquals(program[3][0], 0x1B);
    jsunit.assertEquals(program[4][0], 0x23);
    jsunit.assertEquals(program[5][0], 0x21);
    jsunit.assertEquals(program[6][0], 0x27);
    jsunit.assertEquals(program[14][0], 0x00);
    
};

function testQueryCompiler2() {

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
    compiler.explainQuery(query, {}, collection);
    var program  = compiler.compileQuery(query, {}, collection);
    
    jsunit.assertEquals(program.length, 5);
    jsunit.assertEquals(program[0][0], 0x1B);
    jsunit.assertEquals(program[1][0], 0x23);
    jsunit.assertEquals(program[2][0], 0x21);
    jsunit.assertEquals(program[3][0], 0x28);
    jsunit.assertEquals(program[4][0], 0x00);
    
};

function testQueryCompilerSortLimit() {

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
    compiler.explainQuery(query, {$limit:100, $sort:{a:-1}}, collection);

};

function testQueryCompilerOr() {

    db.dropAll();
    var collection = db.factoryCollection('scule+dummy://unittest');
    collection.ensureHashIndex('a,b,c');
    collection.ensureHashIndex('z');
    var query = {a:{$in:[1,2,3,4,5]}, b:10, c:99, $or:[{z:11},{k:12}]};
    collection.explain(query, {});

};

function testQueryCompilerOr2() {

    db.dropAll();
    var collection = db.factoryCollection('scule+dummy://unittest');
    collection.ensureHashIndex('a,b,c');
    collection.ensureHashIndex('z');
    var query = {$and:[{$or:[{z:11},{k:12},{a:14, c:15}]},{$or:[{d:16},{c:17}]}]};
    collection.explain(query, {});

};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testQueryTreeVisitor);
    jsunit.addTest(testQueryTreeVisitor2);
    jsunit.addTest(testQueryTreeVisitor3);
    jsunit.addTest(testQueryCompiler);
    jsunit.addTest(testQueryCompiler2);
    jsunit.addTest(testQueryCompilerSortLimit);
    jsunit.addTest(testQueryCompilerOr);
    jsunit.addTest(testQueryCompilerOr2);
    jsunit.runTests();
}());