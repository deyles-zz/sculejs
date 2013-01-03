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

var sculedb = require('../lib/com.scule.datastructures');

exports['test BPlusTreeNode'] = function(beforeExit, assert) {
    var node = sculedb.getBPlusTreeNode();
    // test defaults
    assert.equal(node.getOrder(), 100);
    assert.equal(node.getMergeThreshold(), 40);
    // test bean functions
    node.setOrder(400);
    node.setMergeThreshold(33);
    assert.equal(node.getOrder(), 400);
    assert.equal(node.getMergeThreshold(), 33);
};

exports['test BPlusTreeLeafNodeBinarySearch'] = function(beforeExit, assert) {
    var node = sculedb.getBPlusTreeLeafNode();
    for(var i=13; i < 329; i++) {
        node.data.push({
            key: i,
            value: i
        });
    }
    assert.equal(node.indexSearch(30), 17);
    assert.equal(node.indexSearch(3), 0);
    assert.equal(node.indexSearch(400), 315);
    assert.equal(node.indexSearch(14), 1);
};

exports['test BPlusTreeLeafNodeIdentifySiblings'] = function(beforeExit, assert) {

    var interior = {
        data:[]
    }
    
    var leaf1 = sculedb.getBPlusTreeLeafNode();
    leaf1.setOrder(5);
    leaf1.setMergeThreshold(2);

    leaf1.data.push({
        key:0,
        value:0
    });

    leaf1.data.push({
        key:1,
        value:1
    });
    
    leaf1.data.push({
        key:2,
        value:2
    });    

    leaf1.data.push({
        key:3,
        value:3
    });

    var leaf2 = sculedb.getBPlusTreeLeafNode();
    leaf1.setOrder(5);
    leaf1.setMergeThreshold(2);

    leaf2.data.push({
        key:4,
        value:4
    });

    leaf2.data.push({
        key:5,
        value:5
    });
    
    leaf2.data.push({
        key:6,
        value:6
    });    

    leaf2.data.push({
        key:7,
        value:7
    });

    var leaf3 = sculedb.getBPlusTreeLeafNode();
    leaf1.setOrder(5);
    leaf1.setMergeThreshold(2);

    leaf3.data.push({
        key:8,
        value:8
    });

    leaf3.data.push({
        key:9,
        value:9
    });
    
    leaf3.data.push({
        key:10,
        value:10
    });    

    leaf3.data.push({
        key:11,
        value:11
    });

    var leaf4 = sculedb.getBPlusTreeLeafNode();
    leaf1.setOrder(5);
    leaf1.setMergeThreshold(2);

    leaf4.data.push({
        key:12,
        value:12
    });

    leaf4.data.push({
        key:13,
        value:13
    });
    
    leaf4.data.push({
        key:14,
        value:14
    });    

    leaf4.data.push({
        key:15,
        value:15
    });

    var leaf5 = sculedb.getBPlusTreeLeafNode();
    leaf1.setOrder(5);
    leaf1.setMergeThreshold(2);

    leaf5.data.push({
        key:16,
        value:16
    });

    leaf5.data.push({
        key:17,
        value:17
    });
    
    leaf5.data.push({
        key:18,
        value:18
    });    

    leaf5.data.push({
        key:19,
        value:19
    });

    leaf1.setRight(leaf2);
    leaf2.setLeft(leaf1);
    leaf2.setRight(leaf3);
    leaf3.setLeft(leaf2);
    leaf3.setRight(leaf4)
    leaf4.setLeft(leaf3);
    leaf4.setRight(leaf5);
    leaf5.setLeft(leaf4);

    interior.data[0] = leaf1;
    interior.data[1] = 4;
    interior.data[2] = leaf2;
    interior.data[3] = 8;
    interior.data[4] = leaf3;
    interior.data[5] = 12;
    interior.data[6] = leaf4;
    interior.data[7] = 16;
    interior.data[8] = leaf5;
    
    var siblings = leaf1.identifySiblings(interior);
    assert.equal(siblings.left, null);
    assert.equal(siblings.right, leaf2);
    assert.equal(siblings.index, 0);
    
    var siblings = leaf2.identifySiblings(interior);
    assert.equal(siblings.left, leaf1);
    assert.equal(siblings.right, leaf3);
    assert.equal(siblings.index, 2);
    
    var siblings = leaf4.identifySiblings(interior);
    assert.equal(siblings.left, leaf3);
    assert.equal(siblings.right, leaf5);
    assert.equal(siblings.index, 6);
    
    var siblings = leaf5.identifySiblings(interior);
    assert.equal(siblings.left, leaf4);
    assert.equal(siblings.right, null);
    assert.equal(siblings.index, 8);
};

