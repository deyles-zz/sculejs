var md5    = require('../lib/com.jkm3.md5');
var jsunit = require('../lib/com.scule.jsunit');

function testMD5Hashing() {
    jsunit.assertEquals(md5.hash('hello'), '5d41402abc4b2a76b9719d911017c592');
    jsunit.assertNotEquals(md5.hash('goodbye'), '5d41402abc4b2a76b9719d911017c592');
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testMD5Hashing);
    jsunit.runTests();
}());