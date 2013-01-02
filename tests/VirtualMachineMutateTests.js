/**
 * Copyright (c) 2013, Dan Eyles (dan@irlgaming.com)
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of IRL Gaming nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL IRL Gaming BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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