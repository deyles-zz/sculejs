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

var datastructures = require('../lib/com.scule.datastructures');
var sculedb   = require('../lib/com.scule.db');
var instrumentation = require('../lib/com.scule.instrumentation');

exports['test PerformanceTests1'] = function(beforeExit, assert) {
    var timer = instrumentation.getTimer();
    var list = datastructures.getDoublyLinkedList();
    for (var i=0; i < 10000; i++) {
        list.add({
            index: i,
            tag: 'tag_' + i
        });
    }
    timer.startInterval('closure key lookup');
//    for (i=0; i < 100; i++) {
        var count = 0;
        list.forEach(function(object) {
            if (object.element.index === 5000) {
                count++;
            }
        });
//    }
    timer.stopInterval();    
    timer.startInterval('closure range lookup');
//    for (i=0; i < 100; i++) {
        var count = 0;
        list.forEach(function(object) {
            if (object.element.index >= 2000 && object.element.index <= 3500) {
                count++;
            }
        });
//    }
    timer.stopInterval();
    timer.logToConsole();
}

exports['test PerformanceTests2'] = function(beforeExit, assert) {
    sculedb.dropAll();
    var collection = sculedb.factoryCollection('scule+dummy://tests');
    for (var i=0; i < 10000; i++) {
        collection.save({
            a:i,
            b:i*2,
            c:i*3
        });
    }
    var timer = instrumentation.getTimer();
    
    timer.startInterval('key lookup');
//    for (i=0; i < 100; i++) {
        collection.find({
            a:5000
        });
//    }
    timer.stopInterval();
    
    timer.startInterval('range lookup');
//    for (i=0; i < 100; i++) {
        collection.find({
            a:{
                $gte:2000, 
                $lte:3500
            }
        });
//    }
    timer.stopInterval();
    
    
    timer.logToConsole();
};

exports['test PerformanceTests3'] = function(beforeExit, assert) {
    sculedb.dropAll();
    var collection = sculedb.factoryCollection('scule+dummy://tests');
    for (var i=0; i < 10000; i++) {
        collection.save({
            a:i,
            b:i*2,
            c:i*3
        });
    }
    
    var engine = sculedb.getQueryEngine();
    var timer = instrumentation.getTimer();
    
    eval("var c = function(objects, engine) {\
	var r = [];\
	objects.forEach(function(o) {\
		o = o.element;\
		if ((engine.$eq(o.a, 5000))) {\
			r.push(o);\
		}\
	});\
	return r;\
};");
    
    timer.startInterval('compiled key lookup - 1');
//    for (i=0; i < 100; i++) {
        c(collection.documents.queue, engine);
//    }
    timer.stopInterval();
    
    c = function(objects, engine) {
        var r = [];
        objects.forEach(function(o) {
            o = o.element;
            if (o.a === 5000) {
                r.push(o);
            }
        });
        return r;
    };    

    timer.startInterval('compiled key lookup - 2');
//    for (i=0; i < 100; i++) {
        c(collection.documents.queue, engine);
//    }
    timer.stopInterval();

    eval("var c1 = function(objects, engine) {\
	var r = [];\
	objects.forEach(function(o) {\
		o = o.element;\
		if ((engine.$gte(o.a, 2000) && engine.$lte(o.a, 3500))) {\
			r.push(o);\
		}\
	});\
	return r;\
};");
    
    timer.startInterval('range lookup - 1');
//    for (i=0; i < 100; i++) {
        c1(collection.documents.queue, engine);
//    }
    timer.stopInterval();
    
    c1 = function(objects, engine) {
        var r = [];
        objects.forEach(function(o) {
            o = o.element;
            if (o.a >= 2000 && o.a <= 3500) {
                r.push(o);
            }
        });
        return r;
    };    
    
    timer.startInterval('range lookup - 2');
//    for (i=0; i < 100; i++) {
        c1(collection.documents.queue, engine);
//    }
    timer.stopInterval();    
    
    timer.logToConsole();    
}