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

var sculedb = require('../lib/com.scule.datastructures');
var jsunit  = require('../lib/com.scule.jsunit');

function testBPlusTreeNode() {
    var node = sculedb.getBPlusTreeNode();
    // test defaults
    jsunit.assertEquals(node.getOrder(), 100);
    jsunit.assertEquals(node.getMergeThreshold(), 40);
    // test bean functions
    node.setOrder(400);
    node.setMergeThreshold(33);
    jsunit.assertEquals(node.getOrder(), 400);
    jsunit.assertEquals(node.getMergeThreshold(), 33);
};

function testBPlusTreeLeafNodeBinarySearch() {
    var node = sculedb.getBPlusTreeLeafNode();
    for(var i=13; i < 329; i++) {
        node.data.push({
            key: i,
            value: i
        });
    }
    jsunit.assertEquals(node.indexSearch(30), 17);
    jsunit.assertEquals(node.indexSearch(3), 0);
    jsunit.assertEquals(node.indexSearch(400), 315);
    jsunit.assertEquals(node.indexSearch(14), 1);
};

function testBPlusTreeLeafNodeIdentifySiblings() {

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
    jsunit.assertEquals(siblings.left, null);
    jsunit.assertEquals(siblings.right, leaf2);
    jsunit.assertEquals(siblings.index, 0);
    
    var siblings = leaf2.identifySiblings(interior);
    jsunit.assertEquals(siblings.left, leaf1);
    jsunit.assertEquals(siblings.right, leaf3);
    jsunit.assertEquals(siblings.index, 2);
    
    var siblings = leaf4.identifySiblings(interior);
    jsunit.assertEquals(siblings.left, leaf3);
    jsunit.assertEquals(siblings.right, leaf5);
    jsunit.assertEquals(siblings.index, 6);
    
    var siblings = leaf5.identifySiblings(interior);
    jsunit.assertEquals(siblings.left, leaf4);
    jsunit.assertEquals(siblings.right, null);
    jsunit.assertEquals(siblings.index, 8);
};

function testBPlusTreeLeafNodeInsert() {
    var leaf = sculedb.getBPlusTreeLeafNode();
    leaf.setOrder(5);
    leaf.insert('foo0', 'bar0');
    leaf.insert('foo1', 'bar1');
    leaf.insert('foo2', 'bar2');
    leaf.insert('foo3', 'bar3');
    leaf.insert('foo4', 'bar4');
    jsunit.assertEquals(leaf.data.length, 5);
    for(var i=0; i < leaf.data.length; i++) {
        jsunit.assertEquals(leaf.data[i].key, 'foo' + i);
    }
};

function testBPlusTreeLeafNodeSearch() {
    var leaf = sculedb.getBPlusTreeLeafNode();
    leaf.insert('foo', 'bar');
    leaf.insert('foo1', 'bar1');
    leaf.insert('foo2', 'bar2');
    leaf.insert('foo3', 'bar3');
    leaf.insert('foo4', 'bar4');
    leaf.lookup.clear();
    jsunit.assertEquals(leaf.search('foo2'), 'bar2');
    jsunit.assertEquals(leaf.search('foo4'), 'bar4');
    jsunit.assertEquals(leaf.search('foo4'), 'bar4');
};

function testBPlusTreeLeafNodeSplit() {
    var leaf = sculedb.getBPlusTreeLeafNode();
    var inner;
    leaf.setOrder(5);
    for(var i=0; i < 6; i++) {
        inner = leaf.insert(i, i);
        if(i < 5) {
            jsunit.assertEquals(null, inner);
            jsunit.assertEquals(leaf.data[i].key, i);
            jsunit.assertEquals(leaf.data[i].value, i);
        }
    }
    jsunit.assertEquals(inner.left.data.length, 3);
    jsunit.assertEquals(inner.right.data.length, 3);
    jsunit.assertEquals(inner.key, 3);
    jsunit.assertEquals(inner.left.getRight(), inner.right);
    jsunit.assertEquals(inner.right.getLeft(), inner.left);
};

