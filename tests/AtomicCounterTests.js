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

exports['test AtomicCounterInitialize'] = function(beforeExit, assert) {   
    var counter = sculedb.Scule.$d.getAtomicCounter(999);
    assert.equal(counter.getCount(), 999);   
};

exports['test AtomicCounterIncrement'] = function(beforeExit, assert) {   
    var counter = sculedb.Scule.$d.getAtomicCounter(1);
    counter.increment(1);
    assert.equal(counter.getCount(), 2);   
};

exports['test AtomicCounterIncrement2'] = function(beforeExit, assert) {   
    var counter = sculedb.Scule.$d.getAtomicCounter(1);
    counter.increment(11);
    assert.equal(counter.getCount(), 12);   
};

exports['test AtomicCounterDecrement'] = function(beforeExit, assert) {   
    var counter = sculedb.Scule.$d.getAtomicCounter(2);
    counter.decrement(1);
    assert.equal(counter.getCount(), 1);   
};

exports['test AtomicCounterDecrement2'] = function(beforeExit, assert) {   
    var counter = sculedb.Scule.$d.getAtomicCounter(12);
    counter.decrement(6);
    assert.equal(counter.getCount(), 6);   
};