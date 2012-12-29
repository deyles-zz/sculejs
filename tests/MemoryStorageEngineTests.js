var sculedb   = require('../lib/com.scule.db');
var jsunit = require('../lib/com.scule.jsunit');

var storage = sculedb.getMemoryStorageEngine({
    collection:'unittest',
    secret: 'mysecretkey'
});

function testMemoryStorageWrite() {
    var object = {
        foo: 'bar',
        bar: 'foo',
        arr: [1, 3, 2, 4, 5, 7],
        obj: {
            me: 'string'
        }
    }
    storage.write('unittest', object, function(o) {
        jsunit.assertTrue('__scule_collection__unittest' in storage.storage);
    });
};

function testMemoryStorageRead() {
    storage.read('unittest', function(o) {
        jsunit.assertNotEquals(o, null);
        jsunit.assertEquals(o.foo, 'bar');
        jsunit.assertEquals(o.bar, 'foo');
        jsunit.assertEquals(o.arr.length, 6);
        jsunit.assertEquals(o.arr[5], 7);
        jsunit.assertEquals(o.obj.me, 'string');
    });  
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testMemoryStorageWrite);
    jsunit.addTest(testMemoryStorageRead);
    jsunit.runTests();
}());