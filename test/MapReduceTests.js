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

describe('MapReduce', function() {
    it('verifies that map/reduce works as expected', function() {
        Scule.dropAll();
        var collection = Scule.factoryCollection('scule+dummy://unittest');
        for(var i=0; i < 1000; i++) {
            var r = i%10;
            collection.save({
               a:{
                   b:Scule.global.functions.randomFromTo(1, 10)
               },
               bar:'foo'+r,
               arr:[r, r+1, r+2, r+3],
               scl:i
            });
        }
        collection.mapReduce(
            function(document, emit) {
                emit(document.bar, {scl: document.scl});
            },
            function(key, reduce) {
                var o = {
                    count: 0,
                    total: 0,
                    key: key
                };
                reduce.forEach(function(value) {
                    o.count++;
                    o.total += value.scl;
                });
                return o;
            },
            {
                out:{
                    reduce:'scule+dummy://mapreduce'
                },
                finalize:function(key, reduced) {
                    reduced.finalized = key;
                    return reduced;
                }
            },
            function(out) {
                var o = out.findAll();
                assert.equal(o[0].total, 49500);
                assert.equal(o[0].finalized, o[0].key);
                assert.equal(o[1].total, 49600);
                assert.equal(o[1].finalized, o[1].key);
                assert.equal(o[2].total, 49700);
                assert.equal(o[2].finalized, o[2].key);
                assert.equal(o[3].total, 49800);
                assert.equal(o[3].finalized, o[3].key);
                assert.equal(o[4].total, 49900);
                assert.equal(o[4].finalized, o[4].key);
                assert.equal(o[5].total, 50000);
                assert.equal(o[5].finalized, o[5].key);
                assert.equal(o[6].total, 50100);
                assert.equal(o[6].finalized, o[6].key);
                assert.equal(o[7].total, 50200);
                assert.equal(o[7].finalized, o[7].key);
                assert.equal(o[8].total, 50300);
                assert.equal(o[8].finalized, o[8].key);
                assert.equal(o[9].total, 50400);
                assert.equal(o[9].finalized, o[9].key);
            }
        );        
    });
});