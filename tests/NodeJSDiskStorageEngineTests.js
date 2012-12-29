var sculedb   = require('../lib/com.scule.db');
var jsunit    = require('../lib/com.scule.jsunit');
var fs        = require('fs');

function testNodeJSDiskStorageWrite() {
    var object = {
        foo: 'bar',
        bar: 'foo',
        arr: [1, 3, 2, 4, 5, 7],
        obj: {
            me: 'string'
        }
    }
    var storage = sculedb.getNodeJSDiskStorageEngine({
        secret: 'mysecretkey',
        path: '/tmp'
    });
    storage.write('unittest', object, function(o) {
        fs.stat('/tmp/unittest.json', function(err, stats) {
            jsunit.assertTrue(!err);
            jsunit.assertTrue(stats.isFile());
            jsunit.assertTrue(stats.size > 0);
        });
    });
};

function testNodeJSDiskStorageRead() {
    var storage = sculedb.getNodeJSDiskStorageEngine({
        secret: 'mysecretkey',
        path: '/tmp'
    });
    try {
        storage.read('unittest', function(o) {
            jsunit.assertNotEquals(o, null);
            jsunit.assertEquals(o.foo, 'bar');
            jsunit.assertEquals(o.bar, 'foo');
            jsunit.assertEquals(o.arr.length, 6);
            jsunit.assertEquals(o.arr[5], 7);
            jsunit.assertEquals(o.obj.me, 'string');
        });  
    } catch (e) {
        jsunit.assertFalse(true);
    }
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testNodeJSDiskStorageWrite);
    jsunit.addTest(testNodeJSDiskStorageRead);
    jsunit.runTests();
}());