function testBPlusTreeLeafNodeSplit2() {
    var leaf = sculedb.getBPlusTreeLeafNode();
    var inner;
    leaf.setOrder(5);
    var values = [50, 1, 3, 34, 43, 78];
    for(var i=0; i < values.length; i++) {
        inner = leaf.insert(values[i], values[i]);
        if(i < 5) {
            jsunit.assertEquals(null, inner);
        }
    }
    jsunit.assertEquals(inner.left.data[0].value, 1);
    jsunit.assertEquals(inner.left.data[1].value, 3);
    jsunit.assertEquals(inner.left.data[2].value, 34);
    jsunit.assertEquals(inner.right.data[0].value, 43);
    jsunit.assertEquals(inner.right.data[1].value, 50);
    jsunit.assertEquals(inner.right.data[2].value, 78);    
    jsunit.assertEquals(inner.left.data.length, 3);
    jsunit.assertEquals(inner.right.data.length, 3);
    jsunit.assertEquals(inner.key, 43);
};

function testBPlusTreeInteriorNodeIndexSearch() {
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
    
    jsunit.assertEquals(interior.indexSearch(1), 1);
    jsunit.assertEquals(interior.indexSearch(5), 3);
    jsunit.assertEquals(interior.indexSearch(11), 5);
    jsunit.assertEquals(interior.indexSearch(15), 7);
    jsunit.assertEquals(interior.indexSearch(24), 7);
};

function testBPlusTreeLeafNodeRedistribute() {
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

    jsunit.assertEquals(leaf5.search(19), 19);
    leaf5.remove(19, interior);
    jsunit.assertEquals(leaf5.search(19), null);
    leaf5.remove(18, interior);
    jsunit.assertEquals(leaf5.search(18), null);
    jsunit.assertEquals(leaf5.search(15), 15);

};

function testBPlusTreeLeafNodeMergeLeft() {
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

    jsunit.assertEquals(leaf5.search(19), 19);

    leaf5.remove(19, interior);
    jsunit.assertEquals(leaf5.search(19), null);

    leaf5.remove(18, interior);
    jsunit.assertEquals(leaf5.search(18), null);
    jsunit.assertEquals(leaf5.search(15), 15);
    
    var merge = leaf5.remove(15, interior);
    jsunit.assertEquals(leaf5.data.length, 0);
    jsunit.assertEquals(leaf4.data.length, 5);
    jsunit.assertEquals(merge.node, leaf4);
    jsunit.assertTrue(merge.left);
    jsunit.assertEquals(merge.oldkey, 16);
    jsunit.assertEquals(merge.operation, 1);

};

function testBPlusTreeLeafNodeMergeRight() {
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

    jsunit.assertEquals(leaf1.search(1), 1);

    leaf1.remove(1, interior);
    jsunit.assertEquals(leaf5.search(1), null);

    leaf1.remove(2, interior);
    jsunit.assertEquals(leaf1.search(2), null);
    jsunit.assertEquals(leaf1.search(4), 4);
    
    var merge = leaf1.remove(4, interior);
    jsunit.assertEquals(leaf1.data.length, 0);
    jsunit.assertEquals(leaf2.data.length, 5);
    jsunit.assertEquals(merge.node, leaf2);
    jsunit.assertFalse(merge.left);
    jsunit.assertEquals(merge.oldkey, 4);
    jsunit.assertEquals(merge.operation, 1);

    var curr = leaf2;
    var prev;
    while(curr) {
        jsunit.assertEquals(curr.getLeft(), prev);
        prev = curr;
        curr = curr.getRight();
    }

    var curr = leaf5;
    var prev = undefined;
    while(curr) {
        jsunit.assertEquals(curr.getRight(), prev);
        prev = curr;
        curr = curr.getLeft();
    }

};

function testBPlusTreeVerifyKeys(node) {
    if(node.isLeaf()) {
        return;
    }
    var key, left, right;
    for(var i=1; i < node.data.length; i=i+2) {
        key   = node.data[i];
        left  = node.data[i-1];
        right = node.data[i+1];
        if(left.isLeaf() && right.isLeaf()) {
            jsunit.assertTrue(left.data[0].key < key);
            jsunit.assertTrue(right.data[0].key == key);                
            return;
        }
        jsunit.assertTrue(left.data[1] < key);
        jsunit.assertTrue(right.data[1] >= key);
        testBPlusTreeVerifyKeys(left);
        testBPlusTreeVerifyKeys(right);
    }    
};

