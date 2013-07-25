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
    it('should push a value onto an array if it is not null', function() {
        var a = [];
        Scule.global.functions.pushIfNotNull(a, 'foo');
        Scule.global.functions.pushIfNotNull(a, null);
        Scule.global.functions.pushIfNotNull(a, 'bar');
        assert.equal(2, a.length);
        assert.equal('foo', a[0]);
        assert.equal('bar', a[1]);
    });
    it('should push a value from an object onto an array if the key exists', function() {
        var a = [];
        var o = {'foo':'bar'};
        Scule.global.functions.pushIfExists(a, o, 'foo');
        Scule.global.functions.pushIfExists(a, o, 'bar');
        assert.equal(1, a.length);
        assert.equal('bar', a[0]);        
    });
    it('should return the value in an object mapped to the provided key, or a default', function() {
        var o = {'foo':'bar'};
        assert.equal('bar', Scule.global.functions.getObjectAttribute(o, 'foo', 'test'));
        assert.equal('test', Scule.global.functions.getObjectAttribute(o, 'bar', 'test'));
    });
    it('should extract all key => value pairs where the value is true', function() {
        var o = {
            'foo':true,
            'bar':false,
            'lol':true,
            '$bar':true
        };
        assert.equal('{"foo":true,"lol":true}', JSON.stringify(Scule.global.functions.extractTrueValues(o)));
    });
    it('should return a list of all unique values in an array', function() {
        var a = ['foo', 'bar', 'lol', 'bar', 2, 3, 4, 2];
        assert.equal('["foo","bar","lol",2,3,4]', JSON.stringify(Scule.global.functions.unique(a)));
    });
    it('should compare one value with another', function() {
        assert.equal(Scule.global.functions.compare(1, 1), 0);
        assert.equal(Scule.global.functions.compare(2, 1), 1);
        assert.equal(Scule.global.functions.compare(1, 2), -1);        
    });
    it('should compare two arrays', function() {
        assert.equal(Scule.global.functions.compareArray([[1, 2, 3], 2, 3], [[1, 2, 3], 2, 3]), 0);
        assert.equal(Scule.global.functions.compareArray([[2, 2, 3], 2, 3], [[1, 2, 3], 2, 3]), 1);
        assert.equal(Scule.global.functions.compareArray([[1, 2, 3], 2, 3], [[2, 2, 3], 2, 3]), -1);
        assert.equal(Scule.global.functions.compareArray([1, 2, 3], [1, 2, 3]), 0);
        assert.equal(Scule.global.functions.compareArray([2, 2, 3], [1, 2, 3]), 1);
        assert.equal(Scule.global.functions.compareArray([1, 2, 3], [3, 2, 3]), -1);        
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
    });
    it('should return the values in an object', function() {
        assert.equal(JSON.stringify(["foo1","bar1"]), JSON.stringify(Scule.global.functions.objectValues({"foo":"foo1","bar":"bar1"})));
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
    it('should search an object using a dot notated address', function() {
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
        composite = Scule.global.functions.searchObject(keys, object);
        assert.equal(composite[0], 10);
        assert.equal(composite[1], 'foo');
        assert.equal(composite[2], 11);

        keys.e.f = {'2':true};
        keys.f = true;
        composite = Scule.global.functions.searchObject(keys, object);
        assert.equal(composite[0], 10);
        assert.equal(composite[1], 'foo');
        assert.equal(composite[2], 23);  
        assert.equal(composite[3], 12);
        assert.equal(composite[3] == 33, false);        
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
});