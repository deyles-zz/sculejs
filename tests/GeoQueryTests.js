var sculedb = require('../lib/com.scule.db');
var jsunit  = require('../lib/com.scule.jsunit');

function testGeoQueriesWithin() {
    sculedb.dropAll();
    var collection = sculedb.factoryCollection('scule+dummy://unittest');
    for(var i=0; i < 5000; i++) {
        var r = i%10;
        collection.save({
           a: {
               b:r
           },
           loc:{
               lat:sculedb.Scule.$f.randomFromTo(-90, 90),
               lon:sculedb.Scule.$f.randomFromTo(-70, 70)
           },
           bar:'foo'+r,
           arr: [r, r+1, r+2, r+3],
           scl: r
        });
    }
    collection.find({'loc':{$near:{lat:53, lon:-67, distance:1000}}}, {}, function(o) {
        o.forEach(function(document) {
            jsunit.assertTrue('_meta' in document);
            jsunit.assertLessThanEqualTo(document._meta.distance, 1000);
        });
    });
};

function testGeoQueriesNear() {
    sculedb.dropAll();
    var collection = sculedb.factoryCollection('scule+dummy://unittest');
    collection.ensureIndex(sculedb.Scule.$c.INDEX_TYPE_BTREE, 'a.b', {order:100});
    for(var i=0; i < 5000; i++) {
        var r = i%10;
        collection.save({
           a: {
               b:r
           },
           loc:{
               lat:sculedb.Scule.$f.randomFromTo(-90, 90),
               lon:sculedb.Scule.$f.randomFromTo(-180, 180)
           },           
           bar:'foo'+r,
           arr: [r, r+1, r+2, r+3],
           scl: r
        });
    }
    collection.find({'loc':{$within:{lat:53, lon:-67, distance:10}}}, {}, function(o) {
        o.forEach(function(document) {
            jsunit.assertTrue('_meta' in document);
            jsunit.assertLessThanEqualTo(document._meta.distance, 10);
        });
    });
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testGeoQueriesWithin);
    jsunit.addTest(testGeoQueriesNear);
    jsunit.runTests();
}());