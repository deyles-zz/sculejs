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

var sculedb   = require('../lib/com.scule.datastructures');
var db   = require('../lib/com.scule.db');
    
function testBPlusHashingTreeVerifyKeys(beforeExit, assert, node) {
    if(node.isLeaf()) {
        return;
    }
    var key, left, right;
    for(var i=1; i < node.data.length; i=i+2) {
        key   = node.data[i];
        left  = node.data[i-1];
        right = node.data[i+1];
        if(left.isLeaf() && right.isLeaf()) {
            assert.equal(true, left.data[0].key < key);
            assert.equal(true, right.data[0].key == key);                
            return;
        }
        assert.equal(true, left.data[1] < key);
        assert.equal(true, right.data[1] >= key);
        testBPlusHashingTreeVerifyKeys(beforeExit, assert, left);
        testBPlusHashingTreeVerifyKeys(beforeExit, assert, right);
    }    
};

function testBPlusHashingTreeLinkedListOrder(beforeExit, assert, tree) {
    var prev = undefined;    
    var curr = tree.root.data[0];
    while(curr) {
        assert.equal(prev, curr.getLeft());
        prev = curr;       
        curr = curr.getRight();
    }    
};

function testBPlusHashingTreeVerifyOrder(beforeExit, assert, node) {
    if(node.isLeaf()) {
        for(var i=0; i < node.data.length; i++) {
            if(i > 0) {
                for(var j=0; j < i; j++) {
                    assert.equal(false, node.data[j].key >= node.data[i].key);
                }
            }
        }
    } else {
        for(var i=0; i < node.data.length; i=i+2) {
            testBPlusHashingTreeVerifyOrder(beforeExit, assert, node.data[i]);
        }
    }    
};

exports['test BPlusHashingTreeInsert'] = function(beforeExit, assert) {
    var tree = db.getBPlusHashingTree(5);
    for(var i=0; i < 200; i++) {
        var k = sculedb.Scule.$f.randomFromTo(10, 200);
        var o = {
            _id: db.getObjectId(),
            key: k,
            slug: 'slug:' + i
        };
        tree.insert(k, o);
    }
    testBPlusHashingTreeVerifyKeys(beforeExit, assert, tree.root);
    testBPlusHashingTreeVerifyOrder(beforeExit, assert, tree.root);
};

exports['test BPlusHashingTreeInsert2'] = function(beforeExit, assert) {
    var tree = db.getBPlusHashingTree(5);
    for(var i=0; i < 10; i++) {
        var k = sculedb.Scule.$f.randomFromTo(10, 200);
        var o = {
            _id: db.getObjectId(),
            key: k,
            slug: 'slug:' + i
        };
        tree.insert(k, o);
    }
    testBPlusHashingTreeVerifyKeys(beforeExit, assert, tree.root);
    testBPlusHashingTreeVerifyOrder(beforeExit, assert, tree.root);
    testBPlusHashingTreeLinkedListOrder(beforeExit, assert, tree);
};

exports['test BPlusHashingTreeInsert3'] = function(beforeExit, assert) {
    var tree = db.getBPlusHashingTree(5);
    for(var i=0; i < 100; i++) {
        var k = i%10;
        var o = {
            _id: db.getObjectId(),
            key: k,
            slug: 'slug:' + i
        };
        tree.insert(k, o);        
    }
    for(var i=0; i < 10; i++) {
        var table = tree.search(i);
        assert.equal(table.getLength(), 10);
        var keys = table.getKeys();
        keys.forEach(function(key) {
           assert.equal(table.get(key).key, i);
           assert.equal(table.get(key)._id.toString(), key);
        });
    }
}

exports['test BPlusHashingTreeRemove'] = function(beforeExit, assert) {
    var tree = db.getBPlusHashingTree(5);
    for(var i=0; i < 100; i++) {
        var k = i%10;
        var o = {
            _id: db.getObjectId(),
            key: k,
            slug: 'slug:' + i
        };
        tree.insert(k, o);        
    }
    tree.remove(5);
    assert.equal(tree.search(5), null);
    tree.remove(2);
    assert.equal(tree.search(2), null);    
    assert.equal(false, tree.search(9) == null);    
}

exports['test BPlusHashingTreeRange'] = function(beforeExit, assert) {
    var tree = db.getBPlusHashingTree(5);
    for(var i=0; i < 2000; i++) {
        var k = sculedb.Scule.$f.randomFromTo(10, 2000);
        var o = {
            _id: db.getObjectId(),
            key: k,
            slug: 'slug:' + i
        };
        tree.insert(k, o);
    }
    var range = tree.range(333, 1987);
    var broken = false;
    for(var i=0; i < range.length; i++) {
        for(var j=0; j < i; j++) {
            if(range[j] > range[i]) {
                broken = true;
                break;
            }
        }
    }
    assert.equal(false, broken);
};