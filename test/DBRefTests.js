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

describe('DBRef', function() {
    describe('constructor', function() {
       it('should construct a valid database reference', function() {
            var storage    = Scule.getNodeJSDiskStorageEngine({
                secret: 'mysecretkey',
                path:   '/tmp'
            });

            var ut1 = Scule.factoryCollection('scule+dummy://ut1', storage);
            ut1.save({
                foo:'bar1',
                bar:'foo1'
            });
            var o1 = ut1.findAll();
            o1 = o1[0];

            var ut2 = Scule.factoryCollection('scule+dummy://ut2', storage);
            ut2.save({
                foo:'bar2',
                bar:'foo2',
                ref: Scule.getDBRef('scule+dummy://ut1', o1._id)
            });
            var o2 = ut2.findAll();
            o2 = o2[0];    

            var o3 = o2.ref.resolve(storage);
            assert.equal(o1, o3);
            
            var exception = false;
            try {
                Scule.getDBRef('scule+dummy://ut1', undefined);
            } catch (e) {
                exception = true;
            }
            assert.equal(true, exception);
       });
    });
    describe('accessors', function() {
       it('should test object accessors', function() {
           var ref = new Scule.db.classes.DBRef('foo', 'bar');
           assert.equal('foo', ref.getRef());
           assert.equal('bar', ref.getId());
       });
    });
});