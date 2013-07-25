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

function runAllTests() {

    (function() {
    
        Scule.registerNamespace('tests', {
            functions:{},
            variables:{}
        });     
    
        Scule.tests.functions.renderTest = function(variables) {
            var html = '<div class="row"><div class="span9">';
            html += '<h3>' + variables.name + '</h3>';   
            if (variables.failed > 0) {
                html += '<div class="alert alert-error">' + variables.failed + ' tests failed in this suite</div>';
            } else {
                html += '<div class="alert alert-success">' + variables.passed + ' tests succeeded</div>';
            }
            html += '<div class="well"><div>';  
            for (var key in variables.outputs) {
                html += variables.outputs[key].split('').join(' ') + ' ';
            }
            html += '</div></div>';
            variables.assertions.forEach(function(assertion) {
                if (!assertion.failed) {
                    return;
                }
                html += '<div class="row"><div class="span9">';
                html += '<div class="alert alert-block">';
                html += '<h4>' + assertion.caller + '</h4>';
                html += '<p>expected ' + assertion.expected + ', assertion ' + assertion.assertion + '</p>';
                html += '</div></div></div>'
            });
            html += '</div></div>';
            $('#tests').append(html);
        };
    
    }());

    (function() {
    
        function testCompare() {
            JSUNIT.assertEquals(Scule.global.functions.compare(1, 1), 0);
            JSUNIT.assertEquals(Scule.global.functions.compare(2, 1), 1);
            JSUNIT.assertEquals(Scule.global.functions.compare(1, 2), -1);
        };

        function testRandomFromTo() {
            var e = Scule.global.functions.randomFromTo(10, 30);  
            JSUNIT.assertTrue(e >= 10 && e <= 30);  
        };

        function testIsArray() {
            JSUNIT.assertTrue(Scule.global.functions.isArray([1, 2, 3, 4, 5]));
            JSUNIT.assertFalse(Scule.global.functions.isArray({
                foo:'bar'
            })); 
            JSUNIT.assertFalse(Scule.global.functions.isArray(1));
            JSUNIT.assertFalse(Scule.global.functions.isArray('testing'));
        };

        function testSizeOf() {
            JSUNIT.assertEquals(Scule.global.functions.sizeOf({
                foo:'bar',
                bar:'foo'
            }), 2);  
        };

        function testShuffle() {
            var a = [1, 2, 3, 4, 5, 6, 7];
            var b = [1, 2, 3, 4, 5, 6, 7];
            JSUNIT.assertEquals(JSON.stringify(a), JSON.stringify(b));
            Scule.global.functions.shuffle(b);
            JSUNIT.assertNotEquals(JSON.stringify(a), JSON.stringify(b));  
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
            JSUNIT.assertEquals(JSON.stringify(o), JSON.stringify(Scule.global.functions.cloneObject(o)));
        }

        function testIsInteger() {
            JSUNIT.assertTrue(Scule.global.functions.isInteger(5));
            JSUNIT.assertFalse(Scule.global.functions.isInteger(10.232));
            JSUNIT.assertFalse(Scule.global.functions.isInteger("foo"));
            JSUNIT.assertTrue(Scule.global.functions.isInteger("5"));
            JSUNIT.assertFalse(Scule.global.functions.isInteger({
                foo:"bar"
            }));
        };

        function testIsScalar() {
            JSUNIT.assertTrue(Scule.global.functions.isScalar(5));
            JSUNIT.assertTrue(Scule.global.functions.isScalar(10.232));
            JSUNIT.assertTrue(Scule.global.functions.isScalar("foo"));
            JSUNIT.assertTrue(Scule.global.functions.isScalar("5"));
            JSUNIT.assertFalse(Scule.global.functions.isScalar({
                foo:"bar"
            }));
            JSUNIT.assertFalse(Scule.global.functions.isScalar([1,2,3,4,5]));    
        };

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
            var result = Scule.global.functions.traverseObject({
                f:true
            }, object);
            JSUNIT.assertEquals('{"a":10,"c":{"d":"foo"},"e":{"f":[11,12,23,33]},"f":12}', JSON.stringify(result[1]));
            JSUNIT.assertEquals(result[0], 'f');
            result = Scule.global.functions.traverseObject({
                e:{
                    f:true
                }
            }, object);
            JSUNIT.assertEquals('{"f":[11,12,23,33]}', JSON.stringify(result[1]));
            JSUNIT.assertEquals(result[0], 'f');
            result = Scule.global.functions.traverseObject({
                e:{
                    z:true
                }
            }, object);
            JSUNIT.assertEquals('{"f":[11,12,23,33]}', JSON.stringify(result[1]));
            JSUNIT.assertEquals(result[0], 'z');
        };

        (function() {
            JSUNIT.resetTests();
            JSUNIT.addTest(testCompare);
            JSUNIT.addTest(testRandomFromTo);
            JSUNIT.addTest(testIsArray);
            JSUNIT.addTest(testSizeOf);
            JSUNIT.addTest(testShuffle);
            JSUNIT.addTest(testCloneObject);
            JSUNIT.addTest(testIsInteger);
            JSUNIT.addTest(testIsScalar);
            JSUNIT.addTest(testTraverseObject);
            JSUNIT.runTests('General function tests', Scule.tests.functions.renderTest);
        }());    
    
    }());

    (function() {
       
        function testQueryOperators() {

            var engine = Scule.getQueryEngine();
    
            JSUNIT.assertEquals(true,  engine.$eq(1, 1));
            JSUNIT.assertEquals(false, engine.$eq(2, 1));
    
            JSUNIT.assertEquals(false, engine.$ne(1, 1));
            JSUNIT.assertEquals(true,  engine.$ne(2, 1));
    
            JSUNIT.assertEquals(true,  engine.$gt(2, 1));
            JSUNIT.assertEquals(false, engine.$gt(-1, 1));

            JSUNIT.assertEquals(true,  engine.$gte(2, 1));
            JSUNIT.assertEquals(false, engine.$gte(-1, 1));
            JSUNIT.assertEquals(true,  engine.$gte(2, 2));

            JSUNIT.assertEquals(false, engine.$lt(2, 1));
            JSUNIT.assertEquals(true,  engine.$lt(-1, 1));

            JSUNIT.assertEquals(false, engine.$lte(2, 1));
            JSUNIT.assertEquals(true,  engine.$lte(-1, 1));
            JSUNIT.assertEquals(true,  engine.$lte(-1, -1));

            JSUNIT.assertEquals(true,  engine.$in(1, [2, 3, 1, 4, 5]));
            JSUNIT.assertEquals(false, engine.$in(-1, [2, 3, 1, 4, 5]));

            JSUNIT.assertEquals(false, engine.$nin(1, [2, 3, 1, 4, 5]));
            JSUNIT.assertEquals(true,  engine.$nin(-1, [2, 3, 1, 4, 5]));

            JSUNIT.assertEquals(true,  engine.$size([1, 2, 3, 4, 5, 6], 6));
            JSUNIT.assertEquals(false, engine.$size([1, 2, 3, 4, 5, 6], 9));
            JSUNIT.assertEquals(true,  engine.$size({
                foo:true, 
                bar:true
            }, 2));
            JSUNIT.assertEquals(false, engine.$size({
                foo:true, 
                bar:true
            }, 3));

            JSUNIT.assertEquals(true,  engine.$exists('foo', true));
            JSUNIT.assertEquals(false, engine.$exists('foo', false));

            JSUNIT.assertEquals(true,  engine.$all([9, 8, 7, 1, 2, 0, 3], [1, 2, 3]));
            JSUNIT.assertEquals(false, engine.$all([9, 8, 7, 1, 2, 0, 3], [1, 2, 3, 11]));
    
            JSUNIT.assertEquals(true,  engine.$elemMatch([{
                a:0, 
                b:1
            }, {
                a:1, 
                b:2
            }, {
                a:2, 
                b:3
            }], function(o) {
                return o.a == 1 && o.b == 2;
            }));
            JSUNIT.assertEquals(false, engine.$elemMatch([{
                a:0, 
                b:1
            }, {
                a:1, 
                b:2
            }, {
                a:2, 
                b:3
            }], function(o) {
                return o.a == 3 && o.b == 4;
            }));

            JSUNIT.assertEquals(true,  engine.$near({
                lat:53, 
                lon:-67
            }, {
                lat:53, 
                lon:-67, 
                distance:100
            }));
            JSUNIT.assertEquals(false, engine.$near({
                lat:53, 
                lon:-60
            }, {
                lat:53, 
                lon:-67, 
                distance:1000
            }));

            JSUNIT.assertEquals(true,  engine.$within({
                lat:53, 
                lon:-67
            }, {
                lat:53, 
                lon:-67, 
                distance:0
            }));
            JSUNIT.assertEquals(false, engine.$within({
                lat:40, 
                lon:-30
            }, {
                lat:53, 
                lon:-67, 
                distance:30
            }));

        };

        function testUpdateOperators() {

            var engine = Scule.getQueryEngine();
            var o = null;
    
            // $set
            o = {
                a:1
            };
            engine.$set(engine.traverseObject('a', o), 3, false);
            JSUNIT.assertEquals(o.a, 3);
            engine.$set(engine.traverseObject('b', o), 3, false);
            JSUNIT.assertEquals(false, ('b' in o));
            engine.$set(engine.traverseObject('b', o), 3, true);
            JSUNIT.assertEquals(o.b, 3);

            // $unset
            o = {
                a:1
            };
            JSUNIT.assertEquals(true, ('a' in o));
            engine.$unset(engine.traverseObject('a', o), 3, false);
            JSUNIT.assertEquals(false, ('a' in o));

            // $inc
            o = {
                a:1
            };
            engine.$inc(engine.traverseObject('a', o), null, false);
            JSUNIT.assertEquals(o.a, 2);
            engine.$inc(engine.traverseObject('b', o), 3, false);
            JSUNIT.assertEquals(false, ('b' in o));
            engine.$inc(engine.traverseObject('b', o), 3, true);
            JSUNIT.assertEquals(o.b, 3);
            engine.$inc(engine.traverseObject('b', o), 1, true);
            JSUNIT.assertEquals(o.b, 4);
            engine.$inc(engine.traverseObject('b', o), 2.5, true);
            JSUNIT.assertEquals(o.b, 5);
            engine.$inc(engine.traverseObject('b', o), -1, true);
            JSUNIT.assertEquals(o.b, 4);

            // $push
            o = {
                a:[]
            };
            engine.$push(engine.traverseObject('a', o), 'foo', false);
            JSUNIT.assertEquals(o.a.length, 1);
            JSUNIT.assertEquals(o.a[0], 'foo');
            engine.$push(engine.traverseObject('a', o), 'bar', false);
            JSUNIT.assertEquals(o.a.length, 2);
            JSUNIT.assertEquals(o.a[0], 'foo');
            JSUNIT.assertEquals(o.a[1], 'bar');
            engine.$push(engine.traverseObject('b', o), 'foo', true);
            JSUNIT.assertEquals(true, ('b' in o));
            JSUNIT.assertEquals(o.b[0], 'foo');

            // $pushAll
            o = {
                a:[]
            };
            engine.$pushAll(engine.traverseObject('a', o), ['foo', 'bar'], false);
            JSUNIT.assertEquals(o.a.length, 2);
            JSUNIT.assertEquals(o.a[0], 'foo');
            JSUNIT.assertEquals(o.a[1], 'bar');
            engine.$pushAll(engine.traverseObject('b', o), ['foo1', 'bar1'], true);
            JSUNIT.assertEquals(true, ('b' in o));
            JSUNIT.assertEquals(o.b.length, 2);
            JSUNIT.assertEquals(o.b[0], 'foo1');
            JSUNIT.assertEquals(o.b[1], 'bar1');
            engine.$pushAll(engine.traverseObject('c', o), ['foo2'], true);
            JSUNIT.assertEquals(true, ('c' in o));
            JSUNIT.assertEquals(o.c.length, 1);
            JSUNIT.assertEquals(o.c[0], 'foo2');

            // $pop
            o = {
                a:['foo', 'bar', 'moo']
            };
            engine.$pop(engine.traverseObject('a', o), true, false);
            JSUNIT.assertEquals(o.a.length, 2);
            JSUNIT.assertEquals(o.a[0], 'foo');
            JSUNIT.assertEquals(o.a[1], 'bar');
            engine.$pop(engine.traverseObject('a', o), true, false);
            JSUNIT.assertEquals(o.a.length, 1);
            JSUNIT.assertEquals(o.a[0], 'foo');
            engine.$pop(engine.traverseObject('a', o), true, false);
            JSUNIT.assertEquals(o.a.length, 0);

            // $pull
            o = {
                a:['foo', 'bar', 'moo', 'mah', 'moo']
            };
            engine.$pull(engine.traverseObject('a', o), 'moo', false);
            JSUNIT.assertEquals(o.a.length, 3);
            JSUNIT.assertEquals(o.a[0], 'foo');
            JSUNIT.assertEquals(o.a[1], 'bar');
            JSUNIT.assertEquals(o.a[2], 'mah');
            engine.$pull(engine.traverseObject('a', o), 'bar', false);
            JSUNIT.assertEquals(o.a.length, 2);
            JSUNIT.assertEquals(o.a[0], 'foo');
            JSUNIT.assertEquals(o.a[1], 'mah');
            engine.$pull(engine.traverseObject('a', o), 'moo', false);
            JSUNIT.assertEquals(o.a.length, 2);
            JSUNIT.assertEquals(o.a[0], 'foo');
            JSUNIT.assertEquals(o.a[1], 'mah');

            // $pullAll
            o = {
                a:['foo', 'bar', 'moo', 'mah', 'moo']
            };
            engine.$pullAll(engine.traverseObject('a', o), ['moo', 'bar'], false);
            JSUNIT.assertEquals(o.a.length, 2);
            JSUNIT.assertEquals(o.a[0], 'foo');
            JSUNIT.assertEquals(o.a[1], 'mah');
            engine.$pullAll(engine.traverseObject('a', o), ['foo', 'mah'], false);
            JSUNIT.assertEquals(o.a.length, 0);

        };

        function testNormalizer() {

            var normalizer = Scule.getQueryNormalizer();
            var query = {
                $or:[{
                    c:113, 
                    a:{
                        $lt:14
                    }
                }], 
                foo:3, 
                bar:{
                    $lte:100, 
                    $gt:4
                }, 
                a:11
            };
            query = normalizer.normalize(query);
            JSUNIT.assertEquals('{"a":{"$eq":11},"bar":{"$gt":4,"$lte":100},"foo":{"$eq":3},"$or":[{"a":{"$lt":14},"c":113}]}', JSON.stringify(query));

        };

        function testQueryCompiler() {

            var d = [];
            for(var i=0; i < 100000; i++) {
                var foo = (i%3 == 0) ? 3 : 1;
                var bar = (i%2 == 0) ? 3 : 2;
                d.push({
                    element: {
                        foo: foo, 
                        bar: bar
                    }
                });
            }
    
            var engine = Scule.getQueryEngine();
            var interpreter = Scule.getQueryCompiler();
    
            var c = interpreter.compileQuery({
                foo:{
                    $eq:1
                }, 
                bar:{
                    $gt:2
                }
            }, {
                $sort:['foo', -1]
            });
    
            var t = Scule.getTimer();
    
            t.startInterval('closure');
            var r2 = c(d, engine);
            t.stopInterval('closure');    
            //t.logToConsole();

            JSUNIT.assertEquals(r2.length, 33333);

        };

        function testElemMatch() {
    
            var d = [];
            for(var i=0; i < 100; i++) {
                var foo = (i%3 == 0) ? 3 : 1;
                var bar = (i%2 == 0) ? 3 : 2;
                var o   = {
                    foo: foo, 
                    bar: bar,
                    arr:[]
                };
                for(var j=0; j < 10; j++) {
                    if (i%3 == 0) {
                        o.arr.push({
                            j: j,
                            f: j%3
                        });
                    } else {
                        o.arr.push({
                            j: Math.floor(i/10)*2,
                            f: j%2
                        });                
                    }
                }
                d.push({element: o});
            }    
    
            var engine = Scule.getQueryEngine();
            var interpreter = Scule.getQueryCompiler();
    
            var c = interpreter.compileQuery({
                bar:{
                    $eq:3
                }, 
                arr:{
                    $elemMatch:{
                        j:18, 
                        f:0
                    }
                }
            });
    
            var t = Scule.getTimer();
    
            t.startInterval('closure');
            var r = c(d, engine);
            t.stopInterval('closure');    
            //t.logToConsole();

            JSUNIT.assertEquals(r.length, 3);
    
        };

        function testUpdate() {
    
            var collection = Scule.factoryCollection('scule+dummy://unittest');
            collection.clear();    
    
            for(var i=0; i < 10000; i++) {
                var foo = (i%3 == 0) ? 3 : 1;
                var bar = (i%2 == 0) ? 3 : 2;
                var o   = {
                    zoo: {
                        elephant: true,
                        giraffe: true
                    },
                    foo: foo, 
                    bar: bar,
                    arr:[]
                };
                for(var j=0; j < 10; j++) {
                    if (i%3 == 0) {
                        o.arr.push({
                            j: j,
                            f: j%3
                        });
                    } else {
                        o.arr.push({
                            j: Math.floor(i/10)*2,
                            f: j%2
                        });                
                    }
                }
                collection.save(o);
            }    
    
            var interpreter = Scule.getQueryInterpreter();
            interpreter.update(collection, {foo:3}, {$unset:{'zoo.elephant':true}, $set:{bar:1, lol:'bar2'}, $push:{arr:'foo', arr2:'bar'}}, null, true);
    
            for (var key in collection.documents.table) {
                o = collection.documents.table[key];
                if (o.foo == 3) {
                    JSUNIT.assertEquals(o.bar, 1);
                    JSUNIT.assertEquals(o.arr[o.arr.length - 1], 'foo');
                    JSUNIT.assertEquals(false, ('elephant' in o.zoo));
                    JSUNIT.assertEquals(true, ('giraffe' in o.zoo));
                }
            }

        };       

        (function() {
            JSUNIT.resetTests();
            JSUNIT.addTest(testQueryOperators);
            JSUNIT.addTest(testUpdateOperators);
            JSUNIT.addTest(testNormalizer);
            JSUNIT.addTest(testQueryCompiler);
            JSUNIT.addTest(testElemMatch);
            JSUNIT.addTest(testUpdate);
            JSUNIT.runTests('Query interpreter tests', Scule.tests.functions.renderTest);
        }());    

    }());

    (function() {
   
        function testBitSetInitializeString() {   
            var exception = false;
            try {
                var bitset = Scule.getBitSet('test');
            } catch (e) {
                exception = true;
            }
            JSUNIT.assertEquals(true, exception);
        };

        function testBitSetInitializeNegativeNumber() {   
            var exception = false;
            try {
                var bitset = Scule.getBitSet(-100);
            } catch (e) {
                exception = true;
            }
            JSUNIT.assertEquals(true, exception);
        };

        function testBitSetInitializeFloatingPointNumber() {   
            var exception = false;
            try {
                var bitset = Scule.getBitSet(111.030202);
            } catch (e) {
                exception = true;
            }
            JSUNIT.assertEquals(true, exception);
        };

        function testBitSetInitialize() {
            var bitset = Scule.getBitSet(8);
            JSUNIT.assertEquals(8, bitset.getLength());
        };

        function testBitSetEmpty() {   
            var bitset = Scule.getBitSet(1024);
            for (var i=0; i < bitset.words.length; i++) {
                JSUNIT.assertEquals(0x00, bitset.words[i]);
            }
        };

        function testBitSetSetEverySecondBit() {   
            var bitset = Scule.getBitSet(10);
            for (var i=0; i < 10; i++) {
                if (i%2) {
                    bitset.set(i);
                }
            }
            for (var i=0; i < 10; i++) {
                if (i%2) {
                    JSUNIT.assertEquals(true, bitset.get(i));
                } else {
                    JSUNIT.assertEquals(false, bitset.get(i));
                }
            }
        };

        function testBitSetSetRandomBits() {
            for (var j=0; j < 100; j++) {
                var bitset = Scule.getBitSet(90);
                var string = '';
                for (var i=0; i < bitset.getLength(); i++) {
                    if (Scule.global.functions.randomFromTo(0, 1) == 1) {
                        bitset.set(i);
                        string += '1';
                    } else {
                        string += '0';
                    }
                }
                JSUNIT.assertEquals(string, bitset.toString());
            }
        };
   
        function testBloomFilterRandomKeys() {
            for (var j=0; j < 100; j++) {
                var table  = Scule.getHashTable(2000);
                var filter = Scule.getBloomFilter(15000);
                var keys = [];
                for (var i=0; i < 30; i++) {
                    var key = Math.random().toString(36).substring(5);
                    table.put(key)
                    filter.add(key);
                }
                table.getKeys().forEach(function(k) {
                    JSUNIT.assertEquals(true, filter.query(k));
                });
                var nkey = Math.random().toString(36).substring(5);
                while (table.contains(nkey)) {
                    nkey = Math.random().toString(36).substring(5);
                }
                JSUNIT.assertEquals(false, filter.query(nkey));
            }
        };   
   
        function testAtomicCounterInitialize() {   
            var counter = Scule.getAtomicCounter(999);
            JSUNIT.assertEquals(counter.getCount(), 999);   
        };

        function testAtomicCounterIncrement() {   
            var counter = Scule.getAtomicCounter(1);
            counter.increment(1);
            JSUNIT.assertEquals(counter.getCount(), 2);   
        };

        function testAtomicCounterIncrement2() {   
            var counter = Scule.getAtomicCounter(1);
            counter.increment(11);
            JSUNIT.assertEquals(counter.getCount(), 12);   
        };

        function testAtomicCounterDecrement() {   
            var counter = Scule.getAtomicCounter(2);
            counter.decrement(1);
            JSUNIT.assertEquals(counter.getCount(), 1);   
        };

        function testAtomicCounterDecrement2() {   
            var counter = Scule.getAtomicCounter(12);
            counter.decrement(6);
            JSUNIT.assertEquals(counter.getCount(), 6);   
        };   
   
        (function() {
            JSUNIT.resetTests();
            JSUNIT.addTest(testBitSetInitializeString);
            JSUNIT.addTest(testBitSetInitializeNegativeNumber);
            JSUNIT.addTest(testBitSetInitializeFloatingPointNumber);
            JSUNIT.addTest(testBitSetInitialize);
            JSUNIT.addTest(testBitSetEmpty);
            JSUNIT.addTest(testBitSetSetEverySecondBit);
            JSUNIT.addTest(testBitSetSetRandomBits);
            JSUNIT.addTest(testBloomFilterRandomKeys);
            JSUNIT.addTest(testAtomicCounterInitialize);
            JSUNIT.addTest(testAtomicCounterIncrement);
            JSUNIT.addTest(testAtomicCounterIncrement2);
            JSUNIT.addTest(testAtomicCounterDecrement);
            JSUNIT.addTest(testAtomicCounterDecrement2);
            JSUNIT.runTests('BitSet tests', Scule.tests.functions.renderTest);
        }());   
   
    }());

    (function() {
    
        function testBinaryTreeNode() {
            var node = Scule.getBinarySearchTreeNode('foo', 'bar');
            JSUNIT.assertEquals(node.getKey(), 'foo');
            JSUNIT.assertEquals(node.getData(), 'bar');
            JSUNIT.assertEquals(node.getLeft(), null);
            JSUNIT.assertEquals(node.getRight(), null);
            node.setLeft(Scule.getBinarySearchTreeNode('foo1', 'bar1'));
            node.setRight(Scule.getBinarySearchTreeNode('foo2', 'bar2'));
            JSUNIT.assertEquals(node.getLeft().getKey(), 'foo1');
            JSUNIT.assertEquals(node.getLeft().getData(), 'bar1');
            JSUNIT.assertEquals(node.getRight().getKey(), 'foo2');
            JSUNIT.assertEquals(node.getRight().getData(), 'bar2');    
        };

        function testBinaryTreeNodeRemove() {
            var node = Scule.getBinarySearchTreeNode('foo5', 'bar5');

            node.setLeft(Scule.getBinarySearchTreeNode('foo3', 'bar3'));
            node.getLeft().setLeft(Scule.getBinarySearchTreeNode('foo1', 'bar1'));
            node.getLeft().setRight(Scule.getBinarySearchTreeNode('foo4', 'bar4'));

            node.setRight(Scule.getBinarySearchTreeNode('foo8', 'bar8'));
            node.getRight().setLeft(Scule.getBinarySearchTreeNode('foo7', 'bar7'));
            node.getRight().setRight(Scule.getBinarySearchTreeNode('foo9', 'bar9'));

            node.remove(node.getLeft());

            JSUNIT.assertEquals(node.getLeft().getKey(), 'foo4');
            JSUNIT.assertEquals(node.getLeft().getData(), 'bar4');
            JSUNIT.assertEquals(node.getLeft().getRight(), null);
            JSUNIT.assertEquals(node.getLeft().getLeft().getKey(), 'foo1');

            node.remove(node.getRight());
            JSUNIT.assertEquals(node.getRight().getKey(), 'foo9');
            JSUNIT.assertEquals(node.getRight().getData(), 'bar9');
            JSUNIT.assertEquals(node.getRight().getRight(), null);
            JSUNIT.assertEquals(node.getRight().getLeft().getKey(), 'foo7');
        };

        function testBinaryTreeInsertion() {
            var tree = Scule.getBinarySearchTree();
            for(var i=0; i < 100; i++) {
                var key = Scule.global.functions.randomFromTo(1, 100);
                tree.insert(key, key);
            }
            var verify = function(node) {
                if(!node) {
                    return;
                }
                JSUNIT.assertTrue(node.getRight() == null || node.getRight().getKey() > node.getKey());
                JSUNIT.assertTrue(node.getLeft() == null  || node.getLeft().getKey() <= node.getKey());
                verify(node.getRight());
                verify(node.getLeft());
            };
            verify(tree.getRoot());
        };

        function testBinaryTreeSearch() {
            var keys = {};
            var tree = Scule.getBinarySearchTree();
            for(var i=0; i < 100; i++) {
                var key = Scule.global.functions.randomFromTo(1, 1000);
                keys[key] = true;
                tree.insert(key, key);
            }
            for(var key in keys) {
                var node = tree.search(key);
                JSUNIT.assertTrue(node.getKey() == key);
            }
        };

        function testBinaryTreeToArray() {
            var tree = Scule.getBinarySearchTree();
            for(var i=0; i < 100; i++) {
                var key = Scule.global.functions.randomFromTo(1, 1000);
                tree.insert(key, key);
            }
            var list = tree.toArray();
            for(var i=0; i < list.length; i++) {
                for(var j=i+1; j < list.length; j++) {
                    JSUNIT.assertTrue(list[i][0] <= list[j][0]);
                }
            }
        };

        function testBinaryTreeBalance() {
            var tree = Scule.getBinarySearchTree();
            for(var i=0; i < 100; i++) {
                var key = Scule.global.functions.randomFromTo(1, 1000);
                tree.insert(key, key);
            }
            tree.balance();

            var verifyOrder = function(node) {
                if(!node) {
                    return;
                }
                JSUNIT.assertTrue(node.getRight() == null || node.getRight().getKey() > node.getKey());
                JSUNIT.assertTrue(node.getLeft() == null || node.getLeft().getKey() <= node.getKey());
                verifyOrder(node.getRight());
                verifyOrder(node.getLeft());
            };
            verifyOrder(tree.getRoot());
        };

        (function() {
            JSUNIT.resetTests();
            JSUNIT.addTest(testBinaryTreeNode);
            JSUNIT.addTest(testBinaryTreeNodeRemove);
            JSUNIT.addTest(testBinaryTreeInsertion);
            JSUNIT.addTest(testBinaryTreeSearch);
            JSUNIT.addTest(testBinaryTreeToArray);
            JSUNIT.addTest(testBinaryTreeBalance);
            JSUNIT.runTests('Binary Search Tree tests', Scule.tests.functions.renderTest);
        }());    
    
    }());

    (function() {
    
        function testCachingLinkedListSize() {
            var list = Scule.getCachingLinkedList(10, 'key');
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
            JSUNIT.assertEquals(list.getLength(), 4);
        }

        function testCachingLinkedListGet() {
            var list = Scule.getCachingLinkedList(10, 'key');
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
            JSUNIT.assertEquals(node.getElement().bar, 5);
        };

        function testCachingLinkedListSplit() {
            var list1 = Scule.getCachingLinkedList(10, 'key');
            list1.add(1);
            list1.add(2);
            list1.add(3);
            list1.add(4);
            list1.add(5);
            list1.add(6);
            list1.add(7);
            list1.add(8);
            var list2 = list1.split(4);
            JSUNIT.assertEquals(list1.getLength(), 4);
            JSUNIT.assertEquals(list1.getTail().getElement(), 4);
            JSUNIT.assertEquals(list2.getLength(), 4);
            JSUNIT.assertEquals(list2.getTail().getElement(), 8);
        }

        function testCachingLinkedListSplit2() {
            var list1 = Scule.getCachingLinkedList(10, 'key');
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
            JSUNIT.assertEquals(list1.getLength(), 5);
            JSUNIT.assertEquals(list1.getTail().getElement(), 5);
            JSUNIT.assertEquals(list2.getLength(), 4);
            JSUNIT.assertEquals(list2.getTail().getElement(), 9);
        }

        function testCachingLinkedListClear() {
            var list = Scule.getCachingLinkedList(10, 'key');
            list.add(1);
            list.add(2);
            list.add(3);
            list.add(4);
            list.add(5);
            list.add(6);
            list.add(7);
            list.add(8);
            list.clear();
            JSUNIT.assertEquals(list.getLength(), 0);
            JSUNIT.assertEquals(list.getHead(), null);
        }

        function testCachingLinkedListContains() {
            var list = Scule.getCachingLinkedList(10, 'key');
            list.add(1);
            list.add(2);
            list.add(3);
            list.add(4);
            list.add(5);
            list.add(6);
            list.add(7);
            list.add(8);
            JSUNIT.assertTrue(list.contains(6)); 
            JSUNIT.assertFalse(list.contains(10));
        };

        function testCachingLinkedListIsEmpty() {
            var list = Scule.getCachingLinkedList(10, 'key');
            list.add(1);
            list.add(2);
            JSUNIT.assertFalse(list.isEmpty());
        }

        function testCachingLinkedListRemove() {
            var list = Scule.getCachingLinkedList(10, 'key');
            list.add(1);
            list.add(2);
            list.add(3);
            list.add(4);
            list.add(5);
            list.add(6);
            list.add(7);
            list.add(8);
            list.remove(4);
            JSUNIT.assertEquals(list.remove(-1), null);
            JSUNIT.assertEquals(list.remove(10), null);
            JSUNIT.assertEquals(list.getLength(), 7);
            JSUNIT.assertEquals(list.get(4).getElement(), 6);
        };

        function testCachingLinkedListReverse() {
            var list = Scule.getCachingLinkedList(10, 'key');
            list.add(1);
            list.add(2);
            list.add(3);
            list.add(4);
            list.add(5);
            list.add(6);
            list.add(7);
            list.add(8);
            list.reverse();
            JSUNIT.assertEquals(list.getHead().getElement(), 8);
            JSUNIT.assertEquals(list.getTail().getElement(), 1);
        };

        function testCachingLinkedListSort() {
            var list = Scule.getCachingLinkedList(10, 'key');
            for(var i=0; i < 30; i++) {
                list.add(Scule.global.functions.randomFromTo(10, 10000));
            }
            list.sort();
            var curr = list.head;
            while(curr && curr.next) {
                JSUNIT.assertTrue((curr.element <= curr.next.element));
                curr = curr.next;
            }
        };

        function testCachingLinkedListComparison() {
            var list  = Scule.getLinkedList();
            var clist = Scule.getCachingLinkedList(10, 'key');

            var value;
            var i = 0;
            for(; i < 10000; i++) {
                value = 'test' + Scule.global.functions.randomFromTo(100000, 200000);
                list.add({
                    key:i, 
                    value:value
                });
                clist.add({
                    key:i, 
                    value:value
                })
            }
            for(i=0; i < 1000; i++) {
                clist.search(Scule.global.functions.randomFromTo(1, 100000));
            }
            JSUNIT.assertEquals(list.search(999, 'key').getElement().key, clist.search(999, 'key').getElement().key);
            JSUNIT.assertEquals(list.search(599, 'key').getElement().value, clist.search(599, 'key').getElement().value);
        };

        (function() {
            JSUNIT.resetTests();
            JSUNIT.addTest(testCachingLinkedListSize);
            JSUNIT.addTest(testCachingLinkedListGet);
            JSUNIT.addTest(testCachingLinkedListSplit);
            JSUNIT.addTest(testCachingLinkedListSplit2);
            JSUNIT.addTest(testCachingLinkedListClear);
            JSUNIT.addTest(testCachingLinkedListIsEmpty);
            JSUNIT.addTest(testCachingLinkedListContains);
            JSUNIT.addTest(testCachingLinkedListRemove);
            JSUNIT.addTest(testCachingLinkedListReverse);
            JSUNIT.addTest(testCachingLinkedListSort);
            JSUNIT.addTest(testCachingLinkedListComparison);
            JSUNIT.runTests('Caching Linked List tests', Scule.tests.functions.renderTest);
        }());    
    
    }());

    (function() {
    
        function testDoublyLinkedListSize() {
            var list = Scule.getDoublyLinkedList();
            list.add(1);
            list.add(2);
            list.add(3);
            list.add(4);
            JSUNIT.assertEquals(list.getLength(), 4);
        }

        function testDoublyLinkedListGet() {
            var list = Scule.getDoublyLinkedList();
            list.add(1);
            list.add(2);
            list.add(3);
            list.add(4);
            list.add(5);
            list.add(6);
            list.add(7);
            list.add(8);
            var node = list.get(4);
            JSUNIT.assertEquals(node.getElement(), 5);
        };

        function testDoublyLinkedListClear() {
            var list = Scule.getDoublyLinkedList();
            list.add(1);
            list.add(2);
            list.add(3);
            list.add(4);
            list.add(5);
            list.add(6);
            list.add(7);
            list.add(8);
            list.clear();
            JSUNIT.assertEquals(list.getLength(), 0);
            JSUNIT.assertEquals(list.getHead(), null);
        }

        function testDoublyLinkedListIsEmpty() {
            var list = Scule.getDoublyLinkedList();
            list.add(1);
            list.add(2);
            JSUNIT.assertFalse(list.isEmpty());
        }

        function testDoublyLinkedListRemove() {
            var list = Scule.getDoublyLinkedList();
            list.add(1);
            list.add(2);
            list.add(3);
            list.add(4);
            list.add(5);
            list.add(6);
            list.add(7);
            list.add(8);
            list.remove(4);
            JSUNIT.assertEquals(list.remove(-1), null);
            JSUNIT.assertEquals(list.remove(10), null);
            JSUNIT.assertEquals(list.getLength(), 7);
            JSUNIT.assertEquals(list.get(4).getElement(), 6);
        };

        function testDoublyLinkedListTrim() {
            var list = Scule.getDoublyLinkedList();
            list.add(1);
            list.add(2);
            list.add(3);
            list.add(4);
            list.add(5);
            list.add(6);
            list.add(7);
            list.add(8);
            list.trim();
            JSUNIT.assertEquals(list.getLength(), 7);
            JSUNIT.assertEquals(list.get(6).getElement(), 7);
            JSUNIT.assertEquals(list.get(7), null);
            list.trim();
            JSUNIT.assertEquals(list.getLength(), 6);
            JSUNIT.assertEquals(list.get(5).getElement(), 6);    
        };

        function testDoublyLinkedListPrepend() {
            var list = Scule.getDoublyLinkedList();
            list.add(1);
            list.add(2);
            list.add(3);
            list.add(4);
            list.add(5);
            list.add(6);
            list.add(7);
            list.add(8);
            list.prepend(0);
            JSUNIT.assertEquals(list.getLength(), 9);
            JSUNIT.assertEquals(list.getHead().getElement(), 0);
            list.prepend(-1);
            JSUNIT.assertEquals(list.getLength(), 10);
            JSUNIT.assertEquals(list.getHead().getElement(), -1);
        };

        function testDoublyLinkedListSplit() {
            var list1 = Scule.getDoublyLinkedList();
            list1.add(1);
            list1.add(2);
            list1.add(3);
            list1.add(4);
            list1.add(5);
            list1.add(6);
            list1.add(7);
            list1.add(8);
            var list2 = list1.split(4);
            JSUNIT.assertEquals(list1.getLength(), 4);
            JSUNIT.assertEquals(list1.tail.getElement(), 4);
            JSUNIT.assertEquals(list2.getLength(), 4);
            JSUNIT.assertEquals(list2.tail.getElement(), 8);
        }

        function testDoublyLinkedListSplit2() {
            var list1 = Scule.getDoublyLinkedList();
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
            JSUNIT.assertEquals(list1.getLength(), 5);
            JSUNIT.assertEquals(list1.tail.getElement(), 5);
            JSUNIT.assertEquals(list2.getLength(), 4);
            JSUNIT.assertEquals(list2.tail.getElement(), 9);
        }

        function testDoublyLinkedListMiddle() {
            var list = Scule.getDoublyLinkedList();
            list.add(1);
            list.add(2);
            list.add(3);
            list.add(4);
            list.add(5);
            list.add(6);
            list.add(7);
            list.add(8);
            JSUNIT.assertEquals(list.middle().getElement(), 4);
            list.add(9);
            JSUNIT.assertEquals(list.middle().getElement(), 5); 
            list.add(10);
            JSUNIT.assertEquals(list.middle().getElement(), 5);
        };

        function testDoublyLinkedListReverse() {
            var list = Scule.getDoublyLinkedList();
            list.add(1);
            list.add(2);
            list.add(3);
            list.add(4);
            list.add(5);
            list.add(6);
            list.add(7);
            list.add(8);
            JSUNIT.assertEquals(list.getHead().getElement(), 1);
            JSUNIT.assertEquals(list.getTail().getElement(), 8);
            list.reverse();
            JSUNIT.assertEquals(list.getHead().getElement(), 8);
            JSUNIT.assertEquals(list.getTail().getElement(), 1);
        };

        function testDoublyLinkedListSort() {
            var list = Scule.getDoublyLinkedList();
            for(var i=0; i < 30; i++) {
                list.add(Scule.global.functions.randomFromTo(10, 10000));
            }
            list.sort();
            var curr = list.head;
            while(curr && curr.next) {
                JSUNIT.assertTrue((curr.element <= curr.next.element));
                curr = curr.next;
            }
        };

        function testDoublyLinkedListContains() {
            var list = Scule.getDoublyLinkedList();
            list.add(1);
            list.add(2);
            list.add(3);
            list.add(4);
            list.add(5);
            list.add(6);
            list.add(7);
            list.add(8);
            JSUNIT.assertTrue(list.contains(6)); 
            JSUNIT.assertFalse(list.contains(10));
        };

        (function() {
            JSUNIT.resetTests();
            JSUNIT.addTest(testDoublyLinkedListSize);
            JSUNIT.addTest(testDoublyLinkedListGet);
            JSUNIT.addTest(testDoublyLinkedListClear);
            JSUNIT.addTest(testDoublyLinkedListIsEmpty);
            JSUNIT.addTest(testDoublyLinkedListRemove);
            JSUNIT.addTest(testDoublyLinkedListTrim);
            JSUNIT.addTest(testDoublyLinkedListPrepend);
            JSUNIT.addTest(testDoublyLinkedListSplit);
            JSUNIT.addTest(testDoublyLinkedListSplit2);
            JSUNIT.addTest(testDoublyLinkedListMiddle);
            JSUNIT.addTest(testDoublyLinkedListReverse);
            JSUNIT.addTest(testDoublyLinkedListSort);
            JSUNIT.addTest(testDoublyLinkedListContains);
            JSUNIT.runTests('Doubly Linked List tests', Scule.tests.functions.renderTest);
        }());    
    
    }());

    (function() {
    
        function testHashMapSize() {
            var table = Scule.getHashMap(10);
            table.put('foo', 'bar');
            table.put('foo2', 'bar2');
            table.put('foo3', 'bar3');
            JSUNIT.assertEquals(table.getLength(), 3);
            table.put('foo', 'bar4');
            JSUNIT.assertEquals(table.getLength(), 3);
        }

        function testHashMapClear() {
            var table = Scule.getHashMap(10);
            table.put('foo1', 'bar1');
            table.put('foo2', 'bar2');
            table.put('foo3', 'bar3');
            table.clear();
            JSUNIT.assertEquals(table.getLength(), 0);
        }

        function testHashMapContains() {
            var table = Scule.getHashMap(10);
            table.put('foo1', 'bar1');
            table.put('foo2', 'bar2');
            table.put('foo3', 'bar3');
            table.put(3, 'bar4');
            JSUNIT.assertTrue(table.contains('foo2'));
            JSUNIT.assertFalse(table.contains('foo4'));
            JSUNIT.assertTrue(table.contains(3));
        }

        function testHashMapGet() {
            var table = Scule.getHashMap(10);
            table.put('foo', 'bar');
            table.put('foo2', 'bar2');
            table.put('foo3', 'bar3');
            table.put('foo', 'bar4');
            JSUNIT.assertEquals(table.get('foo'), 'bar4');
            JSUNIT.assertEquals(table.get('foo3'), 'bar3');
        }

        function testHashMapRemove() {
            var table = Scule.getHashMap(10);
            table.put('foo', 'bar');
            table.put('foo2', 'bar2');
            table.put('foo3', 'bar3');
            table.put(666, 'the devil!');
            table.remove('foo');
            JSUNIT.assertFalse(table.contains('foo'));
            JSUNIT.assertTrue(table.contains('foo2'));
            table.remove('foo2');
            JSUNIT.assertEquals(table.getLength(), 2);
            table.remove('foo2');
            JSUNIT.assertEquals(table.getLength(), 2);
            table.remove(666)
            JSUNIT.assertEquals(table.getLength(), 1);
        }

        function testHashMapGetKeys() {
            var table = Scule.getHashMap(10);
            table.put('foo1', 'bar1');
            table.put('foo2', 'bar2');
            table.put('foo3', 'bar3');
            JSUNIT.assertEquals(JSON.stringify(table.getKeys().sort()), JSON.stringify(['foo1','foo2','foo3'].sort()));
        }

        function testHashMapGetValues() {
            var table = Scule.getHashMap(10);
            table.put('foo1', 'bar1');
            table.put('foo2', 'bar2');
            table.put('foo3', 'bar3');
            JSUNIT.assertEquals(JSON.stringify(table.getValues().sort()), JSON.stringify(['bar1','bar2','bar3'].sort()));
        }

        (function() {
            JSUNIT.resetTests();
            JSUNIT.addTest(testHashMapSize);
            JSUNIT.addTest(testHashMapClear);  
            JSUNIT.addTest(testHashMapContains);
            JSUNIT.addTest(testHashMapGet);
            JSUNIT.addTest(testHashMapRemove);
            JSUNIT.addTest(testHashMapGetKeys);
            JSUNIT.addTest(testHashMapGetValues);
            JSUNIT.runTests('HashMap tests', Scule.tests.functions.renderTest);
        }());    
    
    }());

    (function() {
    
        function testHashTableSize() {
            var table = Scule.getHashTable();
            table.put('foo', 'bar');
            table.put('foo2', 'bar2');
            table.put('foo3', 'bar3');
            JSUNIT.assertEquals(table.getLength(), 3);
            table.put('foo', 'bar4');
            JSUNIT.assertEquals(table.getLength(), 3);
        }

        function testHashTableClear() {
            var table = Scule.getHashTable();
            table.put('foo1', 'bar1');
            table.put('foo2', 'bar2');
            table.put('foo3', 'bar3');
            table.clear();
            JSUNIT.assertEquals(table.getLength(), 0);
        }

        function testHashTableContains() {
            var table = Scule.getHashTable();
            table.put('foo1', 'bar1');
            table.put('foo2', 'bar2');
            table.put('foo3', 'bar3');
            table.put(3, 'bar4');
            JSUNIT.assertTrue(table.contains('foo2'));
            JSUNIT.assertFalse(table.contains('foo4'));
            JSUNIT.assertTrue(table.contains(3));
        }

        function testHashTableGet() {
            var table = Scule.getHashTable();
            table.put('foo', 'bar');
            table.put('foo2', 'bar2');
            table.put('foo3', 'bar3');
            table.put('foo', 'bar4');
            JSUNIT.assertEquals(table.get('foo'), 'bar4');
            JSUNIT.assertEquals(table.get('foo3'), 'bar3');
        }

        function testHashTableRemove() {
            var table = Scule.getHashTable();
            table.put('foo', 'bar');
            table.put('foo2', 'bar2');
            table.put('foo3', 'bar3');
            table.put(666, 'the devil!');
            table.remove('foo');
            JSUNIT.assertFalse(table.contains('foo'));
            JSUNIT.assertEquals('bar2', table.remove('foo2'));
            JSUNIT.assertFalse(table.remove('foo2'));
            JSUNIT.assertEquals('the devil!', table.remove(666));
            JSUNIT.assertFalse(table.remove(666));
            JSUNIT.assertFalse(table.remove(999));
        }

        function testHashTableGetKeys() {
            var table = Scule.getHashTable();
            table.put('foo1', 'bar1');
            table.put('foo2', 'bar2');
            table.put('foo3', 'bar3');
            JSUNIT.assertEquals(JSON.stringify(table.getKeys()), JSON.stringify(['foo1','foo2','foo3']));
        }

        function testHashTableGetValues() {
            var table = Scule.getHashTable();
            table.put('foo1', 'bar1');
            table.put('foo2', 'bar2');
            table.put('foo3', 'bar3');
            JSUNIT.assertEquals(JSON.stringify(table.getValues()), JSON.stringify(['bar1','bar2','bar3']));
        }

        (function() {
            JSUNIT.resetTests();
            JSUNIT.addTest(testHashTableSize);
            JSUNIT.addTest(testHashTableClear);  
            JSUNIT.addTest(testHashTableContains);
            JSUNIT.addTest(testHashTableGet);
            JSUNIT.addTest(testHashTableRemove);
            JSUNIT.addTest(testHashTableGetKeys);
            JSUNIT.addTest(testHashTableGetValues);
            JSUNIT.runTests('HashTable tests', Scule.tests.functions.renderTest);
        }());    
    
    }());

    (function() {
    
        function testLRUCacheThreshold() {
            var threshold = 1000;
            var cache = Scule.getLRUCache(threshold);
            for(var i=0; i < 1000; i++) {
                cache.put(i, Scule.global.functions.randomFromTo(10000, 20000));
            }
            JSUNIT.assertEquals(cache.getLength(), threshold);
            JSUNIT.assertEquals(cache.cache.getLength(), threshold);
            JSUNIT.assertEquals(cache.queue.getLength(), threshold);
        };

        function testLRUCacheRequeue() {
            var threshold = 1000;
            var cache = Scule.getLRUCache(threshold);
            for(var i=0; i < 1000; i++) {
                cache.put(i, Scule.global.functions.randomFromTo(10000, 20000));
                cache.get(Scule.global.functions.randomFromTo(1, 10000));
            }
            JSUNIT.assertEquals(cache.getLength(), threshold);
            JSUNIT.assertEquals(cache.cache.getLength(), threshold);
            JSUNIT.assertEquals(cache.queue.getLength(), threshold);
        };

        function testLRUCacheFunctionality() {
            var cache = Scule.getLRUCache(5);
            cache.put(1, {
                foo:'bar1'
            });
            cache.put(2, {
                foo:'bar2'
            });
            cache.put(3, {
                foo:'bar3'
            });
            cache.put(4, {
                foo:'bar4'
            });
            cache.put(5, {
                foo:'bar5'
            });
            cache.get(1);
            JSUNIT.assertEquals(JSON.stringify(cache.get(1)), JSON.stringify({
                foo:'bar1'
            }));
            JSUNIT.assertNotEquals(JSON.stringify(cache.get(1)), JSON.stringify({
                foo:'bar2'
            }));
            cache.put(6, {
                foo:'bar6'
            });
            cache.put(7, {
                foo:'bar7'
            });
            JSUNIT.assertFalse(cache.contains(3));
        };

        (function() {
            JSUNIT.resetTests();
            JSUNIT.addTest(testLRUCacheThreshold);
            JSUNIT.addTest(testLRUCacheRequeue);
            JSUNIT.addTest(testLRUCacheFunctionality);
            JSUNIT.runTests('LRU Cache tests', Scule.tests.functions.renderTest);
        }());    
    
    }());

    (function() {
    
        function testLinkedListSize() {
            var list = Scule.getLinkedList();
            list.add(1);
            list.add(2);
            list.add(3);
            list.add(4);
            JSUNIT.assertEquals(list.getLength(), 4);
        }

        function testLinkedListGet() {
            var list = Scule.getLinkedList();
            list.add(1);
            list.add(2);
            list.add(3);
            list.add(4);
            list.add(5);
            list.add(6);
            list.add(7);
            list.add(8);
            var node = list.get(4);
            JSUNIT.assertEquals(node.getElement(), 5);
        };

        function testLinkedListSplit() {
            var list1 = Scule.getLinkedList();
            list1.add(1);
            list1.add(2);
            list1.add(3);
            list1.add(4);
            list1.add(5);
            list1.add(6);
            list1.add(7);
            list1.add(8);
            var list2 = list1.split(4);
            JSUNIT.assertEquals(list1.getLength(), 4);
            JSUNIT.assertEquals(list1.tail.getElement(), 4);
            JSUNIT.assertEquals(list2.getLength(), 4);
            JSUNIT.assertEquals(list2.tail.getElement(), 8);
        }

        function testLinkedListSplit2() {
            var list1 = Scule.getLinkedList();
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
            JSUNIT.assertEquals(list1.getLength(), 5);
            JSUNIT.assertEquals(list1.tail.getElement(), 5);
            JSUNIT.assertEquals(list2.getLength(), 4);
            JSUNIT.assertEquals(list2.tail.getElement(), 9);
        }

        function testLinkedListClear() {
            var list = Scule.getLinkedList();
            list.add(1);
            list.add(2);
            list.add(3);
            list.add(4);
            list.add(5);
            list.add(6);
            list.add(7);
            list.add(8);
            list.clear();
            JSUNIT.assertEquals(list.getLength(), 0);
            JSUNIT.assertEquals(list.getHead(), null);
        }

        function testLinkedListContains() {
            var list = Scule.getLinkedList();
            list.add(1);
            list.add(2);
            list.add(3);
            list.add(4);
            list.add(5);
            list.add(6);
            list.add(7);
            list.add(8);
            JSUNIT.assertTrue(list.contains(6)); 
            JSUNIT.assertFalse(list.contains(10));
        };

        function testLinkedListIsEmpty() {
            var list = Scule.getLinkedList();
            list.add(1);
            list.add(2);
            JSUNIT.assertFalse(list.isEmpty());
        }

        function testLinkedListRemove() {
            var list = Scule.getLinkedList();
            list.add(1);
            list.add(2);
            list.add(3);
            list.add(4);
            list.add(5);
            list.add(6);
            list.add(7);
            list.add(8);
            list.remove(4);
            JSUNIT.assertEquals(list.remove(-1), null);
            JSUNIT.assertEquals(list.remove(10), null);
            JSUNIT.assertEquals(list.getLength(), 7);
            JSUNIT.assertEquals(list.get(4).getElement(), 6);
        };

        function testLinkedListReverse() {
            var list = Scule.getLinkedList();
            list.add(1);
            list.add(2);
            list.add(3);
            list.add(4);
            list.add(5);
            list.add(6);
            list.add(7);
            list.add(8);
            list.reverse();
            JSUNIT.assertEquals(list.getHead().getElement(), 8);
            JSUNIT.assertEquals(list.getTail().getElement(), 1);
        };

        function testLinkedListSearch() {
            var list = Scule.getLinkedList();
            for(var i=0; i < 1000; i++) {
                list.add(i);
            }
            JSUNIT.assertTrue(list.search(555));
            JSUNIT.assertFalse(list.search('foo'));
        };

        function testLinkedListSort() {
            var list = Scule.getLinkedList();
            for(var i=0; i < 30; i++) {
                list.add(Scule.global.functions.randomFromTo(10, 10000));
            }
            list.sort();
            var curr = list.head;
            while(curr && curr.next) {
                JSUNIT.assertTrue((curr.element <= curr.next.element));
                curr = curr.next;
            }
        };

        (function() {
            JSUNIT.resetTests();
            JSUNIT.addTest(testLinkedListSize);
            JSUNIT.addTest(testLinkedListGet);
            JSUNIT.addTest(testLinkedListSplit);
            JSUNIT.addTest(testLinkedListSplit2);
            JSUNIT.addTest(testLinkedListClear);
            JSUNIT.addTest(testLinkedListIsEmpty);
            JSUNIT.addTest(testLinkedListContains);
            JSUNIT.addTest(testLinkedListRemove);
            JSUNIT.addTest(testLinkedListReverse);
            JSUNIT.addTest(testLinkedListSort);
            JSUNIT.addTest(testLinkedListSearch);
            JSUNIT.runTests('Linked List tests', Scule.tests.functions.renderTest);
        }());    
    
    }());

    (function() {
    
        function testLIFOStackPushPop() {
            var stack = Scule.getLIFOStack();
            stack.push(1);
            stack.push(2);
            stack.push(3);
            stack.push(4);
            JSUNIT.assertEquals(stack.pop(), 4);
            JSUNIT.assertEquals(stack.pop(), 3);
            JSUNIT.assertEquals(stack.pop(), 2);
            JSUNIT.assertEquals(stack.pop(), 1);
        };

        function testLIFOStackPeek() {
            var stack = Scule.getLIFOStack();
            stack.push(1);
            stack.push(2);
            stack.push(3);
            stack.push(4);
            JSUNIT.assertEquals(stack.peek(), 4);
            stack.pop();
            JSUNIT.assertEquals(stack.pop(), 3);
        };

        function testLIFOStackClear() {
            var stack = Scule.getLIFOStack();
            stack.push(1);
            stack.push(2);
            stack.push(3);
            stack.push(4);
            stack.clear();
            JSUNIT.assertEquals(stack.getLength(), 0);
            JSUNIT.assertTrue(stack.isEmpty());
        };

        function testFIFOStackPushPop() {
            var stack = Scule.getFIFOStack();
            stack.push(1);
            stack.push(2);
            stack.push(3);
            stack.push(4);
            JSUNIT.assertEquals(stack.pop(), 1);
            JSUNIT.assertEquals(stack.pop(), 2);
            JSUNIT.assertEquals(stack.pop(), 3);
            JSUNIT.assertEquals(stack.pop(), 4);    
        };

        function testFIFOStackPeek() {
            var stack = Scule.getFIFOStack();
            stack.push(1);
            stack.push(2);
            stack.push(3);
            stack.push(4);
            JSUNIT.assertEquals(stack.peek(), 1);
            stack.pop();
            JSUNIT.assertEquals(stack.pop(), 2);    
        };

        function testFIFOStackClear() {
            var stack = Scule.getFIFOStack();
            stack.push(1);
            stack.push(2);
            stack.push(3);
            stack.push(4);
            stack.clear();
            JSUNIT.assertEquals(stack.getLength(), 0);
            JSUNIT.assertTrue(stack.isEmpty());    
        };

        function testQueueEnqueueDequeue() {
            var queue = Scule.getQueue();
            queue.enqueue(1);
            queue.enqueue(2);
            queue.enqueue(3);
            queue.enqueue(4);
            JSUNIT.assertEquals(queue.dequeue(), 1);
            JSUNIT.assertEquals(queue.dequeue(), 2);
            JSUNIT.assertEquals(queue.dequeue(), 3);
            JSUNIT.assertEquals(queue.dequeue(), 4);    
        };

        function testQueueClear() {
            var queue = Scule.getQueue();
            queue.push(1);
            queue.push(2);
            queue.push(3);
            queue.push(4);
            queue.clear();
            JSUNIT.assertEquals(queue.getLength(), 0);
            JSUNIT.assertTrue(queue.isEmpty());    
        };

        (function() {
            JSUNIT.resetTests();
            JSUNIT.addTest(testLIFOStackPushPop);
            JSUNIT.addTest(testLIFOStackPeek);
            JSUNIT.addTest(testLIFOStackClear);
            JSUNIT.addTest(testFIFOStackPushPop);
            JSUNIT.addTest(testFIFOStackPeek);
            JSUNIT.addTest(testFIFOStackClear);
            JSUNIT.addTest(testQueueEnqueueDequeue);
            JSUNIT.addTest(testQueueClear);    
            JSUNIT.runTests('Stack tests', Scule.tests.functions.renderTest);
        }());    
    
    }());

    (function() {
  
        function testObjectIdCreation() {
            var oid1 = Scule.getObjectId();
            var oid2 = Scule.getObjectId();
            JSUNIT.assertEquals(oid1.id.length, 24);
            JSUNIT.assertNotEquals(oid1.id, oid2.id);
        };

        (function() {
            JSUNIT.resetTests();
            JSUNIT.addTest(testObjectIdCreation);
            JSUNIT.runTests('ObjectId tests', Scule.tests.functions.renderTest);
        }());

    }());

    (function() {
    
        function testObjectDateConstructorDefault() {
            var date = Scule.getObjectDate();
            var ts   = (new Date()).getTime();
            JSUNIT.assertTrue(ts > date.getTimestamp());
            JSUNIT.assertTrue(date.getSeconds() > 0);
            JSUNIT.assertTrue(date.getMicroSeconds() > 0);
        };

        function testObjectDateConstructor() {
            var ts   = (new Date()).getTime().toString();
            var date = Scule.getObjectDate(parseInt(ts.substring(0, 10)), parseInt(ts.substring(10)));
            JSUNIT.assertTrue(date.getSeconds() > 0);
            JSUNIT.assertTrue(date.getMicroSeconds() > 0);
        };

        (function() {
            JSUNIT.resetTests();
            JSUNIT.addTest(testObjectDateConstructorDefault);
            JSUNIT.addTest(testObjectDateConstructor);
            JSUNIT.runTests('ObjectDate tests', Scule.tests.functions.renderTest);
        }());    
    
    }());

    (function() {
        
        function testPrimaryKeyIndexAdd() {
            var index = Scule.getPrimaryKeyIndex();
            for (var i=0; i < 100; i++) {
                var o = {
                    i: i,
                    _id: Scule.getObjectId()
                };
                index.add(o);
            }
            JSUNIT.assertEquals(100, index.length());
        };

        function testPrimaryKeyIndexContains() {
            var objects = [];
            var index = Scule.getPrimaryKeyIndex();
            for (var i=0; i < 100; i++) {
                var o = {
                    i: i,
                    _id: Scule.getObjectId()
                };
                objects.push(o);
                index.add(o);
            }
            objects.forEach(function(o) {
                JSUNIT.assertEquals(true, index.contains(Scule.global.functions.getObjectId(o, true)));
            });
        };

        function testPrimaryKeyIndexGet() {
            var objects = [];
            var index = Scule.getPrimaryKeyIndex();
            for (var i=0; i < 100; i++) {
                var o = {
                    i: i,
                    _id: Scule.getObjectId()
                };
                objects.push(o);
                index.add(o);
            }
            objects.forEach(function(o) {
                JSUNIT.assertEquals(o, index.get(Scule.global.functions.getObjectId(o, true)));
            });
        };

        function testPrimaryKeyIndexClear() {
            var index = Scule.getPrimaryKeyIndex();
            for (var i=0; i < 100; i++) {
                var o = {
                    i: i,
                    _id: Scule.getObjectId()
                };
                index.add(o);
            }
            JSUNIT.assertEquals(100, index.length());
            index.clear();
            JSUNIT.assertEquals(0, index.length());
        };

        function testPrimaryKeyIndexRemove() {
            var objects = [];
            var index = Scule.getPrimaryKeyIndex();
            for (var i=0; i < 100; i++) {
                var o = {
                    i: i,
                    _id: Scule.getObjectId()
                };
                objects.push(o);
                index.add(o);
            }
            JSUNIT.assertEquals(100, index.length());
            JSUNIT.assertEquals(true, index.contains(Scule.global.functions.getObjectId(objects[50], true)))
            index.remove(objects[50]);
            JSUNIT.assertEquals(99, index.length());
            JSUNIT.assertEquals(false, index.contains(Scule.global.functions.getObjectId(objects[50], true)))
            JSUNIT.assertEquals(true, index.contains(Scule.global.functions.getObjectId(objects[10], true)))
            index.remove(objects[10]);
            JSUNIT.assertEquals(98, index.length());
            JSUNIT.assertEquals(false, index.contains(Scule.global.functions.getObjectId(objects[10], true)))
        };

        function testPrimaryKeyIndexToTable() {
            var objects = [];
            var index = Scule.getPrimaryKeyIndex();
            for (var i=0; i < 100; i++) {
                var o = {
                    i: i,
                    _id: Scule.getObjectId()
                };
                objects.push(o);
                index.add(o);
            }
            var table = index.toTable();
            objects.forEach(function(o) {
                JSUNIT.assertEquals(true, table.hasOwnProperty(Scule.global.functions.getObjectId(o, true)));
            });
        };

        function testPrimaryKeyIndexToArray() {
            var objects = [];
            var index = Scule.getPrimaryKeyIndex();
            for (var i=0; i < 100; i++) {
                var o = {
                    i: i,
                    _id: Scule.getObjectId()
                };
                objects.push(o);
                index.add(o);
            }
            var array = index.toArray();
            JSUNIT.assertEquals(100, array.length);
            for (var j=0; j < array.length; j++) {
                JSUNIT.assertEquals(objects[j], array[j]);
            }
        };
        
        (function() {
            JSUNIT.resetTests();
            JSUNIT.addTest(testPrimaryKeyIndexToArray);
            JSUNIT.addTest(testPrimaryKeyIndexToTable);
            JSUNIT.addTest(testPrimaryKeyIndexRemove);
            JSUNIT.addTest(testPrimaryKeyIndexClear);
            JSUNIT.addTest(testPrimaryKeyIndexAdd);
            JSUNIT.addTest(testPrimaryKeyIndexGet);
            JSUNIT.addTest(testPrimaryKeyIndexContains);
            JSUNIT.runTests('PrimaryKeyIndex tests', Scule.tests.functions.renderTest);
        }());
        
    }());

    (function() {
    
        function testDBRefCreation() {
            var ut1 = Scule.factoryCollection('scule+dummy://ut1');
            ut1.save({
                foo:'bar1',
                bar:'foo1'
            });
            var o1 = ut1.findAll();
            o1 = o1[0];

            var ut2 = Scule.factoryCollection('scule+dummy://ut2');
            ut2.save({
                foo:'bar2',
                bar:'foo2',
                ref: Scule.getDBRef('scule+dummy://ut1', o1._id)
            });
            var o2 = ut2.findAll();
            o2 = o2[0];    

            var o3 = o2.ref.resolve();
            JSUNIT.assertEquals(o1, o3);
        };

        (function() {
            JSUNIT.resetTests();
            JSUNIT.addTest(testDBRefCreation);
            JSUNIT.runTests('DBRef tests', Scule.tests.functions.renderTest);
        }());    
    
    }());

    (function() {
  
        function testCollectionFactory() {
            Scule.dropAll();
            var collection = Scule.factoryCollection('scule+dummy://unittest');
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
            JSUNIT.assertEquals(collection.getLength(), 1000);
            JSUNIT.assertTrue(collection.getLastInsertId() !== null);
            collection.clear();
            JSUNIT.assertEquals(collection.getLength(), 0);
        };

        function testCollectionFactory2() {
            Scule.dropAll();
            var collection = Scule.factoryCollection('scule+local://collection', {secret:'test'});
            collection.clear();
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
            JSUNIT.assertEquals(collection.getLength(), 1000);
            JSUNIT.assertTrue(collection.getLastInsertId() !== null);
            collection.commit();
        };

        function testCollectionMerge() {
            Scule.dropAll();
            var collection1 = Scule.factoryCollection('scule+dummy://unittest1');
            var collection2 = Scule.factoryCollection('scule+dummy://unittest2');    
            for(var i=0; i < 1000; i++) {
                var r = i%10;
                var o = {
                    a:{
                        b:Scule.global.functions.randomFromTo(1, 10)
                    },
                    bar:'foo'+r,
                    arr:[r, r+1, r+2, r+3],
                    scl:i
                };
                collection1.save(o);
                collection2.save(o);
            }
            collection1.merge(collection2);
            JSUNIT.assertEquals(collection1.getLength(), 1000);
            for(var i=0; i < 1000; i++) {
                var r = i%10;
                var o = {
                    a:{
                        b:Scule.global.functions.randomFromTo(1, 10)
                    },
                    bar:'foo'+r,
                    arr:[r, r+1, r+2, r+3],
                    scl:i
                };
                collection2.save(o);
            } 
            collection1.merge(collection2);
            JSUNIT.assertEquals(collection1.getLength(), 2000);    
        };

        (function() {
            JSUNIT.resetTests();
            JSUNIT.addTest(testCollectionFactory);
            JSUNIT.addTest(testCollectionFactory2);
            JSUNIT.addTest(testCollectionMerge);
            JSUNIT.runTests('Collection tests', Scule.tests.functions.renderTest);
        }());

    }());

    (function() {
  
        function testCollectionMapReduce() {
            Scule.dropAll();
            var collection = Scule.factoryCollection('scule+dummy://unittest');
            for(var i=0; i < 1000; i++) {
                var r = i%10;
                collection.save({
                    a:{
                        b:Scule.global.functions.randomFromTo(1, 10)
                    },
                    bar:'foo'+r,
                    arr:[r, r+1, r+2, r+3],
                    scl:i
                });
            }
            collection.mapReduce(
                function(document, emit) {
                    emit(document.bar, {
                        scl: document.scl
                    });
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
                    JSUNIT.assertEquals(o[0].total, 49500);
                    JSUNIT.assertEquals(o[0].finalized, o[0].key);
                    JSUNIT.assertEquals(o[1].total, 49600);
                    JSUNIT.assertEquals(o[1].finalized, o[1].key);
                    JSUNIT.assertEquals(o[2].total, 49700);
                    JSUNIT.assertEquals(o[2].finalized, o[2].key);
                    JSUNIT.assertEquals(o[3].total, 49800);
                    JSUNIT.assertEquals(o[3].finalized, o[3].key);
                    JSUNIT.assertEquals(o[4].total, 49900);
                    JSUNIT.assertEquals(o[4].finalized, o[4].key);
                    JSUNIT.assertEquals(o[5].total, 50000);
                    JSUNIT.assertEquals(o[5].finalized, o[5].key);
                    JSUNIT.assertEquals(o[6].total, 50100);
                    JSUNIT.assertEquals(o[6].finalized, o[6].key);
                    JSUNIT.assertEquals(o[7].total, 50200);
                    JSUNIT.assertEquals(o[7].finalized, o[7].key);
                    JSUNIT.assertEquals(o[8].total, 50300);
                    JSUNIT.assertEquals(o[8].finalized, o[8].key);
                    JSUNIT.assertEquals(o[9].total, 50400);
                    JSUNIT.assertEquals(o[9].finalized, o[9].key);
                }
                );
        };

        (function() {
            JSUNIT.resetTests();
            JSUNIT.addTest(testCollectionMapReduce);
            JSUNIT.runTests('Map/Reduce tests', Scule.tests.functions.renderTest);
        }());

    }());

    (function() {

        function testQueries() {

            Scule.dropAll();

            var timer = Scule.getTimer();
            var collection = Scule.factoryCollection('scule+dummy://unittest');
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
                        lng: Scule.global.functions.randomFromTo(-130, 130),
                        lat: Scule.global.functions.randomFromTo(-130, 130)
                    }
                };
                collection.save(o);
                if(k == 4) {
                    k = 0;
                }
            }

            timer.startInterval("collection - {i:{$gte:5000}, n:{$lte:80}}");
            collection.count({
                i:{
                    $gte:5000
                }, 
                n:{
                    $lte:80
                }
            }, {}, function(count) {
                var o = collection.findAll();
                var c = 0;
                o.forEach(function(d) {
                    if(d.i >= 5000 && d.n <= 80) {
                        c++;
                    }
                });
                JSUNIT.assertEquals(count, c);
                JSUNIT.assertEquals(count, 5000);
            });
            timer.stopInterval();

            timer.startInterval("collection - {i:{$gte:5000}, n:{$lte:80}}");
            collection.count({
                i:{
                    $gte:5000
                }, 
                n:{
                    $lte:80
                }
            }, {}, function(count) {
                JSUNIT.assertEquals(count, 5000);
            });
            timer.stopInterval();

            timer.startInterval("collection - {i:{$in:[1, 2, 3, 4, 5]}}");
            collection.count({
                i:{
                    $in:[1, 2, 3, 4, 5]
                }
            }, {}, function(count) {
                var o = collection.findAll();
                var c = 0;
                o.forEach(function(d) {
                    if(d.i >= 1 && d.i <= 5) {
                        c++;
                    }
                });
                JSUNIT.assertEquals(count, c);        
                JSUNIT.assertEquals(count, 5);
            });
            timer.stopInterval();

            timer.startInterval("collection - {i:{$in:[1, 2, 3, 4, 5]}}");
            collection.count({
                i:{
                    $in:[1, 2, 3, 4, 5]
                }
            }, {}, function(count) {
                JSUNIT.assertEquals(count, 5);
            });
            timer.stopInterval();

            timer.startInterval("collection - {s:{$size:3}}");
            collection.count({
                s:{
                    $size:3
                }
            }, {}, function(count) {
                var o = collection.findAll();
                var c = 0;
                o.forEach(function(d) {
                    if(d.s.length == 3) {
                        c++;
                    }
                });
                JSUNIT.assertEquals(count, c);         
                JSUNIT.assertEquals(count, 2500);
            });
            timer.stopInterval();

            timer.startInterval("collection - {s:{$size:3}}");
            collection.count({
                s:{
                    $size:3
                }
            }, {}, function(count) {
                JSUNIT.assertEquals(count, 2500);
            });
            timer.stopInterval();

            timer.startInterval("collection - {o:{$size:5}}");
            collection.count({
                o:{
                    $size:5
                }
            }, {}, function(count) {
                var o = collection.findAll();
                var c = 0;
                o.forEach(function(d) {
                    if(Scule.global.functions.sizeOf(d.o) == 5) {
                        c++;
                    }
                });
                JSUNIT.assertEquals(count, c);        
                JSUNIT.assertEquals(count, 10000);
            });
            timer.stopInterval();

            timer.startInterval("collection - {o:{$size:5}}");
            collection.count({
                o:{
                    $size:5
                }
            }, {}, function(count) {
                JSUNIT.assertEquals(count, 10000);
            });
            timer.stopInterval();

            timer.startInterval("collection - {n:{$exists:false}}");
            collection.count({
                n:{
                    $exists:false
                }
            }, {}, function(count) {
                var o = collection.findAll();
                var c = 0;
                o.forEach(function(d) {
                    if(!('n' in d)) {
                        c++;
                    }
                });
                JSUNIT.assertEquals(count, c);        
                JSUNIT.assertEquals(count, 0);
            });
            timer.stopInterval();

            timer.startInterval("collection - {n:{$exists:false}}");
            collection.count({
                n:{
                    $exists:false
                }
            }, {}, function(count) {
                JSUNIT.assertEquals(count, 0);
            });
            timer.stopInterval();

            timer.startInterval("collection - {n:{$exists:true}}");
            collection.count({
                n:{
                    $exists:true
                }
            }, {}, function(count) {
                var o = collection.findAll();
                var c = 0;
                o.forEach(function(d) {
                    if('n' in d) {
                        c++;
                    }
                });
                JSUNIT.assertEquals(count, c);         
                JSUNIT.assertEquals(count, 10000);
            });
            timer.stopInterval();

            timer.startInterval("collection - {n:{$exists:true}}");
            collection.count({
                n:{
                    $exists:true
                }
            }, {}, function(count) {
                JSUNIT.assertEquals(count, 10000);
            });
            timer.stopInterval();

            timer.startInterval("collection - {i:{$gte:70}}");
            collection.count({
                i:{
                    $gte:70
                }
            }, {}, function(count) {
                var o = collection.findAll();
                var c = 0;
                o.forEach(function(d) {
                    if(d.i >= 70) {
                        c++;
                    }
                });
                JSUNIT.assertEquals(count, c);         
                JSUNIT.assertEquals(count, 9930);
            });
            timer.stopInterval();

            timer.startInterval("collection - {i:{$gte:70}}");
            collection.count({
                i:{
                    $gte:70
                }
            }, {}, function(count) {
                JSUNIT.assertEquals(count, 9930);
            });
            timer.stopInterval();

            timer.startInterval("collection - {s:/^T/}");
            collection.count({
                s:/^T/
            }, {}, function(count) {
                var o = collection.findAll();
                var c = 0;
                o.forEach(function(d) {
                    if(/^T/.test(d.s)) {
                        c++;
                    }
                });
                JSUNIT.assertEquals(count, c);         
                JSUNIT.assertEquals(count, 2500);
            });
            timer.stopInterval();

            timer.startInterval("collection - {s:/^T/}");
            collection.count({
                s:/^T/
            }, {}, function(count) {
                JSUNIT.assertEquals(count, 2500);
            });
            timer.stopInterval();

            timer.startInterval("collection - {$or:[{n:{$lt:40}}, {i:{$gt:50}}]}");
            collection.count({
                $or:[{
                    n:{
                        $lt:40
                    }
                }, {
                    i:{
                        $gt:50
                    }
                }]
            }, {}, function(count) {
                var o = collection.findAll();
                var c = 0;
                o.forEach(function(d) {
                    if(d.i > 50 || d.n < 40) {
                        c++;
                    }
                });
                JSUNIT.assertEquals(count, c);        
                JSUNIT.assertEquals(count, 10000);
            });
            timer.stopInterval();

            timer.startInterval("collection - {$or:[{n:{$lt:40}}, {i:{$gt:50}}]}");
            collection.count({
                $or:[{
                    n:{
                        $lt:40
                    }
                }, {
                    i:{
                        $gt:50
                    }
                }]
            }, {}, function(count) {
                JSUNIT.assertEquals(count, 10000);
            });
            timer.stopInterval();

            timer.startInterval("collection - {$or:[{n:{$lt:40}}, {i:{$gt:50}}]}, {$sort:{i:-1}, $limit:30}");
            collection.count({
                $or:[{
                    n:{
                        $lt:40
                    }
                }, {
                    i:{
                        $gt:50
                    }
                }]
            }, {
                $sort:{
                    i:-1
                }, 
                $limit:30
            }, function(count) {
                var o = collection.findAll();
                var c = 0;
                for (var i=0; i < o.length; i++) {
                    var d = o[i];
                    if (d.i > 50 || d.n < 40) {
                        c++;
                    }
                    if (c == 30) {
                        break;
                    }
                }
                JSUNIT.assertEquals(count, c);        
                JSUNIT.assertEquals(count, 30);
            });
            timer.stopInterval();

            timer.startInterval("collection - {$or:[{n:{$lt:40}}, {i:{$gt:50}}]}, {$sort:{i:-1}, $limit:30}");
            collection.count({
                $or:[{
                    n:{
                        $lt:40
                    }
                }, {
                    i:{
                        $gt:50
                    }
                }]
            }, {
                $sort:{
                    i:-1
                }, 
                $limit:30
            }, function(count) {
                JSUNIT.assertEquals(count, 30);
            });
            timer.stopInterval();

            timer.startInterval("collection - {i:{$lte:90}}, {$set:{n:10, s:'Steve'}}");
            collection.update({
                i:{
                    $lte:90
                }
            }, {
                $set:{
                    n:10, 
                    s:'Steve'
                }
            }, {}, false, function(count) {
                var o = collection.findAll();
                var c = 0;
                o.forEach(function(d) {
                    if(d.i <= 90) {
                        c++;
                    }
                });
                JSUNIT.assertEquals(count.length, c);        
                JSUNIT.assertEquals(count.length, 91);
                o = collection.find({i:{$lte:90}});
                o.forEach(function(d) {
                    JSUNIT.assertEquals(10, d.n);
                    JSUNIT.assertEquals('Steve', d.s);
                });
            });
            timer.stopInterval();

            timer.startInterval("collection - {i:10}, {$push:{foo:'bar3'}}");
            collection.update({
                i:10
            }, {
                $push:{
                    foo:'bar3'
                }
            }, {}, true, function(count) {
                var o = collection.findAll();
                var c = 0;
                o.forEach(function(d) {
                    if(d.i == 10) {
                        c++;
                    }
                });
                JSUNIT.assertEquals(count.length, c);         
                JSUNIT.assertEquals(count.length, 1);
                var o = collection.find({i:10});
                o.forEach(function(d) {
                    JSUNIT.assertEquals('bar3', d.foo[d.foo.length - 1]);
                });                
            });
            timer.stopInterval();

            timer.startInterval("collection - {i:10}, {$pushAll:{foo:['bar3', 'bar4']}}");
            collection.update({
                i:10
            }, {
                $pushAll:{
                    foo:['bar3', 'bar4']
                }
            }, {}, false, function(count) {
                JSUNIT.assertEquals(count.length, 1);
                var o = collection.find({i:10});
                o.forEach(function(d) {
                    JSUNIT.assertEquals('bar4', d.foo[d.foo.length - 1]);
                    JSUNIT.assertEquals('bar3', d.foo[d.foo.length - 2]);
                });
            });
            timer.stopInterval();

            var exception = false;
            try {
                collection.save({test:null});
            } catch (e) {
                exception = true;
            }
            JSUNIT.assertEquals(false, exception);

        };

        function testTicket14a() {

            var collection = Scule.factoryCollection('scule+dummy://test', {
                secret:'mysecretkey'
            });

            for (var i=0; i < 1000; i++) {
                collection.save({
                    _id:i, 
                    index:i, 
                    remainder:(i%10)
                });
            }

            collection.update({_id:500}, {$set:{index:1909, foo:'bar'}}, {}, true);
            collection.commit();

            var o = collection.findOne(500);    
            
            JSUNIT.assertEquals(1909, o.index);
            JSUNIT.assertEquals('bar', o.foo);
            JSUNIT.assertEquals(500, o._id.id);

        };

        function testTicket14b() {

            var collection = Scule.factoryCollection('scule+dummy://test', {
                secret:'mysecretkey'
            });
            collection.clear();
            collection.save({
                _id: 1, 
                a: 10
            });

            collection.update({_id:1}, {$set:{a:20, b:50}}, {}, true);
            collection.commit();

            var o = collection.findOne(1);
            JSUNIT.assertEquals(1, o._id.id);
            JSUNIT.assertEquals(20, o.a);
            JSUNIT.assertEquals(50, o.b);

        };

        function testTicket22() {

            Scule.dropAll();
            var collection = Scule.factoryCollection('scule+dummy://test', {
                secret:'mysecretkey'
            });
            collection.clear();
            
            for (var i=0; i < 1000; i++) {
                collection.save({a:'test' + i});
            }

            var i;
            for (i=0; i < 100; i++) {
                JSUNIT.assertEquals(111, collection.count({a:/test[1]/g}));
            }
            for (i=0; i < 100; i++) {
                JSUNIT.assertEquals(333, collection.count({a:/test[1-3]/g}));
            }
            for (i=0; i < 100; i++) {
                JSUNIT.assertEquals(100, collection.count({a:/test([1-9][0-9]?$|100$)/g}));
            }

        };

        function testDateComparator() {

            var comparator = Scule.getDateComparator();
            
            JSUNIT.assertEquals(true, comparator.isDate(new Date()));
            JSUNIT.assertEquals(true, comparator.isDate(Scule.getObjectDate()));
            JSUNIT.assertEquals(false, comparator.isDate(1372395600));

            JSUNIT.assertEquals(1372395600000, comparator.normalizeDate(new Date(1372395600 * 1000)));
            JSUNIT.assertEquals(1372395600000, comparator.normalizeDate(Scule.getObjectDate(1372395600, 0)));

            JSUNIT.assertEquals(true, comparator.$eq(new Date(1372395600 * 1000), new Date(1372395600 * 1000)));
            JSUNIT.assertEquals(true, comparator.$eq(new Date(1372395600 * 1000), Scule.getObjectDate(1372395600, 0)));
            JSUNIT.assertEquals(true, comparator.$eq(Scule.getObjectDate(1372395600, 0), new Date(1372395600 * 1000)));
            JSUNIT.assertEquals(true, comparator.$eq(Scule.getObjectDate(1372395600, 0), Scule.getObjectDate(1372395600, 0)));

            JSUNIT.assertEquals(true, comparator.$gt(new Date(1372395630 * 1000), new Date(1372395600 * 1000)));
            JSUNIT.assertEquals(true, comparator.$gt(new Date(1372395630 * 1000), Scule.getObjectDate(1372395600, 0)));
            JSUNIT.assertEquals(true, comparator.$gt(Scule.getObjectDate(1372395600, 300), new Date(1372395600 * 1000)));
            JSUNIT.assertEquals(true, comparator.$gt(Scule.getObjectDate(1372395600, 300), Scule.getObjectDate(1372395600, 0)));

            JSUNIT.assertEquals(false, comparator.$gt(new Date(1372395600 * 1000), new Date(1372395630 * 1000)));
            JSUNIT.assertEquals(false, comparator.$gt(new Date(1372395600 * 1000), Scule.getObjectDate(1372395630, 300)));
            JSUNIT.assertEquals(false, comparator.$gt(Scule.getObjectDate(1372395600, 0), new Date(1372395600 * 1000)));
            JSUNIT.assertEquals(false, comparator.$gt(Scule.getObjectDate(1372395600, 0), Scule.getObjectDate(1372395600, 300)));

            JSUNIT.assertEquals(true, comparator.$gte(new Date(1372395600 * 1000), new Date(1372395600 * 1000)));
            JSUNIT.assertEquals(true, comparator.$gte(new Date(1372395630 * 1000), Scule.getObjectDate(1372395600, 0)));
            JSUNIT.assertEquals(true, comparator.$gte(Scule.getObjectDate(1372395600, 300), new Date(1372395600 * 1000)));
            JSUNIT.assertEquals(true, comparator.$gte(Scule.getObjectDate(1372395600, 300), Scule.getObjectDate(1372395600, 0)));

            JSUNIT.assertEquals(false, comparator.$gte(new Date(1372395600 * 1000), new Date(1372395630 * 1000)));
            JSUNIT.assertEquals(false, comparator.$gte(new Date(1372395600 * 1000), Scule.getObjectDate(1372395630, 300)));
            JSUNIT.assertEquals(true,  comparator.$gte(Scule.getObjectDate(1372395600, 0), new Date(1372395600 * 1000)));
            JSUNIT.assertEquals(false, comparator.$gte(Scule.getObjectDate(1372395600, 0), Scule.getObjectDate(1372395600, 300)));

        };

        function testQueryEngine() {

            var engine = Scule.getQueryEngine();

            JSUNIT.assertEquals(true, engine.$eq(new Date(1372395600 * 1000), new Date(1372395600 * 1000)));
            JSUNIT.assertEquals(true, engine.$eq(new Date(1372395600 * 1000), Scule.getObjectDate(1372395600, 0)));
            JSUNIT.assertEquals(true, engine.$eq(Scule.getObjectDate(1372395600, 0), new Date(1372395600 * 1000)));
            JSUNIT.assertEquals(true, engine.$eq(Scule.getObjectDate(1372395600, 0), Scule.getObjectDate(1372395600, 0)));
            JSUNIT.assertEquals(false, engine.$eq(Scule.getObjectDate(1372395600, 300), Scule.getObjectDate(1372395600, 0)));
            JSUNIT.assertEquals(false, engine.$eq(new Date(1372395631 * 1000), Scule.getObjectDate(1372395630, 0)));

            JSUNIT.assertEquals(true, engine.$eq(3, 3));
            JSUNIT.assertEquals(true, engine.$eq(0, 0));
            JSUNIT.assertEquals(true, engine.$eq(-3, -3));
            JSUNIT.assertEquals(true, engine.$eq(null, null));
            JSUNIT.assertEquals(true, engine.$eq('a', 'a'));
            JSUNIT.assertEquals(true, engine.$eq('abc', 'abc'));
            JSUNIT.assertEquals(true, engine.$eq('abc', /^abc$/));
            JSUNIT.assertEquals(false, engine.$eq(3, 0));
            JSUNIT.assertEquals(false, engine.$eq('a', 'b'));
            JSUNIT.assertEquals(false, engine.$eq('bac', 'abc'));
            JSUNIT.assertEquals(false, engine.$eq('cac', /^abc$/));

            JSUNIT.assertEquals(false, engine.$ne(new Date(1372395600 * 1000), new Date(1372395600 * 1000)));
            JSUNIT.assertEquals(false, engine.$ne(new Date(1372395600 * 1000), Scule.getObjectDate(1372395600, 0)));
            JSUNIT.assertEquals(false, engine.$ne(Scule.getObjectDate(1372395600, 0), new Date(1372395600 * 1000)));
            JSUNIT.assertEquals(false, engine.$ne(Scule.getObjectDate(1372395600, 0), Scule.getObjectDate(1372395600, 0)));
            JSUNIT.assertEquals(true, engine.$ne(Scule.getObjectDate(1372395600, 300), Scule.getObjectDate(1372395600, 0)));
            JSUNIT.assertEquals(true, engine.$ne(new Date(1372395631 * 1000), Scule.getObjectDate(1372395630, 0)));

            JSUNIT.assertEquals(false, engine.$ne(3, 3));
            JSUNIT.assertEquals(false, engine.$ne(0, 0));
            JSUNIT.assertEquals(false, engine.$ne(-3, -3));
            JSUNIT.assertEquals(false, engine.$ne(null, null));
            JSUNIT.assertEquals(false, engine.$ne('a', 'a'));
            JSUNIT.assertEquals(false, engine.$ne('abc', 'abc'));
            JSUNIT.assertEquals(false, engine.$ne('abc', /^abc$/));
            JSUNIT.assertEquals(true, engine.$ne(3, 0));
            JSUNIT.assertEquals(true, engine.$ne('a', 'b'));
            JSUNIT.assertEquals(true, engine.$ne('bac', 'abc'));
            JSUNIT.assertEquals(true, engine.$ne('cac', /^abc$/));    

            JSUNIT.assertEquals(true, engine.$in(1, [2, 3, 1, 5]));
            JSUNIT.assertEquals(true, engine.$in('a', [2, 'c', 'a', 3, 1, 5]));
            JSUNIT.assertEquals(true, engine.$in(null, [2, null, 3, 1, 5]));
            JSUNIT.assertEquals(true, engine.$in('abc', [2, null, 3, /^ab/, 5]));
            JSUNIT.assertEquals(true, engine.$in(Scule.getObjectDate(1372395600, 0), [2, new Date(1372395600 * 1000), 3, 1, 5]));
            JSUNIT.assertEquals(true, engine.$in(Scule.getObjectDate(1372395600, 0), [2, Scule.getObjectDate(1372395600, 0), 3, 1, 5]));
            JSUNIT.assertEquals(true, engine.$in(new Date(1372395600 * 1000), [2, new Date(1372395600 * 1000), 3, 1, 5]));

            JSUNIT.assertEquals(false, engine.$nin(1, [2, 3, 1, 5]));
            JSUNIT.assertEquals(false, engine.$nin('a', [2, 'c', 'a', 3, 1, 5]));
            JSUNIT.assertEquals(false, engine.$nin(null, [2, null, 3, 1, 5]));
            JSUNIT.assertEquals(false, engine.$nin('abc', [2, null, 3, /^ab/, 5]));
            JSUNIT.assertEquals(false, engine.$nin(Scule.getObjectDate(1372395600, 0), [2, new Date(1372395600 * 1000), 3, 1, 5]));
            JSUNIT.assertEquals(false, engine.$nin(Scule.getObjectDate(1372395600, 0), [2, Scule.getObjectDate(1372395600, 0), 3, 1, 5]));
            JSUNIT.assertEquals(false, engine.$nin(new Date(1372395600 * 1000), [2, new Date(1372395600 * 1000), 3, 1, 5]));

        };

        function testTicket26() {

            Scule.dropAll();
            var o = null;
            var collection = Scule.factoryCollection('scule+dummy://test');
            collection.clear();
            collection.save({date:Scule.getObjectDate(1372603560, 212), id:1});
            collection.save({date:Scule.getObjectDateFromDate((new Date(1362395600 * 1000))), id:2});
            collection.commit();
            collection.update({id:1}, {$set:{zero:0}}, {}, true);

            o = collection.find({date:{$gt:(new Date(1372395600 * 1000))}});
            JSUNIT.assertEquals(1, o.length);
            JSUNIT.assertEquals(1, o[0].id);
            JSUNIT.assertEquals(1372603560212, o[0].date.toDate().getTime());

            o = collection.find({date:{$gt:Scule.getObjectDateFromDate((new Date(1362395600 * 1000)))}});
            JSUNIT.assertEquals(1, o.length);
            JSUNIT.assertEquals(1, o[0].id);
            JSUNIT.assertEquals(1372603560212, o[0].date.toDate().getTime());

            o = collection.find({date:{$eq:Scule.getObjectDateFromDate(new Date(1362395600000))}});
            JSUNIT.assertEquals(1, o.length);
            JSUNIT.assertEquals(2, o[0].id);
            JSUNIT.assertEquals(1362395600000, o[0].date.toDate().getTime());

        };

        function testTicket29() {

            var ht = Scule.getHashTable();
            ht.put('hasOwnProperty', true);
            ht.put('bar', 'foo');
            JSUNIT.assertEquals(null, ht.get('foo'));    
            JSUNIT.assertEquals(null, ht.search('foo'));    
            JSUNIT.assertEquals(false, ht.contains('foo'));
            JSUNIT.assertEquals(true, ht.contains('hasOwnProperty'));
            JSUNIT.assertEquals(true, ht.get('hasOwnProperty'));
            JSUNIT.assertEquals(true, ht.contains('bar'));
            JSUNIT.assertEquals('foo', ht.get('bar'));
            JSUNIT.assertEquals(2, ht.getKeys().length);
            JSUNIT.assertEquals('[true,"foo"]', JSON.stringify(ht.getValues()));

        };

        function testTicket32() {
            
            Scule.dropAll();
            var collection1 = Scule.factoryCollection('scule+local://ticket32', {'secret':'test'});
            collection1.clear();
            for (var i=0; i < 100; i++) {
                collection1.save({i: i});
            }
            collection1.commit();
            
            setTimeout(function() {
                var storage     = Scule.getLocalStorageStorageEngine({'secret':'test'});
                var collection2 = new Scule.db.classes.Collection('ticket32');
                collection2.setStorageEngine(storage);
                collection2.open(function() {
                    collection2.findAll(function(o) {
                        JSUNIT.assertEquals(100, o.length);	
                    });                
                });
            }, 100);
            
        };

        function testTicket6() {
            Scule.dropAll();
            var a = [];
            var collection = Scule.factoryCollection('scule+dummy://test');
            for (var i=0; i < 100; i++) {
                var o = {i: i};
                collection.save(o);
                a.push(o);
            }

            var o = null;
            o = collection.find({}, {$skip:5});
            JSUNIT.assertEquals(95, o.length);
            JSUNIT.assertEquals(o[0].i, a[5].i);

            o = collection.find({}, {$skip:5, $limit:10});
            JSUNIT.assertEquals(10, o.length);
            JSUNIT.assertEquals(o[0].i, a[5].i);
            JSUNIT.assertEquals(o[9].i, a[14].i);

            o = collection.find({}, {$skip:5, $limit:10, $sort:{i:-1}});
            JSUNIT.assertEquals(10, o.length);
            JSUNIT.assertEquals(o[0].i, a[94].i);
            JSUNIT.assertEquals(o[9].i, a[85].i);

            o = collection.find({}, {$skip:100});
            JSUNIT.assertEquals(o.length, 0);

            o = collection.find({i:{$gte:50}}, {$skip:30});
            JSUNIT.assertEquals(o.length, 20);
            JSUNIT.assertEquals(o[0].i, a[80].i);
            JSUNIT.assertEquals(o[19].i, a[99].i);            
        };

        function testTicket33a() {
            var lastNames = ['Edgar', 'Adams', 'Jones', 'Bryan', 'Smith', 'Doe', 'Lennard', 'Turkish', 'Allan', 'Collins'];
            Scule.dropAll();
            var collection = Scule.factoryCollection('scule+dummy://ticket33');
            collection.clear();
            for (var i=0; i < 100; i++) {
                var o = {
                    position: i,
                    last_name: lastNames[Math.floor((i/10))]
                };
                collection.save(o);
            }
            var a = ["Adams","Adams","Adams","Adams","Adams","Adams","Adams","Adams","Adams","Adams","Bryan","Edgar","Edgar","Edgar","Edgar"];
            collection.find({position:{$lte:30}}, {$sort:{last_name:2}, $limit:15}, function(players) {
                for (var i=0; i < players.length; i++) {
                    JSUNIT.assertEquals(a[i], players[i].last_name);
                }
            });            
        };

        function testTicket33b() {
            var lastNames = ['Edgar', 'Adams', 'Jones', 'Bryan', 'Smith', 'Doe', 'Lennard', 'Turkish', 'Allan', 'Collins'];
            Scule.dropAll();
            var collection = Scule.factoryCollection('scule+dummy://ticket33');
            collection.clear();
            for (var i=0; i < 100; i++) {
                var o = {
                    position: i,
                    last_name: lastNames[Math.floor((i/10))]
                };
                collection.save(o);
            }
            var a = [];
            collection.find({position:{$lte:60}}, {$sort:{last_name:2}, $limit:30}, function(players) {
                for (var i=0; i < players.length; i++) {
                    a.push(players[i].position);
                }
            });
            collection.find({position:{$lte:60}}, {$sort:{last_name:2}, $skip:15, $limit:15}, function(players) {
                for (var i=0; i < players.length; i++) {
                    JSUNIT.assertEquals(a[i+15], players[i].position);
                }
            });            
        };

        (function() {
            JSUNIT.resetTests();
            JSUNIT.addTest(testDateComparator);            
            JSUNIT.addTest(testQueryEngine);
            JSUNIT.addTest(testQueries);
            JSUNIT.addTest(testTicket6);
            JSUNIT.addTest(testTicket14a);
            JSUNIT.addTest(testTicket14b);
            JSUNIT.addTest(testTicket22);
            JSUNIT.addTest(testTicket26);
            JSUNIT.addTest(testTicket29);
            JSUNIT.addTest(testTicket32);
            JSUNIT.addTest(testTicket33a);
            JSUNIT.addTest(testTicket33b);
            JSUNIT.runTests('Query tests', Scule.tests.functions.renderTest);
        }());    
       
    }());

};