exports['test BPlusTreeLeafNodeInsert'] = function(beforeExit, assert) {
    var leaf = sculedb.getBPlusTreeLeafNode();
    leaf.setOrder(5);
    leaf.insert('foo0', 'bar0');
    leaf.insert('foo1', 'bar1');
    leaf.insert('foo2', 'bar2');
    leaf.insert('foo3', 'bar3');
    leaf.insert('foo4', 'bar4');
    assert.equal(leaf.data.length, 5);
    for(var i=0; i < leaf.data.length; i++) {
        assert.equal(leaf.data[i].key, 'foo' + i);
    }
};

exports['test BPlusTreeLeafNodeSearch'] = function(beforeExit, assert) {
    var leaf = sculedb.getBPlusTreeLeafNode();
    leaf.insert('foo', 'bar');
    leaf.insert('foo1', 'bar1');
    leaf.insert('foo2', 'bar2');
    leaf.insert('foo3', 'bar3');
    leaf.insert('foo4', 'bar4');
    leaf.lookup.clear();
    assert.equal(leaf.search('foo2'), 'bar2');
    assert.equal(leaf.search('foo4'), 'bar4');
    assert.equal(leaf.search('foo4'), 'bar4');
};

exports['test BPlusTreeLeafNodeSplit'] = function(beforeExit, assert) {
    var leaf = sculedb.getBPlusTreeLeafNode();
    var inner;
    leaf.setOrder(5);
    for(var i=0; i < 6; i++) {
        inner = leaf.insert(i, i);
        if(i < 5) {
            assert.equal(null, inner);
            assert.equal(leaf.data[i].key, i);
            assert.equal(leaf.data[i].value, i);
        }
    }
    assert.equal(inner.left.data.length, 3);
    assert.equal(inner.right.data.length, 3);
    assert.equal(inner.key, 3);
    assert.equal(inner.left.getRight(), inner.right);
    assert.equal(inner.right.getLeft(), inner.left);
};

exports['test BPlusTreeLeafNodeSplit2'] = function(beforeExit, assert) {
    var leaf = sculedb.getBPlusTreeLeafNode();
    var inner;
    leaf.setOrder(5);
    var values = [50, 1, 3, 34, 43, 78];
    for(var i=0; i < values.length; i++) {
        inner = leaf.insert(values[i], values[i]);
        if(i < 5) {
            assert.equal(null, inner);
        }
    }
    assert.equal(inner.left.data[0].value, 1);
    assert.equal(inner.left.data[1].value, 3);
    assert.equal(inner.left.data[2].value, 34);
    assert.equal(inner.right.data[0].value, 43);
    assert.equal(inner.right.data[1].value, 50);
    assert.equal(inner.right.data[2].value, 78);    
    assert.equal(inner.left.data.length, 3);
    assert.equal(inner.right.data.length, 3);
    assert.equal(inner.key, 43);
};

