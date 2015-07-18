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

describe('Where', function() {    
    it('should test the $where operator', function(done) {
        Scule.dropAll();

        var collection = Scule.factoryCollection('scule+dummy://unittest');    
        collection.clear();    

        var now = new Date();
        for (var i=0; i < 100; i++) {
            collection.save({
                id:i,
                status: ((i%2)?"published":"held"),
                expires: ((i%2)?null:now),
                activates: ((i%3)?null:now)
            });
        }
        
        var o = collection.find({
            status: "published",
            id:{$in:[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]},
            $where:function() { 
                var now = new Date(); 
                return (this.expires === null || this.expires <= now) ||
                        (this.activates === null || this.activates >= now); 
            }
        });
        
        o.forEach(function(document) {
            assert.ok(document.expires === null || document.expires <= now);
            assert.ok(document.activates === null || document.activates >= now);
            assert.equal("published", document.status);
        });
        
        assert.equal(5, o.length);
        done();
    });
});