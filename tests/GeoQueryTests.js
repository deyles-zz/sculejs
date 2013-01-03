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

var sculedb = require('../lib/com.scule.db');

exports['test GeoQueriesWithin'] = function(beforeExit, assert) {
    sculedb.dropAll();
    var collection = sculedb.factoryCollection('scule+dummy://unittest');
    for(var i=0; i < 5000; i++) {
        var r = i%10;
        collection.save({
           a: {
               b:r
           },
           loc:{
               lat:sculedb.Scule.$f.randomFromTo(-90, 90),
               lon:sculedb.Scule.$f.randomFromTo(-70, 70)
           },
           bar:'foo'+r,
           arr: [r, r+1, r+2, r+3],
           scl: r
        });
    }
    collection.find({'loc':{$near:{lat:53, lon:-67, distance:1000}}}, {}, function(o) {
        o.forEach(function(document) {
            assert.equal(true, '_meta' in document);
            assert.equal(true, document._meta.distance <= 1000);
        });
    });
};

exports['test GeoQueriesNear'] = function(beforeExit, assert) {
    sculedb.dropAll();
    var collection = sculedb.factoryCollection('scule+dummy://unittest');
    collection.ensureIndex(sculedb.Scule.$c.INDEX_TYPE_BTREE, 'a.b', {order:100});
    for(var i=0; i < 5000; i++) {
        var r = i%10;
        collection.save({
           a: {
               b:r
           },
           loc:{
               lat:sculedb.Scule.$f.randomFromTo(-90, 90),
               lon:sculedb.Scule.$f.randomFromTo(-180, 180)
           },           
           bar:'foo'+r,
           arr: [r, r+1, r+2, r+3],
           scl: r
        });
    }
    collection.find({'loc':{$within:{lat:53, lon:-67, distance:10}}}, {}, function(o) {
        o.forEach(function(document) {
            assert.equal(true, '_meta' in document);
            assert.equal(true, document._meta.distance <= 10);
        });
    });
};