exports['test BPlusTreeInteriorNodeIndexSearch'] = function(beforeExit, assert) {
    var interior = sculedb.getBPlusTreeInteriorNode();
    interior.setOrder(5);
    interior.setMergeThreshold(2);
    
    var leaf1 = sculedb.getBPlusTreeLeafNode();
    leaf1.setOrder(5);
    leaf1.setMergeThreshold(2);

    leaf1.data.push({
        key:0,
        value:0
    });

    leaf1.data.push({
        key:1,
        value:1
    });
    
    leaf1.data.push({
        key:2,
        value:2
    });    

    leaf1.data.push({
        key:3,
        value:3
    });

    var leaf2 = sculedb.getBPlusTreeLeafNode();
    leaf1.setOrder(5);
    leaf1.setMergeThreshold(2);

    leaf2.data.push({
        key:4,
        value:4
    });

    leaf2.data.push({
        key:5,
        value:5
    });
    
    leaf2.data.push({
        key:6,
        value:6
    });    

    leaf2.data.push({
        key:7,
        value:7
    });

    var leaf3 = sculedb.getBPlusTreeLeafNode();
    leaf1.setOrder(5);
    leaf1.setMergeThreshold(2);

    leaf3.data.push({
        key:8,
        value:8
    });

    leaf3.data.push({
        key:9,
        value:9
    });
    
    leaf3.data.push({
        key:10,
        value:10
    });    

    leaf3.data.push({
        key:11,
        value:11
    });

    var leaf4 = sculedb.getBPlusTreeLeafNode();
    leaf1.setOrder(5);
    leaf1.setMergeThreshold(2);

    leaf4.data.push({
        key:12,
        value:12
    });

    leaf4.data.push({
        key:13,
        value:13
    });
    
    leaf4.data.push({
        key:14,
        value:14
    });    

    leaf4.data.push({
        key:15,
        value:15
    });

    var leaf5 = sculedb.getBPlusTreeLeafNode();
    leaf1.setOrder(5);
    leaf1.setMergeThreshold(2);

    leaf5.data.push({
        key:16,
        value:16
    });

    leaf5.data.push({
        key:17,
        value:17
    });
    
    leaf5.data.push({
        key:18,
        value:18
    });    

    leaf5.data.push({
        key:19,
        value:19
    });

    leaf1.setRight(leaf2);
    leaf2.setLeft(leaf1);
    leaf2.setRight(leaf3);
    leaf3.setLeft(leaf2);
    leaf3.setRight(leaf4)
    leaf4.setLeft(leaf3);
    leaf4.setRight(leaf5);
    leaf5.setLeft(leaf4);

    interior.data[0] = leaf1;
    interior.data[1] = 4;
    interior.data[2] = leaf2;
    interior.data[3] = 8;
    interior.data[4] = leaf3;
    interior.data[5] = 12;
    interior.data[6] = leaf4;
    interior.data[7] = 16;
    interior.data[8] = leaf5;
    
    assert.equal(interior.indexSearch(1), 1);
    assert.equal(interior.indexSearch(5), 3);
    assert.equal(interior.indexSearch(11), 5);
    assert.equal(interior.indexSearch(15), 7);
    assert.equal(interior.indexSearch(24), 7);
};

