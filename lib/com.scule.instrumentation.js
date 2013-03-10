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
 * @module com.scule.instrumentation
 * @private
 * @type {Object}
 */
module.exports = {
    Scule: {
        classes: {},
        $d: require(__dirname + '/com.scule.datastructures')
    }
};

/**
 * A simple timer for instrumenting intervals during program execution
 * @public
 * @constructor
 * @class {Timer}
 * @returns {Void}
 */
module.exports.Scule.classes.Timer = function () {

    /**
     * @private
     * @type {Number}
     */
    this.intervalCounter = 0;

    /**
     * @private
     * @type {Array}
     */
    this.intervalArray   = [];

    /**
     * @private
     * @type {LIFOStack}
     */
    this.intervals = module.exports.Scule.$d.getLIFOStack();

    /**
     * Resets all intervals in the timer
     * @public
     * @returns {Void}
     */
    this.resetTimer = function () {
        this.intervalCounter = 0;
        this.intervalArray   = [];
        this.intervals.clear();
    };

    /**
     * Starts an interval
     * @public
     * @param {String} tag the unique string used to identify the started interval
     * @returns {Void}
     */
    this.startInterval = function (tag) {
        this.intervalCounter = this.intervalCounter + 1;
        if (tag === undefined) {
            tag = this.intervalCounter;
        }
        this.intervals.push(new module.exports.Scule.classes.TimerInterval(tag));
        this.intervalArray.push(this.intervals.peek());
    };

    /**
     * Stops the last interval started
     * @public
     * @returns {Void}
     */
    this.stopInterval = function () {
        if (this.intervals.isEmpty()) {
            return false;
        }
        this.intervals.peek().stop();
        return this.intervals.pop();
    };

    /**
     * Stops all intervals encapsulated by the timer
     * @public
     * @returns {Void}
     */
    this.stopAllIntervals = function () {
        while (!this.intervals.isEmpty()) {
            this.intervals.pop().stop();
        }
    };

    /**
     * Logs all timers to the console
     * @public
     * @returns {Void}
     */
    this.logToConsole = function () {
        this.intervalArray.forEach(function (interval) {
            interval.logToConsole();
        });
    };

};

/**
 * Represents an interval within an instrumentation timer
 * @public
 * @constructor
 * @class {TimerInterval}
 * @param {String} tag the unique string identifier for the interval
 * @returns {Void}
 */
module.exports.Scule.classes.TimerInterval = function (tag) {

    /**
     * @private
     * @type Number
     */
    this.startTimestamp = (new Date()).getTime();
    this.endTimestamp   = null;
    this.tag            = tag;

    /**
     * Returns a boolean value indicating whether or not the interval is stopped
     * @public
     * @returns {Void}
     */
    this.stopped = function () {
        return this.endTimestamp !== null;
    };

    /**
     * Stops the interval
     * @public
     * @returns {Void}
     */
    this.stop = function () {
        this.endTimestamp = (new Date()).getTime();
    };

    /**
     * Returns the difference between the start and end timestamps for the interval as milliseconds
     * @public
     * @returns {Number}
     */
    this.getDifference = function () {
        if (this.endTimestamp === null) {
            return false;
        }
        return this.endTimestamp - this.startTimestamp;
    };

    /**
     * Logs the interval to the console
     * @public
     * @returns {Void}
     */
    this.logToConsole = function () {
        var diff = this.getDifference();
        if (diff === false) {
            console.log('interval ' + this.tag + ' is still in progress');
        }
        console.log('interval ' + this.tag + ' lasted ' + diff + 'ms');
    };

};

/**
 * Returns an instrumentation timer instance
 * @returns {Timer}
 */
module.exports.getTimer = function () {
    return new module.exports.Scule.classes.Timer();
};