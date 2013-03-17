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
"use strict";

/**
 * @module com.scule.events
 */

var md5 = {
    m: require('crypto'),
    hash: function (s) {
        return this.m.createHash('md5').update(s).digest('hex');
    }
};

module.exports = {
    Scule: {
        functions: {},
        classes:   {},
        objects:   {},
        $f:require(__dirname + '/com.scule.functions').Scule.functions,
        $d:require(__dirname + '/com.scule.datastructures'),
        $e:require(__dirname + '/com.scule.events')
    }
};

/**
 * Represents a message with a routing key and payload
 * @class {Message}
 * @constructor
 * @param {String} key the routing key for the message
 * @param {Mixed} body the payload for the message
 * @returns {Void}
 */
module.exports.Scule.classes.Message = function(key, body) {
    
    /**
     * @access private
     * @type {String}
     */
    this.key = key;
    
    /**
     * @access private
     * @type {Mixed}
     */
    this.body = body;
    
    /**
     * Returns the routing key for the message
     * @access public
     * @returns {String}
     */
    this.getKey = function() {
        return this.key;
    };
    
    /**
     * Returns the payload for the message
     * @access public
     * @returns {Mixed}
     */
    this.getBody = function() {
        return this.body;
    };
    
};

/**
 * Represents a message queue
 * @constructor
 * @class {MessageQueue}
 * @param {String} name the name of the queue
 * @returns {Void}
 */
module.exports.Scule.classes.MessageQueue = function(name) {
    
    /**
     * @access public
     * @type {String}
     */
    this.name        = name;
    
    /**
     * @access public
     * @type {Array}
     */
    this.subscribers = [];
    
    module.exports.Scule.$d.Scule.classes.Queue.call(this);
    
    /**
     * Returns the name of the queue
     * @returns {String}
     */
    this.getName = function() {
        return this.name;
    };
    
    /**
     * Adds a subscriber to the queue
     * @param {MessageSubscriber} subscriber the subscriber to add
     * @returns {Void}
     */
    this.addSubscriber = function(subscriber) {
        this.subscribers.push(subscriber);
    };
    
    /**
     * Return a list of all subscribers registered with the queue
     * @returns {Array}
     */
    this.getSubscribers = function() {
        return this.subscribers;
    };
    
    /**
     * Removes all subscribers from the queue
     * @returns {Void}
     */
    this.removeSubscribers = function() {
        this.subscribers = [];
    };
    
};

/**
 * Represents a message exchange
 * @class {MessageExchange}
 * @constructor
 * @param {String} name the name of the exchange
 * @returns {Void}
 */
module.exports.Scule.classes.MessageExchange = function(name) {
    
    /**
     * @access private
     * @type {String}
     */
    this.name = name;
    
    /**
     * @access private
     * @type {HashTable}
     */
    this.queues = module.exports.Scule.$d.getHashTable(); 
    
    /**
     * Returns the name of the exchange
     * @returns {String}
     */
    this.getName = function() {
        return this.name;
    };
    
    /**
     * binds a queue to the exchange
     * @access public
     * @param {MessageQueue} queue the queue to bind
     * @param {String} routingKey the key to bind with
     * @returns {Boolean}
     * @throws {Exception}
     */
    this.addQueue = function(queue, routingKey) {
        if (!(queue instanceof module.exports.Scule.classes.MessageQueue)) {
            throw 'provided object is not a messge queue';
        }
        if (this.queues.contains(queue.getName())) {
            throw 'exchange ' + name + ' is already bound to queue ' + queue.getName();
        }
        this.queues.put(queue.getName(), queue);
        this.addRoute(queue, routingKey);
        return true;
    };
    
    /**
     * Adds a route to the exchange - this is implemented by extending classes
     * @access public
     * @param {MessageQueue} queue the queue to create a route for
     * @param {String} routingKey the routing key for the binding
     * @returns {Boolean}
     */
    this.addRoute = function(queue, routingKey) {
        return true;
    };
    
    /**
     * Unbinds a queue from the exchange
     * @access public
     * @param {MessageQueue} queue the queue to unbind
     * @returns {Boolean}
     */
    this.removeQueue = function(queue) {
        if (this.queues.contains(queue.getName())) {
            this.queues.remove(queue.getName());
            this.removeRoute(queue);
            return true;
        }
        return false;
    };
    
    /**
     * Removes a route from the exchange
     * @access public
     * @param {MessageQueue} queue
     * @returns {Boolean}
     */
    this.removeRoute = function(queue) {
        return true;
    };
    
    this.route = function(message) {
        throw 'routing is not supported in abstract exchange class';
    };
    
};

module.exports.Scule.classes.FanOutMessageExchange = function(name) {

    module.exports.Scule.classes.MessageExchange.call(this, name);

    this.route = function(message) {
        var __t   = this;
        var names = this.queues.getKeys();
        names.forEach(function(name) {
            __t.queues.get(name).enqueue(message);
        });
    };

};

module.exports.Scule.classes.DirectMessageExchange = function(name) {
    
    this.routes = module.exports.Scule.$d.getHashTable();
    
    module.exports.Scule.classes.MessageExchange.call(this, name);
    
    this.addRoute = function(queue, routingKey) {
        var key = md5.hash(routingKey.toString());
        if (!this.routes.contains(key)) {
            this.routes.put(key, {key:routingKey, queues:[]});
        }
        this.routes.get(key).queues.push(queue);
    };
    
    this.removeRoute = function(queue) {
        var __t  = this;
        var keys = this.routes.getKeys();
        keys.forEach(function(key) {
            var route = __t.routes.get(key);
            var len   = route.queues.length;
            while (len--) {
                if (route.queues[len] == queue) {
                    route.queues.splice(len, 1);
                }
            }
        });
    };    
    
    this.route = function(message) {
        var __t  = this;
        var keys = this.routes.getKeys();
        keys.forEach(function(key) {
            var route = __t.routes.get(key);
            if (!message.getKey().match(route.key)) {
                return;
            }
            for (var i=0; i < route.queues.length; i++) {
                route.queues[i].enqueue(message);
            }            
        });
    };  
    
};