exports['test BPlusTreeLeafNodeRedistribute'] = function(beforeExit, assert) {
    var interior = sculedb.getBPlusTreeInteriorNode();
    interior.setOrder(5);
    interior.setMergeThreshold(2);
    
    var leaf1 = sculedb.getBPlusTreeLeafNode();
    leaf1.setOrder(5);
    leaf1.setMergeThreshold(3);

    leaf1.data.push({
        key:0,
        value:0
    });

    leaf1.data.push({
        key:1,
        value:1
    });
    
    leaf1.data.push({
        key:2,
        value:2
    });    

    leaf1.data.push({
        key:3,
        value:3
    });

    var leaf2 = sculedb.getBPlusTreeLeafNode();
    leaf2.setOrder(5);
    leaf2.setMergeThreshold(3);

    leaf2.data.push({
        key:4,
        value:4
    });

    leaf2.data.push({
        key:5,
        value:5
    });
    
    leaf2.data.push({
        key:6,
        value:6
    });    

    leaf2.data.push({
        key:7,
        value:7
    });

    var leaf3 = sculedb.getBPlusTreeLeafNode();
    leaf3.setOrder(5);
    leaf3.setMergeThreshold(3);

    leaf3.data.push({
        key:8,
        value:8
    });

    leaf3.data.push({
        key:9,
        value:9
    });
    
    leaf3.data.push({
        key:10,
        value:10
    });    

    leaf3.data.push({
        key:11,
        value:11
    });

    var leaf4 = sculedb.getBPlusTreeLeafNode();
    leaf4.setOrder(5);
    leaf4.setMergeThreshold(3);

    leaf4.data.push({
        key:12,
        value:12
    });

    leaf4.data.push({
        key:13,
        value:13
    });
    
    leaf4.data.push({
        key:14,
        value:14
    });    

    leaf4.data.push({
        key:15,
        value:15
    });

    var leaf5 = sculedb.getBPlusTreeLeafNode();
    leaf5.setOrder(5);
    leaf5.setMergeThreshold(3);

    leaf5.data.push({
        key:16,
        value:16
    });

    leaf5.data.push({
        key:17,
        value:17
    });
    
    leaf5.data.push({
        key:18,
        value:18
    });    

    leaf5.data.push({
        key:19,
        value:19
    });

    leaf1.setRight(leaf2);
    leaf2.setLeft(leaf1);
    leaf2.setRight(leaf3);
    leaf3.setLeft(leaf2);
    leaf3.setRight(leaf4)
    leaf4.setLeft(leaf3);
    leaf4.setRight(leaf5);
    leaf5.setLeft(leaf4);

    interior.data[0] = leaf1;
    interior.data[1] = 4;
    interior.data[2] = leaf2;
    interior.data[3] = 8;
    interior.data[4] = leaf3;
    interior.data[5] = 12;
    interior.data[6] = leaf4;
    interior.data[7] = 16;
    interior.data[8] = leaf5;    

    assert.equal(leaf5.search(19), 19);
    leaf5.remove(19, interior);
    assert.equal(leaf5.search(19), null);
    leaf5.remove(18, interior);
    assert.equal(leaf5.search(18), null);
    assert.equal(leaf5.search(15), 15);

};

