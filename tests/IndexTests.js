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