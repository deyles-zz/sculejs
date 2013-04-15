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
    
    /**
     * Routes a message to the queues bound to the exchange
     * @param {Message} message the message to route
     * @returns {Void}
     * @throws {Exception}
     */
    this.route = function(message) {
        throw 'routing is not supported in abstract exchange class';
    };
    
};

/**
 * Represents a fan-out message exchange - messages are routed to all bound
 * queues irrespective of their routing keys
 * @class {FanOutMessageExchange}
 * @constructor
 * @extends MessageExchange
 * @param {String} name the name of the exchange
 * @returns {Void}
 */
module.exports.Scule.classes.FanOutMessageExchange = function(name) {

    module.exports.Scule.classes.MessageExchange.call(this, name);

    /**
     * Routes a message to the queues bound to the exchange
     * @param {Message} message the message to route
     * @returns {Void}
     */
    this.route = function(message) {
        var __t   = this;
        var names = this.queues.getKeys();
        names.forEach(function(name) {
            __t.queues.get(name).enqueue(message);
        });
    };

};

/**
 * Represents a direct message exchange - messages are routed based on the routing
 * key pattern provided when bindings are created
 * @class {FanOutMessageExchange}
 * @constructor
 * @extends MessageExchange
 * @param {String} name the name of the exchange
 * @returns {Void}
 */
