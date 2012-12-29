var sculedb   = require('../lib/com.scule.db');
var jsunit = require('../lib/com.scule.jsunit');

function testLRUCacheThreshold() {
    var threshold = 1000;
    var cache = sculedb.Scule.$d.getLRUCache(threshold);
    for(var i=0; i < 1000; i++) {
        cache.put(i, sculedb.Scule.$f.randomFromTo(10000, 20000));
    }
    jsunit.assertEquals(cache.getLength(), threshold);
    jsunit.assertEquals(cache.cache.getLength(), threshold);
    jsunit.assertEquals(cache.queue.getLength(), threshold);
};

function testLRUCacheRequeue() {
    var threshold = 1000;
    var cache = sculedb.Scule.$d.getLRUCache(threshold);
    for(var i=0; i < 1000; i++) {
        cache.put(i, sculedb.Scule.$f.randomFromTo(10000, 20000));
        cache.get(sculedb.Scule.$f.randomFromTo(1, 10000));
    }
    jsunit.assertEquals(cache.getLength(), threshold);
    jsunit.assertEquals(cache.cache.getLength(), threshold);
    jsunit.assertEquals(cache.queue.getLength(), threshold);
};

function testLRUCacheFunctionality() {
    var cache = sculedb.Scule.$d.getLRUCache(5);
    cache.put(1, {foo:'bar1'});
    cache.put(2, {foo:'bar2'});
    cache.put(3, {foo:'bar3'});
    cache.put(4, {foo:'bar4'});
    cache.put(5, {foo:'bar5'});
    cache.get(1);
    jsunit.assertEquals(JSON.stringify(cache.get(1)), JSON.stringify({foo:'bar1'}));
    jsunit.assertNotEquals(JSON.stringify(cache.get(1)), JSON.stringify({foo:'bar2'}));
    cache.put(6, {foo:'bar6'});
    cache.put(7, {foo:'bar7'});
    jsunit.assertFalse(cache.contains(3));
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testLRUCacheThreshold);
    jsunit.addTest(testLRUCacheRequeue);
    jsunit.addTest(testLRUCacheFunctionality);
    jsunit.runTests();
}());