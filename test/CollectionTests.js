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

var assert = require('assert');
var Scule = require('../lib/com.scule');

describe('CollectionFactory', function() {
    it('should verify the factory pattern is correctly implemented', function() {
        Scule.dropAll();
        var collection = Scule.factoryCollection('scule+dummy://unittest');
        collection.clear();
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
        assert.equal(collection.getLength(), 1000);
        assert.ok(collection.getLastInsertId());
        collection.clear();
        assert.equal(collection.getLength(), 0);        
    });
    it('should factory a NodeJS disk based collection', function() {
        Scule.dropAll();
        var collection = Scule.factoryCollection('scule+nodejs://collection', {secret:'test', path:'/tmp'});
        setTimeout(function() {
            collection.clear();
            for(var i=0; i < 5; i++) {
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
            assert.equal(5, collection.getLength());
            assert.ok(collection.getLastInsertId());
            collection.commit();        
        }, 500);        
    });
    it('should merge two collections', function() {
        Scule.dropAll();
        var collection1 = Scule.factoryCollection('scule+dummy://unittest1');
        var collection2 = Scule.factoryCollection('scule+dummy://unittest2');  
        collection1.clear();
        collection2.clear();
        for(var i=0; i < 1000; i++) {
            var r = i%10;
            var o = {
               a:{
                   b:Scule.global.functions.randomFromTo(1, 10)
               },
               bar:'foo'+r,
               arr:[r, r+1, r+2, r+3],
               scl:i
            };
            collection1.save(o);
            collection2.save(o);
        }
        collection1.merge(collection2);
        assert.equal(collection1.getLength(), 1000);
        for(var i=0; i < 1000; i++) {
            var r = i%10;
            var o = {
               a:{
                   b:Scule.global.functions.randomFromTo(1, 10)
               },
               bar:'foo'+r,
               arr:[r, r+1, r+2, r+3],
               scl:i
            };
            collection2.save(o);
        } 
        collection1.merge(collection2);
        assert.equal(collection1.getLength(), 2000);         
    });
});