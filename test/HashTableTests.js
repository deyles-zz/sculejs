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

describe('HashTable', function() {
    it('should return the hash table size', function() {
        var table = Scule.getHashTable();
        table.put('foo', 'bar');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        assert.equal(table.getLength(), 3);
        table.put('foo', 'bar4');
        assert.equal(table.getLength(), 3);        
    });
    it('should empty the hash table', function() {
        var table = Scule.getHashTable();
        table.put('foo1', 'bar1');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        table.clear();
        assert.equal(table.getLength(), 0);        
    });
    it('should determine whether or not keys exist in a hash table', function() {
        var table = Scule.getHashTable();
        table.put('foo1', 'bar1');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        table.put(3, 'bar4');
        assert.equal(true, table.contains('foo2'));
        assert.equal(false, table.contains('foo4'));
        assert.equal(true, table.contains(3));        
    });
    it('should return entries from the hash table', function() {
        var table = Scule.getHashTable();
        table.put('foo', 'bar');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        table.put('foo', 'bar4');
        assert.equal(table.get('foo'), 'bar4');
        assert.equal(table.get('foo3'), 'bar3');        
    });
    it('should return entries from a the hash table', function() {
        var table = Scule.getHashTable();
        table.put('foo', 'bar');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        table.put(666, 'the devil!');
        table.remove('foo');
        assert.equal(false, table.contains('foo'));
        assert.equal(true, table.contains('foo2'));
        assert.equal('bar2', table.remove('foo2'));
        assert.equal(false, table.remove('foo2'));
        assert.equal('the devil!', table.remove(666));
        assert.equal(false, table.remove(666));
        assert.equal(false, table.remove(999));        
    });
    it('should return all keys present in a hash table', function() {
        var table = Scule.getHashTable();
        table.put('foo1', 'bar1');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        assert.equal(JSON.stringify(table.getKeys()), JSON.stringify(['foo1','foo2','foo3']));        
    });
    it('should return all values present in a hash table', function() {
        var table = Scule.getHashTable();
        table.put('foo1', 'bar1');
        table.put('foo2', 'bar2');
        table.put('foo3', 'bar3');
        assert.equal(JSON.stringify(table.getValues()), JSON.stringify(['bar1','bar2','bar3']));        
    });
});