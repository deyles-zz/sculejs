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

describe('PrimaryKeyIndex', function() {
    it('should add an object to the index', function() {
        var index = Scule.getPrimaryKeyIndex();
        for (var i=0; i < 100; i++) {
            var o = {
                i: i,
                _id: Scule.getObjectId()
            };
            index.add(o);
        }
        assert.equal(100, index.length());        
    });
    it('should return a boolean value indicating whether or not an object exists in the index', function() {
        var objects = [];
        var index = Scule.getPrimaryKeyIndex();
        for (var i=0; i < 100; i++) {
            var o = {
                i: i,
                _id: Scule.getObjectId()
            };
            objects.push(o);
            index.add(o);
        }

        objects.forEach(function(o) {
            assert.equal(true, index.contains(Scule.global.functions.getObjectId(o, true)));
        });        
    });
    it('should return an object from the index', function() {
        var objects = [];
        var index = Scule.getPrimaryKeyIndex();
        for (var i=0; i < 100; i++) {
            var o = {
                i: i,
                _id: Scule.getObjectId()
            };
            objects.push(o);
            index.add(o);
        }

        objects.forEach(function(o) {
            assert.equal(o, index.get(Scule.global.functions.getObjectId(o, true)));
        });        
    });
    it('should remove all objects from the index', function() {
        var index = Scule.getPrimaryKeyIndex();
        for (var i=0; i < 100; i++) {
            var o = {
                i: i,
                _id: Scule.getObjectId()
            };
            index.add(o);
        }
        assert.equal(100, index.length());
        index.clear();
        assert.equal(0, index.length());        
    });
    it('should remove particular objects from the index', function() {
        var objects = [];
        var index = Scule.getPrimaryKeyIndex();
        for (var i=0; i < 100; i++) {
            var o = {
                i: i,
                _id: Scule.getObjectId()
            };
            objects.push(o);
            index.add(o);
        }

        assert.equal(100, index.length());

        assert.equal(true, index.contains(Scule.global.functions.getObjectId(objects[50], true)))
        index.remove(objects[50]);
        assert.equal(99, index.length());
        assert.equal(false, index.contains(Scule.global.functions.getObjectId(objects[50], true)))

        assert.equal(true, index.contains(Scule.global.functions.getObjectId(objects[10], true)))
        index.remove(objects[10]);
        assert.equal(98, index.length());
        assert.equal(false, index.contains(Scule.global.functions.getObjectId(objects[10], true)))        
    });
    it('should return the index as a hash table', function() {
        var objects = [];
        var index = Scule.getPrimaryKeyIndex();
        for (var i=0; i < 100; i++) {
            var o = {
                i: i,
                _id: Scule.getObjectId()
            };
            objects.push(o);
            index.add(o);
        }

        var table = index.toTable();
        objects.forEach(function(o) {
            assert.equal(true, table.hasOwnProperty(Scule.global.functions.getObjectId(o, true)));
        });        
    });
    it('should return the index as an array', function() {
        var objects = [];
        var index = Scule.getPrimaryKeyIndex();
        for (var i=0; i < 100; i++) {
            var o = {
                i: i,
                _id: Scule.getObjectId()
            };
            objects.push(o);
            index.add(o);
        }

        var array = index.toArray();
        assert.equal(100, array.length);
        for (var j=0; j < array.length; j++) {
            assert.equal(objects[j], array[j]);
        }        
    });
});