module.exports.Scule.classes.DirectMessageExchange = function(name) {
    
    /**
     * @access private
     * @type {HashTable}
     */
    this.routes = module.exports.Scule.$d.getHashTable();
    
    module.exports.Scule.classes.MessageExchange.call(this, name);
    
    /**
     * Adds a route to the exchange - this is implemented by extending classes
     * @access public
     * @param {MessageQueue} queue the queue to create a route for
     * @param {String} routingKey the routing key for the binding
     * @returns {Boolean}
     */    
    this.addRoute = function(queue, routingKey) {
        var key = md5.hash(routingKey.toString());
        if (!this.routes.contains(key)) {
            this.routes.put(key, {
                key:routingKey, 
                queues:[]
            });
        }
        this.routes.get(key).queues.push(queue);
    };
    
    /**
     * Removes a route from the exchange
     * @access public
     * @param {MessageQueue} queue
     * @returns {Boolean}
     */    
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
    
    /**
     * Routes a message to the queues bound to the exchange
     * @param {Message} message the message to route
     * @returns {Void}
     */    
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

/**
 * Represents a message channel - arbitrates bindings between queues and exchanges
 * @class {MessageChannel}
 * @constructor
 * @returns {Void}
 */
module.exports.Scule.classes.MessageChannel = function() {

    /**
     * @access private
     * @type {HashTable}
     */
    this.bindings = module.exports.Scule.$d.getHashTable();
    
    /**
     * Binds together a queue and an exchange
     * @param {MessageExchange} exchange
     * @param {MessageQueue} queue
     * @param {String} routingKey
     * @returns {Void}
     */
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

    /**
     * Destroys an existing binding between a queue and an exchange
     * @param {MessageExchange} exchange
     * @param {MessageQueue} queue
     * @returns {Void}
     */
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

/**
 * Represents a message subscriber - subscribers poll queues every 10 - 18 milliseconds
 * and process them using the provided callback function
 * @class {MessageSubscriber}
 * @constructor
 * @param {MessageQueue} queue
 * @param {Function} callback
 * @returns {Void}
 */
module.exports.Scule.classes.MessageSubscriber = function(queue, callback) {
    
    /**
     * @access private
     * @type {MessageQueue}
     */
    this.queue    = queue;
    
    /**
     * @access private
     * @type {Function}
     */
    this.callback = callback;
    
    /**
     * @access private
     * @type {Interval}
     */
    this.interval = null;
    
    /**
     * Starts the subscriber interval - intervals have between 3 and 8 milliseconds
     * of wobble, based on a random number created when creating the schedule
     * @access public
     * @returns {Void}
     */
    this.start = function() {
        var __t = this;
        this.interval = setInterval(function() {
            var o = __t.queue.dequeue();
            if (o) {
                __t.callback(o);
            }
        }, (10 + module.exports.Scule.$f.randomFromTo(3, 8)));
    };
    
    /**
     * Stops the subscriber interval
     * @access public
     * @returns {Void}
     */
    this.stop = function() {
        clearInterval(this.interval);
    };
    
};

/**
 * A director that controls the relationships between exchanges, queues, channels,
 * publishers and subscribers. This class also contains a lot of syntactic sugar
 * to make managing message queues much easier.
 * @class {MessagingDirector}
 * @constructor
 * @returns {Void}
 */
module.exports.Scule.classes.MessagingDirector = function() {

    /**
     * @access private
     * @type {HashTable}
     */
    this.queues      = module.exports.Scule.$d.getHashTable();
    
    /**
     * @access private
     * @type {HashTable}
     */
    this.exchanges   = module.exports.Scule.$d.getHashTable(); 
    
    /**
     * @access private
     * @type {MessageChannel}
     */
    this.channel     = new module.exports.Scule.classes.MessageChannel();

    /**
     * Creates a binding between a queue and an exchange, optionally using a routing key.
     * If no exchange or queue exist correspond go the provided names they are automatically
     * created. Attempting to create a binding on a fan-out exchange with a routing key
     * will result in an exception.
     * @access public
     * @param {String} exchangeName
     * @param {String} queueName
     * @param {RegEx} routingKey
     * @returns {Void}
     * @throws {Exception}
     */
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

    /**
     * Publishes a message to all subscribers via the provided exchange name
     * @access public
     * @param {String} exchangeName the exchange to send the message to
     * @param {String} key the routing key for the message
     * @param {Mixed} body the payload for the message
     * @returns {Void}
     * @throws {Exception}
     */
    this.publish = function(exchangeName, key, body) {
        var message = new module.exports.Scule.classes.Message(key, body);
        if (!this.exchanges.contains(exchangeName)) {
            throw 'exchange ' + exchangeName + ' does not exist';
        }
        var exchange = this.exchanges.get(exchangeName);
        exchange.route(message);
    };

    /**
     * Subscribes a listener to the given queue
     * @access public
     * @param {String} queueName the name of the queue to subscribe to
     * @param {Function} callback the callback function to use as the subscriber
     * @returns {Void}
     * @throws {Exception}
     */
    this.subscribe = function(queueName, callback) {
        if (!this.queues.contains(queueName)) {
            throw 'queue ' + queueName + ' does not exist';
        }
        var queue      = this.queues.get(queueName);
        var subscriber = new module.exports.Scule.classes.MessageSubscriber(queue, callback);
        queue.addSubscriber(subscriber);
        subscriber.start();
    };

    /**
     * Unsubscribes all subscribers for the given queue
     * @access public
     * @param {String} queueName the name of the queue to remove subscribers from
     * @throws {Exception}
     * @returns {Void}
     */
    this.unsubscribeAll = function(queueName) {
        if (queueName === undefined) {
            throw 'queue name is required';
        }        
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

/**
 * Returns an instance of the {Message} class
 * @param {String} name the name of the message
 * @param {String} body the body of the message
 * @returns {Message}
 */
module.exports.getMessage = function(name, body) {
    return new module.exports.Scule.classes.Message(name, body);
};

/**
 * Returns an instance of the {MessageQueue} class
 * @param {String} name the name of the queue
 * @returns {MessageQueue}
 */
module.exports.getMessageQueue = function(name) {
    return new module.exports.Scule.classes.MessageQueue(name);
};

/**
 * Returns an instance of the {MessageExchange} class
 * @param {String} name the name of the exchange
 * @returns {MessageExchange}
 */
module.exports.getMessageExchange = function(name) {
    return new module.exports.Scule.classes.MessageExchange(name);
};

/**
 * Returns an instance of the {FanOutMessageExchange} class
 * @param {String} name the name of the exchange
 * @returns {FanOutMessageExchange}
 */
module.exports.getFanOutMessageExchange = function(name) {
    return new module.exports.Scule.classes.FanOutMessageExchange(name);
};

/**
 * Returns an instance of the {DirectMessageExchange} class
 * @param {String} name the name of the exchange
 * @param {String} key the routing key for the exchange
 * @returns {DirectMessageExchange}
 */
module.exports.getDirectMessageExchange = function(name, key) {
    return new module.exports.Scule.classes.DirectMessageExchange(name, key);
};

/**
 * Returns an instance of the {MessageChannel} class
 * @returns {MessageChannel}
 */
module.exports.getMessageChannel = function() {
    return new module.exports.Scule.classes.MessageChannel();
};

/**
 * Returns an instance of the {MessagingDirector} class
 * @returns {MessagingDirector}
 */
module.exports.getMessagingDirector = function() {
    return new module.exports.Scule.classes.MessagingDirector();
};