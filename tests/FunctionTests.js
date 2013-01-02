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

var sculedb = require('../lib/com.scule.functions');
var jsunit = require('../lib/com.scule.jsunit');

function testCompare() {
    jsunit.assertEquals(sculedb.Scule.functions.compare(1, 1), 0);
    jsunit.assertEquals(sculedb.Scule.functions.compare(2, 1), 1);
    jsunit.assertEquals(sculedb.Scule.functions.compare(1, 2), -1);
};

function testArrayCompare() {
    jsunit.assertEquals(sculedb.Scule.functions.compareArray([[1, 2, 3], 2, 3], [[1, 2, 3], 2, 3]), 0);
    jsunit.assertEquals(sculedb.Scule.functions.compareArray([[2, 2, 3], 2, 3], [[1, 2, 3], 2, 3]), 1);
    jsunit.assertEquals(sculedb.Scule.functions.compareArray([[1, 2, 3], 2, 3], [[2, 2, 3], 2, 3]), -1);
    jsunit.assertEquals(sculedb.Scule.functions.compareArray([1, 2, 3], [1, 2, 3]), 0);
    jsunit.assertEquals(sculedb.Scule.functions.compareArray([2, 2, 3], [1, 2, 3]), 1);
    jsunit.assertEquals(sculedb.Scule.functions.compareArray([1, 2, 3], [3, 2, 3]), -1);
};

function testRandomFromTo() {
    var e = sculedb.Scule.functions.randomFromTo(10, 30);  
    jsunit.assertTrue(e >= 10 && e <= 30);  
};

function testIsArray() {
    jsunit.assertTrue(sculedb.Scule.functions.isArray([1, 2, 3, 4, 5]));
    jsunit.assertFalse(sculedb.Scule.functions.isArray({
        foo:'bar'
    })); 
    jsunit.assertFalse(sculedb.Scule.functions.isArray(1));
    jsunit.assertFalse(sculedb.Scule.functions.isArray('testing'));
};

function testSizeOf() {
    jsunit.assertEquals(sculedb.Scule.functions.sizeOf({
        foo:'bar',
        bar:'foo'
    }), 2);  
};

function testShuffle() {
    var a = [1, 2, 3, 4, 5, 6, 7];
    var b = [1, 2, 3, 4, 5, 6, 7];
    jsunit.assertEquals(JSON.stringify(a), JSON.stringify(b));
    sculedb.Scule.functions.shuffle(b);
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
    jsunit.assertEquals(JSON.stringify(o), JSON.stringify(sculedb.Scule.functions.cloneObject(o)));
}

function testIsInteger() {
    jsunit.assertTrue(sculedb.Scule.functions.isInteger(5));
    jsunit.assertFalse(sculedb.Scule.functions.isInteger(10.232));
    jsunit.assertFalse(sculedb.Scule.functions.isInteger("foo"));
    jsunit.assertTrue(sculedb.Scule.functions.isInteger("5"));
    jsunit.assertFalse(sculedb.Scule.functions.isInteger({
        foo:"bar"
    }));
};

function testIsScalar() {
    jsunit.assertTrue(sculedb.Scule.functions.isScalar(5));
    jsunit.assertTrue(sculedb.Scule.functions.isScalar(10.232));
    jsunit.assertTrue(sculedb.Scule.functions.isScalar("foo"));
    jsunit.assertTrue(sculedb.Scule.functions.isScalar("5"));
    jsunit.assertFalse(sculedb.Scule.functions.isScalar({
        foo:"bar"
    }));
    jsunit.assertFalse(sculedb.Scule.functions.isScalar([1,2,3,4,5]));    
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
    composite = sculedb.Scule.functions.searchObject(keys, object);
    jsunit.assertEquals(composite[0], 10);
    jsunit.assertEquals(composite[1], 'foo');
    jsunit.assertEquals(composite[2], 11);
    
    keys.e.f = {'2':true};
    keys.f = true;
    composite = sculedb.Scule.functions.searchObject(keys, object);
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
    var result = sculedb.Scule.functions.traverseObject({f:true}, object);
    jsunit.assertEquals('{"a":10,"c":{"d":"foo"},"e":{"f":[11,12,23,33]},"f":12}', JSON.stringify(result[1]));
    jsunit.assertEquals(result[0], 'f');
    result = sculedb.Scule.functions.traverseObject({e:{f:true}}, object);
    jsunit.assertEquals('{"f":[11,12,23,33]}', JSON.stringify(result[1]));
    jsunit.assertEquals(result[0], 'f');
    result = sculedb.Scule.functions.traverseObject({e:{z:true}}, object);
    jsunit.assertEquals('{"f":[11,12,23,33]}', JSON.stringify(result[1]));
    jsunit.assertEquals(result[0], 'z');
};

(function() {
    jsunit.resetTests(__filename);
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