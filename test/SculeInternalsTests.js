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

describe('Scule', function() {
    describe('namespaces', function() {
        it('should register a new namespace', function() {
            Scule.registerNamespace('foo', {bar:{}});
            assert.equal(true, 'foo' in Scule);
        });
        it('should not register the same namespace twice', function() {
            var exception = false;
            try {
                Scule.registerNamespace('foo', {bar:{}});
            } catch (e) {
                exception = true;
            }
            assert.equal(true, exception);
        });
        it('should throw an exception due to missing namespace', function() {
            var exception = false;
            try {
                Scule.require('bar');
            } catch (e) {
                exception = true;
            }
            assert.equal(true, exception);            
        });
    });
    describe('components', function() {
        it('should register a new component', function() {
            Scule.registerComponent('foo', 'bar', 'module', 'stuff');
            assert.equal('stuff', Scule.foo.bar.module);
        });
        it('should throw an error if no matching type exists within the namespace', function() {
            var exception = false;
            try {
                Scule.registerComponent('foo', 'bar2', 'module', 'stuff');
            } catch (e) {
                exception = true;
            }
            assert.equal(true, exception);            
        });
    });
});