module.exports.Scule.classes.MessageChannel = function() {

    this.bindings = module.exports.Scule.$d.getHashTable();
    
    this.bind = function(exchange, queue, routingKey) {
        var key = exchange.getName() + ',' + queue.getName();
        if (this.bindings.contains(key)) {
            throw 'binding for ' + key + ' already exists';
        }
        this.bindings.put(key, {
            exchange: exchange,
            queue: queue
        });
        exchange.addQueue(queue, routingKey);
    };

    this.unbind = function(exchange, queue) {
        var key = exchange.getName() + ',' + queue.getName();
        if (!this.bindings.contains(key)) {
            throw 'binding for ' + key + ' does not exist';
        }
        var binding = this.bindings.get(key);
        this.bindings.remove(key);
        binding.exchange.removeQueue(binding.queue);
    };

};

module.exports.Scule.classes.MessageSubscriber = function(queue, callback) {
    
    this.queue    = queue;
    this.callback = callback;
    this.interval = null;
    
    this.start = function() {
        var __t = this;
        this.interval = setInterval(function() {
            var o = __t.queue.dequeue();
            if (o) {
                __t.callback(o);
            }
        }, (10 + module.exports.Scule.$f.randomFromTo(3, 8)));
    };
    
    this.stop = function() {
        clearInterval(this.interval);
    };
    
};

module.exports.Scule.classes.MessagingDirector = function() {

    this.queues      = module.exports.Scule.$d.getHashTable();
    this.exchanges   = module.exports.Scule.$d.getHashTable(); 
    this.channel     = new module.exports.Scule.classes.MessageChannel();

    this.bind = function(exchangeName, queueName, routingKey) {
        if (routingKey !== undefined) {
            this.bindDirect(exchangeName, queueName, routingKey);
        } else {
            this.bindFanOut(exchangeName, queueName);
        }
    };

    this.bindDirect = function(exchangeName, queueName, routingKey) {
        var exchange = null;
        var queue    = null;
        if (this.exchanges.contains(exchangeName)) {
            exchange = this.exchanges.get(exchangeName);
            if (!(exchange instanceof module.exports.Scule.classes.DirectMessageExchange)) {
                throw 'unable to bind directly to a fan-out exchange';
            }
        } else {
            exchange = new module.exports.Scule.classes.DirectMessageExchange(exchangeName);
            this.exchanges.put(exchangeName, exchange);
        }
        if (this.queues.contains(queueName)) {
            queue = this.queues.get(queueName);
        } else {
            queue = new module.exports.Scule.classes.MessageQueue(queueName);
            this.queues.put(queueName, queue);
        }
        this.channel.bind(exchange, queue, routingKey);
    };

    this.bindFanOut = function(exchangeName, queueName) {
        var exchange = null;
        var queue    = null;
        if (this.exchanges.contains(exchangeName)) {
            exchange = this.exchanges.get(exchangeName);
            if (!(exchange instanceof module.exports.Scule.classes.FanOutMessageExchange)) {
                throw 'unable to bind to direct exchange without a routing key';
            }
        } else {
            exchange = new module.exports.Scule.classes.FanOutMessageExchange(exchangeName);
            this.exchanges.put(exchangeName, exchange);
        }
        if (this.queues.contains(queueName)) {
            queue = this.queues.get(queueName);
        } else {
            queue = new module.exports.Scule.classes.MessageQueue(queueName);
            this.queues.put(queueName, queue);
        }
        this.channel.bind(exchange, queue);        
    };

    this.publish = function(exchangeName, key, body) {
        var message = new module.exports.Scule.classes.Message(key, body);
        if (!this.exchanges.contains(exchangeName)) {
            throw 'exchange ' + exchangeName + ' does not exist';
        }
        var exchange = this.exchanges.get(exchangeName);
        exchange.route(message);
    };

    this.subscribe = function(queueName, callback) {
        if (!this.queues.contains(queueName)) {
            throw 'queue ' + queueName + ' does not exist';
        }
        var queue      = this.queues.get(queueName);
        var subscriber = new module.exports.Scule.classes.MessageSubscriber(queue, callback);
        queue.addSubscriber(subscriber);
        subscriber.start();
    };

    this.unsubscribeAll = function(queueName) {
        if (!this.queues.contains(queueName)) {
            throw 'queue ' + queueName + ' does not exist';
        }
        var queue = this.queues.get(queueName);
        var subscribers = queue.getSubscribers();
        subscribers.forEach(function(subscriber) {
            subscriber.stop();
        });
        queue.subscribers = [];
    };

};

module.exports.getMessage = function(name, body) {
    return new module.exports.Scule.classes.Message(name, body);
};

module.exports.getMessageQueue = function(name) {
    return new module.exports.Scule.classes.MessageQueue(name);
};

module.exports.getMessageExchange = function(name) {
    return new module.exports.Scule.classes.MessageExchange(name);
};

module.exports.getFanOutMessageExchange = function(name) {
    return new module.exports.Scule.classes.FanOutMessageExchange(name);
};

module.exports.getDirectMessageExchange = function(name, key) {
    return new module.exports.Scule.classes.DirectMessageExchange(name, key);
};

module.exports.getMessageChannel = function() {
    return new module.exports.Scule.classes.MessageChannel();
};

module.exports.getMessagingDirector = function() {
    return new module.exports.Scule.classes.MessagingDirector();
};