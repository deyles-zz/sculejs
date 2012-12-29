var sculedb = require('../lib/com.scule.db');
var build   = require('../lib/com.scule.db.builder');
var inst    = require('../lib/com.scule.instrumentation');
var jsunit  = require('../lib/com.scule.jsunit');

function testProgramBuilder() {
    var collection = sculedb.factoryCollection('scule+dummy://test');
    
    var director = build.getProgramDirector();
    var builder  = build.getProgramBuilder();

    director.setProgramBuilder(builder);
    
    var program = director.getProgram();
    
    program.startHeadBlock();
    program.startScanBlock(collection, []);
    program.stopBlock();
    
    program.startLoopBlock();
    program.startAndBlock();
    program.addInstruction('eq', ['a', 5]);
    program.addInstruction('gt', ['b', 300]);
    program.startOrBlock();
    program.startAndBlock();
    program.addInstruction('eq', ['a', 7]);
    program.stopBlock();
    program.startAndBlock();
    program.addInstruction('eq', ['a', 9]);
    program.stopBlock();    
    program.stopBlock();
    program.stopBlock();
    program.stopBlock();
    
    director.explainProgram();
};

function testQueryCompiler() {
    var collection = sculedb.factoryCollection('scule+dummy://test');
    collection.ensureBTreeIndex('a,b');
    collection.ensureHashIndex('c');
    collection.ensureBTreeIndex('c');

    var compiler = build.getQueryCompiler();
    // {a:3, b:4, c:{$gt:300}}
    compiler.explainQuery({a:3, b:4, c:{$gt:300}}, {$limit:10, $sort:{a:-1}}, collection);
};

(function() {
    jsunit.resetTests(__filename);
//    jsunit.addTest(testProgramBuilder);
    jsunit.addTest(testQueryCompiler);
    jsunit.runTests();
}());