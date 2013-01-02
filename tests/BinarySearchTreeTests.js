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

var sculedb   = require('../lib/com.scule.db');
var jsunit    = require('../lib/com.scule.jsunit');

function testBinaryTreeNode() {
    var node = sculedb.Scule.$d.getBinarySearchTreeNode('foo', 'bar');
    jsunit.assertEquals(node.getKey(), 'foo');
    jsunit.assertEquals(node.getData(), 'bar');
    jsunit.assertEquals(node.getLeft(), null);
    jsunit.assertEquals(node.getRight(), null);
    node.setLeft(sculedb.Scule.$d.getBinarySearchTreeNode('foo1', 'bar1'));
    node.setRight(sculedb.Scule.$d.getBinarySearchTreeNode('foo2', 'bar2'));
    jsunit.assertEquals(node.getLeft().getKey(), 'foo1');
    jsunit.assertEquals(node.getLeft().getData(), 'bar1');
    jsunit.assertEquals(node.getRight().getKey(), 'foo2');
    jsunit.assertEquals(node.getRight().getData(), 'bar2');    
};

function testBinaryTreeNodeRemove() {
    var node = sculedb.Scule.$d.getBinarySearchTreeNode('foo5', 'bar5');

    node.setLeft(sculedb.Scule.$d.getBinarySearchTreeNode('foo3', 'bar3'));
    node.getLeft().setLeft(sculedb.Scule.$d.getBinarySearchTreeNode('foo1', 'bar1'));
    node.getLeft().setRight(sculedb.Scule.$d.getBinarySearchTreeNode('foo4', 'bar4'));
    
    node.setRight(sculedb.Scule.$d.getBinarySearchTreeNode('foo8', 'bar8'));
    node.getRight().setLeft(sculedb.Scule.$d.getBinarySearchTreeNode('foo7', 'bar7'));
    node.getRight().setRight(sculedb.Scule.$d.getBinarySearchTreeNode('foo9', 'bar9'));
    
    node.remove(node.getLeft());
    
    jsunit.assertEquals(node.getLeft().getKey(), 'foo4');
    jsunit.assertEquals(node.getLeft().getData(), 'bar4');
    jsunit.assertEquals(node.getLeft().getRight(), null);
    jsunit.assertEquals(node.getLeft().getLeft().getKey(), 'foo1');
    
    node.remove(node.getRight());
    jsunit.assertEquals(node.getRight().getKey(), 'foo9');
    jsunit.assertEquals(node.getRight().getData(), 'bar9');
    jsunit.assertEquals(node.getRight().getRight(), null);
    jsunit.assertEquals(node.getRight().getLeft().getKey(), 'foo7');
};

function testBinaryTreeInsertion() {
    var tree = sculedb.Scule.$d.getBinarySearchTree();
    for(var i=0; i < 100; i++) {
        var key = sculedb.Scule.$f.randomFromTo(1, 100);
        tree.insert(key, key);
    }
    var verify = function(node) {
        if(!node) {
            return;
        }
        jsunit.assertTrue(node.getRight() == null || node.getRight().getKey() > node.getKey());
        jsunit.assertTrue(node.getLeft() == null || node.getLeft().getKey() <= node.getKey());
        verify(node.getRight());
        verify(node.getLeft());
    };
    verify(tree.getRoot());
};

function testBinaryTreeSearch() {
    var keys = {};
    var tree = sculedb.Scule.$d.getBinarySearchTree();
    for(var i=0; i < 100; i++) {
        var key = sculedb.Scule.$f.randomFromTo(1, 1000);
        keys[key] = true;
        tree.insert(key, key);
    }
    for(var key in keys) {
        var node = tree.search(key);
        jsunit.assertTrue(node.getKey() == key);
    }
};

function testBinaryTreeToArray() {
    var tree = sculedb.Scule.$d.getBinarySearchTree();
    for(var i=0; i < 100; i++) {
        var key = sculedb.Scule.$f.randomFromTo(1, 1000);
        tree.insert(key, key);
    }
    var list = tree.toArray();
    for(var i=0; i < list.length; i++) {
        for(var j=i+1; j < list.length; j++) {
            jsunit.assertTrue(list[i][0] <= list[j][0]);
        }
    }
};

function testBinaryTreeBalance() {
    var tree = sculedb.Scule.$d.getBinarySearchTree();
    for(var i=0; i < 100; i++) {
        var key = sculedb.Scule.$f.randomFromTo(1, 1000);
        tree.insert(key, key);
    }
    tree.balance();
    
    var verifyOrder = function(node) {
        if(!node) {
            return;
        }
        jsunit.assertTrue(node.getRight() == null || node.getRight().getKey() > node.getKey());
        jsunit.assertTrue(node.getLeft() == null || node.getLeft().getKey() <= node.getKey());
        verifyOrder(node.getRight());
        verifyOrder(node.getLeft());
    };
    verifyOrder(tree.getRoot());
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testBinaryTreeNode);
    jsunit.addTest(testBinaryTreeNodeRemove);
    jsunit.addTest(testBinaryTreeInsertion);
    jsunit.addTest(testBinaryTreeSearch);
    jsunit.addTest(testBinaryTreeToArray);
    jsunit.addTest(testBinaryTreeBalance);
    jsunit.runTests();
}());