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

exports['test Ticket32'] = function(beforeExit, assert) {
 
    var table = {};
 
    Scule.dropAll();
    var collection1 = Scule.factoryCollection('scule+nodejs://ticket32', {
        'secret':'test',
        'path':'/tmp'
    });
    collection1.clear();
    for (var i=0; i < 100; i++) {
        var o = {
            i: i
        };
        collection1.save(o);
        table[Scule.global.functions.getObjectId(o, true)] = o;
    }
    collection1.commit();
           
    setTimeout(function() {
        var storage = Scule.getNodeJSDiskStorageEngine({
            'secret':'test',
            'path':'/tmp'
        });
        var collection2 = new Scule.db.classes.Collection('ticket32');
        collection2.setStorageEngine(storage);
        collection2.open(function() {
            collection2.findAll(function(documents) {
                assert.equal(100, documents.length);
                documents.forEach(function(o) {
                    assert.equal(true, table.hasOwnProperty(Scule.global.functions.getObjectId(o, true)));
                });
            });            
        });
    }, 100);

};