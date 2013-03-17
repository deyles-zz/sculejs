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

module.exports = {
    Scule: {
        functions: {},
        classes:   {},
        objects:   {},
        $f:require(__dirname + '/com.scule.functions').Scule.functions,
        $d:require(__dirname + '/com.scule.datastructures')
    }
};

/**
 * Represents an "event"
 * @access public
 * @constructor
 * @param {String} the event name
 * @param {Mixed} the event payload
 * @class {Event}
 * @returns {Void}
 */
module.exports.Scule.classes.Event = function(name, body) {
    
    /**
     * @access private
     * @type {String}
     */
    this.name = name;
    
    /**
     * @access private
     * @type {Mixed}
     */
    this.body = body;
    
    /**
     * Returns the name of the event
     * @access public
     * @returns {String}
     */
    this.getName = function() {
        return this.name;
    };
    
    /**
     * Returns the body of the event
     * @access public
     * @returns {Mixed}
     */
    this.getBody = function() {
        return this.body;
    };
    
};

/**
 * Represents an event emitter - used to propogate events
 * @access public
 * @constructor
 * @class {EventEmitter}
 * @returns {Void}
 */
module.exports.Scule.classes.EventEmitter = function() {
    
    /**
     * @access private
     * @type {HashTable}
     */
    this.listeners = module.exports.Scule.$d.getHashTable();
    
    /**
     * Creates a bucket in the listener hash table corresponding to the provided
     * name if one doesn't already exist
     * @access private
     * @param {String} the name of the bucket to create
     * @returns {Void}
     */
    this.createBucket = function(name) {
        if (!this.listeners.contains(name)) {
            this.listeners.put(name, []);
        }
    };
    
    /**
     * Adds a listener for the named event - listeners can either be instances of
     * the EventListener class or closures accepting a single parameter (the event)
     * @access public
     * @param {String} the name of the event to listen for
     * @param {Function|EventListener} the listener for the event
     * @returns {Void}
     */
    this.addEventListener = function(name, listener) {
        if (!(listener instanceof module.exports.Scule.classes.EventListener)) {
            listener = new module.exports.Scule.classes.EventListener(listener);
        }
        this.createBucket(name);
        var bucket = this.listeners.get(name);
        bucket.push(listener);
    };
 
    /**
     * Removes the specified listener from the emitter
     * @access public
     * @param {String} the name of the event to listen for
     * @param {Function|EventListener} the listener for the event
     * @returns {Void}
     */ 
    this.removeEventListener = function(name, listener) {
        this.createBucket(name);
        if (listener instanceof module.exports.Scule.classes.EventListener) {
            listener = listener.getClosure();
        }        
        var bucket = this.listeners.get(name);
        var newbucket = [];
        for (var i=0; i < bucket.length; i++) {
            if (bucket[i].getClosure() != listener) {
                newbucket.push(listener)
            }
        }
        this.listeners.put(name, newbucket);
    };
    
    /**
     * Removes all listeners for the named event
     * @access public
     * @returns {Void}
     */
    this.removeEventListeners = function(name) {
        this.listeners.remove(name);
    };
    
    /**
     * Propogates an event to all registered listeners
     * @access public
     * @param {String} the name of the event to listen for
     * @param {Object|Event} the event to emit
     * @returns {Void}
     */
    this.fireEvent = function(name, event) {
        this.createBucket(name);
        if (!(event instanceof module.exports.Scule.classes.Event)) {
            event = new module.exports.Scule.classes.Event(name, event);
        }
        var bucket = this.listeners.get(name);
        bucket.forEach(function(listener) {
            listener.consume(event);
        });
    };
    
};

/**
 * Represents an event listener
 * @access public
 * @constructor
 * @param {Function} the handler for the event being listened to
 * @returns {Void}
 */
module.exports.Scule.classes.EventListener = function(closure) {

    /**
     * @access private
     * @type Function
     */
    this.closure = closure;

    /**
     * Consumes the provided event
     * @access public
     * @param {Event} the event to consume
     * @returns {Void}
     */
    this.consume = function(event) {
        this.closure(event);
    };

    /**
     * Returns the closure encapsulated by the event listener
     * @access public
     * @returns {Function}
     */
    this.getClosure = function() {
        return this.closure;
    };

};

/**
 * Returns a new event listener
 * @access public
 * @param {Function} closure the closure that acts as the listener
 * @returns {EventListener}
 */
module.exports.getEventListener = function(closure) {
    return new module.exports.Scule.classes.EventListener(closure);
};

/**
 * Returns a new EventEmitter
 * @access public
 * @returns {EventEmitter}
 */
module.exports.getEventEmitter = function() {
    return new module.exports.Scule.classes.EventEmitter();
};

/**
 * Returns a new Event
 * @access public
 * @param {String} name
 * @param {Mixed} body
 * @returns {Event}
 */
module.exports.getEvent = function(name, body) {
    return new module.exports.Scule.classes.Event(name, body);
};