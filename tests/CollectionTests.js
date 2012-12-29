var sculedb = require('../lib/com.scule.db');
var jsunit  = require('../lib/com.scule.jsunit');

function testCollectionFactory() {
    sculedb.dropAll();
    var collection = sculedb.factoryCollection('scule+dummy://unittest');
    collection.ensureIndex(sculedb.Scule.$c.INDEX_TYPE_BTREE, 'a.b', {order:100});
    for(var i=0; i < 1000; i++) {
        var r = i%10;
        collection.save({
           a: {
               b:r
           },
           bar:'foo'+r,
           arr: [r, r+1, r+2, r+3],
           scl: r
        });
    }
    jsunit.assertEquals(collection.getLength(), 1000);
    jsunit.assertTrue(collection.getLastInsertId() !== null);
    collection.clear();
    jsunit.assertEquals(collection.getLength(), 0);
};

function testCollectionMerge() {
    sculedb.dropAll();
    var collection1 = sculedb.factoryCollection('scule+dummy://unittest1');
    var collection2 = sculedb.factoryCollection('scule+dummy://unittest2');    
    for(var i=0; i < 1000; i++) {
        var r = i%10;
        var o = {
           a:{
               b:sculedb.Scule.$f.randomFromTo(1, 10)
           },
           bar:'foo'+r,
           arr:[r, r+1, r+2, r+3],
           scl:i
        };
        collection1.save(o);
        collection2.save(o);
    }
    collection1.merge(collection2);
    jsunit.assertEquals(collection1.getLength(), 1000);
    for(var i=0; i < 1000; i++) {
        var r = i%10;
        var o = {
           a:{
               b:sculedb.Scule.$f.randomFromTo(1, 10)
           },
           bar:'foo'+r,
           arr:[r, r+1, r+2, r+3],
           scl:i
        };
        collection2.save(o);
    } 
    collection1.merge(collection2);
    jsunit.assertEquals(collection1.getLength(), 2000);    
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testCollectionFactory);
    jsunit.addTest(testCollectionMerge);
    jsunit.runTests();
}());