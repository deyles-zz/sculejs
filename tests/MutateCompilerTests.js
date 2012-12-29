var db      = require('../lib/com.scule.db');
var build   = require('../lib/com.scule.db.builder');
var inst    = require('../lib/com.scule.instrumentation');
var jsunit  = require('../lib/com.scule.jsunit');

function testMutateCompiler() {
    db.dropAll();
    var collection = db.factoryCollection('scule+dummy://unittest');    
    var compiler   = build.getQueryCompiler();
    compiler.explainMutate({$set:{a:3, 'b.c':4, foo:'bar'}, $unset:{c:true}, $inc:{i:1}, $push:{z:'foo'}, $pushAll:{y:['foo','bar','poo']}}, collection);
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testMutateCompiler);
    jsunit.runTests();
}());