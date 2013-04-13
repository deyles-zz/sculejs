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

var scule  = require('com.scule');
scule.debug(false);

var scollection = scule.factoryCollection('scule+dummy://test', {secret:'mysecretkey'});
scollection.ensureBTreeIndex('loc.lat', {order:100});
scollection.ensureBTreeIndex('i',       {order:100});
scollection.ensureBTreeIndex('n',       {order:100});
scollection.clear();

var timer = scule.getTimer();

var names = ['Tom', 'Dick', 'Harry', 'John'];
for(var i=0; i < 5000; i++) {
	var a = [];
	var n = scule.Scule.functions.randomFromTo(3, 12);
	for(var j=0; j < n; j++) {
		a.push(scule.Scule.functions.randomFromTo(0, 100));
	}
	var o = {
		i:i,
		n:scule.Scule.functions.randomFromTo(10, 30),
		s:names[scule.Scule.functions.randomFromTo(0, 3)],
		a:a,
		as:a.length,
		term: Math.random().toString(36).substring(7),
		ts:(new Date()).getTime(),
		foo:['bar','bar2'],
		o: {
			a: scule.Scule.functions.randomFromTo(1, 30),
			b: scule.Scule.functions.randomFromTo(1, 30),
			c: scule.Scule.functions.randomFromTo(1, 30),
			d: scule.Scule.functions.randomFromTo(1, 30),
			e: scule.Scule.functions.randomFromTo(1, 30)
		},
		loc: {
			lng: scule.Scule.functions.randomFromTo(-130, 130),
			lat: scule.Scule.functions.randomFromTo(-130, 130)
		}
	};
	scollection.save(o);
}

/**
 * commits the collection to disk
 */
scollection.commit();

/**
 * count all objects where i is less than or equal to 20
 */
timer.startInterval("scollection - {i:{$lte:20}, n:{$gte:6}}");
scollection.count({i:{$lte:20}, n:{$gte:6}});
timer.stopInterval();

timer.logToConsole();
timer.resetTimer();
Ti.API.info('-----------------------------------------------');

/**
 * find all objects where the field i has a value in the provided array
 */
timer.startInterval("scollection - {i:{$in:[1, 2, 3, 4, 5]}}");
scollection.count({i:{$in:[1, 2, 3, 4, 5]}});
timer.stopInterval();

timer.logToConsole();
timer.resetTimer();
Ti.API.info('-----------------------------------------------');

/**
 * reaches into a nested object to query for a loc.lat value of less than or equal to 5
 */
timer.startInterval("scollection - {'loc.lat':{$lte:5}}");
scollection.count({'loc.lat':{$lte:5}});
timer.stopInterval();

timer.logToConsole();
timer.resetTimer();
Ti.API.info('-----------------------------------------------');

/**
 * find all objects where the length of field 's' is 8
 */
timer.startInterval("scollection - {s:{$size:8}}");
scollection.count({s:{$size:8}});
timer.stopInterval();

timer.logToConsole();
timer.resetTimer();
Ti.API.info('-----------------------------------------------');

/**
 * find all objects where the length of field 'o' is 5
 */
timer.startInterval("scollection - {o:{$size:5}}");
scollection.count({o:{$size:5}});
timer.stopInterval();

timer.logToConsole();
timer.resetTimer();
Ti.API.info('-----------------------------------------------');

/**
 * find all objects where the field 'n' doesn't exist
 */
timer.startInterval("scollection - {n:{$exists:false}}");
scollection.count({n:{$exists:false}});
timer.stopInterval();

timer.logToConsole();
timer.resetTimer();
Ti.API.info('-----------------------------------------------');

/**
 * all objects where i is greater than or equal to 70
 */
timer.startInterval("scollection - {i:{$gte:70}}");
scollection.count({i:{$gte:70}});
timer.stopInterval();

timer.logToConsole();
timer.resetTimer();
Ti.API.info('-----------------------------------------------');

/**
 * all objects where i is greater than 50 or n is less than 40
 */
timer.startInterval("scollection -{i:{$gt:50}, $or:[{n:{$lt:40}}]}");
scollection.count({i:{$gt:50}, $or:[{n:{$lt:40}}]});
timer.stopInterval();

timer.logToConsole();
timer.resetTimer();
Ti.API.info('-----------------------------------------------');

/**
 * all objects where i is greater than 50 or n is less than 40, sorted by i descending limiting results to 30
 */
timer.startInterval("scollection - {i:{$gt:50}, $or:[{n:{$lt:40}]}, {$sort:{i:-1}, $limit:30}");
scollection.count({i:{$gt:50}, $or:[{n:{$lt:40}}]}, {$sort:{i:-1}, $limit:30});
timer.stopInterval();

timer.logToConsole();
timer.resetTimer();
Ti.API.info('-----------------------------------------------');

/**
 * update all objects where i is less than or equal to 90 and set n to 10 and name to "Steve"
 */
timer.startInterval("scollection - {i:{$lte:90}}, {$set:{n:10, s:'Steve'}}");
scollection.update({i:{$lte:90}}, {$set:{n:10, s:'Steve'}});
timer.stopInterval();

timer.logToConsole();
timer.resetTimer();
Ti.API.info('-----------------------------------------------');

/**
 * update all objects where i equals 10 by pushing the string "bar3" to the array stored in key "foo"
 */
timer.startInterval("scollection - {i:10}, {$push:{foo:'bar3'}}");
scollection.update({i:10}, {$push:{foo:'bar3'}});
timer.stopInterval();

timer.logToConsole();
timer.resetTimer();
Ti.API.info('-----------------------------------------------');

/**
 * update all objects where i equals 10 by pushing the strings "bar3" and "bar4" to the array stored in key "foo"
 */
timer.startInterval("scollection - {i:10}, {$pushAll:{foo:['bar3', 'bar4']}}");
scollection.update({i:10}, {$pushAll:{foo:['bar3', 'bar4']}});
timer.stopInterval();

timer.logToConsole();
timer.resetTimer();
Ti.API.info('-----------------------------------------------');