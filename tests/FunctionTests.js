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

exports['test Compare'] = function(beforeExit, assert) {
    assert.equal(sculedb.Scule.functions.compare(1, 1), 0);
    assert.equal(sculedb.Scule.functions.compare(2, 1), 1);
    assert.equal(sculedb.Scule.functions.compare(1, 2), -1);
};

exports['test ArrayCompare'] = function(beforeExit, assert) {
    assert.equal(sculedb.Scule.functions.compareArray([[1, 2, 3], 2, 3], [[1, 2, 3], 2, 3]), 0);
    assert.equal(sculedb.Scule.functions.compareArray([[2, 2, 3], 2, 3], [[1, 2, 3], 2, 3]), 1);
    assert.equal(sculedb.Scule.functions.compareArray([[1, 2, 3], 2, 3], [[2, 2, 3], 2, 3]), -1);
    assert.equal(sculedb.Scule.functions.compareArray([1, 2, 3], [1, 2, 3]), 0);
    assert.equal(sculedb.Scule.functions.compareArray([2, 2, 3], [1, 2, 3]), 1);
    assert.equal(sculedb.Scule.functions.compareArray([1, 2, 3], [3, 2, 3]), -1);
};

exports['test RandomFromTo'] = function(beforeExit, assert) {
    var e = sculedb.Scule.functions.randomFromTo(10, 30);  
    assert.equal(e >= 10 && e <= 30, true);  
};

exports['test IsArray'] = function(beforeExit, assert) {
    assert.equal(sculedb.Scule.functions.isArray([1, 2, 3, 4, 5]), true);
    assert.equal(sculedb.Scule.functions.isArray({
        foo:'bar'
    }), false); 
    assert.equal(sculedb.Scule.functions.isArray(1), false);
    assert.equal(sculedb.Scule.functions.isArray('testing'), false);
};

exports['test SizeOf'] = function(beforeExit, assert) {
    assert.equal(sculedb.Scule.functions.sizeOf({
        foo:'bar',
        bar:'foo'
    }), 2);  
};

exports['test Shuffle'] = function(beforeExit, assert) {
    var a = [1, 2, 3, 4, 5, 6, 7];
    var b = [1, 2, 3, 4, 5, 6, 7];
    assert.equal(JSON.stringify(a), JSON.stringify(b));
    sculedb.Scule.functions.shuffle(b);
    assert.equal((JSON.stringify(a) == JSON.stringify(b)), false);  
};

exports['test CloneObject'] = function(beforeExit, assert) {
    var o = {
        foo:'bar',
        bar:'foo',
        a:[1,2,3,4],
        b:{
            foo2:'bar2'
        }
    };
    assert.equal(JSON.stringify(o), JSON.stringify(sculedb.Scule.functions.cloneObject(o)));
}

exports['test IsInteger'] = function(beforeExit, assert) {
    assert.equal(sculedb.Scule.functions.isInteger(5), true);
    assert.equal(false, sculedb.Scule.functions.isInteger(10.232));
    assert.equal(false, sculedb.Scule.functions.isInteger("foo"));
    assert.equal(true, sculedb.Scule.functions.isInteger("5"));
    assert.equal(false, sculedb.Scule.functions.isInteger({
        foo:"bar"
    }));
};

exports['test IsScalar'] = function(beforeExit, assert) {
    assert.equal(true, sculedb.Scule.functions.isScalar(5));
    assert.equal(true, sculedb.Scule.functions.isScalar(10.232));
    assert.equal(true, sculedb.Scule.functions.isScalar("foo"));
    assert.equal(true, sculedb.Scule.functions.isScalar("5"));
    assert.equal(false, sculedb.Scule.functions.isScalar({
        foo:"bar"
    }));
    assert.equal(false, sculedb.Scule.functions.isScalar([1,2,3,4,5]));    
};

exports['test SearchObject'] = function(beforeExit, assert) {
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
    assert.equal(composite[0], 10);
    assert.equal(composite[1], 'foo');
    assert.equal(composite[2], 11);
    
    keys.e.f = {'2':true};
    keys.f = true;
    composite = sculedb.Scule.functions.searchObject(keys, object);
    assert.equal(composite[0], 10);
    assert.equal(composite[1], 'foo');
    assert.equal(composite[2], 23);  
    assert.equal(composite[3], 12);
    assert.equal(composite[3] == 33, false);
}

exports['test TraverseObject'] = function(beforeExit, assert) {
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
    assert.equal('{"a":10,"c":{"d":"foo"},"e":{"f":[11,12,23,33]},"f":12}', JSON.stringify(result[1]));
    assert.equal(result[0], 'f');
    result = sculedb.Scule.functions.traverseObject({e:{f:true}}, object);
    assert.equal('{"f":[11,12,23,33]}', JSON.stringify(result[1]));
    assert.equal(result[0], 'f');
    result = sculedb.Scule.functions.traverseObject({e:{z:true}}, object);
    assert.equal('{"f":[11,12,23,33]}', JSON.stringify(result[1]));
    assert.equal(result[0], 'z');
    result = sculedb.Scule.functions.traverseObject({e:{f:{'*':true}}}, object);
    assert.equal('["*",[11,12,23,33]]', JSON.stringify(result));
};