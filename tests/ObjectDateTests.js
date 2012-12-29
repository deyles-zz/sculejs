var sculedb   = require('../lib/com.scule.db');
var jsunit = require('../lib/com.scule.jsunit');

function testObjectDateConstructorDefault() {
    var date = sculedb.getObjectDate();
    var ts   = (new Date()).getTime();
    jsunit.assertTrue(ts > date.getTimestamp());
    jsunit.assertTrue(date.getSeconds() > 0);
    jsunit.assertTrue(date.getMicroSeconds() > 0);
};

function testObjectDateConstructor() {
    var ts   = (new Date()).getTime().toString();
    var date = sculedb.getObjectDate(parseInt(ts.substring(0, 10)), parseInt(ts.substring(10)));
    jsunit.assertTrue(date.getSeconds() > 0);
    jsunit.assertTrue(date.getMicroSeconds() > 0);
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testObjectDateConstructorDefault);
    jsunit.addTest(testObjectDateConstructor);
    jsunit.runTests();
}());