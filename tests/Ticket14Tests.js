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

var scule   = require('../lib/com.scule.db');

exports['test Ticket14a'] = function(beforeExit, assert) {

    scule.debug(false);

    var collection = scule.factoryCollection('scule+dummy://test', {
        secret:'mysecretkey'
    });
    
    for (var i=0; i < 1000; i++) {
        collection.save({
            _id:i, 
            index:i, 
            remainder:(i%10)
            });
    }

    collection.update({_id:500}, {$set:{index:1909, foo:'bar'}}, {}, true);
    collection.commit();
    
    var o = collection.findOne(500);    
    assert.equal(1909, o.index);
    assert.equal('bar', o.foo);
    assert.equal(500, o._id.toString());
   
};

exports['test Ticket14b'] = function(beforeExit, assert) {

    scule.debug(false);

    var collection = scule.factoryCollection('scule+dummy://test', {
        secret:'mysecretkey'
    });
    collection.clear();
    collection.save({
        _id: 1, 
        a: 10
    });
    
    collection.update({_id:1}, {$set:{a:20, b:50}}, {}, true);
    collection.commit();
    
    var o = collection.findOne(1);
    assert.equal(1, o._id.toString());
    assert.equal(20, o.a);
    assert.equal(50, o.b);

};