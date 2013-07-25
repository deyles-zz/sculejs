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

describe('SimpleCryptographyProvider', function() {
    it('should sign a string', function() {
        var provider = Scule.getSimpleCryptographyProvider();
        var hash = provider.signString('foobar');
        assert.equal(hash, provider.signString('foobar'));        
    });
    it('should sign an object', function() {
        var provider = Scule.getSimpleCryptographyProvider();
        var object = {
            _sig: null,
            _meta: {
                ver: 2.0,
                salt: 123456789
            },
            _collection: {
                'iamatestkey':{
                    foo:'bar',
                    bar:'foo'
                }
            }
        };
        var hash = provider.signObject(object, 'mysecretkey', 'mysecretsalt');
        assert.equal(hash, provider.signObject(object, 'mysecretkey', 'mysecretsalt'));        
    });
    it('should sign a JSON string', function() {
        var provider = Scule.getSimpleCryptographyProvider();
        var object = {
            _sig: null,
            _meta: {
                ver: 2.0,
                salt: 123456789
            },
            _collection: {
                'iamatestkey':{
                    foo:'bar',
                    bar:'foo'
                }
            }
        };
        var hash = provider.signJSONString(object, 'mysecretkey', 'mysecretsalt'); 
        assert.equal(hash, provider.signJSONString(object, 'mysecretkey', 'mysecretsalt'));        
    });
    it('should verify the signature calculated from an object', function() {
        var provider = Scule.getSimpleCryptographyProvider();
        var object = {
            _sig: null,
            _meta: {
                ver: 2.0,
                salt: 123456789
            },
            _collection: {
                'iamatestkey':{
                    foo:'bar',
                    bar:'foo'
                }
            }
        };
        object._sig = provider.signObject(object, 'mysecretkey', 'mysecretsalt');
        assert.equal(true, provider.verifyObjectSignature(object, 'mysecretkey', 'mysecretsalt'));
        object._sig = 'foobar';
        assert.equal(false, provider.verifyObjectSignature(object, 'mysecretkey', 'mysecretsalt'));            
    });
});