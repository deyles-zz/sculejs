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

var Scule = require('../lib/com.scule');

exports['test QueryEngine'] = function(beforeExit, assert) {
    
    var engine = Scule.getQueryEngine();
    
    assert.equal(true, engine.$eq(new Date(1372395600 * 1000), new Date(1372395600 * 1000)));
    assert.equal(true, engine.$eq(new Date(1372395600 * 1000), Scule.getObjectDate(1372395600, 0)));
    assert.equal(true, engine.$eq(Scule.getObjectDate(1372395600, 0), new Date(1372395600 * 1000)));
    assert.equal(true, engine.$eq(Scule.getObjectDate(1372395600, 0), Scule.getObjectDate(1372395600, 0)));
    assert.equal(false, engine.$eq(Scule.getObjectDate(1372395600, 300), Scule.getObjectDate(1372395600, 0)));
    assert.equal(false, engine.$eq(new Date(1372395631 * 1000), Scule.getObjectDate(1372395630, 0)));
    
    assert.equal(true, engine.$eq(3, 3));
    assert.equal(true, engine.$eq(0, 0));
    assert.equal(true, engine.$eq(-3, -3));
    assert.equal(true, engine.$eq(null, null));
    assert.equal(true, engine.$eq('a', 'a'));
    assert.equal(true, engine.$eq('abc', 'abc'));
    assert.equal(true, engine.$eq('abc', /^abc$/));
    assert.equal(false, engine.$eq(3, 0));
    assert.equal(false, engine.$eq('a', 'b'));
    assert.equal(false, engine.$eq('bac', 'abc'));
    assert.equal(false, engine.$eq('cac', /^abc$/));
    
    assert.equal(false, engine.$ne(new Date(1372395600 * 1000), new Date(1372395600 * 1000)));
    assert.equal(false, engine.$ne(new Date(1372395600 * 1000), Scule.getObjectDate(1372395600, 0)));
    assert.equal(false, engine.$ne(Scule.getObjectDate(1372395600, 0), new Date(1372395600 * 1000)));
    assert.equal(false, engine.$ne(Scule.getObjectDate(1372395600, 0), Scule.getObjectDate(1372395600, 0)));
    assert.equal(true, engine.$ne(Scule.getObjectDate(1372395600, 300), Scule.getObjectDate(1372395600, 0)));
    assert.equal(true, engine.$ne(new Date(1372395631 * 1000), Scule.getObjectDate(1372395630, 0)));
    
    assert.equal(false, engine.$ne(3, 3));
    assert.equal(false, engine.$ne(0, 0));
    assert.equal(false, engine.$ne(-3, -3));
    assert.equal(false, engine.$ne(null, null));
    assert.equal(false, engine.$ne('a', 'a'));
    assert.equal(false, engine.$ne('abc', 'abc'));
    assert.equal(false, engine.$ne('abc', /^abc$/));
    assert.equal(true, engine.$ne(3, 0));
    assert.equal(true, engine.$ne('a', 'b'));
    assert.equal(true, engine.$ne('bac', 'abc'));
    assert.equal(true, engine.$ne('cac', /^abc$/));    
    
    assert.equal(true, engine.$in(1, [2, 3, 1, 5]));
    assert.equal(true, engine.$in('a', [2, 'c', 'a', 3, 1, 5]));
    assert.equal(true, engine.$in(null, [2, null, 3, 1, 5]));
    assert.equal(true, engine.$in('abc', [2, null, 3, /^ab/, 5]));
    assert.equal(true, engine.$in(Scule.getObjectDate(1372395600, 0), [2, new Date(1372395600 * 1000), 3, 1, 5]));
    assert.equal(true, engine.$in(Scule.getObjectDate(1372395600, 0), [2, Scule.getObjectDate(1372395600, 0), 3, 1, 5]));
    assert.equal(true, engine.$in(new Date(1372395600 * 1000), [2, new Date(1372395600 * 1000), 3, 1, 5]));

    assert.equal(false, engine.$nin(1, [2, 3, 1, 5]));
    assert.equal(false, engine.$nin('a', [2, 'c', 'a', 3, 1, 5]));
    assert.equal(false, engine.$nin(null, [2, null, 3, 1, 5]));
    assert.equal(false, engine.$nin('abc', [2, null, 3, /^ab/, 5]));
    assert.equal(false, engine.$nin(Scule.getObjectDate(1372395600, 0), [2, new Date(1372395600 * 1000), 3, 1, 5]));
    assert.equal(false, engine.$nin(Scule.getObjectDate(1372395600, 0), [2, Scule.getObjectDate(1372395600, 0), 3, 1, 5]));
    assert.equal(false, engine.$nin(new Date(1372395600 * 1000), [2, new Date(1372395600 * 1000), 3, 1, 5]));

};