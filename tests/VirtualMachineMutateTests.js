var sculedb = require('../lib/com.scule.db.parser');
var db      = require('../lib/com.scule.db');
var vm      = require('../lib/com.scule.db.vm');
var build   = require('../lib/com.scule.db.builder');
var inst    = require('../lib/com.scule.instrumentation');
var jsunit  = require('../lib/com.scule.jsunit');

function testVirtualMachineSimpleMutation() {

    db.dropAll();
    var collection = db.factoryCollection('scule+dummy://unittest');
    var timer    = inst.getTimer();
    
    timer.startInterval('InsertDocuments');
    for(var i=0; i < 100000; i++) {
        var a = [];
        var r = vm.Scule.$f.randomFromTo(2, 5);
        for(var j=0; j < r; j++) {
            a.push(j);
        }
        collection.save({
            a:vm.Scule.$f.randomFromTo(1, 10),
            b:vm.Scule.$f.randomFromTo(1, 10),
            c:vm.Scule.$f.randomFromTo(1, 10),
            d:vm.Scule.$f.randomFromTo(1, 10),
            e:vm.Scule.$f.randomFromTo(1, 10),
            f:a
        });
    }
    timer.stopInterval();
    
    timer.startInterval('CreateIndexes');
    collection.ensureBTreeIndex('a,b', {
        order:5000
    });
    timer.stopInterval();

    var result   = null;
    var mutate   = null;
    var program  = null;
    var machine  = vm.getVirtualMachine();
    var compiler = build.getQueryCompiler();
    
    compiler.explainMutate({
        $set:{
            foo:'bar'
        }
    }, collection);
    
    timer.startInterval('CompileQuery');
    program = compiler.compileQuery({
        a:3, 
        b:4
    }, {}, collection);
    mutate  = compiler.compileMutate({
        $set:{
            foo:'bar'
        }
    }, collection);
    timer.stopInterval();
    timer.startInterval('ExecuteQuery');
    result = machine.execute(program, mutate, true);
    timer.stopInterval();
    timer.logToConsole();

    result.forEach(function(o) {
        jsunit.assertEquals(o.foo, 'bar');
    });
    
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testVirtualMachineSimpleMutation);
    jsunit.runTests();
}());