function testBPlusTreeLinkedListOrder(tree) {
    var prev = undefined;    
    var curr = tree.root.data[0];
    while(curr) {
        jsunit.assertEquals(prev, curr.getLeft());
        prev = curr;       
        curr = curr.getRight();
    }    
};

function testBPlusTreeInteriorNodeRemove() {  
    var tree = sculedb.getBPlusTree(5);
    for(var i=0; i < 23; i++) {
        tree.insert(i, i);
        testBPlusTreeVerifyKeys(tree.root);
    }    
    tree.remove(0);
    testBPlusTreeLinkedListOrder(tree);
    testBPlusTreeVerifyKeys(tree.root);
    tree.remove(3);
    testBPlusTreeLinkedListOrder(tree);    
    testBPlusTreeVerifyKeys(tree.root);
    tree.remove(6);
    testBPlusTreeLinkedListOrder(tree);    
    testBPlusTreeVerifyKeys(tree.root);    
    tree.remove(12);
    testBPlusTreeLinkedListOrder(tree);    
    testBPlusTreeVerifyKeys(tree.root);    
    tree.remove(1);
    testBPlusTreeLinkedListOrder(tree);    
    testBPlusTreeVerifyKeys(tree.root);    
    tree.remove(18);
    testBPlusTreeLinkedListOrder(tree);    
    testBPlusTreeVerifyKeys(tree.root);    
    tree.remove(21);
    testBPlusTreeLinkedListOrder(tree);    
    testBPlusTreeVerifyKeys(tree.root);    
    tree.remove(13);
    testBPlusTreeLinkedListOrder(tree);    
    testBPlusTreeVerifyKeys(tree.root);    
    tree.remove(19);
    testBPlusTreeLinkedListOrder(tree);    
    testBPlusTreeVerifyKeys(tree.root);    
    tree.remove(9);
    testBPlusTreeLinkedListOrder(tree);    
    testBPlusTreeVerifyKeys(tree.root);
    tree.remove(8);
    testBPlusTreeLinkedListOrder(tree);    
    testBPlusTreeVerifyKeys(tree.root);
    tree.remove(7);
    testBPlusTreeLinkedListOrder(tree);
    testBPlusTreeVerifyKeys(tree.root);
};

function testBPlusTreeVerifyOrder(node) {
    if(node.isLeaf()) {
        for(var i=0; i < node.data.length; i++) {
            if(i > 0) {
                for(var j=0; j < i; j++) {
                    if(node.data[j].key >= node.data[i].key) {
                        //console.log(node.data[j].key + ' >= ' + node.data[i].key);
                    }
                    jsunit.assertFalse(node.data[j].key >= node.data[i].key);
                }
            }
        }
    } else {
        for(var i=0; i < node.data.length; i=i+2) {
            testBPlusTreeVerifyOrder(node.data[i]);
        }
    }    
};

function testBPlusTreeRangeOrder(tree) {
    var range = tree.range(2000, 5000, true, true);
    for(var i=0; i < range.length - 1; i++) {
        jsunit.assertTrue(range[i] < range[i + 1]);
    }    
}

function testBPlusTreeInteriorRemoveRandom() {
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
            testBPlusTreeVerifyKeys(tree.root);
            testBPlusTreeVerifyOrder(tree.root);
        }
    });
    gone.forEach(function(v) {
        jsunit.assertEquals(tree.search(v), null);
    });
    exist.forEach(function(v) {
        jsunit.assertEquals(tree.search(v), v);
    });
    testBPlusTreeVerifyKeys(tree.root);
};

function testBPlusTreeInteriorNodeInsert() {
    var tree = sculedb.getBPlusTree(5);
    for(var i=0; i < 32; i++) {
        tree.insert(i, i);
    }
    for(var i=0; i < 32; i++) {
        jsunit.assertEquals(tree.search(i), i);
    }
    jsunit.assertEquals(tree.search(-1), null);
    jsunit.assertEquals(tree.search(38), null);
};

function testBPlusTreeAlphabetSequentialInsert() {
    var tree = sculedb.getBPlusTree(5);
    var alpha = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
    for(var i=0; i < alpha.length; i++) {
        tree.insert(alpha[i], alpha[i]);
    }
    var range = tree.range("a", "z", true, true);
    jsunit.assertEquals(range.length, 26);
    jsunit.assertEquals(range[0], "a");
    jsunit.assertEquals(range[range.length-1], "z");
};