exports['test BPlusTreeLeafNodeMergeLeft'] = function(beforeExit, assert) {
    var interior = sculedb.getBPlusTreeInteriorNode();
    interior.setOrder(5);
    interior.setMergeThreshold(2);
    
    var leaf1 = sculedb.getBPlusTreeLeafNode();
    leaf1.setOrder(5);
    leaf1.setMergeThreshold(3);

    leaf1.data.push({
        key:0,
        value:0
    });

    leaf1.data.push({
        key:1,
        value:1
    });
    
    leaf1.data.push({
        key:2,
        value:2
    });    

    leaf1.data.push({
        key:3,
        value:3
    });

    var leaf2 = sculedb.getBPlusTreeLeafNode();
    leaf2.setOrder(5);
    leaf2.setMergeThreshold(3);

    leaf2.data.push({
        key:4,
        value:4
    });

    leaf2.data.push({
        key:5,
        value:5
    });
    
    leaf2.data.push({
        key:6,
        value:6
    });    

    leaf2.data.push({
        key:7,
        value:7
    });

    var leaf3 = sculedb.getBPlusTreeLeafNode();
    leaf3.setOrder(5);
    leaf3.setMergeThreshold(3);

    leaf3.data.push({
        key:8,
        value:8
    });

    leaf3.data.push({
        key:9,
        value:9
    });
    
    leaf3.data.push({
        key:10,
        value:10
    });    

    leaf3.data.push({
        key:11,
        value:11
    });

    var leaf4 = sculedb.getBPlusTreeLeafNode();
    leaf4.setOrder(5);
    leaf4.setMergeThreshold(3);

    leaf4.data.push({
        key:12,
        value:12
    });

    leaf4.data.push({
        key:13,
        value:13
    });
    
    leaf4.data.push({
        key:14,
        value:14
    });    

    leaf4.data.push({
        key:15,
        value:15
    });

    var leaf5 = sculedb.getBPlusTreeLeafNode();
    leaf5.setOrder(5);
    leaf5.setMergeThreshold(3);

    leaf5.data.push({
        key:16,
        value:16
    });

    leaf5.data.push({
        key:17,
        value:17
    });
    
    leaf5.data.push({
        key:18,
        value:18
    });    

    leaf5.data.push({
        key:19,
        value:19
    });

    leaf1.setRight(leaf2);
    leaf2.setLeft(leaf1);
    leaf2.setRight(leaf3);
    leaf3.setLeft(leaf2);
    leaf3.setRight(leaf4)
    leaf4.setLeft(leaf3);
    leaf4.setRight(leaf5);
    leaf5.setLeft(leaf4);

    interior.data[0] = leaf1;
    interior.data[1] = 4;
    interior.data[2] = leaf2;
    interior.data[3] = 8;
    interior.data[4] = leaf3;
    interior.data[5] = 12;
    interior.data[6] = leaf4;
    interior.data[7] = 16;
    interior.data[8] = leaf5;    

    assert.equal(leaf5.search(19), 19);

    leaf5.remove(19, interior);
    assert.equal(leaf5.search(19), null);

    leaf5.remove(18, interior);
    assert.equal(leaf5.search(18), null);
    assert.equal(leaf5.search(15), 15);
    
    var merge = leaf5.remove(15, interior);
    assert.equal(leaf5.data.length, 0);
    assert.equal(leaf4.data.length, 5);
    assert.equal(merge.node, leaf4);
    assert.equal(true, merge.left);
    assert.equal(merge.oldkey, 16);
    assert.equal(merge.operation, 1);

};

exports['test BPlusTreeLeafNodeMergeRight'] = function(beforeExit, assert) {
    var interior = sculedb.getBPlusTreeInteriorNode();
    interior.setOrder(5);
    interior.setMergeThreshold(2);
    
    var leaf1 = sculedb.getBPlusTreeLeafNode();
    leaf1.setOrder(5);
    leaf1.setMergeThreshold(3);
    leaf1.data.push({
        key:0,
        value:0
    });
    leaf1.data.push({
        key:1,
        value:1
    });
    leaf1.data.push({
        key:2,
        value:2
    });    
    leaf1.data.push({
        key:3,
        value:3
    });

    var leaf2 = sculedb.getBPlusTreeLeafNode();
    leaf2.setOrder(5);
    leaf2.setMergeThreshold(3);
    leaf2.data.push({
        key:4,
        value:4
    });
    leaf2.data.push({
        key:5,
        value:5
    });
    leaf2.data.push({
        key:6,
        value:6
    });    
    leaf2.data.push({
        key:7,
        value:7
    });

    var leaf3 = sculedb.getBPlusTreeLeafNode();
    leaf3.setOrder(5);
    leaf3.setMergeThreshold(3);
    leaf3.data.push({
        key:8,
        value:8
    });
    leaf3.data.push({
        key:9,
        value:9
    });
    leaf3.data.push({
        key:10,
        value:10
    });    
    leaf3.data.push({
        key:11,
        value:11
    });

    var leaf4 = sculedb.getBPlusTreeLeafNode();
    leaf4.setOrder(5);
    leaf4.setMergeThreshold(3);
    leaf4.data.push({
        key:12,
        value:12
    });
    leaf4.data.push({
        key:13,
        value:13
    });
    leaf4.data.push({
        key:14,
        value:14
    });    
    leaf4.data.push({
        key:15,
        value:15
    });

    var leaf5 = sculedb.getBPlusTreeLeafNode();
    leaf5.setOrder(5);
    leaf5.setMergeThreshold(3);
    leaf5.data.push({
        key:16,
        value:16
    });
    leaf5.data.push({
        key:17,
        value:17
    });
    leaf5.data.push({
        key:18,
        value:18
    });
    leaf5.data.push({
        key:19,
        value:19
    });

    leaf1.setRight(leaf2);
    leaf2.setLeft(leaf1);
    leaf2.setRight(leaf3);
    leaf3.setLeft(leaf2);
    leaf3.setRight(leaf4)
    leaf4.setLeft(leaf3);
    leaf4.setRight(leaf5);
    leaf5.setLeft(leaf4);

    interior.data[0] = leaf1;
    interior.data[1] = 4;
    interior.data[2] = leaf2;
    interior.data[3] = 8;
    interior.data[4] = leaf3;
    interior.data[5] = 12;
    interior.data[6] = leaf4;
    interior.data[7] = 16;
    interior.data[8] = leaf5;    

    assert.equal(leaf1.search(1), 1);

    leaf1.remove(1, interior);
    assert.equal(leaf5.search(1), null);

    leaf1.remove(2, interior);
    assert.equal(leaf1.search(2), null);
    assert.equal(leaf1.search(4), 4);
    
    var merge = leaf1.remove(4, interior);
    assert.equal(leaf1.data.length, 0);
    assert.equal(leaf2.data.length, 5);
    assert.equal(merge.node, leaf2);
    assert.equal(false, merge.left);
    assert.equal(merge.oldkey, 4);
    assert.equal(merge.operation, 1);

    var curr = leaf2;
    var prev;
    while(curr) {
        assert.equal(curr.getLeft(), prev);
        prev = curr;
        curr = curr.getRight();
    }

    var curr = leaf5;
    var prev = undefined;
    while(curr) {
        assert.equal(curr.getRight(), prev);
        prev = curr;
        curr = curr.getLeft();
    }

};

