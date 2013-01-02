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
var jsunit = require('../lib/com.scule.jsunit');

function testIndexParseAttributes() {
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
    var index = sculedb.getIndex();
    jsunit.assertEquals(index.search('1,2,3').length, 0);
};

function testIndexClear() {
    var index = sculedb.getIndex();
    jsunit.assertFalse(index.clear());
};

function testIndexRange() {
    var index = sculedb.getIndex();
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
    var index = sculedb.getIndex();
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
    var index = sculedb.getIndex();
    jsunit.assertFalse(index.remove(document));    
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testIndexParseAttributes);
    jsunit.addTest(testIndexGenerateKey);
    jsunit.addTest(testIndexSearch);
    jsunit.addTest(testIndexClear);
    jsunit.addTest(testIndexRange);
    jsunit.addTest(testIndexRemove);
    jsunit.runTests();
}());