function testBPlusTreeRange() {
    var tree = sculedb.getBPlusTree(33);
    for(var i=0; i < 1000; i++) {
        var ts = (new Date()).getTime();
        tree.insert(i, i);
    }
    var range = tree.range(333, 633, true, true);  
    jsunit.assertEquals(range.length, 301);
    jsunit.assertEquals(range[0], 333);
    jsunit.assertEquals(range[range.length - 1], 633);
    for(var i=0; i < range.length - 1; i++) {
        jsunit.assertTrue(((range[i] + 1) == (range[i + 1])));
    }
};

function testBPlusTreeRandomInsert() {
    var tree = sculedb.getBPlusTree(5);
    var values = [34, 1, 10, 2, 5, 9, 0, 48, 99, 35, 11, 12, 7, 8, 23, 88, 17, 19, 33];
    for(var i=0; i < values.length; i++) {
        tree.insert(values[i], values[i]);
    }
    for(var i=0; i < values.length; i++) {
        jsunit.assertEquals(tree.search(values[i]), values[i]);
    }
};

function testBPlusTreeRandomBulkInsert() {
    var tree = sculedb.getBPlusTree(5);
    for(var i=0; i < 1000; i++) {
        var v = sculedb.Scule.$f.randomFromTo(1000, 5000);
        tree.insert(v, v);
    }    
    testBPlusTreeRangeOrder(tree);
};

function testBPlusTreeBalanced() {
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
    jsunit.assertTrue(e);
}

function testBPlusTreeRandomBalanced() {
    var tree = sculedb.getBPlusTree(5);
    var values = [];
    for(var i=0; i < 700; i++) {
        var v = sculedb.Scule.$f.randomFromTo(5, 5000);
        values.push(v);
        tree.insert(v, v);
    }
    for(var i=0; i < values.length; i++) {
        jsunit.assertEquals(tree.search(values[i]), values[i]);
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
    jsunit.assertTrue(e);
};

function testBPlusTreeBulkLoad() {
    var tree = sculedb.getBPlusTree(sculedb.Scule.$f.randomFromTo(5000, 10000));
    var ts = (new Date()).getTime();
    for(var i=0; i < 100000; i++) {
        var v = sculedb.Scule.$f.randomFromTo(0, 100000);
        tree.insert(v, v);
    }
    jsunit.assertTrue(((new Date().getTime()) - ts) < 1500);
    
    var start = (new Date()).getTime();
    var ttl = 0;
    for(var i=0; i < 1000000; i++) {
        var t = (new Date()).getTime();
        var v = sculedb.Scule.$f.randomFromTo(0, 100000);
        tree.search(v);
        t = (new Date()).getTime() - t;
        ttl += t;
    }
    var avg = (ttl/1000000);

};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testBPlusTreeLeafNodeIdentifySiblings);
    jsunit.addTest(testBPlusTreeLeafNodeBinarySearch);
    jsunit.addTest(testBPlusTreeLeafNodeInsert);
    jsunit.addTest(testBPlusTreeLeafNodeSearch);
    jsunit.addTest(testBPlusTreeLeafNodeSplit);
    jsunit.addTest(testBPlusTreeLeafNodeSplit2);
    jsunit.addTest(testBPlusTreeInteriorNodeIndexSearch);
    jsunit.addTest(testBPlusTreeInteriorNodeInsert);
    jsunit.addTest(testBPlusTreeAlphabetSequentialInsert);
    jsunit.addTest(testBPlusTreeNode);
    jsunit.addTest(testBPlusTreeBalanced);
    jsunit.addTest(testBPlusTreeRange);
    jsunit.addTest(testBPlusTreeRandomInsert);
    jsunit.addTest(testBPlusTreeRandomBalanced);
    jsunit.addTest(testBPlusTreeLeafNodeRedistribute);
    jsunit.addTest(testBPlusTreeLeafNodeMergeLeft);
    jsunit.addTest(testBPlusTreeLeafNodeMergeRight);
    jsunit.addTest(testBPlusTreeInteriorNodeRemove);
    jsunit.addTest(testBPlusTreeInteriorRemoveRandom);
    jsunit.addTest(testBPlusTreeRandomBulkInsert);
    jsunit.addTest(testBPlusTreeBulkLoad);
    jsunit.runTests();
}());