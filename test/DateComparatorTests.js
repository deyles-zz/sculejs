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

describe('DateComparator', function() {
    var comparator = Scule.getDateComparator();
    it('verifies that dates can be accurately identified', function() {
        assert.equal(true, comparator.isDate(new Date()));
        assert.equal(true, comparator.isDate(Scule.getObjectDate()));
        assert.equal(false, comparator.isDate(1372395600));        
    });
    it('verifies that date normalization works', function() {
        assert.equal(1372395600000, comparator.normalizeDate(new Date(1372395600 * 1000)));
        assert.equal(1372395600000, comparator.normalizeDate(Scule.getObjectDate(1372395600, 0)));        
    });
    it('verifies that $eq date comparison logic functions as expected', function() {
        assert.equal(true, comparator.$eq(new Date(1372395600 * 1000), new Date(1372395600 * 1000)));
        assert.equal(true, comparator.$eq(new Date(1372395600 * 1000), Scule.getObjectDate(1372395600, 0)));
        assert.equal(true, comparator.$eq(Scule.getObjectDate(1372395600, 0), new Date(1372395600 * 1000)));
        assert.equal(true, comparator.$eq(Scule.getObjectDate(1372395600, 0), Scule.getObjectDate(1372395600, 0)));
        assert.equal(true, comparator.$eq(Scule.getObjectDateFromDate(new Date(1372395600 * 1000)), Scule.getObjectDate(1372395600, 0)));
        var exception = false;
        try {
            Scule.getObjectDateFromDate('foo');
        } catch (e) {
            exception = true;
        }
        assert.equal(true, exception);
    });
    it('verifies that $gt date comparison logic functions as expected', function() {
        assert.equal(true, comparator.$gt(new Date(1372395630 * 1000), new Date(1372395600 * 1000)));
        assert.equal(true, comparator.$gt(new Date(1372395630 * 1000), Scule.getObjectDate(1372395600, 0)));
        assert.equal(true, comparator.$gt(Scule.getObjectDate(1372395600, 300), new Date(1372395600 * 1000)));
        assert.equal(true, comparator.$gt(Scule.getObjectDate(1372395600, 300), Scule.getObjectDate(1372395600, 0)));
        assert.equal(false, comparator.$gt(new Date(1372395600 * 1000), new Date(1372395630 * 1000)));
        assert.equal(false, comparator.$gt(new Date(1372395600 * 1000), Scule.getObjectDate(1372395630, 300)));
        assert.equal(false, comparator.$gt(Scule.getObjectDate(1372395600, 0), new Date(1372395600 * 1000)));
        assert.equal(false, comparator.$gt(Scule.getObjectDate(1372395600, 0), Scule.getObjectDate(1372395600, 300)));
    });
    it('verifies that $gte date comparison logic functions as expected', function() {
        assert.equal(true, comparator.$gte(new Date(1372395600 * 1000), new Date(1372395600 * 1000)));
        assert.equal(true, comparator.$gte(new Date(1372395630 * 1000), Scule.getObjectDate(1372395600, 0)));
        assert.equal(true, comparator.$gte(Scule.getObjectDate(1372395600, 300), new Date(1372395600 * 1000)));
        assert.equal(true, comparator.$gte(Scule.getObjectDate(1372395600, 300), Scule.getObjectDate(1372395600, 0)));
        assert.equal(false, comparator.$gte(new Date(1372395600 * 1000), new Date(1372395630 * 1000)));
        assert.equal(false, comparator.$gte(new Date(1372395600 * 1000), Scule.getObjectDate(1372395630, 300)));
        assert.equal(true,  comparator.$gte(Scule.getObjectDate(1372395600, 0), new Date(1372395600 * 1000)));
        assert.equal(false, comparator.$gte(Scule.getObjectDate(1372395600, 0), Scule.getObjectDate(1372395600, 300)));        
    });
});