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

var jsunit = require('com.scule.jsunit');
var scule  = require('com.scule');
var sfunc  = scule.Scule.functions;

(function() {
    
    function testCompare() {
        jsunit.assertEquals(sfunc.compare(1, 1), 0);
        jsunit.assertEquals(sfunc.compare(2, 1), 1);
        jsunit.assertEquals(sfunc.compare(1, 2), -1);
    };

    function testArrayCompare() {
        jsunit.assertEquals(sfunc.compareArray([[1, 2, 3], 2, 3], [[1, 2, 3], 2, 3]), 0);
        jsunit.assertEquals(sfunc.compareArray([[2, 2, 3], 2, 3], [[1, 2, 3], 2, 3]), 1);
        jsunit.assertEquals(sfunc.compareArray([[1, 2, 3], 2, 3], [[2, 2, 3], 2, 3]), -1);
        jsunit.assertEquals(sfunc.compareArray([1, 2, 3], [1, 2, 3]), 0);
        jsunit.assertEquals(sfunc.compareArray([2, 2, 3], [1, 2, 3]), 1);
        jsunit.assertEquals(sfunc.compareArray([1, 2, 3], [3, 2, 3]), -1);
    };

    function testRandomFromTo() {
        var e = sfunc.randomFromTo(10, 30);  
        jsunit.assertTrue(e >= 10 && e <= 30);  
    };

    function testIsArray() {
        jsunit.assertTrue(sfunc.isArray([1, 2, 3, 4, 5]));
        jsunit.assertFalse(sfunc.isArray({
            foo:'bar'
        })); 
        jsunit.assertFalse(sfunc.isArray(1));
        jsunit.assertFalse(sfunc.isArray('testing'));
    };

    function testSizeOf() {
        jsunit.assertEquals(sfunc.sizeOf({
            foo:'bar',
            bar:'foo'
        }), 2);  
    };

    function testShuffle() {
        var a = [1, 2, 3, 4, 5, 6, 7];
        var b = [1, 2, 3, 4, 5, 6, 7];
        jsunit.assertEquals(JSON.stringify(a), JSON.stringify(b));
        sfunc.shuffle(b);
        jsunit.assertNotEquals(JSON.stringify(a), JSON.stringify(b));  
    };

    function testCloneObject() {
        var o = {
            foo:'bar',
            bar:'foo',
            a:[1,2,3,4],
            b:{
                foo2:'bar2'
            }
        };
        jsunit.assertEquals(JSON.stringify(o), JSON.stringify(sfunc.cloneObject(o)));
    }

    function testIsInteger() {
        jsunit.assertTrue(sfunc.isInteger(5));
        jsunit.assertFalse(sfunc.isInteger(10.232));
        jsunit.assertFalse(sfunc.isInteger("foo"));
        jsunit.assertTrue(sfunc.isInteger("5"));
        jsunit.assertFalse(sfunc.isInteger({
            foo:"bar"
        }));
    };

    function testIsScalar() {
        jsunit.assertTrue(sfunc.isScalar(5));
        jsunit.assertTrue(sfunc.isScalar(10.232));
        jsunit.assertTrue(sfunc.isScalar("foo"));
        jsunit.assertTrue(sfunc.isScalar("5"));
        jsunit.assertFalse(sfunc.isScalar({
            foo:"bar"
        }));
        jsunit.assertFalse(sfunc.isScalar([1,2,3,4,5]));    
    };

    function testSearchObject() {
        var composite;
        var keys = {a:true, c:{d:true}, e:{f:{'0':true}}};
        var object = {
            a: 10,
            c: {
                d: 'foo'
            },
            e: {
                f: [11, 12, 23, 33]
            },
            f: 12
        }
        composite = sfunc.searchObject(keys, object);
        jsunit.assertEquals(composite[0], 10);
        jsunit.assertEquals(composite[1], 'foo');
        jsunit.assertEquals(composite[2], 11);

        keys.e.f = {'2':true};
        keys.f = true;
        composite = sfunc.searchObject(keys, object);
        jsunit.assertEquals(composite[0], 10);
        jsunit.assertEquals(composite[1], 'foo');
        jsunit.assertEquals(composite[2], 23);  
        jsunit.assertEquals(composite[3], 12);
        jsunit.assertNotEquals(composite[3], 33);
    }

    function testTraverseObject() {
        var object = {
            a: 10,
            c: {
                d: 'foo'
            },
            e: {
                f: [11, 12, 23, 33]
            },
            f: 12
        }    
        var result = sfunc.traverseObject({f:true}, object);
        jsunit.assertEquals('{"a":10,"c":{"d":"foo"},"e":{"f":[11,12,23,33]},"f":12}', JSON.stringify(result[1]));
        jsunit.assertEquals(result[0], 'f');
        result = sfunc.traverseObject({e:{f:true}}, object);
        jsunit.assertEquals('{"f":[11,12,23,33]}', JSON.stringify(result[1]));
        jsunit.assertEquals(result[0], 'f');
        result = sfunc.traverseObject({e:{z:true}}, object);
        jsunit.assertEquals('{"f":[11,12,23,33]}', JSON.stringify(result[1]));
        jsunit.assertEquals(result[0], 'z');
    };

    (function() {
        jsunit.resetTests();
        jsunit.addTest(testCompare);
        jsunit.addTest(testArrayCompare);
        jsunit.addTest(testRandomFromTo);
        jsunit.addTest(testIsArray);
        jsunit.addTest(testSizeOf);
        jsunit.addTest(testShuffle);
        jsunit.addTest(testCloneObject);
        jsunit.addTest(testIsInteger);
        jsunit.addTest(testIsScalar);
        jsunit.addTest(testSearchObject);
        jsunit.addTest(testTraverseObject);
        jsunit.runTests();
    }());    
    
}());

(function() {
   
    function testBitSetInitializeString() {   
        var exception = false;
        try {
            var bitset = scule.getBitSet('test');
        } catch (e) {
            exception = true;
        }
        jsunit.assertEquals(true, exception);
    };

    function testBitSetInitializeNegativeNumber() {   
        var exception = false;
        try {
            var bitset = scule.getBitSet(-100);
        } catch (e) {
            exception = true;
        }
        jsunit.assertEquals(true, exception);
    };

    function testBitSetInitializeFloatingPointNumber() {   
        var exception = false;
        try {
            var bitset = scule.getBitSet(111.030202);
        } catch (e) {
            exception = true;
        }
        jsunit.assertEquals(true, exception);
    };

    function testBitSetInitialize() {
        var bitset = scule.getBitSet(8);
        jsunit.assertEquals(8, bitset.getLength());
    };

    function testBitSetEmpty() {   
        var bitset = scule.getBitSet(1024);
        for (var i=0; i < bitset.words.length; i++) {
            jsunit.assertEquals(0x00, bitset.words[i]);
        }
    };

    function testBitSetSetEverySecondBit() {   
        var bitset = scule.getBitSet(10);
        for (var i=0; i < 10; i++) {
            if (i%2) {
                bitset.set(i);
            }
        }
        for (var i=0; i < 10; i++) {
            if (i%2) {
                jsunit.assertEquals(true, bitset.get(i));
            } else {
                jsunit.assertEquals(false, bitset.get(i));
            }
        }
    };

    function testBitSetSetRandomBits() {
        for (var j=0; j < 10000; j++) {
            var bitset = scule.getBitSet(90);
            var string = '';
            for (var i=0; i < bitset.getLength(); i++) {
                if (sfunc.randomFromTo(0, 1) == 1) {
                    bitset.set(i);
                    string += '1';
                } else {
                    string += '0';
                }
            }
            jsunit.assertEquals(string, bitset.toString());
        }
    };
   
    function testBloomFilterRandomKeys() {
        for (var j=0; j < 500; j++) {
            var table  = scule.getHashTable(2000);
            var filter = scule.getBloomFilter(15000);
            var keys = [];
            for (var i=0; i < 300; i++) {
                var key = Math.random().toString(36).substring(5);
                table.put(key)
                filter.add(key);
            }
            table.getKeys().forEach(function(k) {
                jsunit.assertEquals(true, filter.query(k));
            });
            var nkey = Math.random().toString(36).substring(5);
            while (table.contains(nkey)) {
                nkey = Math.random().toString(36).substring(5);
            }
            jsunit.assertEquals(false, filter.query(nkey));
        }
    };   
   
    function testAtomicCounterInitialize() {   
        var counter = scule.getAtomicCounter(999);
        jsunit.assertEquals(counter.getCount(), 999);   
    };

    function testAtomicCounterIncrement() {   
        var counter = scule.getAtomicCounter(1);
        counter.increment(1);
        jsunit.assertEquals(counter.getCount(), 2);   
    };

    function testAtomicCounterIncrement2() {   
        var counter = scule.getAtomicCounter(1);
        counter.increment(11);
        jsunit.assertEquals(counter.getCount(), 12);   
    };

    function testAtomicCounterDecrement() {   
        var counter = scule.getAtomicCounter(2);
        counter.decrement(1);
        jsunit.assertEquals(counter.getCount(), 1);   
    };

    function testAtomicCounterDecrement2() {   
        var counter = scule.getAtomicCounter(12);
        counter.decrement(6);
        jsunit.assertEquals(counter.getCount(), 6);   
    };   
   
    (function() {
        jsunit.resetTests();
        jsunit.addTest(testBitSetInitializeString);
        jsunit.addTest(testBitSetInitializeNegativeNumber);
        jsunit.addTest(testBitSetInitializeFloatingPointNumber);
        jsunit.addTest(testBitSetInitialize);
        jsunit.addTest(testBitSetEmpty);
        jsunit.addTest(testBitSetSetEverySecondBit);
        jsunit.addTest(testBitSetSetRandomBits);
        jsunit.addTest(testBloomFilterRandomKeys);
        jsunit.addTest(testAtomicCounterInitialize);
        jsunit.addTest(testAtomicCounterIncrement);
        jsunit.addTest(testAtomicCounterIncrement2);
        jsunit.addTest(testAtomicCounterDecrement);
        jsunit.addTest(testAtomicCounterDecrement2);
        jsunit.runTests();
    }());   
   
}());

