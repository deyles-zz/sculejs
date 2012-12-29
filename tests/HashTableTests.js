var sculedb   = require('../lib/com.scule.db');
var jsunit = require('../lib/com.scule.jsunit');

function testHashTableSize() {
    var table = sculedb.Scule.$d.getHashTable();
    table.put('foo', 'bar');
    table.put('foo2', 'bar2');
    table.put('foo3', 'bar3');
    jsunit.assertEquals(table.getLength(), 3);
    table.put('foo', 'bar4');
    jsunit.assertEquals(table.getLength(), 3);
}

function testHashTableClear() {
    var table = sculedb.Scule.$d.getHashTable();
    table.put('foo1', 'bar1');
    table.put('foo2', 'bar2');
    table.put('foo3', 'bar3');
    table.clear();
    jsunit.assertEquals(table.getLength(), 0);
}

function testHashTableContains() {
    var table = sculedb.Scule.$d.getHashTable();
    table.put('foo1', 'bar1');
    table.put('foo2', 'bar2');
    table.put('foo3', 'bar3');
    table.put(3, 'bar4');
    jsunit.assertTrue(table.contains('foo2'));
    jsunit.assertFalse(table.contains('foo4'));
    jsunit.assertTrue(table.contains(3));
}

function testHashTableGet() {
    var table = sculedb.Scule.$d.getHashTable();
    table.put('foo', 'bar');
    table.put('foo2', 'bar2');
    table.put('foo3', 'bar3');
    table.put('foo', 'bar4');
    jsunit.assertEquals(table.get('foo'), 'bar4');
    jsunit.assertEquals(table.get('foo3'), 'bar3');
}

function testHashTableRemove() {
    var table = sculedb.Scule.$d.getHashTable();
    table.put('foo', 'bar');
    table.put('foo2', 'bar2');
    table.put('foo3', 'bar3');
    table.put(666, 'the devil!');
    table.remove('foo');
    jsunit.assertFalse(table.contains('foo'));
    jsunit.assertTrue(table.contains('foo2'));
    jsunit.assertTrue(table.remove('foo2'));
    jsunit.assertFalse(table.remove('foo2'));
    jsunit.assertTrue(table.remove(666));
    jsunit.assertFalse(table.remove(666));
    jsunit.assertFalse(table.remove(999));
}

function testHashTableGetKeys() {
    var table = sculedb.Scule.$d.getHashTable();
    table.put('foo1', 'bar1');
    table.put('foo2', 'bar2');
    table.put('foo3', 'bar3');
    jsunit.assertEquals(JSON.stringify(table.getKeys()), JSON.stringify(['foo1','foo2','foo3']));
}

function testHashTableGetValues() {
    var table = sculedb.Scule.$d.getHashTable();
    table.put('foo1', 'bar1');
    table.put('foo2', 'bar2');
    table.put('foo3', 'bar3');
    jsunit.assertEquals(JSON.stringify(table.getValues()), JSON.stringify(['bar1','bar2','bar3']));
}

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testHashTableSize);
    jsunit.addTest(testHashTableClear);  
    jsunit.addTest(testHashTableContains);
    jsunit.addTest(testHashTableGet);
    jsunit.addTest(testHashTableRemove);
    jsunit.addTest(testHashTableGetKeys);
    jsunit.addTest(testHashTableGetValues);
    jsunit.runTests();
}());