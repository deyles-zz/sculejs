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
var inst    = require('../lib/com.scule.instrumentation');

exports['test QuerySymbol'] = function(beforeExit, assert) {
    
    var symbol = sculedb.getQuerySymbol('foo', 8);
    assert.equal(symbol.getSymbol(), 'foo');
    assert.equal(symbol.getType(), 8);
    
    symbol.setSymbol('bar');
    symbol.setType(1);
    
    assert.equal(symbol.getSymbol(), 'bar');
    assert.equal(symbol.getType(), 1);
    assert.equal(false, symbol.hasChildren());
    
    symbol.addChild(sculedb.getQuerySymbol('foo', 8));
    
    assert.equal(true, symbol.hasChildren());
    assert.equal(symbol.getFirstChild(), symbol.getChild(0));
    
    symbol.addChild(sculedb.getQuerySymbol('foo1', 8));
    
    assert.equal(symbol.getFirstChild(), symbol.getChild(0));
    assert.equal(false, symbol.getFirstChild() == symbol.getChild(1));
    
    symbol.addChild(sculedb.getQuerySymbol('$and', 2));
    
    assert.equal(symbol.getChild(2).getType(), 2);
    assert.equal(symbol.getChild(2).getSymbol(), '$and');
    assert.equal(symbol.children.length, 3);
    
    symbol.normalize();
    
    assert.equal(symbol.children.length, 2);
};

exports['test QueryTree'] = function(beforeExit, assert) {
 
    var tree = sculedb.getQueryTree();
 
    assert.equal(tree.getRoot(), null);
    
    var node = sculedb.getQuerySymbol('foo', 8);
    tree.setRoot(node);
    
    assert.equal(tree.getRoot(), node);

    tree.getRoot().addChild(sculedb.getQuerySymbol('$and', 2));
    
    assert.equal(true, tree.getRoot().hasChildren());
    
    tree.normalize();

    assert.equal(false, tree.getRoot().hasChildren());
};

exports['test QueryParser'] = function(beforeExit, assert) {

    var parser = sculedb.getQueryParser();
    var tree   = parser.parseQuery({a:1, b:2});
    
    assert.equal(tree.getRoot().getType(), -1); // should be an expression
    
    assert.equal(tree.getRoot().getChild(0).getType(), 8);
    assert.equal(tree.getRoot().getChild(0).getSymbol(), 'a');
    assert.equal(tree.getRoot().getChild(1).getType(), 8);
    assert.equal(tree.getRoot().getChild(1).getSymbol(), 'b');
    
    assert.equal(tree.getRoot().getChild(0).getFirstChild().getType(), 1);
    assert.equal(tree.getRoot().getChild(0).getFirstChild().getSymbol(), '$eq');
    assert.equal(tree.getRoot().getChild(1).getFirstChild().getType(), 1);
    assert.equal(tree.getRoot().getChild(1).getFirstChild().getSymbol(), '$eq');    

    assert.equal(tree.getRoot().getChild(0).getFirstChild().getFirstChild().getType(), 9);
    assert.equal(tree.getRoot().getChild(0).getFirstChild().getFirstChild().getSymbol(), 1);
    assert.equal(tree.getRoot().getChild(1).getFirstChild().getFirstChild().getType(), 9);
    assert.equal(tree.getRoot().getChild(1).getFirstChild().getFirstChild().getSymbol(), 2); 

};

exports['test QueryParserNormalization'] = function(beforeExit, assert) {

    var parser = sculedb.getQueryParser();
    var tree   = parser.parseQuery({a:1, b:2, $or:[{a:2, b:3}, {a:3, b:4}], $and:[{c:11}, {$or:[{a:4, b:5}, {a:5, b:6}]}, {$or:[{a:6, b:7}, {a:7, b:8}]}]});

    assert.equal(tree.getRoot().getType(), -1); // should be an expression
    
    assert.equal(tree.getRoot().getChild(0).getType(), 8);
    assert.equal(tree.getRoot().getChild(0).getSymbol(), 'a');
    assert.equal(tree.getRoot().getChild(1).getType(), 8);
    assert.equal(tree.getRoot().getChild(1).getSymbol(), 'b');
    assert.equal(tree.getRoot().getChild(2).getType(), 8);
    assert.equal(tree.getRoot().getChild(2).getSymbol(), 'c');
    
    assert.equal(tree.getRoot().getChild(0).getFirstChild().getType(), 1);
    assert.equal(tree.getRoot().getChild(0).getFirstChild().getSymbol(), '$eq');
    assert.equal(tree.getRoot().getChild(1).getFirstChild().getType(), 1);
    assert.equal(tree.getRoot().getChild(1).getFirstChild().getSymbol(), '$eq');    
    assert.equal(tree.getRoot().getChild(2).getFirstChild().getType(), 1);
    assert.equal(tree.getRoot().getChild(2).getFirstChild().getSymbol(), '$eq');

    assert.equal(tree.getRoot().getChild(0).getFirstChild().getFirstChild().getType(), 9);
    assert.equal(tree.getRoot().getChild(0).getFirstChild().getFirstChild().getSymbol(), 1);
    assert.equal(tree.getRoot().getChild(1).getFirstChild().getFirstChild().getType(), 9);
    assert.equal(tree.getRoot().getChild(1).getFirstChild().getFirstChild().getSymbol(), 2);
    assert.equal(tree.getRoot().getChild(2).getFirstChild().getFirstChild().getType(), 9);
    assert.equal(tree.getRoot().getChild(2).getFirstChild().getFirstChild().getSymbol(), 11);

    assert.equal(tree.getRoot().getChild(3).getType(), 2);
    assert.equal(tree.getRoot().getChild(3).children.length, 3);
    
    tree.getRoot().getChild(3).children.forEach(function(child) {
        assert.equal(child.getType(), 2);
        assert.equal(child.getFirstChild().getType(), 2);
        child.getFirstChild().children.forEach(function(subChild) {
            assert.equal(subChild.getType(), 8);
            assert.equal(subChild.getFirstChild().getType(), 1);
            assert.equal(subChild.getFirstChild().getFirstChild().getType(), 9);
        });
    });
};

exports['test QueryParserNestingError'] = function(beforeExit, assert) {
    
    var parser = sculedb.getQueryParser();
    
    var flag = false;
    try {
        parser.parseQuery({a:1, $and:[{b:2}]});
    } catch (e) {
        flag = true;
    }
    assert.equal(true, flag);
    
    flag = false;
    try {
        parser.parseQuery({a:1, $and:[{b:2},{c:2}]});
    } catch (e) {
        flag = true;
    }
    assert.equal(false, flag);

    flag = false;
    try {
        parser.parseQuery({a:1, $or:[{b:2}]});
    } catch (e) {
        flag = true;
    }
    assert.equal(true, flag);

    flag = false;
    try {
        parser.parseQuery({a:1, $and:[{b:2},{c:2},{$and:[{d:3},{e:4}]}]});
    } catch (e) {
        flag = true;
    }
    assert.equal(true, flag);    

    flag = false;
    try {
        parser.parseQuery({a:1, $and:[{b:2},{c:2},{$or:[{d:3},{e:4}]}]});
    } catch (e) {
        flag = true;
    }
    assert.equal(false, flag);

    flag = false;
    try {
        parser.parseQuery({a:1, $or:[{b:2},{c:2},{$or:[{d:3},{e:4}]}]});
    } catch (e) {
        flag = true;
    }
    assert.equal(true, flag);
};