(function(){
    
    function testBPlusTreeNode() {
        var node = scule.getBPlusTreeNode();
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
        var node = scule.getBPlusTreeLeafNode();
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
    
        var leaf1 = scule.getBPlusTreeLeafNode();
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

        var leaf2 = scule.getBPlusTreeLeafNode();
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

        var leaf3 = scule.getBPlusTreeLeafNode();
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

        var leaf4 = scule.getBPlusTreeLeafNode();
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

        var leaf5 = scule.getBPlusTreeLeafNode();
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
        var leaf = scule.getBPlusTreeLeafNode();
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
        var leaf = scule.getBPlusTreeLeafNode();
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
        var leaf = scule.getBPlusTreeLeafNode();
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
        var leaf = scule.getBPlusTreeLeafNode();
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
        var interior = scule.getBPlusTreeInteriorNode();
        interior.setOrder(5);
        interior.setMergeThreshold(2);
    
        var leaf1 = scule.getBPlusTreeLeafNode();
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

        var leaf2 = scule.getBPlusTreeLeafNode();
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

        var leaf3 = scule.getBPlusTreeLeafNode();
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

        var leaf4 = scule.getBPlusTreeLeafNode();
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

        var leaf5 = scule.getBPlusTreeLeafNode();
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
        var interior = scule.getBPlusTreeInteriorNode();
        interior.setOrder(5);
        interior.setMergeThreshold(2);
    
        var leaf1 = scule.getBPlusTreeLeafNode();
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

        var leaf2 = scule.getBPlusTreeLeafNode();
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

        var leaf3 = scule.getBPlusTreeLeafNode();
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

        var leaf4 = scule.getBPlusTreeLeafNode();
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

        var leaf5 = scule.getBPlusTreeLeafNode();
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
        var interior = scule.getBPlusTreeInteriorNode();
        interior.setOrder(5);
        interior.setMergeThreshold(2);
    
        var leaf1 = scule.getBPlusTreeLeafNode();
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

        var leaf2 = scule.getBPlusTreeLeafNode();
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

        var leaf3 = scule.getBPlusTreeLeafNode();
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

        var leaf4 = scule.getBPlusTreeLeafNode();
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

        var leaf5 = scule.getBPlusTreeLeafNode();
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
        var interior = scule.getBPlusTreeInteriorNode();
        interior.setOrder(5);
        interior.setMergeThreshold(2);
    
        var leaf1 = scule.getBPlusTreeLeafNode();
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

        var leaf2 = scule.getBPlusTreeLeafNode();
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

        var leaf3 = scule.getBPlusTreeLeafNode();
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

        var leaf4 = scule.getBPlusTreeLeafNode();
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

        var leaf5 = scule.getBPlusTreeLeafNode();
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
        var tree = scule.getBPlusTree(5);
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
        var tree = scule.getBPlusTree(5);
        var val  = [];
        for(var i=0; i < 23; i++) {
            var v = sfunc.randomFromTo(1000, 5000);
            val.push(v);
            tree.insert(v, v);
        }
        var exist = [];
        var gone  = [];
        val.forEach(function(v) {
            if(sfunc.randomFromTo(0, 5) == 2) {
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
        var tree = scule.getBPlusTree(5);
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
        var tree = scule.getBPlusTree(100);
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
        var tree = scule.getBPlusTree(78);
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

    function testBPlusTreeLeftRange() {
        var tree = scule.getBPlusTree(100);
        for(var i=0; i < 1000; i++) {
            var ts = (new Date()).getTime();
            tree.insert(i, i);
        }
        var range = tree.range(333, null, true, null);
        jsunit.assertEquals(range[0], 333);
    };

    function testBPlusTreeRightRange() {
        var tree = scule.getBPlusTree(5);
        for(var i=0; i < 1000; i++) {
            var ts = (new Date()).getTime();
            tree.insert(i, i);
        }
        var range = tree.range(null, 633, null, true);  
        jsunit.assertEquals(range[range.length - 1], 633);
    };

    function testBPlusTreeRandomInsert() {
        var tree = scule.getBPlusTree(5);
        var values = [34, 1, 10, 2, 5, 9, 0, 48, 99, 35, 11, 12, 7, 8, 23, 88, 17, 19, 33];
        for(var i=0; i < values.length; i++) {
            tree.insert(values[i], values[i]);
        }
        for(var i=0; i < values.length; i++) {
            jsunit.assertEquals(tree.search(values[i]), values[i]);
        }
    };

    function testBPlusTreeRandomBulkInsert() {
        var tree = scule.getBPlusTree(5);
        for(var i=0; i < 1000; i++) {
            var v = sfunc.randomFromTo(1000, 5000);
            tree.insert(v, v);
        }    
        testBPlusTreeRangeOrder(tree);
    };

    function testBPlusTreeBalanced() {
        var tree = scule.getBPlusTree(5);
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
    };

    function testBPlusTreeRandomBalanced() {
        var tree = scule.getBPlusTree(5);
        var values = [];
        for(var i=0; i < 700; i++) {
            var v = sfunc.randomFromTo(5, 5000);
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
        var tree = scule.getBPlusTree(sfunc.randomFromTo(5000, 10000));
        var ts = (new Date()).getTime();
        for(var i=0; i < 100000; i++) {
            var v = sfunc.randomFromTo(0, 100000);
            tree.insert(v, v);
        }
        jsunit.assertTrue(((new Date().getTime()) - ts) < 1500);
    
        var start = (new Date()).getTime();
        var ttl = 0;
        for(var i=0; i < 1000000; i++) {
            var t = (new Date()).getTime();
            var v = sfunc.randomFromTo(0, 100000);
            tree.search(v);
            t = (new Date()).getTime() - t;
            ttl += t;
        }
        var avg = (ttl/1000000);    
    };

    (function() {
        jsunit.resetTests();
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
        jsunit.addTest(testBPlusTreeLeftRange);
        jsunit.addTest(testBPlusTreeRightRange);
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
    
}());

(function() {

    function testBPlusHashingTreeVerifyKeys(node) {
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
            testBPlusHashingTreeVerifyKeys(left);
            testBPlusHashingTreeVerifyKeys(right);
        }    
    };

    function testBPlusHashingTreeLinkedListOrder(tree) {
        var prev = undefined;    
        var curr = tree.root.data[0];
        while(curr) {
            console.log(curr);
            jsunit.assertEquals(prev, curr.getLeft());
            prev = curr;       
            curr = curr.getRight();
        }    
    };

    function testBPlusHashingTreeVerifyOrder(node) {
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
                testBPlusHashingTreeVerifyOrder(node.data[i]);
            }
        }    
    };

    function testBPlusHashingTreeInsert() {
        var tree = scule.getBPlusHashingTree(5);
        for(var i=0; i < 200; i++) {
            var k = sfunc.randomFromTo(10, 200);
            var o = {
                _id: scule.getObjectId(),
                key: k,
                slug: 'slug:' + i
            };
            tree.insert(k, o);
        }
        testBPlusHashingTreeVerifyKeys(tree.root);
        testBPlusHashingTreeVerifyOrder(tree.root);
    };

    function testBPlusHashingTreeInsert2() {
        var tree = scule.getBPlusHashingTree(33);
        for(var i=0; i < 10; i++) {
            var k = sfunc.randomFromTo(10, 200);
            var o = {
                _id: scule.getObjectId(),
                key: k,
                slug: 'slug:' + i
            };
            tree.insert(k, o);
        }
        testBPlusHashingTreeVerifyKeys(tree.root);
        testBPlusHashingTreeVerifyOrder(tree.root);
    };

    function testBPlusHashingTreeInsert3() {
        var tree = scule.getBPlusHashingTree(17);
        for(var i=0; i < 100; i++) {
            var k = i%10;
            var o = {
                _id: scule.getObjectId(),
                key: k,
                slug: 'slug:' + i
            };
            tree.insert(k, o);        
        }
        for(var i=0; i < 10; i++) {
            var table = tree.search(i);
            jsunit.assertEquals(table.getLength(), 10);
            var keys = table.getKeys();
            keys.forEach(function(key) {
               jsunit.assertEquals(table.get(key).key, i);
               jsunit.assertEquals(table.get(key)._id.toString(), key);
            });
        }
    }

    function testBPlusHashingTreeRemove() {
        var tree = scule.getBPlusHashingTree(10);
        for(var i=0; i < 100; i++) {
            var k = i%10;
            var o = {
                _id: scule.getObjectId(),
                key: k,
                slug: 'slug:' + i
            };
            tree.insert(k, o);        
        }
        tree.remove(5);
        jsunit.assertEquals(tree.search(5), null);
        tree.remove(2);
        jsunit.assertEquals(tree.search(2), null);    
        jsunit.assertNotEquals(tree.search(9), null);    
    }

    function testBPlusHashingTreeRange() {
        var tree = scule.getBPlusHashingTree(15);
        for(var i=0; i < 2000; i++) {
            var k = sfunc.randomFromTo(10, 2000);
            var o = {
                _id: scule.getObjectId(),
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
        jsunit.assertFalse(broken);
    };

    function testBPlusHashingTreeLeftRange() {
        var tree = scule.getBPlusHashingTree(15);
        for(var i=0; i < 2000; i++) {
            var k = sfunc.randomFromTo(10, 2000);
            var o = {
                _id: scule.getObjectId(),
                key: k,
                slug: 'slug:' + i
            };
            tree.insert(k, o);
        }
        var range = tree.range(333, null);
        var broken = false;
        for(var i=0; i < range.length; i++) {
            for(var j=0; j < i; j++) {
                if(range[j] > range[i]) {
                    broken = true;
                    break;
                }
            }
        }
        jsunit.assertFalse(broken);
    };

    function testBPlusHashingTreeRightRange() {
        var tree = scule.getBPlusHashingTree(15);
        for(var i=0; i < 2000; i++) {
            var k = sfunc.randomFromTo(10, 2000);
            var o = {
                _id: scule.getObjectId(),
                key: k,
                slug: 'slug:' + i
            };
            tree.insert(k, o);
        }
        var range = tree.range(null, 333);
        var broken = false;
        for(var i=0; i < range.length; i++) {
            for(var j=0; j < i; j++) {
                if(range[j] > range[i]) {
                    broken = true;
                    break;
                }
            }
        }
        jsunit.assertFalse(broken);
    };

    (function() {
        jsunit.resetTests();
        jsunit.addTest(testBPlusHashingTreeInsert);
        jsunit.addTest(testBPlusHashingTreeInsert2);
        jsunit.addTest(testBPlusHashingTreeInsert3);
        jsunit.addTest(testBPlusHashingTreeRemove);
        jsunit.addTest(testBPlusHashingTreeRange);
        jsunit.addTest(testBPlusHashingTreeLeftRange);
        jsunit.addTest(testBPlusHashingTreeRightRange);
        jsunit.runTests();
    }());

}());

(function() {
    
    function testBinaryTreeNode() {
        var node = scule.getBinarySearchTreeNode('foo', 'bar');
        jsunit.assertEquals(node.getKey(), 'foo');
        jsunit.assertEquals(node.getData(), 'bar');
        jsunit.assertEquals(node.getLeft(), null);
        jsunit.assertEquals(node.getRight(), null);
        node.setLeft(scule.getBinarySearchTreeNode('foo1', 'bar1'));
        node.setRight(scule.getBinarySearchTreeNode('foo2', 'bar2'));
        jsunit.assertEquals(node.getLeft().getKey(), 'foo1');
        jsunit.assertEquals(node.getLeft().getData(), 'bar1');
        jsunit.assertEquals(node.getRight().getKey(), 'foo2');
        jsunit.assertEquals(node.getRight().getData(), 'bar2');    
    };

    function testBinaryTreeNodeRemove() {
        var node = scule.getBinarySearchTreeNode('foo5', 'bar5');

        node.setLeft(scule.getBinarySearchTreeNode('foo3', 'bar3'));
        node.getLeft().setLeft(scule.getBinarySearchTreeNode('foo1', 'bar1'));
        node.getLeft().setRight(scule.getBinarySearchTreeNode('foo4', 'bar4'));

        node.setRight(scule.getBinarySearchTreeNode('foo8', 'bar8'));
        node.getRight().setLeft(scule.getBinarySearchTreeNode('foo7', 'bar7'));
        node.getRight().setRight(scule.getBinarySearchTreeNode('foo9', 'bar9'));

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
        var tree = scule.getBinarySearchTree();
        for(var i=0; i < 100; i++) {
            var key = sfunc.randomFromTo(1, 100);
            tree.insert(key, key);
        }
        var verify = function(node) {
            if(!node) {
                return;
            }
            jsunit.assertTrue(node.getRight() == null || node.getRight().getKey() > node.getKey());
            jsunit.assertTrue(node.getLeft() == null  || node.getLeft().getKey() <= node.getKey());
            verify(node.getRight());
            verify(node.getLeft());
        };
        verify(tree.getRoot());
    };

    function testBinaryTreeSearch() {
        var keys = {};
        var tree = scule.getBinarySearchTree();
        for(var i=0; i < 100; i++) {
            var key = sfunc.randomFromTo(1, 1000);
            keys[key] = true;
            tree.insert(key, key);
        }
        for(var key in keys) {
            var node = tree.search(key);
            jsunit.assertTrue(node.getKey() == key);
        }
    };

    function testBinaryTreeToArray() {
        var tree = scule.getBinarySearchTree();
        for(var i=0; i < 100; i++) {
            var key = sfunc.randomFromTo(1, 1000);
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
        var tree = scule.getBinarySearchTree();
        for(var i=0; i < 100; i++) {
            var key = sfunc.randomFromTo(1, 1000);
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
        jsunit.resetTests();
        jsunit.addTest(testBinaryTreeNode);
        jsunit.addTest(testBinaryTreeNodeRemove);
        jsunit.addTest(testBinaryTreeInsertion);
        jsunit.addTest(testBinaryTreeSearch);
        jsunit.addTest(testBinaryTreeToArray);
        jsunit.addTest(testBinaryTreeBalance);
        jsunit.runTests();
    }());    
    
}());

(function() {
    
    function testCachingLinkedListSize() {
        var list = scule.getCachingLinkedList(10, 'key');
        list.add({
            key: 'foo', 
            bar: 1
        });
        list.add({
            key: 'foo1', 
            bar: 2
        });
        list.add({
            key: 'foo2', 
            bar: 3
        });
        list.add({
            key: 'foo3', 
            bar: 4
        });
        jsunit.assertEquals(list.getLength(), 4);
    }

    function testCachingLinkedListGet() {
        var list = scule.getCachingLinkedList(10, 'key');
        list.add({
            key: 'foo', 
            bar: 1
        });
        list.add({
            key: 'foo1', 
            bar: 2
        });
        list.add({
            key: 'foo2', 
            bar: 3
        });
        list.add({
            key: 'foo3', 
            bar: 4
        });
        list.add({
            key: 'foo4', 
            bar: 5
        });
        list.add({
            key: 'foo5', 
            bar: 6
        });
        list.add({
            key: 'foo6', 
            bar: 7
        });
        list.add({
            key: 'foo7', 
            bar: 8
        });
        var node = list.get(4);
        jsunit.assertEquals(node.getElement().bar, 5);
    };

    function testCachingLinkedListSplit() {
        var list1 = scule.getCachingLinkedList(10, 'key');
        list1.add(1);
        list1.add(2);
        list1.add(3);
        list1.add(4);
        list1.add(5);
        list1.add(6);
        list1.add(7);
        list1.add(8);
        var list2 = list1.split(4);
        jsunit.assertEquals(list1.getLength(), 4);
        jsunit.assertEquals(list1.getTail().getElement(), 4);
        jsunit.assertEquals(list2.getLength(), 4);
        jsunit.assertEquals(list2.getTail().getElement(), 8);
    }

    function testCachingLinkedListSplit2() {
        var list1 = scule.getCachingLinkedList(10, 'key');
        list1.add(1);
        list1.add(2);
        list1.add(3);
        list1.add(4);
        list1.add(5);
        list1.add(6);
        list1.add(7);
        list1.add(8);
        list1.add(9);
        var list2 = list1.split();
        jsunit.assertEquals(list1.getLength(), 5);
        jsunit.assertEquals(list1.getTail().getElement(), 5);
        jsunit.assertEquals(list2.getLength(), 4);
        jsunit.assertEquals(list2.getTail().getElement(), 9);
    }

    function testCachingLinkedListClear() {
        var list = scule.getCachingLinkedList(10, 'key');
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        list.clear();
        jsunit.assertEquals(list.getLength(), 0);
        jsunit.assertEquals(list.getHead(), null);
    }

    function testCachingLinkedListContains() {
        var list = scule.getCachingLinkedList(10, 'key');
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        jsunit.assertTrue(list.contains(6)); 
        jsunit.assertFalse(list.contains(10));
    };

    function testCachingLinkedListIsEmpty() {
        var list = scule.getCachingLinkedList(10, 'key');
        list.add(1);
        list.add(2);
        jsunit.assertFalse(list.isEmpty());
    }

    function testCachingLinkedListRemove() {
        var list = scule.getCachingLinkedList(10, 'key');
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        list.remove(4);
        jsunit.assertEquals(list.remove(-1), null);
        jsunit.assertEquals(list.remove(10), null);
        jsunit.assertEquals(list.getLength(), 7);
        jsunit.assertEquals(list.get(4).getElement(), 6);
    };

    function testCachingLinkedListReverse() {
        var list = scule.getCachingLinkedList(10, 'key');
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        list.reverse();
        jsunit.assertEquals(list.getHead().getElement(), 8);
        jsunit.assertEquals(list.getTail().getElement(), 1);
    };

    function testCachingLinkedListSort() {
        var list = scule.getCachingLinkedList(10, 'key');
        for(var i=0; i < 30; i++) {
            list.add(sfunc.randomFromTo(10, 10000));
        }
        list.sort();
        var curr = list.head;
        while(curr && curr.next) {
            jsunit.assertTrue((curr.element <= curr.next.element));
            curr = curr.next;
        }
    };

    function testCachingLinkedListComparison() {
        var list  = scule.getLinkedList();
        var clist = scule.getCachingLinkedList(10, 'key');

        var value;
        var i = 0;
        for(; i < 10000; i++) {
            value = 'test' + sfunc.randomFromTo(100000, 200000);
            list.add({key:i, value:value});
            clist.add({key:i, value:value})
        }
        for(i=0; i < 1000; i++) {
            clist.search(sfunc.randomFromTo(1, 100000));
        }
        jsunit.assertEquals(list.search(999, 'key').getElement().key, clist.search(999, 'key').getElement().key);
        jsunit.assertEquals(list.search(599, 'key').getElement().value, clist.search(599, 'key').getElement().value);
    };

    (function() {
        jsunit.resetTests();
        jsunit.addTest(testCachingLinkedListSize);
        jsunit.addTest(testCachingLinkedListGet);
        jsunit.addTest(testCachingLinkedListSplit);
        jsunit.addTest(testCachingLinkedListSplit2);
        jsunit.addTest(testCachingLinkedListClear);
        jsunit.addTest(testCachingLinkedListIsEmpty);
        jsunit.addTest(testCachingLinkedListContains);
        jsunit.addTest(testCachingLinkedListRemove);
        jsunit.addTest(testCachingLinkedListReverse);
        jsunit.addTest(testCachingLinkedListSort);
        jsunit.addTest(testCachingLinkedListComparison);
        jsunit.runTests();
    }());    
    
}());

(function() {
    
    function testDoublyLinkedListSize() {
        var list = scule.getDoublyLinkedList();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        jsunit.assertEquals(list.getLength(), 4);
    }

    function testDoublyLinkedListGet() {
        var list = scule.getDoublyLinkedList();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        var node = list.get(4);
        jsunit.assertEquals(node.getElement(), 5);
    };

    function testDoublyLinkedListClear() {
        var list = scule.getDoublyLinkedList();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        list.clear();
        jsunit.assertEquals(list.getLength(), 0);
        jsunit.assertEquals(list.getHead(), null);
    }

    function testDoublyLinkedListIsEmpty() {
        var list = scule.getDoublyLinkedList();
        list.add(1);
        list.add(2);
        jsunit.assertFalse(list.isEmpty());
    }

    function testDoublyLinkedListRemove() {
        var list = scule.getDoublyLinkedList();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        list.remove(4);
        jsunit.assertEquals(list.remove(-1), null);
        jsunit.assertEquals(list.remove(10), null);
        jsunit.assertEquals(list.getLength(), 7);
        jsunit.assertEquals(list.get(4).getElement(), 6);
    };

    function testDoublyLinkedListTrim() {
        var list = scule.getDoublyLinkedList();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        list.trim();
        jsunit.assertEquals(list.getLength(), 7);
        jsunit.assertEquals(list.get(6).getElement(), 7);
        jsunit.assertEquals(list.get(7), null);
        list.trim();
        jsunit.assertEquals(list.getLength(), 6);
        jsunit.assertEquals(list.get(5).getElement(), 6);    
    };

    function testDoublyLinkedListPrepend() {
        var list = scule.getDoublyLinkedList();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        list.prepend(0);
        jsunit.assertEquals(list.getLength(), 9);
        jsunit.assertEquals(list.getHead().getElement(), 0);
        list.prepend(-1);
        jsunit.assertEquals(list.getLength(), 10);
        jsunit.assertEquals(list.getHead().getElement(), -1);
    };

    function testDoublyLinkedListSplit() {
        var list1 = scule.getDoublyLinkedList();
        list1.add(1);
        list1.add(2);
        list1.add(3);
        list1.add(4);
        list1.add(5);
        list1.add(6);
        list1.add(7);
        list1.add(8);
        var list2 = list1.split(4);
        jsunit.assertEquals(list1.getLength(), 4);
        jsunit.assertEquals(list1.tail.getElement(), 4);
        jsunit.assertEquals(list2.getLength(), 4);
        jsunit.assertEquals(list2.tail.getElement(), 8);
    }

    function testDoublyLinkedListSplit2() {
        var list1 = scule.getDoublyLinkedList();
        list1.add(1);
        list1.add(2);
        list1.add(3);
        list1.add(4);
        list1.add(5);
        list1.add(6);
        list1.add(7);
        list1.add(8);
        list1.add(9);
        var list2 = list1.split();
        jsunit.assertEquals(list1.getLength(), 5);
        jsunit.assertEquals(list1.tail.getElement(), 5);
        jsunit.assertEquals(list2.getLength(), 4);
        jsunit.assertEquals(list2.tail.getElement(), 9);
    }

    function testDoublyLinkedListMiddle() {
        var list = scule.getDoublyLinkedList();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        jsunit.assertEquals(list.middle().getElement(), 4);
        list.add(9);
        jsunit.assertEquals(list.middle().getElement(), 5); 
        list.add(10);
        jsunit.assertEquals(list.middle().getElement(), 5);
    };

    function testDoublyLinkedListReverse() {
        var list = scule.getDoublyLinkedList();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        jsunit.assertEquals(list.getHead().getElement(), 1);
        jsunit.assertEquals(list.getTail().getElement(), 8);
        list.reverse();
        jsunit.assertEquals(list.getHead().getElement(), 8);
        jsunit.assertEquals(list.getTail().getElement(), 1);
    };

    function testDoublyLinkedListSort() {
        var list = scule.getDoublyLinkedList();
        for(var i=0; i < 30; i++) {
            list.add(sfunc.randomFromTo(10, 10000));
        }
        list.sort();
        var curr = list.head;
        while(curr && curr.next) {
            jsunit.assertTrue((curr.element <= curr.next.element));
            curr = curr.next;
        }
    };

    function testDoublyLinkedListContains() {
        var list = scule.getDoublyLinkedList();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        jsunit.assertTrue(list.contains(6)); 
        jsunit.assertFalse(list.contains(10));
    };

    function testDoublyLinkedListArraySearch() {
        var list = scule.getLinkedList();
        for(var i=0; i < 1000; i++) {
            list.add([i, (i*2), (i-1)]);
        }    
        jsunit.assertTrue(list.search([500, 1000, 499], null, sfunc.compareArray));
        jsunit.assertFalse(list.search([500, 1000, 498], null, sfunc.compareArray));
    };

    (function() {
        jsunit.resetTests();
        jsunit.addTest(testDoublyLinkedListSize);
        jsunit.addTest(testDoublyLinkedListGet);
        jsunit.addTest(testDoublyLinkedListClear);
        jsunit.addTest(testDoublyLinkedListIsEmpty);
        jsunit.addTest(testDoublyLinkedListRemove);
        jsunit.addTest(testDoublyLinkedListTrim);
        jsunit.addTest(testDoublyLinkedListPrepend);
        jsunit.addTest(testDoublyLinkedListSplit);
        jsunit.addTest(testDoublyLinkedListSplit2);
        jsunit.addTest(testDoublyLinkedListMiddle);
        jsunit.addTest(testDoublyLinkedListReverse);
        jsunit.addTest(testDoublyLinkedListSort);
        jsunit.addTest(testDoublyLinkedListContains);
        jsunit.addTest(testDoublyLinkedListArraySearch);
        jsunit.runTests();
    }());    
    
}());

(function() {
    
    function testHashMapSize() {
        var table = scule.getHashMap(10);
        table.put('foo', 'bar');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        jsunit.assertEquals(table.getLength(), 3);
        table.put('foo', 'bar4');
        jsunit.assertEquals(table.getLength(), 3);
    }

    function testHashMapClear() {
        var table = scule.getHashMap(10);
        table.put('foo1', 'bar1');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        table.clear();
        jsunit.assertEquals(table.getLength(), 0);
    }

    function testHashMapContains() {
        var table = scule.getHashMap(10);
        table.put('foo1', 'bar1');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        table.put(3, 'bar4');
        jsunit.assertTrue(table.contains('foo2'));
        jsunit.assertFalse(table.contains('foo4'));
        jsunit.assertTrue(table.contains(3));
    }

    function testHashMapGet() {
        var table = scule.getHashMap(10);
        table.put('foo', 'bar');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        table.put('foo', 'bar4');
        jsunit.assertEquals(table.get('foo'), 'bar4');
        jsunit.assertEquals(table.get('foo3'), 'bar3');
    }

    function testHashMapRemove() {
        var table = scule.getHashMap(10);
        table.put('foo', 'bar');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        table.put(666, 'the devil!');
        table.remove('foo');
        jsunit.assertFalse(table.contains('foo'));
        jsunit.assertTrue(table.contains('foo2'));
        table.remove('foo2');
        jsunit.assertEquals(table.getLength(), 2);
        table.remove('foo2');
        jsunit.assertEquals(table.getLength(), 2);
        table.remove(666)
        jsunit.assertEquals(table.getLength(), 1);
    }

    function testHashMapGetKeys() {
        var table = scule.getHashMap(10);
        table.put('foo1', 'bar1');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        jsunit.assertEquals(JSON.stringify(table.getKeys().sort()), JSON.stringify(['foo1','foo2','foo3'].sort()));
    }

    function testHashMapGetValues() {
        var table = scule.getHashMap(10);
        table.put('foo1', 'bar1');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        jsunit.assertEquals(JSON.stringify(table.getValues().sort()), JSON.stringify(['bar1','bar2','bar3'].sort()));
    }

    function testHashMapLoadFactor() {

        var timer = scule.getTimer();
        var tree  = scule.getBPlusTree(1000);
        var map   = scule.getHashMap(1000);
        var table = scule.getHashTable();

        timer.startInterval('HashMap.Hash');
        for(var i=0; i < 10000; i++) {
            map.hash('foo' + i);
        }
        timer.stopInterval();

        timer.startInterval('HashMap.Insert');
        for(var i=0; i < 10000; i++) {
            map.put('foo' + i, {bar:i});
        }
        timer.stopInterval();
        timer.startInterval('HashMap.Seek');
        for(var i=0; i < 10000; i++) {
            map.get('foo' + i);
        }    
        timer.stopInterval();

        timer.startInterval('HashTable.Insert');
        for(var i=0; i < 10000; i++) {
            table.put('foo' + i, {bar:i});
        }
        timer.stopInterval();   
        timer.startInterval('HashTable.Seek');
        for(var i=0; i < 10000; i++) {
            table.get('foo' + i);
        }    
        timer.stopInterval();

        timer.startInterval('BPlusTree.Insert');
        for(var i=0; i < 10000; i++) {
            tree.insert('foo' + i, {bar:i});
        }
        timer.stopInterval();   
        timer.startInterval('BPlusTree.Seek');
        for(var i=0; i < 10000; i++) {
            tree.search('foo' + i);
        }    
        timer.stopInterval();

        timer.logToConsole();
    };

    (function() {
        jsunit.resetTests();
        jsunit.addTest(testHashMapSize);
        jsunit.addTest(testHashMapClear);  
        jsunit.addTest(testHashMapContains);
        jsunit.addTest(testHashMapGet);
        jsunit.addTest(testHashMapRemove);
        jsunit.addTest(testHashMapGetKeys);
        jsunit.addTest(testHashMapGetValues);
        jsunit.addTest(testHashMapLoadFactor);
        jsunit.runTests();
    }());    
    
}());

(function() {
    
    function testHashTableSize() {
        var table = scule.getHashTable();
        table.put('foo', 'bar');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        jsunit.assertEquals(table.getLength(), 3);
        table.put('foo', 'bar4');
        jsunit.assertEquals(table.getLength(), 3);
    }

    function testHashTableClear() {
        var table = scule.getHashTable();
        table.put('foo1', 'bar1');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        table.clear();
        jsunit.assertEquals(table.getLength(), 0);
    }

    function testHashTableContains() {
        var table = scule.getHashTable();
        table.put('foo1', 'bar1');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        table.put(3, 'bar4');
        jsunit.assertTrue(table.contains('foo2'));
        jsunit.assertFalse(table.contains('foo4'));
        jsunit.assertTrue(table.contains(3));
    }

    function testHashTableGet() {
        var table = scule.getHashTable();
        table.put('foo', 'bar');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        table.put('foo', 'bar4');
        jsunit.assertEquals(table.get('foo'), 'bar4');
        jsunit.assertEquals(table.get('foo3'), 'bar3');
    }

    function testHashTableRemove() {
        var table = scule.getHashTable();
        table.put('foo', 'bar');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        table.put(666, 'the devil!');
        table.remove('foo');
        jsunit.assertFalse(table.contains('foo'));
        jsunit.assertTrue(table.contains('foo2'));
        jsunit.assertTrue(table.remove('foo2'));
        jsunit.assertFalse(table.remove('foo2'));
        jsunit.assertTrue(table.remove(666));
        jsunit.assertFalse(table.remove(666));
        jsunit.assertFalse(table.remove(999));
    }

    function testHashTableGetKeys() {
        var table = scule.getHashTable();
        table.put('foo1', 'bar1');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        jsunit.assertEquals(JSON.stringify(table.getKeys()), JSON.stringify(['foo1','foo2','foo3']));
    }

    function testHashTableGetValues() {
        var table = scule.getHashTable();
        table.put('foo1', 'bar1');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        jsunit.assertEquals(JSON.stringify(table.getValues()), JSON.stringify(['bar1','bar2','bar3']));
    }

    (function() {
        jsunit.resetTests();
        jsunit.addTest(testHashTableSize);
        jsunit.addTest(testHashTableClear);  
        jsunit.addTest(testHashTableContains);
        jsunit.addTest(testHashTableGet);
        jsunit.addTest(testHashTableRemove);
        jsunit.addTest(testHashTableGetKeys);
        jsunit.addTest(testHashTableGetValues);
        jsunit.runTests();
    }());    
    
}());

(function() {
    
    function testLRUCacheThreshold() {
        var threshold = 1000;
        var cache = scule.getLRUCache(threshold);
        for(var i=0; i < 1000; i++) {
            cache.put(i, sfunc.randomFromTo(10000, 20000));
        }
        jsunit.assertEquals(cache.getLength(), threshold);
        jsunit.assertEquals(cache.cache.getLength(), threshold);
        jsunit.assertEquals(cache.queue.getLength(), threshold);
    };

    function testLRUCacheRequeue() {
        var threshold = 1000;
        var cache = scule.getLRUCache(threshold);
        for(var i=0; i < 1000; i++) {
            cache.put(i, sfunc.randomFromTo(10000, 20000));
            cache.get(sfunc.randomFromTo(1, 10000));
        }
        jsunit.assertEquals(cache.getLength(), threshold);
        jsunit.assertEquals(cache.cache.getLength(), threshold);
        jsunit.assertEquals(cache.queue.getLength(), threshold);
    };

    function testLRUCacheFunctionality() {
        var cache = scule.getLRUCache(5);
        cache.put(1, {foo:'bar1'});
        cache.put(2, {foo:'bar2'});
        cache.put(3, {foo:'bar3'});
        cache.put(4, {foo:'bar4'});
        cache.put(5, {foo:'bar5'});
        cache.get(1);
        jsunit.assertEquals(JSON.stringify(cache.get(1)), JSON.stringify({foo:'bar1'}));
        jsunit.assertNotEquals(JSON.stringify(cache.get(1)), JSON.stringify({foo:'bar2'}));
        cache.put(6, {foo:'bar6'});
        cache.put(7, {foo:'bar7'});
        jsunit.assertFalse(cache.contains(3));
    };

    (function() {
        jsunit.resetTests();
        jsunit.addTest(testLRUCacheThreshold);
        jsunit.addTest(testLRUCacheRequeue);
        jsunit.addTest(testLRUCacheFunctionality);
        jsunit.runTests();
    }());    
    
}());

(function() {
    
    function testLinkedListSize() {
        var list = scule.getLinkedList();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        jsunit.assertEquals(list.getLength(), 4);
    }

    function testLinkedListGet() {
        var list = scule.getLinkedList();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        var node = list.get(4);
        jsunit.assertEquals(node.getElement(), 5);
    };

    function testLinkedListSplit() {
        var list1 = scule.getLinkedList();
        list1.add(1);
        list1.add(2);
        list1.add(3);
        list1.add(4);
        list1.add(5);
        list1.add(6);
        list1.add(7);
        list1.add(8);
        var list2 = list1.split(4);
        jsunit.assertEquals(list1.getLength(), 4);
        jsunit.assertEquals(list1.tail.getElement(), 4);
        jsunit.assertEquals(list2.getLength(), 4);
        jsunit.assertEquals(list2.tail.getElement(), 8);
    }

    function testLinkedListSplit2() {
        var list1 = scule.getLinkedList();
        list1.add(1);
        list1.add(2);
        list1.add(3);
        list1.add(4);
        list1.add(5);
        list1.add(6);
        list1.add(7);
        list1.add(8);
        list1.add(9);
        var list2 = list1.split();
        jsunit.assertEquals(list1.getLength(), 5);
        jsunit.assertEquals(list1.tail.getElement(), 5);
        jsunit.assertEquals(list2.getLength(), 4);
        jsunit.assertEquals(list2.tail.getElement(), 9);
    }

    function testLinkedListClear() {
        var list = scule.getLinkedList();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        list.clear();
        jsunit.assertEquals(list.getLength(), 0);
        jsunit.assertEquals(list.getHead(), null);
    }

    function testLinkedListContains() {
        var list = scule.getLinkedList();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        jsunit.assertTrue(list.contains(6)); 
        jsunit.assertFalse(list.contains(10));
    };

    function testLinkedListIsEmpty() {
        var list = scule.getLinkedList();
        list.add(1);
        list.add(2);
        jsunit.assertFalse(list.isEmpty());
    }

    function testLinkedListRemove() {
        var list = scule.getLinkedList();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        list.remove(4);
        jsunit.assertEquals(list.remove(-1), null);
        jsunit.assertEquals(list.remove(10), null);
        jsunit.assertEquals(list.getLength(), 7);
        jsunit.assertEquals(list.get(4).getElement(), 6);
    };

    function testLinkedListReverse() {
        var list = scule.getLinkedList();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        list.reverse();
        jsunit.assertEquals(list.getHead().getElement(), 8);
        jsunit.assertEquals(list.getTail().getElement(), 1);
    };

    function testLinkedListSearch() {
        var list = scule.getLinkedList();
        for(var i=0; i < 1000; i++) {
            list.add(i);
        }
        jsunit.assertTrue(list.search(555));
        jsunit.assertFalse(list.search('foo'));
    };

    function testLinkedListArraySearch() {
        var list = scule.getLinkedList();
        for(var i=0; i < 1000; i++) {
            list.add([i, (i*2), (i-1)]);
        }    
        jsunit.assertTrue(list.search([500, 1000, 499], null, sfunc.compareArray));
        jsunit.assertFalse(list.search([500, 1000, 498], null, sfunc.compareArray));
    };

    function testLinkedListSort() {
        var list = scule.getLinkedList();
        for(var i=0; i < 30; i++) {
            list.add(sfunc.randomFromTo(10, 10000));
        }
        list.sort();
        var curr = list.head;
        while(curr && curr.next) {
            jsunit.assertTrue((curr.element <= curr.next.element));
            curr = curr.next;
        }
    };

    (function() {
        jsunit.resetTests();
        jsunit.addTest(testLinkedListSize);
        jsunit.addTest(testLinkedListGet);
        jsunit.addTest(testLinkedListSplit);
        jsunit.addTest(testLinkedListSplit2);
        jsunit.addTest(testLinkedListClear);
        jsunit.addTest(testLinkedListIsEmpty);
        jsunit.addTest(testLinkedListContains);
        jsunit.addTest(testLinkedListRemove);
        jsunit.addTest(testLinkedListReverse);
        jsunit.addTest(testLinkedListSort);
        jsunit.addTest(testLinkedListSearch);
        jsunit.addTest(testLinkedListArraySearch);
        jsunit.runTests();
    }());    
    
}());

(function() {
    
    function testLIFOStackPushPop() {
        var stack = scule.getLIFOStack();
        stack.push(1);
        stack.push(2);
        stack.push(3);
        stack.push(4);
        jsunit.assertEquals(stack.pop(), 4);
        jsunit.assertEquals(stack.pop(), 3);
        jsunit.assertEquals(stack.pop(), 2);
        jsunit.assertEquals(stack.pop(), 1);
    };

    function testLIFOStackPeek() {
        var stack = scule.getLIFOStack();
        stack.push(1);
        stack.push(2);
        stack.push(3);
        stack.push(4);
        jsunit.assertEquals(stack.peek(), 4);
        stack.pop();
        jsunit.assertEquals(stack.pop(), 3);
    };

    function testLIFOStackClear() {
        var stack = scule.getLIFOStack();
        stack.push(1);
        stack.push(2);
        stack.push(3);
        stack.push(4);
        stack.clear();
        jsunit.assertEquals(stack.getLength(), 0);
        jsunit.assertTrue(stack.isEmpty());
    };

    function testFIFOStackPushPop() {
        var stack = scule.getFIFOStack();
        stack.push(1);
        stack.push(2);
        stack.push(3);
        stack.push(4);
        jsunit.assertEquals(stack.pop(), 1);
        jsunit.assertEquals(stack.pop(), 2);
        jsunit.assertEquals(stack.pop(), 3);
        jsunit.assertEquals(stack.pop(), 4);    
    };

    function testFIFOStackPeek() {
        var stack = scule.getFIFOStack();
        stack.push(1);
        stack.push(2);
        stack.push(3);
        stack.push(4);
        jsunit.assertEquals(stack.peek(), 1);
        stack.pop();
        jsunit.assertEquals(stack.pop(), 2);    
    };

    function testFIFOStackClear() {
        var stack = scule.getFIFOStack();
        stack.push(1);
        stack.push(2);
        stack.push(3);
        stack.push(4);
        stack.clear();
        jsunit.assertEquals(stack.getLength(), 0);
        jsunit.assertTrue(stack.isEmpty());    
    };

    function testQueueEnqueueDequeue() {
        var queue = scule.getQueue();
        queue.enqueue(1);
        queue.enqueue(2);
        queue.enqueue(3);
        queue.enqueue(4);
        jsunit.assertEquals(queue.dequeue(), 1);
        jsunit.assertEquals(queue.dequeue(), 2);
        jsunit.assertEquals(queue.dequeue(), 3);
        jsunit.assertEquals(queue.dequeue(), 4);    
    };

    function testQueueClear() {
        var queue = scule.getQueue();
        queue.push(1);
        queue.push(2);
        queue.push(3);
        queue.push(4);
        queue.clear();
        jsunit.assertEquals(queue.getLength(), 0);
        jsunit.assertTrue(queue.isEmpty());    
    };

    (function() {
        jsunit.resetTests();
        jsunit.addTest(testLIFOStackPushPop);
        jsunit.addTest(testLIFOStackPeek);
        jsunit.addTest(testLIFOStackClear);
        jsunit.addTest(testFIFOStackPushPop);
        jsunit.addTest(testFIFOStackPeek);
        jsunit.addTest(testFIFOStackClear);
        jsunit.addTest(testQueueEnqueueDequeue);
        jsunit.addTest(testQueueClear);    
        jsunit.runTests();
    }());    
    
}());

(function() {
  
    function testObjectIdCreation() {
        var oid1 = scule.getObjectId();
        var oid2 = scule.getObjectId();
        jsunit.assertEquals(oid1.id.length, 24);
        jsunit.assertNotEquals(oid1.id, oid2.id);
    };

    (function() {
        jsunit.resetTests();
        jsunit.addTest(testObjectIdCreation);
        jsunit.runTests();
    }());

}());

(function() {
    
    function testObjectDateConstructorDefault() {
        var date = scule.getObjectDate();
        var ts   = (new Date()).getTime();
        jsunit.assertTrue(ts > date.getTimestamp());
        jsunit.assertTrue(date.getSeconds() > 0);
        jsunit.assertTrue(date.getMicroSeconds() > 0);
    };

    function testObjectDateConstructor() {
        var ts   = (new Date()).getTime().toString();
        var date = scule.getObjectDate(parseInt(ts.substring(0, 10)), parseInt(ts.substring(10)));
        jsunit.assertTrue(date.getSeconds() > 0);
        jsunit.assertTrue(date.getMicroSeconds() > 0);
    };

    (function() {
        jsunit.resetTests();
        jsunit.addTest(testObjectDateConstructorDefault);
        jsunit.addTest(testObjectDateConstructor);
        jsunit.runTests();
    }());    
    
}());

(function() {
    
    function testIndexParseAttributes() {
        var index = scule.getIndex();

        index.parseAttributes([
            'a',
            'c.d',
            'e.f.0'
            ]);
        var o1 = index.attributes;

        index.resetAttributes();
        index.parseAttributes('a,c.d,e.f.0');
        var o2 = index.attributes;

        index.resetAttributes();
        index.parseAttributes('a , c.d, e. f.0 ');
        var o3 = index.attributes;

        jsunit.assertEquals(o1.a, o2.a);
        jsunit.assertEquals(o1.c.d, o2.c.d);
        jsunit.assertEquals(o1.e.f[0], o2.e.f[0]);
        jsunit.assertEquals(o1.a, o3.a);
        jsunit.assertEquals(o1.c.d, o3.c.d);
        jsunit.assertEquals(o1.e.f[0], o3.e.f[0]);
        jsunit.assertEquals(o3.a, o2.a);
        jsunit.assertEquals(o3.c.d, o2.c.d);
        jsunit.assertEquals(o3.e.f[0], o2.e.f[0]);
    };

    function testIndexGenerateKey() {
        var index = scule.getIndex();
        var document = {
            a:21,
            c:{
                d:34
            },
            e:{
                f:[32, 23, 43, 45]
            },
            f:[2, 7, 6, 0],
            foo:'bar',
            bar:'foo'
        };
        index.parseAttributes('a,c.d,e.f.0');
        jsunit.assertEquals(index.generateIndexKey(document), '21,34,32');
        index.resetAttributes();
        index.parseAttributes('e.f.0,c.d,a');
        jsunit.assertEquals(index.generateIndexKey(document), '21,34,32');
        index.resetAttributes();
        index.parseAttributes('c.d,e.f.0,a');
        jsunit.assertEquals(index.generateIndexKey(document), '21,34,32');    
        index.resetAttributes();    
        index.parseAttributes('c.d,e.f.3');
        jsunit.assertEquals(index.generateIndexKey(document), '34,45');
        index.resetAttributes();
        index.parseAttributes('f.1,c.d,e.f.1');
        jsunit.assertEquals(index.generateIndexKey(document), '34,23,7');
        index.resetAttributes();
        index.parseAttributes('f.0');
        jsunit.assertEquals(index.generateIndexKey(document), 2);
        index.resetAttributes();
        index.parseAttributes('foo');
        jsunit.assertEquals(index.generateIndexKey(document), 'bar');
        jsunit.assertNotEquals(index.generateIndexKey(document), 'foo');
        index.resetAttributes();
        index.parseAttributes('bar');
        jsunit.assertEquals(index.generateIndexKey(document), 'foo');
        jsunit.assertNotEquals(index.generateIndexKey(document), 'bar');    
    };

    function testIndexSearch() {
        var index = scule.getIndex();
        jsunit.assertEquals(index.search('1,2,3').length, 0);
    };

    function testIndexClear() {
        var index = scule.getIndex();
        jsunit.assertFalse(index.clear());
    };

    function testIndexRange() {
        var index = scule.getIndex();
        jsunit.assertFalse(index.range(0, 100000));    
    };

    function testIndexIndex() {
        var document = {
            a:21,
            c:{
                d:34
            },
            e:{
                f:[32, 23, 43, 45]
            },
            f:[2, 7, 6, 0],
            foo:'bar',
            bar:'foo'
        };    
        var index = scule.getIndex();
        jsunit.assertFalse(index.index(document));    
    };

    function testIndexRemove() {
        var document = {
            a:21,
            c:{
                d:34
            },
            e:{
                f:[32, 23, 43, 45]
            },
            f:[2, 7, 6, 0],
            foo:'bar',
            bar:'foo'
        };    
        var index = scule.getIndex();
        jsunit.assertFalse(index.remove(document));    
    };

    (function() {
        jsunit.resetTests();
        jsunit.addTest(testIndexParseAttributes);
        jsunit.addTest(testIndexGenerateKey);
        jsunit.addTest(testIndexSearch);
        jsunit.addTest(testIndexClear);
        jsunit.addTest(testIndexRange);
        jsunit.addTest(testIndexRemove);
        jsunit.runTests();
    }());    
    
}());

(function() {
    
    function testDBRefCreation() {
        var ut1 = scule.factoryCollection('scule+dummy://ut1');
        ut1.save({
            foo:'bar1',
            bar:'foo1'
        });
        var o1 = ut1.findAll();
        o1 = o1[0];

        var ut2 = scule.factoryCollection('scule+dummy://ut2');
        ut2.save({
            foo:'bar2',
            bar:'foo2',
            ref: scule.getDBRef('scule+dummy://ut1', o1._id)
        });
        var o2 = ut2.findAll();
        o2 = o2[0];    

        var o3 = o2.ref.resolve();
        jsunit.assertEquals(o1, o3);
    };

    (function() {
        jsunit.resetTests();
        jsunit.addTest(testDBRefCreation);
        jsunit.runTests();
    }());    
    
}());

(function() {
  
    function testHashTableIndexSearch1() {  
        var document, result;
        var index = scule.getHashTableIndex(100);
        index.parseAttributes('a');
        for(var i=0; i < 300; i++) {
            document = {
                _id: scule.getObjectId(),
                a:i%10,
                c:{
                    d:i
                },
                e:{
                    f:[i, i+1, i+2, i+3]
                },
                f:[2, 7, 6, 0],
                foo:'bar' + (i%10),
                bar:'foo' + (i%10)
            };
            index.index(document);
        }

        result = index.search(9);
        jsunit.assertEquals(result.length, 30);
        result.forEach(function(o) {
            jsunit.assertEquals(o.a, 9); 
        });

        result = index.search(3);
        jsunit.assertEquals(result.length, 30);
        result.forEach(function(o) {
            jsunit.assertEquals(o.a, 3); 
        });    
    };

    function testHashTableIndexSearch2() {
        var document, result;
        var index = scule.getHashTableIndex(100);
        index.parseAttributes('a,e.f.2');
        for(var i=0; i < 300; i++) {
            document = {
                _id: scule.getObjectId(),
                a:i%10,
                c:{
                    d:i
                },
                e:{
                    f:[i%10, (i%10)+1, (i%10)+2, (i%10)+3]
                },
                f:[2, 7, 6, 0],
                foo:'bar' + (i%10),
                bar:'foo' + (i%10)
            };
            index.index(document);
        }

        result = index.search('3,5');
        jsunit.assertEquals(result.length, 30);
        result.forEach(function(o) {
            jsunit.assertEquals(o.a, 3); 
            jsunit.assertEquals(o.e.f[2], 5);
        });
    };

    function testHashTableIndexSearch3() {
        var document, result;
        var index = scule.getHashTableIndex(100);
        index.parseAttributes('foo');
        for(var i=0; i < 300; i++) {
            document = {
                _id: scule.getObjectId(),
                a:i%10,
                c:{
                    d:i
                },
                e:{
                    f:[i%10, (i%10)+1, (i%10)+2, (i%10)+3]
                },
                f:[2, 7, 6, 0],
                foo:'bar' + (i%10),
                bar:'foo' + (i%10)
            };
            index.index(document);
        }

        result = index.search('bar3');
        jsunit.assertEquals(result.length, 30);
        result.forEach(function(o) {
            jsunit.assertEquals(o.a, 3); 
            jsunit.assertEquals(o.foo, 'bar3');
        });
    };

    function testHashTableIndexClear() {
        var document, result;
        var index = scule.getHashTableIndex(100);
        index.parseAttributes('a,e.f.2');
        for(var i=0; i < 300; i++) {
            document = {
                _id: scule.getObjectId(),
                a:i%10,
                c:{
                    d:i
                },
                e:{
                    f:[i%10, (i%10)+1, (i%10)+2, (i%10)+3]
                },
                f:[2, 7, 6, 0],
                foo:'bar' + (i%10),
                bar:'foo' + (i%10)
            };
            index.index(document);
        }
        jsunit.assertTrue(index.clear());

        result = index.search('3,5');
        jsunit.assertEquals(result.length, 0);
    };

    function testHashTableIndexRemove() {
        var document, result, document;
        var index = scule.getHashTableIndex(100);
        index.parseAttributes('c.d');
        for(var i=0; i < 3000; i++) {
            document = {
                _id: scule.getObjectId(),
                a:i%10,
                c:{
                    d:i
                },
                e:{
                    f:[i%10, (i%10)+1, (i%10)+2, (i%10)+3]
                },
                f:[2, 7, 6, 0],
                foo:'bar' + (i%10),
                bar:'foo' + (i%10)
            };
            index.index(document);
        }
        result   = index.search(1000);

        jsunit.assertEquals(result.length, 1);

        document = result[0];
        index.remove(document);

        result   = index.search(1000);
        jsunit.assertEquals(result.length, 0);
    };

    function testHashTableIndexRemoveKey() {
        var document, result;
        var index = scule.getHashTableIndex(100);
        index.parseAttributes('a');
        for(var i=0; i < 3000; i++) {
            document = {
                _id: scule.getObjectId(),
                a:i%10,
                c:{
                    d:i
                },
                e:{
                    f:[i%10, (i%10)+1, (i%10)+2, (i%10)+3]
                },
                f:[2, 7, 6, 0],
                foo:'bar' + (i%10),
                bar:'foo' + (i%10)
            };
            index.index(document);
        }
        result   = index.search(3);
        jsunit.assertEquals(result.length, 300);

        document = result[0];
        index.removeKey(3);

        result   = index.search(3);
        jsunit.assertEquals(result.length, 0);

        jsunit.assertFalse(index.leaves.contains(document._id));
    };

    (function() {
        jsunit.resetTests();
        jsunit.addTest(testHashTableIndexSearch1);
        jsunit.addTest(testHashTableIndexSearch2);
        jsunit.addTest(testHashTableIndexSearch3);
        jsunit.addTest(testHashTableIndexClear);
        jsunit.addTest(testHashTableIndexRemove);
        jsunit.addTest(testHashTableIndexRemoveKey);
        jsunit.runTests();
    }());

}());

(function() {
  
    function testBPlusTreeIndexSearch1() {  
        var document, result;
        var index = scule.getBPlusTreeIndex(100);
        index.parseAttributes('a');
        for(var i=0; i < 300; i++) {
            document = {
                _id: scule.getObjectId(),
                a:i%10,
                c:{
                    d:i
                },
                e:{
                    f:[i, i+1, i+2, i+3]
                },
                f:[2, 7, 6, 0],
                foo:'bar' + (i%10),
                bar:'foo' + (i%10)
            };
            index.index(document);
        }

        result = index.search(9);
        jsunit.assertEquals(result.length, 30);
        result.forEach(function(o) {
            jsunit.assertEquals(o.a, 9); 
        });

        result = index.search(3);
        jsunit.assertEquals(result.length, 30);
        result.forEach(function(o) {
            jsunit.assertEquals(o.a, 3); 
        });    
    };

    function testBPlusTreeIndexSearch2() {
        var document, result;
        var index = scule.getBPlusTreeIndex(100);
        index.parseAttributes('a,e.f.2');
        for(var i=0; i < 300; i++) {
            document = {
                _id: scule.getObjectId(),
                a:i%10,
                c:{
                    d:i
                },
                e:{
                    f:[i%10, (i%10)+1, (i%10)+2, (i%10)+3]
                },
                f:[2, 7, 6, 0],
                foo:'bar' + (i%10),
                bar:'foo' + (i%10)
            };
            index.index(document);
        }

        result = index.search('3,5');
        jsunit.assertEquals(result.length, 30);
        result.forEach(function(o) {
            jsunit.assertEquals(o.a, 3); 
            jsunit.assertEquals(o.e.f[2], 5);
        });
    };

    function testBPlusTreeIndexSearch3() {
        var document, result;
        var index = scule.getBPlusTreeIndex(100);
        index.parseAttributes('foo');
        for(var i=0; i < 300; i++) {
            document = {
                _id: scule.getObjectId(),
                a:i%10,
                c:{
                    d:i
                },
                e:{
                    f:[i%10, (i%10)+1, (i%10)+2, (i%10)+3]
                },
                f:[2, 7, 6, 0],
                foo:'bar' + (i%10),
                bar:'foo' + (i%10)
            };
            index.index(document);
        }

        result = index.search('bar3');
        jsunit.assertEquals(result.length, 30);
        result.forEach(function(o) {
            jsunit.assertEquals(o.a, 3); 
            jsunit.assertEquals(o.foo, 'bar3');
        });
    };

    function testBPlusTreeIndexClear() {
        var document, result;
        var index = scule.getBPlusTreeIndex(100);
        index.parseAttributes('a,e.f.2');
        for(var i=0; i < 300; i++) {
            document = {
                _id: scule.getObjectId(),
                a:i%10,
                c:{
                    d:i
                },
                e:{
                    f:[i%10, (i%10)+1, (i%10)+2, (i%10)+3]
                },
                f:[2, 7, 6, 0],
                foo:'bar' + (i%10),
                bar:'foo' + (i%10)
            };
            index.index(document);
        }
        jsunit.assertTrue(index.clear());

        result = index.search('3,5');
        jsunit.assertEquals(result.length, 0);
    };

    function testBPlusTreeIndexRange() {
        var document, result;
        var index = scule.getBPlusTreeIndex(100);
        index.parseAttributes('c.d');
        for(var i=0; i < 3000; i++) {
            document = {
                _id: scule.getObjectId(),
                a:i%10,
                c:{
                    d:i
                },
                e:{
                    f:[i%10, (i%10)+1, (i%10)+2, (i%10)+3]
                },
                f:[2, 7, 6, 0],
                foo:'bar' + (i%10),
                bar:'foo' + (i%10)
            };
            index.index(document);
        }

        var result = index.range(1000, 2500, true, true);
        jsunit.assertEquals(result.length, 1501);
        jsunit.assertEquals(result[0].c.d, 1000);
        jsunit.assertEquals(result[1500].c.d, 2500);
    };

    function testBPlusTreeIndexRemove() {
        var document, result, document;
        var index = scule.getBPlusTreeIndex(100);
        index.parseAttributes('c.d');
        for(var i=0; i < 3000; i++) {
            document = {
                _id: scule.getObjectId(),
                a:i%10,
                c:{
                    d:i
                },
                e:{
                    f:[i%10, (i%10)+1, (i%10)+2, (i%10)+3]
                },
                f:[2, 7, 6, 0],
                foo:'bar' + (i%10),
                bar:'foo' + (i%10)
            };
            index.index(document);
        }
        result   = index.search(1000);
        jsunit.assertEquals(result.length, 1);

        document = result[0];
        index.remove(document);

        result   = index.search(1000);
        jsunit.assertEquals(result.length, 0);
    };

    function testBPlusTreeIndexRemoveKey() {
        var document, result;
        var index = scule.getBPlusTreeIndex(100);
        index.parseAttributes('a');
        for(var i=0; i < 3000; i++) {
            document = {
                _id: scule.getObjectId(),
                a:i%10,
                c:{
                    d:i
                },
                e:{
                    f:[i%10, (i%10)+1, (i%10)+2, (i%10)+3]
                },
                f:[2, 7, 6, 0],
                foo:'bar' + (i%10),
                bar:'foo' + (i%10)
            };
            index.index(document);
        }
        result   = index.search(3);
        jsunit.assertEquals(result.length, 300);

        document = result[0];
        index.removeKey(3);

        result   = index.search(3);
        jsunit.assertEquals(result.length, 0);  
        jsunit.assertFalse(index.leaves.contains(document._id));
    };

    (function() {
        jsunit.resetTests();
        jsunit.addTest(testBPlusTreeIndexSearch1);
        jsunit.addTest(testBPlusTreeIndexSearch2);
        jsunit.addTest(testBPlusTreeIndexSearch3);
        jsunit.addTest(testBPlusTreeIndexClear);
        jsunit.addTest(testBPlusTreeIndexRange);
        jsunit.addTest(testBPlusTreeIndexRemove);
        jsunit.addTest(testBPlusTreeIndexRemoveKey);
        jsunit.runTests();
    }());

}());

(function() {
  
    function testCollectionFactory() {
        scule.dropAll();
        var collection = scule.factoryCollection('scule+dummy://unittest');
        collection.ensureBTreeIndex('a.b', {order:100});
        for(var i=0; i < 1000; i++) {
            var r = i%10;
            collection.save({
               a: {
                   b:r
               },
               bar:'foo'+r,
               arr: [r, r+1, r+2, r+3],
               scl: r
            });
        }
        jsunit.assertEquals(collection.getLength(), 1000);
        jsunit.assertTrue(collection.getLastInsertId() !== null);
        collection.clear();
        jsunit.assertEquals(collection.getLength(), 0);
    };

    function testCollectionMerge() {
        scule.dropAll();
        var collection1 = scule.factoryCollection('scule+dummy://unittest1');
        var collection2 = scule.factoryCollection('scule+dummy://unittest2');    
        for(var i=0; i < 1000; i++) {
            var r = i%10;
            var o = {
               a:{
                   b:sfunc.randomFromTo(1, 10)
               },
               bar:'foo'+r,
               arr:[r, r+1, r+2, r+3],
               scl:i
            };
            collection1.save(o);
            collection2.save(o);
        }
        collection1.merge(collection2);
        jsunit.assertEquals(collection1.getLength(), 1000);
        for(var i=0; i < 1000; i++) {
            var r = i%10;
            var o = {
               a:{
                   b:sfunc.randomFromTo(1, 10)
               },
               bar:'foo'+r,
               arr:[r, r+1, r+2, r+3],
               scl:i
            };
            collection2.save(o);
        } 
        collection1.merge(collection2);
        jsunit.assertEquals(collection1.getLength(), 2000);    
    };

    (function() {
        jsunit.resetTests();
        jsunit.addTest(testCollectionFactory);
        jsunit.addTest(testCollectionMerge);
        jsunit.runTests();
    }());

}());

(function() {
  
    function testCollectionMapReduce() {
        scule.dropAll();
        var collection = scule.factoryCollection('scule+dummy://unittest');
        collection.ensureBTreeIndex('a.b', {order:100});
        for(var i=0; i < 1000; i++) {
            var r = i%10;
            collection.save({
               a:{
                   b:sfunc.randomFromTo(1, 10)
               },
               bar:'foo'+r,
               arr:[r, r+1, r+2, r+3],
               scl:i
            });
        }
        collection.explain({}, {});
        collection.mapReduce(
            function(document, emit) {
                emit(document.bar, {scl: document.scl});
            },
            function(key, reduce) {
                var o = {
                    count: 0,
                    total: 0,
                    key: key
                };
                reduce.forEach(function(value) {
                    o.count++;
                    o.total += value.scl;
                });
                return o;
            },
            {
            	query:{},
                out:{
                    reduce:'scule+dummy://mapreduce'
                },
                finalize:function(key, reduced) {
                    reduced.finalized = key;
                    return reduced;
                }
            },
            function(out) {
                var o = out.findAll();
                jsunit.assertEquals(o[0].total, 49500);
                jsunit.assertEquals(o[0].finalized, o[0].key);
                jsunit.assertEquals(o[1].total, 49600);
                jsunit.assertEquals(o[1].finalized, o[1].key);
                jsunit.assertEquals(o[2].total, 49700);
                jsunit.assertEquals(o[2].finalized, o[2].key);
                jsunit.assertEquals(o[3].total, 49800);
                jsunit.assertEquals(o[3].finalized, o[3].key);
                jsunit.assertEquals(o[4].total, 49900);
                jsunit.assertEquals(o[4].finalized, o[4].key);
                jsunit.assertEquals(o[5].total, 50000);
                jsunit.assertEquals(o[5].finalized, o[5].key);
                jsunit.assertEquals(o[6].total, 50100);
                jsunit.assertEquals(o[6].finalized, o[6].key);
                jsunit.assertEquals(o[7].total, 50200);
                jsunit.assertEquals(o[7].finalized, o[7].key);
                jsunit.assertEquals(o[8].total, 50300);
                jsunit.assertEquals(o[8].finalized, o[8].key);
                jsunit.assertEquals(o[9].total, 50400);
                jsunit.assertEquals(o[9].finalized, o[9].key);
            }
        );
    };

    (function() {
        jsunit.resetTests();
        jsunit.addTest(testCollectionMapReduce);
        jsunit.runTests();
    }());

}());

(function() {
  
    function testQueries() {

        scule.dropAll();

        var timer = scule.getTimer();
        var collection = scule.factoryCollection('scule+dummy://unittest');

        collection.ensureBTreeIndex('loc.lat', {order:1000});
        collection.ensureBTreeIndex('i',       {order:1000});
        collection.ensureBTreeIndex('n',       {order:1000});    

        collection.clear();    

        var k = 0;
        var names = ['Tom', 'Dick', 'Harry', 'John'];
        for(var i=0; i < 10000; i++) {
                var a = [];
                var n = i%10;
                for(var j=0; j < n; j++) {
                        a.push(j);
                }
                var o = {
                        i:i,
                        n:n,
                        s:names[k++],
                        a:a,
                        as:a.length,
                        term: Math.random().toString(36).substring(7),
                        ts:(new Date()).getTime(),
                        foo:['bar','bar2'],
                        o: {
                                a: i,
                                b: i+1,
                                c: i+2,
                                d: i+3,
                                e: i+4
                        },
                        loc: {
                                lng:sfunc.randomFromTo(-130, 130),
                                lat:sfunc.randomFromTo(-130, 130)
                        }
                };
                collection.save(o);
                if(k == 4) {
                    k = 0;
                }
        }

        timer.startInterval("collection - {i:{$gte:5000}, n:{$lte:80}}");
        collection.count({i:{$gte:5000}, n:{$lte:80}}, {}, function(count) {
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(d.i >= 5000 && d.n <= 80) {
                    c++;
                }
            });
            jsunit.assertEquals(count, c);
            jsunit.assertEquals(count, 5000);
        });
        timer.stopInterval();

        timer.startInterval("collection - {i:{$gte:5000}, n:{$lte:80}}");
        collection.count({i:{$gte:5000}, n:{$lte:80}}, {}, function(count) {
            jsunit.assertEquals(count, 5000);
        });
        timer.stopInterval();

        timer.startInterval("collection - {i:{$in:[1, 2, 3, 4, 5]}}");
        collection.count({i:{$in:[1, 2, 3, 4, 5]}}, {}, function(count) {
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(d.i >= 1 && d.i <= 5) {
                    c++;
                }
            });
            jsunit.assertEquals(count, c);        
            jsunit.assertEquals(count, 5);
        });
        timer.stopInterval();

        timer.startInterval("collection - {i:{$in:[1, 2, 3, 4, 5]}}");
        collection.count({i:{$in:[1, 2, 3, 4, 5]}}, {}, function(count) {
            jsunit.assertEquals(count, 5);
        });
        timer.stopInterval();

        timer.startInterval("collection - {s:{$size:3}}");
        collection.count({s:{$size:3}}, {}, function(count) {
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(d.s.length == 3) {
                    c++;
                }
            });
            jsunit.assertEquals(count, c);         
            jsunit.assertEquals(count, 2500);
        });
        timer.stopInterval();

        timer.startInterval("collection - {s:{$size:3}}");
        collection.count({s:{$size:3}}, {}, function(count) {
            jsunit.assertEquals(count, 2500);
        });
        timer.stopInterval();

        timer.startInterval("collection - {o:{$size:5}}");
        collection.count({o:{$size:5}}, {}, function(count) {
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(sfunc.sizeOf(d.o) == 5) {
                    c++;
                }
            });
            jsunit.assertEquals(count, c);        
            jsunit.assertEquals(count, 10000);
        });
        timer.stopInterval();

        timer.startInterval("collection - {o:{$size:5}}");
        collection.count({o:{$size:5}}, {}, function(count) {
            jsunit.assertEquals(count, 10000);
        });
        timer.stopInterval();

        timer.startInterval("collection - {n:{$exists:false}}");
        collection.count({n:{$exists:false}}, {}, function(count) {
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(!('n' in d)) {
                    c++;
                }
            });
            jsunit.assertEquals(count, c);        
            jsunit.assertEquals(count, 0);
        });
        timer.stopInterval();

        timer.startInterval("collection - {n:{$exists:false}}");
        collection.count({n:{$exists:false}}, {}, function(count) {
            jsunit.assertEquals(count, 0);
        });
        timer.stopInterval();

        timer.startInterval("collection - {n:{$exists:true}}");
        collection.count({n:{$exists:true}}, {}, function(count) {
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if('n' in d) {
                    c++;
                }
            });
            jsunit.assertEquals(count, c);         
            jsunit.assertEquals(count, 10000);
        });
        timer.stopInterval();

        timer.startInterval("collection - {n:{$exists:true}}");
        collection.count({n:{$exists:true}}, {}, function(count) {
            jsunit.assertEquals(count, 10000);
        });
        timer.stopInterval();

        timer.startInterval("collection - {i:{$gte:70}}");
        collection.count({i:{$gte:70}}, {}, function(count) {
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(d.i >= 70) {
                    c++;
                }
            });
            jsunit.assertEquals(count, c);         
            jsunit.assertEquals(count, 9930);
        });
        timer.stopInterval();

        timer.startInterval("collection - {i:{$gte:70}}");
        collection.count({i:{$gte:70}}, {}, function(count) {
            jsunit.assertEquals(count, 9930);
        });
        timer.stopInterval();

        timer.startInterval("collection - {s:/^T/}");
        collection.count({s:/^T/}, {}, function(count) {
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(/^T/.test(d.s)) {
                    c++;
                }
            });
            jsunit.assertEquals(count, c);         
            jsunit.assertEquals(count, 2500);
        });
        timer.stopInterval();

        timer.startInterval("collection - {s:/^T/}");
        collection.count({s:/^T/}, {}, function(count) {
            jsunit.assertEquals(count, 2500);
        });
        timer.stopInterval();

        timer.startInterval("collection - {$or:[{n:{$lt:40}}, {i:{$gt:50}}]}");
        collection.count({$or:[{n:{$lt:40}}, {i:{$gt:50}}]}, {}, function(count) {
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(d.i > 50 || d.n < 40) {
                    c++;
                }
            });
            jsunit.assertEquals(count, c);        
            jsunit.assertEquals(count, 10000);
        });
        timer.stopInterval();

        timer.startInterval("collection - {$or:[{n:{$lt:40}}, {i:{$gt:50}}]}");
        collection.count({$or:[{n:{$lt:40}}, {i:{$gt:50}}]}, {}, function(count) {
            jsunit.assertEquals(count, 10000);
        });
        timer.stopInterval();

        timer.startInterval("collection - {$or:[{n:{$lt:40}}, {i:{$gt:50}}]}, {$sort:{i:-1}, $limit:30}");
        collection.count({$or:[{n:{$lt:40}}, {i:{$gt:50}}]}, {$sort:{i:-1}, $limit:30}, function(count) {
            var o = collection.findAll();       
            jsunit.assertEquals(count, 30);
        });
        timer.stopInterval();

        timer.startInterval("collection - {$or:[{n:{$lt:40}}, {i:{$gt:50}}]}, {$sort:{i:-1}, $limit:30}");
        collection.count({$or:[{n:{$lt:40}}, {i:{$gt:50}}]}, {$sort:{i:-1}, $limit:30}, function(count) {
            jsunit.assertEquals(count, 30);
        });
        timer.stopInterval();

        timer.startInterval("collection - {i:{$lte:90}}, {$set:{n:10, s:'Steve'}}");
        collection.update({i:{$lte:90}}, {$set:{n:10, s:'Steve'}}, {}, false, function(count) {
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(d.i <= 90) {
                    c++;
                }
            });
            jsunit.assertEquals(count.length, c);        
            jsunit.assertEquals(count.length, 91);
        });
        timer.stopInterval();

        timer.startInterval("collection - {i:10}, {$push:{foo:'bar3'}}");
        collection.update({i:10}, {$push:{foo:'bar3'}}, {}, true, function(count) {
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(d.i == 10) {
                    c++;
                }
            });
            jsunit.assertEquals(count.length, c);         
            jsunit.assertEquals(count.length, 1);
        });
        timer.stopInterval();

        timer.startInterval("collection - {i:10}, {$pushAll:{foo:['bar3', 'bar4']}}");
        collection.update({i:10}, {$pushAll:{foo:['bar3', 'bar4']}}, {}, false, function(count) {
            jsunit.assertEquals(count.length, 1);
        });
        timer.stopInterval();

        console.log('');
        timer.logToConsole();
    };

    (function() {
        jsunit.resetTests();
        jsunit.addTest(testQueries);
        jsunit.runTests();
    }());

}());