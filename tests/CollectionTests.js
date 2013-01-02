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
var jsunit  = require('../lib/com.scule.jsunit');

function testCollectionFactory() {
    sculedb.dropAll();
    var collection = sculedb.factoryCollection('scule+dummy://unittest');
    collection.ensureIndex(sculedb.Scule.$c.INDEX_TYPE_BTREE, 'a.b', {order:100});
    for(var i=0; i < 1000; i++) {
        var r = i%10;
        collection.save({
           a: {
               b:r
           },
           bar:'foo'+r,
           arr: [r, r+1, r+2, r+3],
           scl: r
        });
    }
    jsunit.assertEquals(collection.getLength(), 1000);
    jsunit.assertTrue(collection.getLastInsertId() !== null);
    collection.clear();
    jsunit.assertEquals(collection.getLength(), 0);
};

function testCollectionMerge() {
    sculedb.dropAll();
    var collection1 = sculedb.factoryCollection('scule+dummy://unittest1');
    var collection2 = sculedb.factoryCollection('scule+dummy://unittest2');    
    for(var i=0; i < 1000; i++) {
        var r = i%10;
        var o = {
           a:{
               b:sculedb.Scule.$f.randomFromTo(1, 10)
           },
           bar:'foo'+r,
           arr:[r, r+1, r+2, r+3],
           scl:i
        };
        collection1.save(o);
        collection2.save(o);
    }
    collection1.merge(collection2);
    jsunit.assertEquals(collection1.getLength(), 1000);
    for(var i=0; i < 1000; i++) {
        var r = i%10;
        var o = {
           a:{
               b:sculedb.Scule.$f.randomFromTo(1, 10)
           },
           bar:'foo'+r,
           arr:[r, r+1, r+2, r+3],
           scl:i
        };
        collection2.save(o);
    } 
    collection1.merge(collection2);
    jsunit.assertEquals(collection1.getLength(), 2000);    
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testCollectionFactory);
    jsunit.addTest(testCollectionMerge);
    jsunit.runTests();
}());