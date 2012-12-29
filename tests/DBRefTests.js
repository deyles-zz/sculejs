var sculedb   = require('../lib/com.scule.db');
var jsunit    = require('../lib/com.scule.jsunit');

function testDBRefCreation() {
    var storage    = sculedb.getNodeJSDiskStorageEngine({
        secret: 'mysecretkey',
        path:   '/tmp'
    });
    
    var ut1 = sculedb.factoryCollection('scule+dummy://ut1', storage);
    ut1.save({
        foo:'bar1',
        bar:'foo1'
    });
    var o1 = ut1.findAll();
    o1 = o1[0];
    
    var ut2 = sculedb.factoryCollection('scule+dummy://ut2', storage);
    ut2.save({
        foo:'bar2',
        bar:'foo2',
        ref: sculedb.getDBRef('scule+dummy://ut1', o1._id)
    });
    var o2 = ut2.findAll();
    o2 = o2[0];    
    
    var o3 = o2.ref.resolve(storage);
    jsunit.assertEquals(o1, o3);
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testDBRefCreation);
    jsunit.runTests();
}());