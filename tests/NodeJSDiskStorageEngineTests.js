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

var sculedb   = require('../lib/com.scule.db');
var fs        = require('fs');

exports['test NodeJSDiskStorageWrite'] = function(beforeExit, assert) {
    var object = {
        foo: 'bar',
        bar: 'foo',
        arr: [1, 3, 2, 4, 5, 7],
        obj: {
            me: 'string'
        }
    }
    var storage = sculedb.getNodeJSDiskStorageEngine({
        secret: 'mysecretkey',
        path: '/tmp'
    });
    storage.write('unittest', object, function(o) {
        fs.stat('/tmp/unittest.json', function(err, stats) {
            assert.equal(true, !err);
            assert.equal(true, stats.isFile());
            assert.equal(true, stats.size > 0);
        });
    });
};

exports['test NodeJSDiskStorageRead'] = function(beforeExit, assert) {
    var storage = sculedb.getNodeJSDiskStorageEngine({
        secret: 'mysecretkey',
        path: '/tmp'
    });
    try {
        storage.read('unittest', function(o) {
            assert.isNotNull(o);
            assert.equal(o.foo, 'bar');
            assert.equal(o.bar, 'foo');
            assert.equal(o.arr.length, 6);
            assert.equal(o.arr[5], 7);
            assert.equal(o.obj.me, 'string');
        });  
    } catch (e) {
        assert.equal(false, true);
    }
};