testBPlusTreeVerifyKeys = function(beforeExit, assert, node) {
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
        testBPlusTreeVerifyKeys(beforeExit, assert, left);
        testBPlusTreeVerifyKeys(beforeExit, assert, right);
    }    
};

testBPlusTreeLinkedListOrder = function(beforeExit, assert, tree) {
    var prev = undefined;    
    var curr = tree.root.data[0];
    while(curr) {
        assert.equal(prev, curr.getLeft());
        prev = curr;       
        curr = curr.getRight();
    }    
};

exports['test BPlusTreeInteriorNodeRemove'] = function(beforeExit, assert) {  
    var tree = sculedb.getBPlusTree(5);
    for(var i=0; i < 23; i++) {
        tree.insert(i, i);
        testBPlusTreeVerifyKeys(beforeExit, assert, tree.root);
    }    
    tree.remove(0);
    testBPlusTreeLinkedListOrder(beforeExit, assert, tree);
    testBPlusTreeVerifyKeys(beforeExit, assert, tree.root);
    tree.remove(3);
    testBPlusTreeLinkedListOrder(beforeExit, assert, tree);    
    testBPlusTreeVerifyKeys(beforeExit, assert, tree.root);
    tree.remove(6);
    testBPlusTreeLinkedListOrder(beforeExit, assert, tree);    
    testBPlusTreeVerifyKeys(beforeExit, assert, tree.root);    
    tree.remove(12);
    testBPlusTreeLinkedListOrder(beforeExit, assert, tree);    
    testBPlusTreeVerifyKeys(beforeExit, assert, tree.root);    
    tree.remove(1);
    testBPlusTreeLinkedListOrder(beforeExit, assert, tree);    
    testBPlusTreeVerifyKeys(beforeExit, assert, tree.root);    
    tree.remove(18);
    testBPlusTreeLinkedListOrder(beforeExit, assert, tree);    
    testBPlusTreeVerifyKeys(beforeExit, assert, tree.root);    
    tree.remove(21);
    testBPlusTreeLinkedListOrder(beforeExit, assert, tree);    
    testBPlusTreeVerifyKeys(beforeExit, assert, tree.root);    
    tree.remove(13);
    testBPlusTreeLinkedListOrder(beforeExit, assert, tree);    
    testBPlusTreeVerifyKeys(beforeExit, assert, tree.root);    
    tree.remove(19);
    testBPlusTreeLinkedListOrder(beforeExit, assert, tree);    
    testBPlusTreeVerifyKeys(beforeExit, assert, tree.root);    
    tree.remove(9);
    testBPlusTreeLinkedListOrder(beforeExit, assert, tree);    
    testBPlusTreeVerifyKeys(beforeExit, assert, tree.root);
    tree.remove(8);
    testBPlusTreeLinkedListOrder(beforeExit, assert, tree);    
    testBPlusTreeVerifyKeys(beforeExit, assert, tree.root);
    tree.remove(7);
    testBPlusTreeLinkedListOrder(beforeExit, assert, tree);
    testBPlusTreeVerifyKeys(beforeExit, assert, tree.root);
};

