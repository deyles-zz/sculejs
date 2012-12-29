var sculedb   = require('../lib/com.scule.db');
var jsunit = require('../lib/com.scule.jsunit');

function testObjectIdCreation() {
    var oid1 = sculedb.getObjectId();
    var oid2 = sculedb.getObjectId();
    jsunit.assertEquals(oid1.id.length, 24);
    jsunit.assertNotEquals(oid1.id, oid2.id);
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testObjectIdCreation);
    jsunit.runTests();
}());