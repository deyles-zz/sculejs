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

describe('BitSet', function() {
    it('should throw an exception when trying to use a string in the constructor', function() {
        var exception = false;
        try {
            var bitset = Scule.getBitSet('test');
        } catch (e) {
            exception = true;
        }
        assert.equal(true, exception);        
    });
    it('should throw an exception when trying to use a negative number in the constructor', function() {
        var exception = false;
        try {
            var bitset = Scule.getBitSet(-100);
        } catch (e) {
            exception = true;
        }
        assert.equal(true, exception);        
    });
    it('should throw an exception when trying to use a floating point number in the constructor', function() {
        var exception = false;
        try {
            var bitset = Scule.getBitSet(111.030202);
        } catch (e) {
            exception = true;
        }
        assert.equal(true, exception);
    });
    it('should initialize a bitset with a capacity of 8 bits', function() {
        var bitset = Scule.getBitSet(8);
        assert.equal(8, bitset.getLength());        
    });
    it('should verify that a new bitset is empty', function() {
        var bitset = Scule.getBitSet(1024);
        for (var i=0; i < bitset.words.length; i++) {
            assert.equal(0x00, bitset.words[i]);
        }        
    });
    it('should set every second bit', function() {
        var bitset = Scule.getBitSet(10);
        for (var i=0; i < 10; i++) {
            if (i%2) {
                bitset.set(i);
            }
        }
        for (var i=0; i < 10; i++) {
            if (i%2) {
                assert.equal(true, bitset.get(i));
            } else {
                assert.equal(false, bitset.get(i));
            }
        }        
    });
    it('should set random bits', function() {
        for (var j=0; j < 10000; j++) {
            var bitset = Scule.getBitSet(90);
            var string = '';
            for (var i=0; i < bitset.getLength(); i++) {
                if (Scule.global.functions.randomFromTo(0, 1) == 1) {
                    bitset.set(i);
                    string += '1';
                } else {
                    string += '0';
                }
            }
            assert.equal(string, bitset.toString());
        }        
    });
    it('should clear a given bit in the bitset', function() {
        var bitset = Scule.getBitSet(10);
        for (var i=0; i < 10; i++) {
            bitset.set(i);
        }
        bitset.clear(5);
        for (var i=0; i < 10; i++) {
            if (i == 5) {
                assert.equal(false, bitset.get(i));                
            } else {
                assert.equal(true, bitset.get(i)); 
            }
        }
    });
    it('should throw an exception when attempting to address a bit out of range', function() {
        var exception = false;
        try {
            var bitset = Scule.getBitSet(10);
            bitset.get(1000);
        } catch (e) {
            exception = true;
        }
        assert.equal(true, exception);        
    });
});