testBPlusTreeVerifyOrder = function(beforeExit, assert, node) {
    if(node.isLeaf()) {
        for(var i=0; i < node.data.length; i++) {
            if(i > 0) {
                for(var j=0; j < i; j++) {
                    if(node.data[j].key >= node.data[i].key) {
                        //console.log(node.data[j].key + ' >= ' + node.data[i].key);
                    }
                    assert.equal(false, node.data[j].key >= node.data[i].key);
                }
            }
        }
    } else {
        for(var i=0; i < node.data.length; i=i+2) {
            testBPlusTreeVerifyOrder(beforeExit, assert, node.data[i]);
        }
    }    
};

testBPlusTreeRangeOrder = function(beforeExit, assert, tree) {
    var range = tree.range(2000, 5000, true, true);
    for(var i=0; i < range.length - 1; i++) {
        assert.equal(true, range[i] < range[i + 1]);
    }    
}

exports['test BPlusTreeInteriorRemoveRandom'] = function(beforeExit, assert) {
    var tree = sculedb.getBPlusTree(5);
    var val  = [];
    for(var i=0; i < 23; i++) {
        var v = sculedb.Scule.$f.randomFromTo(1000, 5000);
        val.push(v);
        tree.insert(v, v);
    }
    var exist = [];
    var gone  = [];
    val.forEach(function(v) {
        if(sculedb.Scule.$f.randomFromTo(0, 5) == 2) {
            exist.push(v);
        } else {
            gone.push(v);
            tree.remove(v)
            testBPlusTreeVerifyKeys(beforeExit, assert, tree.root);
            testBPlusTreeVerifyOrder(beforeExit, assert, tree.root);
        }
    });
    gone.forEach(function(v) {
        assert.equal(tree.search(v), null);
    });
    exist.forEach(function(v) {
        assert.equal(tree.search(v), v);
    });
    testBPlusTreeVerifyKeys(beforeExit, assert, tree.root);
};

exports['test BPlusTreeInteriorNodeInsert'] = function(beforeExit, assert) {
    var tree = sculedb.getBPlusTree(5);
    for(var i=0; i < 32; i++) {
        tree.insert(i, i);
    }
    for(var i=0; i < 32; i++) {
        assert.equal(tree.search(i), i);
    }
    assert.equal(tree.search(-1), null);
    assert.equal(tree.search(38), null);
};

exports['test BPlusTreeAlphabetSequentialInsert'] = function(beforeExit, assert) {
    var tree = sculedb.getBPlusTree(5);
    var alpha = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
    for(var i=0; i < alpha.length; i++) {
        tree.insert(alpha[i], alpha[i]);
    }
    var range = tree.range("a", "z", true, true);
    assert.equal(range.length, 26);
    assert.equal(range[0], "a");
    assert.equal(range[range.length-1], "z");
};

