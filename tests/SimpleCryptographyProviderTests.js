var sculedb   = require('../lib/com.scule.db');
var jsunit = require('../lib/com.scule.jsunit');

function testSignString() {
    var provider = sculedb.getSimpleCryptographyProvider();
    var hash = provider.signString('foobar');
    jsunit.assertEquals(hash, provider.signString('foobar'));
};

function testSignObject() {
    var provider = sculedb.getSimpleCryptographyProvider();
    var object = {
        _sig: null,
        _meta: {
            ver: 2.0,
            salt: 123456789
        },
        _collection: {
            'iamatestkey':{
                foo:'bar',
                bar:'foo'
            }
        }
    };
    var hash = provider.signObject(object, 'mysecretkey', 'mysecretsalt');
    jsunit.assertEquals(hash, provider.signObject(object, 'mysecretkey', 'mysecretsalt'));
};

function testSignJSONString() {
    var provider = sculedb.getSimpleCryptographyProvider();
    var object = {
        _sig: null,
        _meta: {
            ver: 2.0,
            salt: 123456789
        },
        _collection: {
            'iamatestkey':{
                foo:'bar',
                bar:'foo'
            }
        }
    };
    var hash = provider.signJSONString(object, 'mysecretkey', 'mysecretsalt'); 
    jsunit.assertEquals(hash, provider.signJSONString(object, 'mysecretkey', 'mysecretsalt'));
};

function testVerifyObjectSignature() {
    var provider = sculedb.getSimpleCryptographyProvider();
    var object = {
        _sig: null,
        _meta: {
            ver: 2.0,
            salt: 123456789
        },
        _collection: {
            'iamatestkey':{
                foo:'bar',
                bar:'foo'
            }
        }
    };
    object._sig = provider.signObject(object, 'mysecretkey', 'mysecretsalt');
    jsunit.assertTrue(provider.verifyObjectSignature(object, 'mysecretkey', 'mysecretsalt'));
    object._sig = 'foobar';
    jsunit.assertFalse(provider.verifyObjectSignature(object, 'mysecretkey', 'mysecretsalt'));    
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testSignString);
    jsunit.addTest(testSignObject);
    jsunit.addTest(testSignJSONString);
    jsunit.addTest(testVerifyObjectSignature);
    jsunit.runTests();
}());