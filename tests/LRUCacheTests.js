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

exports['test LRUCacheThreshold'] = function(beforeExit, assert) {
    var threshold = 1000;
    var cache = sculedb.Scule.$d.getLRUCache(threshold);
    for(var i=0; i < 1000; i++) {
        cache.put(i, sculedb.Scule.$f.randomFromTo(10000, 20000));
    }
    assert.equal(cache.getLength(), threshold);
    assert.equal(cache.cache.getLength(), threshold);
    assert.equal(cache.queue.getLength(), threshold);
};

exports['test LRUCacheRequeue'] = function(beforeExit, assert) {
    var threshold = 1000;
    var cache = sculedb.Scule.$d.getLRUCache(threshold);
    for(var i=0; i < 1000; i++) {
        cache.put(i, sculedb.Scule.$f.randomFromTo(10000, 20000));
        cache.get(sculedb.Scule.$f.randomFromTo(1, 10000));
    }
    assert.equal(cache.getLength(), threshold);
    assert.equal(cache.cache.getLength(), threshold);
    assert.equal(cache.queue.getLength(), threshold);
};

exports['test LRUCacheFunctionality'] = function(beforeExit, assert) {
    try {
        var cache = sculedb.Scule.$d.getLRUCache(5);
        cache.put(1, {
            foo:'bar1'
        });
        cache.put(2, {
            foo:'bar2'
        });
        cache.put(3, {
            foo:'bar3'
        });
        cache.put(4, {
            foo:'bar4'
        });
        cache.put(5, {
            foo:'bar5'
        });
        cache.get(1);
        assert.equal(JSON.stringify(cache.get(1)), JSON.stringify({
            foo:'bar1'
        }));
        assert.equal(false, JSON.stringify(cache.get(1)) == JSON.stringify({
            foo:'bar2'
        }));
        cache.put(6, {
            foo:'bar6'
        });
        cache.put(7, {
            foo:'bar7'
        });
        assert.equal(false, cache.contains(3));
    } catch (e) {
        console.log(e);
    }
};