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

exports['test IndexParseAttributes'] = function(beforeExit, assert) {
    var index = sculedb.getIndex();
    
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
    
    assert.equal(o1.a, o2.a);
    assert.equal(o1.c.d, o2.c.d);
    assert.equal(o1.e.f[0], o2.e.f[0]);
    assert.equal(o1.a, o3.a);
    assert.equal(o1.c.d, o3.c.d);
    assert.equal(o1.e.f[0], o3.e.f[0]);
    assert.equal(o3.a, o2.a);
    assert.equal(o3.c.d, o2.c.d);
    assert.equal(o3.e.f[0], o2.e.f[0]);
};

exports['test IndexGenerateKey'] = function(beforeExit, assert) {
    var index = sculedb.getIndex();
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
    assert.equal(index.generateIndexKey(document), '21,34,32');
    index.resetAttributes();
    index.parseAttributes('e.f.0,c.d,a');
    assert.equal(index.generateIndexKey(document), '21,34,32');
    index.resetAttributes();
    index.parseAttributes('c.d,e.f.0,a');
    assert.equal(index.generateIndexKey(document), '21,34,32');    
    index.resetAttributes();    
    index.parseAttributes('c.d,e.f.3');
    assert.equal(index.generateIndexKey(document), '34,45');
    index.resetAttributes();
    index.parseAttributes('f.1,c.d,e.f.1');
    assert.equal(index.generateIndexKey(document), '34,23,7');
    index.resetAttributes();
    index.parseAttributes('f.0');
    assert.equal(index.generateIndexKey(document), 2);
    index.resetAttributes();
    index.parseAttributes('foo');
    assert.equal(index.generateIndexKey(document), 'bar');
    assert.equal(false, index.generateIndexKey(document) == 'foo');
    index.resetAttributes();
    index.parseAttributes('bar');
    assert.equal(index.generateIndexKey(document), 'foo');
    assert.equal(false, index.generateIndexKey(document) == 'bar');    
};

exports['test IndexSearch'] = function(beforeExit, assert) {
    var index = sculedb.getIndex();
    assert.equal(index.search('1,2,3').length, 0);
};

exports['test IndexClear'] = function(beforeExit, assert) {
    var index = sculedb.getIndex();
    assert.equal(false, index.clear());
};

exports['test IndexRange'] = function(beforeExit, assert) {
    var index = sculedb.getIndex();
    assert.equal(false, index.range(0, 100000));    
};

exports['test IndexIndex'] = function(beforeExit, assert) {
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
    var index = sculedb.getIndex();
    assert.equal(false, index.index(document));    
};

exports['test IndexRemove'] = function(beforeExit, assert) {
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
    var index = sculedb.getIndex();
    assert.equal(false, index.remove(document));    
};