exports['test BPlusTreeRange'] = function(beforeExit, assert) {
    var tree = sculedb.getBPlusTree(33);
    for(var i=0; i < 1000; i++) {
        var ts = (new Date()).getTime();
        tree.insert(i, i);
    }
    var range = tree.range(333, 633, true, true);  
    assert.equal(range.length, 301);
    assert.equal(range[0], 333);
    assert.equal(range[range.length - 1], 633);
    for(var i=0; i < range.length - 1; i++) {
        assert.equal(true, ((range[i] + 1) == (range[i + 1])));
    }
};

exports['test BPlusTreeRandomInsert'] = function(beforeExit, assert) {
    var tree = sculedb.getBPlusTree(5);
    var values = [34, 1, 10, 2, 5, 9, 0, 48, 99, 35, 11, 12, 7, 8, 23, 88, 17, 19, 33];
    for(var i=0; i < values.length; i++) {
        tree.insert(values[i], values[i]);
    }
    for(var i=0; i < values.length; i++) {
        assert.equal(tree.search(values[i]), values[i]);
    }
};

exports['test BPlusTreeRandomBulkInsert'] = function(beforeExit, assert) {
    var tree = sculedb.getBPlusTree(5);
    for(var i=0; i < 1000; i++) {
        var v = sculedb.Scule.$f.randomFromTo(1000, 5000);
        tree.insert(v, v);
    }    
    testBPlusTreeRangeOrder(beforeExit, assert, tree);
};

exports['test BPlusTreeBalanced'] = function(beforeExit, assert) {
    var tree = sculedb.getBPlusTree(5);
    for(var i=0; i < 10000; i++) {
        tree.insert(i, i);
    }
    var depths = [];
    var r = function(node, depth) {
        if(node) {
            node.data.forEach(function(o) {
                if(o.left || o.right) {
                    r(o.left, depth + 1);
                    r(o.right, depth + 1);                    
                } else {
                    depths.push(depth);
                }
            });
        }  
    }
    r(tree.root, 1);
    var j = depths[0];
    var e = true;
    for(var i=0; i < depths.length; i++) {
        if(j !== depths[i]) {
            e = false;
        }
    }
    assert.equal(true, e);
}

exports['test BPlusTreeRandomBalanced'] = function(beforeExit, assert) {
    var tree = sculedb.getBPlusTree(5);
    var values = [];
    for(var i=0; i < 700; i++) {
        var v = sculedb.Scule.$f.randomFromTo(5, 5000);
        values.push(v);
        tree.insert(v, v);
    }
    for(var i=0; i < values.length; i++) {
        assert.equal(tree.search(values[i]), values[i]);
    }
    var depths = [];
    var r = function(node, depth) {
        if(node) {
            node.data.forEach(function(o) {
                if(o.left || o.right) {
                    r(o.left, depth + 1);
                    r(o.right, depth + 1);                    
                } else {
                    depths.push(depth);
                }
            });
        }  
    }
    r(tree.root, 1);
    var j = depths[0];
    var e = true;
    for(var i=0; i < depths.length; i++) {
        if(j !== depths[i]) {
            e = false;
        }
    }
    assert.equal(true, e);
};

exports['test BPlusTreeBulkLoad'] = function(beforeExit, assert) {
    var tree = sculedb.getBPlusTree(sculedb.Scule.$f.randomFromTo(5000, 10000));
    var ts = (new Date()).getTime();
    for(var i=0; i < 10000; i++) {
        var v = sculedb.Scule.$f.randomFromTo(0, 10000);
        tree.insert(v, v);
    }
    assert.equal(true, ((new Date().getTime()) - ts) < 1500);
    
    var start = (new Date()).getTime();
    var ttl = 0;
    for(var i=0; i < 10000; i++) {
        var t = (new Date()).getTime();
        var v = sculedb.Scule.$f.randomFromTo(0, 10000);
        tree.search(v);
        t = (new Date()).getTime() - t;
        ttl += t;
    }
    var avg = (ttl/1000000);

};