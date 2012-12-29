var sculedb = require('../lib/com.scule.db');
var inst    = require('../lib/com.scule.instrumentation');
var jsunit  = require('../lib/com.scule.jsunit');

function testHashMapSize() {
    var table = sculedb.Scule.$d.getHashMap(10);
    table.put('foo', 'bar');
    table.put('foo2', 'bar2');
    table.put('foo3', 'bar3');
    jsunit.assertEquals(table.getLength(), 3);
    table.put('foo', 'bar4');
    jsunit.assertEquals(table.getLength(), 3);
}

function testHashMapClear() {
    var table = sculedb.Scule.$d.getHashMap(10);
    table.put('foo1', 'bar1');
    table.put('foo2', 'bar2');
    table.put('foo3', 'bar3');
    table.clear();
    jsunit.assertEquals(table.getLength(), 0);
}

function testHashMapContains() {
    var table = sculedb.Scule.$d.getHashMap(10);
    table.put('foo1', 'bar1');
    table.put('foo2', 'bar2');
    table.put('foo3', 'bar3');
    table.put(3, 'bar4');
    jsunit.assertTrue(table.contains('foo2'));
    jsunit.assertFalse(table.contains('foo4'));
    jsunit.assertTrue(table.contains(3));
}

function testHashMapGet() {
    var table = sculedb.Scule.$d.getHashMap(10);
    table.put('foo', 'bar');
    table.put('foo2', 'bar2');
    table.put('foo3', 'bar3');
    table.put('foo', 'bar4');
    jsunit.assertEquals(table.get('foo'), 'bar4');
    jsunit.assertEquals(table.get('foo3'), 'bar3');
}

function testHashMapRemove() {
    var table = sculedb.Scule.$d.getHashMap(10);
    table.put('foo', 'bar');
    table.put('foo2', 'bar2');
    table.put('foo3', 'bar3');
    table.put(666, 'the devil!');
    table.remove('foo');
    jsunit.assertFalse(table.contains('foo'));
    jsunit.assertTrue(table.contains('foo2'));
    table.remove('foo2');
    jsunit.assertEquals(table.getLength(), 2);
    table.remove('foo2');
    jsunit.assertEquals(table.getLength(), 2);
    table.remove(666)
    jsunit.assertEquals(table.getLength(), 1);
}

function testHashMapGetKeys() {
    var table = sculedb.Scule.$d.getHashMap(10);
    table.put('foo1', 'bar1');
    table.put('foo2', 'bar2');
    table.put('foo3', 'bar3');
    jsunit.assertEquals(JSON.stringify(table.getKeys().sort()), JSON.stringify(['foo1','foo2','foo3'].sort()));
}

function testHashMapGetValues() {
    var table = sculedb.Scule.$d.getHashMap(10);
    table.put('foo1', 'bar1');
    table.put('foo2', 'bar2');
    table.put('foo3', 'bar3');
    jsunit.assertEquals(JSON.stringify(table.getValues().sort()), JSON.stringify(['bar1','bar2','bar3'].sort()));
}

function testHashMapLoadFactor() {
    
    var timer = inst.getTimer();
    var tree  = sculedb.Scule.$d.getBPlusTree(1000);
    var map   = sculedb.Scule.$d.getHashMap(1000);
    var table = sculedb.Scule.$d.getHashTable();
    
    timer.startInterval('HashMap.Hash');
    for(var i=0; i < 10000; i++) {
        map.hash('foo' + i);
    }
    timer.stopInterval();
    
    timer.startInterval('HashMap.Insert');
    for(var i=0; i < 10000; i++) {
        map.put('foo' + i, {bar:i});
    }
    timer.stopInterval();
    timer.startInterval('HashMap.Seek');
    for(var i=0; i < 10000; i++) {
        map.get('foo' + i);
    }    
    timer.stopInterval();
    
    timer.startInterval('HashTable.Insert');
    for(var i=0; i < 10000; i++) {
        table.put('foo' + i, {bar:i});
    }
    timer.stopInterval();   
    timer.startInterval('HashTable.Seek');
    for(var i=0; i < 10000; i++) {
        table.get('foo' + i);
    }    
    timer.stopInterval();

    timer.startInterval('BPlusTree.Insert');
    for(var i=0; i < 10000; i++) {
        tree.insert('foo' + i, {bar:i});
    }
    timer.stopInterval();   
    timer.startInterval('BPlusTree.Seek');
    for(var i=0; i < 10000; i++) {
        tree.search('foo' + i);
    }    
    timer.stopInterval();

    timer.logToConsole();
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testHashMapSize);
    jsunit.addTest(testHashMapClear);  
    jsunit.addTest(testHashMapContains);
    jsunit.addTest(testHashMapGet);
    jsunit.addTest(testHashMapRemove);
    jsunit.addTest(testHashMapGetKeys);
    jsunit.addTest(testHashMapGetValues);
    jsunit.addTest(testHashMapLoadFactor);
    jsunit.runTests();
}());