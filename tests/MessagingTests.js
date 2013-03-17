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

var messaging = require('../lib/com.scule.messaging');

exports['test DirectMessageExchange'] = function(beforeExit, assert) {
    var queues = [];
    for (var i=0; i < 10; i++) {
        queues.push(messaging.getMessageQueue('q:' + i));
    }
    var exchange = messaging.getDirectMessageExchange('test');
    var channel  = messaging.getMessageChannel();
    for (var i=0; i < 10; i++) {
        if (i%2 == 0) {
            channel.bind(exchange, queues[i], /^scule\.test\.(.*)$/gi);
        }
    }
    channel.unbind(exchange, queues[0]);
    exchange.route(messaging.getMessage('scule.test.unit', {
        foo:'bar'
    }));
    exchange.route(messaging.getMessage('scule.foo.bar', {
        foo:'bar'
    }));
    for (var i=1; i < 10; i++) {
        if (i%2 == 0) {
            assert.equal(queues[i].getLength(), 1);
            var o = queues[i].dequeue();
            assert.ok(o);
            assert.equal(o.getKey(), 'scule.test.unit');
            assert.equal(JSON.stringify(o.getBody()), JSON.stringify({
                foo:'bar'
            }));
        }
    }
};

exports['test FanOutMessageExchange'] = function(beforeExit, assert) {
    var queues = [];
    for (var i=0; i < 10; i++) {
        queues.push(messaging.getMessageQueue('q:' + i));
    }
    var exchange = messaging.getFanOutMessageExchange('test');
    var channel  = messaging.getMessageChannel();
    for (var i=0; i < 10; i++) {
        if (i%2 == 0) {
            channel.bind(exchange, queues[i]);
        }
    }
    var message  = messaging.getMessage('scule.test.unit', {
        foo:'bar'
    });
    exchange.route(messaging.getMessage('scule.foo.bar', {
        foo:'bar'
    }));
    exchange.route(message);
    for (var i=0; i < 10; i++) {
        if (i%2 == 0) {
            assert.equal(queues[i].getLength(), 2);
            var o = queues[i].dequeue();
            assert.ok(o);
            assert.equal(true, (o.getKey() == 'scule.test.unit' || o.getKey() == 'scule.foo.bar'));
            assert.equal(JSON.stringify(o.getBody()), JSON.stringify({
                foo:'bar'
            }));
        }
    }
};

exports['test MessagingDirector'] = function(beforeExit, assert) {
    var director = messaging.getMessagingDirector();
    director.bind('test_exchange1', 'test_queue1');
    director.bind('test_exchange1', 'test_queue2');
    director.bind('test_exchange1', 'test_queue3');
    director.bind('test_exchange2', 'test_queue1', /scule\.test\.(.*)/ig);
    director.bind('test_exchange2', 'test_queue2', /scule\.foo\.(.*)/ig);
    director.bind('test_exchange3', 'test_queue3');
    
    var c1 = 0, c2 = 0, c3 = 0;
    
    director.subscribe('test_queue1', function(message) {
        assert.equal(true, (message.key == 'scule.test.bar' || message.key == 'scule.test.foo' || message.key == 'scule.lol.wut'));
        c1++;
    });
    director.subscribe('test_queue2', function(message) {
        assert.equal(true, (message.key == 'scule.foo.bar' || message.key == 'scule.test.foo' || message.key == 'scule.lol.wut'));
        c2++;
    });
    director.subscribe('test_queue3', function(message) {
        c3++;
    });    
    for (var i=0; i < 10000; i++) {
        director.publish('test_exchange1', 'scule.test.foo', {
            foo:'bar0'
        });
        director.publish('test_exchange1', 'scule.lol.wut', {
            foo:'bar1'
        });        
        director.publish('test_exchange2', 'scule.bar.foo', {
            foo:'bar2'
        });
        director.publish('test_exchange2', 'scule.test.bar', {
            foo:'bar3'
        });
        director.publish('test_exchange3', 'scule.a.b.c', {
            foo:'bar4'
        });        
    }
    setTimeout(function() {
        director.unsubscribeAll('test_queue1');
        director.unsubscribeAll('test_queue2');
        director.unsubscribeAll('test_queue3');
    }, 1000);
};