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

var assert = require('assert');
var Scule = require('../lib/com.scule');

describe('functions', function() {
    it('should compare one value with another', function() {
        assert.equal(Scule.global.functions.compare(1, 1), 0);
        assert.equal(Scule.global.functions.compare(2, 1), 1);
        assert.equal(Scule.global.functions.compare(1, 2), -1);        
    });
    it('should generate a random number between 10 and 30', function() {
        var e = Scule.global.functions.randomFromTo(10, 30);  
        assert.equal(e >= 10 && e <= 30, true);          
    });
    it('should test whether or not a variable references an array', function() {
        assert.equal(Scule.global.functions.isArray([1, 2, 3, 4, 5]), true);
        assert.equal(Scule.global.functions.isArray({
            foo:'bar'
        }), false); 
        assert.equal(Scule.global.functions.isArray(1), false);
        assert.equal(Scule.global.functions.isArray('testing'), false);        
    });
    it('should return the keys in an object', function() {
        assert.equal(JSON.stringify(["foo","bar"]), JSON.stringify(Scule.global.functions.objectKeys({"foo":true, "bar":true})));
        var o = new RegExp(/abc/);
        o.foo = true;
        assert.equal(JSON.stringify(["foo"]), JSON.stringify(Scule.global.functions.objectKeys(o)));
    });
    it('should return the number of keys in the provided object', function() {
        assert.equal(Scule.global.functions.sizeOf({
            foo:'bar',
            bar:'foo'
        }), 2);
        assert.equal(Scule.global.functions.sizeOf([1, 2, 3]), 3);
    });
    it('should shuffle the values in an array', function() {
        var a = [1, 2, 3, 4, 5, 6, 7];
        var b = [1, 2, 3, 4, 5, 6, 7];
        assert.equal(JSON.stringify(a), JSON.stringify(b));
        Scule.global.functions.shuffle(b);
        assert.equal((JSON.stringify(a) == JSON.stringify(b)), false);        
    });
    it('should clone an object', function() {
        var o = {
            foo:'bar',
            bar:'foo',
            a:[1,2,3,4],
            b:{
                foo2:'bar2'
            },
            r:/foo.*/g
        };
        assert.equal(JSON.stringify(o), JSON.stringify(Scule.global.functions.cloneObject(o)));        
    });
    it('should test whether or not a series of values are integers', function() {
        assert.equal(Scule.global.functions.isInteger(5), true);
        assert.equal(false, Scule.global.functions.isInteger(10.232));
        assert.equal(false, Scule.global.functions.isInteger("foo"));
        assert.equal(true, Scule.global.functions.isInteger("5"));
        assert.equal(false, Scule.global.functions.isInteger({
            foo:"bar"
        }));        
    });
    it('should test whether or not a series of values are scalar', function() {
        assert.equal(true, Scule.global.functions.isScalar(5));
        assert.equal(true, Scule.global.functions.isScalar(10.232));
        assert.equal(true, Scule.global.functions.isScalar("foo"));
        assert.equal(true, Scule.global.functions.isScalar("5"));
        assert.equal(false, Scule.global.functions.isScalar({
            foo:"bar"
        }));
        assert.equal(false, Scule.global.functions.isScalar([1,2,3,4,5]));            
    });
    it('should traverse the provided object', function() {
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
        var result = Scule.global.functions.traverseObject({f:true}, object);
        assert.equal('{"a":10,"c":{"d":"foo"},"e":{"f":[11,12,23,33]},"f":12}', JSON.stringify(result[1]));
        assert.equal(result[0], 'f');
        result = Scule.global.functions.traverseObject({e:{f:true}}, object);
        assert.equal('{"f":[11,12,23,33]}', JSON.stringify(result[1]));
        assert.equal(result[0], 'f');
        result = Scule.global.functions.traverseObject({e:{z:true}}, object);
        assert.equal('{"f":[11,12,23,33]}', JSON.stringify(result[1]));
        assert.equal(result[0], 'z');
        result = Scule.global.functions.traverseObject({e:{f:{'*':true}}}, object);
        assert.equal('["*",[11,12,23,33]]', JSON.stringify(result));        
    });
    it('should test whether or not an object contains a given key', function() {
        var o = {
            foo:true
        }
        assert.equal(true, Scule.global.functions.contains(o, 'foo'));
        assert.equal(false, Scule.global.functions.contains(o, 'bar'));
    });
    it('should test if a variable represents a double wide number', function() {
        assert.equal(false, Scule.global.functions.isDouble('foo'));
        assert.equal(false, Scule.global.functions.isDouble([1, 2, 3]));
        assert.equal(false, Scule.global.functions.isDouble({foo:'bar'}));
        assert.equal(true, Scule.global.functions.isDouble(2));
        assert.equal(true, Scule.global.functions.isDouble(2.2));
    });
    it('should trim whitespace off a string', function() {
        assert.equal('', Scule.global.functions.trim('   '));
        assert.equal('foo', Scule.global.functions.trim('foo '));
        assert.equal('foo', Scule.global.functions.trim('  foo '));
        assert.equal('foo', Scule.global.functions.trim(' foo'));
        assert.equal('foo', Scule.global.functions.trim("foo\n"));
        assert.equal('foo', Scule.global.functions.trim('foo\t'));
        assert.equal('foo', Scule.global.functions.trim('foo\t\n'));
        assert.equal('foo', Scule.global.functions.trim('foo'));
    });
    it('should sort the keys in a dictionary', function() {
        var o = {
            z:true,
            b:true,
            a:true,
            c:true
        }
        o = Scule.global.functions.sortObjectKeys(o);
        assert.equal('{"a":true,"b":true,"c":true,"z":true}', JSON.stringify(o));
    });
    it('should sort the keys in a dictionary, placing dollar prefixed keys at the end', function() {
        var o = {
            z:true,
            b:true,
            $a:true,
            c:true
        }
        o = Scule.global.functions.sortObjectKeys(o);
        assert.equal('{"b":true,"c":true,"z":true,"$a":true}', JSON.stringify(o));
    });
    it('should parse an attribute string to a corresponding data structure', function() {
        var o = Scule.global.functions.parseAttributes('a.b,c.d.e');
        assert.equal('{"a":{"b":true},"c":{"d":{"e":true}}}', JSON.stringify(o));
    });
    it("should retrieve a single attribute from an object given a path statement (e.g 'a.b')", function() {
        var o = {
            a: {
                b: {
                    c:'foo'
                }
            }
        };
        assert.equal('foo', Scule.global.functions.traverse('a.b.c', o));
        assert.equal('{"c":"foo"}', JSON.stringify(Scule.global.functions.traverse('a.b', o)));
        assert.equal(null, Scule.global.functions.traverse('a.b.c.d', o));
        assert.equal(undefined, Scule.global.functions.traverse('a.b.c.d', undefined));
    });
    it('should sort an array of objects in descending order', function() {
        var get = function() {
            var a = [];
            for (var i=0; i < 100; i++) {
                a.push({'key':i});
            }
            return a;
        };
        var a = get();
        Scule.global.functions.sort(-1, a, 'key');
        for (var i=0; i < 100; i++) {
            assert.equal(i, 99 - a[i].key);
        }
    });
    it('should sort an array of objects in reverse order', function() {
        var get = function() {
            var a = [];
            for (var i=0; i < 100; i++) {
                a.push({'key':i});
            }
            return a;
        };
        var a = get();
        Scule.global.functions.sort(3, a, 'key');
        for (var i=0; i < 100; i++) {
            assert.equal(i, 99 - a[i].key);
        }
    });
    it('should sort an array of objects in ascending order', function() {
        var get = function() {
            var a = [];
            for (var i=0; i < 100; i++) {
                a.push({'key':i});
            }
            return a;
        };
        var a = get();
        Scule.global.functions.sort(1, a, 'key');
        for (var i=0; i < 100; i++) {
            assert.equal(i, a[i].key);
        }
    });
    it('should sort an array of objects in alphabetical order', function() {
        var get = function() {
            return [{k:'c'},{k:'a'},{k:'b'},{k:'d'},{k:'c'}];
        };
        var a = get();
        Scule.global.functions.sort(2, a, 'k');
        assert.equal(a[0].k, 'a');
        assert.equal(a[1].k, 'b');
        assert.equal(a[2].k, 'c');
        assert.equal(a[3].k, 'c');
        assert.equal(a[4].k, 'd');
    });    
});