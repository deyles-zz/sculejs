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

describe('ObjectDate', function() {
    describe('constructor', function() {
        it('should construct a valid DateObject using a Date instance', function() {
            var date = Scule.getObjectDate();
            var ts   = (new Date()).getTime();
            assert.equal(true, ts > date.getTimestamp());
            assert.equal(true, date.getSeconds() > 0);
            assert.equal(true, date.getMicroSeconds() > 0);            
        });
        it('should construct a valid DateObject using default values', function() {
            var ts   = (new Date()).getTime().toString();
            var date = Scule.getObjectDate(parseInt(ts.substring(0, 10)), parseInt(ts.substring(10)));
            assert.equal(true, date.getSeconds() > 0);
            assert.equal(true, date.getMicroSeconds() > 0);            
        });
    });
    describe('cast', function() {
        it('should return a valid Date instance', function() {
            var date = Scule.getObjectDate(1372395600, 0);
            assert.equal((new Date(1372395600 * 1000)).getTime(), date.toDate().getTime());            
        });
    });
});