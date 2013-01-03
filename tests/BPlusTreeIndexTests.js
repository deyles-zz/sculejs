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

exports['test BPlusTreeIndexSearch1'] = function(beforeExit, assert) {  
    var document, result;
    var index = sculedb.getBPlusTreeIndex(100);
    index.parseAttributes('a');
    for(var i=0; i < 300; i++) {
        document = {
            _id: sculedb.getObjectId(),
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
    assert.equal(result.length, 30);
    result.forEach(function(o) {
        assert.equal(o.a, 9); 
    });
    
    result = index.search(3);
    assert.equal(result.length, 30);
    result.forEach(function(o) {
        assert.equal(o.a, 3); 
    });    
};

exports['test BPlusTreeIndexSearch2'] = function(beforeExit, assert) {
    var document, result;
    var index = sculedb.getBPlusTreeIndex(100);
    index.parseAttributes('a,e.f.2');
    for(var i=0; i < 300; i++) {
        document = {
            _id: sculedb.getObjectId(),
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
    assert.equal(result.length, 30);
    result.forEach(function(o) {
        assert.equal(o.a, 3); 
        assert.equal(o.e.f[2], 5);
    });
};

exports['test BPlusTreeIndexSearch3'] = function(beforeExit, assert) {
    var document, result;
    var index = sculedb.getBPlusTreeIndex(100);
    index.parseAttributes('foo');
    for(var i=0; i < 300; i++) {
        document = {
            _id: sculedb.getObjectId(),
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
    assert.equal(result.length, 30);
    result.forEach(function(o) {
        assert.equal(o.a, 3); 
        assert.equal(o.foo, 'bar3');
    });
};

exports['test BPlusTreeIndexClear'] = function(beforeExit, assert) {
    var document, result;
    var index = sculedb.getBPlusTreeIndex(100);
    index.parseAttributes('a,e.f.2');
    for(var i=0; i < 300; i++) {
        document = {
            _id: sculedb.getObjectId(),
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
    assert.equal(true, index.clear());
    
    result = index.search('3,5');
    assert.equal(result.length, 0);
};

exports['test BPlusTreeIndexRange'] = function(beforeExit, assert) {
    var document, result;
    var index = sculedb.getBPlusTreeIndex(100);
    index.parseAttributes('c.d');
    for(var i=0; i < 3000; i++) {
        document = {
            _id: sculedb.getObjectId(),
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
    assert.equal(result.length, 1501);
    assert.equal(result[0].c.d, 1000);
    assert.equal(result[1500].c.d, 2500);
};

exports['test BPlusTreeIndexRemove'] = function(beforeExit, assert) {
    var document, result, document;
    var index = sculedb.getBPlusTreeIndex(100);
    index.parseAttributes('c.d');
    for(var i=0; i < 3000; i++) {
        document = {
            _id: sculedb.getObjectId(),
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
    assert.equal(result.length, 1);
    
    document = result[0];
    index.remove(document);
    
    result   = index.search(1000);
    assert.equal(result.length, 0);
};

exports['test BPlusTreeIndexRemoveKey'] = function(beforeExit, assert) {
    var document, result;
    var index = sculedb.getBPlusTreeIndex(100);
    index.parseAttributes('a');
    for(var i=0; i < 3000; i++) {
        document = {
            _id: sculedb.getObjectId(),
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
    assert.equal(result.length, 300);
    
    document = result[0];
    index.removeKey(3);
    
    result   = index.search(3);
    assert.equal(result.length, 0);
    
    assert.equal(false, index.leaves.contains(document._id));
};