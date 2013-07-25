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

describe('BloomFilter', function() {
    it('should throw an exception when trying to use a string in the constructor', function() {
        var exception = false;
        try {
            var filter = Scule.getBloomFilter('test');
        } catch (e) {
            exception = true;
        }
        assert.equal(true, exception);        
    });
    it('should throw an exception when trying to use a negative number in the constructor', function() {
        var exception = false;
        try {
            var filter = Scule.getBloomFilter(-100);
        } catch (e) {
            exception = true;
        }
        assert.equal(true, exception);        
    });
    it('should throw an exception when trying to use a floating point number in the constructor', function() {
        var exception = false;
        try {
            var filter = Scule.getBloomFilter(111.030202);
        } catch (e) {
            exception = true;
        }
        assert.equal(true, exception);
    });    
    it('verifies that bloom filter insertion and queries function as expected', function() {
        for (var j=0; j < 500; j++) {
            var table  = Scule.getHashTable(2000);
            var filter = Scule.getBloomFilter(15000);
            var keys = [];
            for (var i=0; i < 300; i++) {
                var key = Math.random().toString(36).substring(5);
                table.put(key)
                filter.add(key);
            }
            table.getKeys().forEach(function(k) {
                assert.equal(true, filter.query(k));
            });
            var nkey = Math.random().toString(36).substring(5);
            while (table.contains(nkey)) {
                nkey = Math.random().toString(36).substring(5);
            }
            assert.equal(false, filter.query(nkey));
        }        
    });
});