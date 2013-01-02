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

/**
 * @module com.scule.jsunit
 * @private
 * @type {Object}
 */
module.exports = {
    JSUNIT: {}
};

Object.defineProperty(global, '__stack', {
    get: function () {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function (_, stack) {
            return stack;
        };
        var err = new Error();
        Error.captureStackTrace(err, arguments.callee.caller.caller);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__line', {
    get: function () {
        return __stack[1].getLineNumber();
    }
});

/**
 * @private
 * @type {Object}
 */
module.exports.JSUNIT.variables = {
    assertions: [],
    tests: [],
    passed: 0,
    failed: 0,
    filename: __filename
};

/**
 * Registers an assertion with the system
 * @param {Function} caller the calling function
 * @param {Mixed} assertion the value being asserted
 * @param {Mixed} expected the expected value being asserted against
 * @return {Void}
 */
function assert(caller, assertion, expected) {
    if (assertion === expected) {
        process.stdout.write('.');
        module.exports.JSUNIT.variables.passed = module.exports.JSUNIT.variables.passed + 1;
    } else {
        process.stdout.write('F');
        module.exports.JSUNIT.variables.failed = module.exports.JSUNIT.variables.failed + 1;
    }
    module.exports.JSUNIT.variables.assertions.push({
        caller: caller.name,
        callee: arguments.callee.caller.name,
        assertion: assertion,
        expected: expected,
        line:__line
    });
}

/**
 * Asserts that a value is false
 * @param {Mixed} arg asserts that the provided argument is false
 * @returns {Boolean}
 */
function assertFalse(arg) {
    var a = (!arg);
    assert(arguments.callee.caller, a, true)    
}

module.exports.assertFalse = assertFalse;

/**
 * Asserts that a value is true
 * @param {Mixed} arg asserts that the provided argument is true
 * @returns {Boolean}
 */
function assertTrue(arg) {
    var a = (arg === true);
    assert(arguments.callee.caller, a, true);
}

module.exports.assertTrue = assertTrue;

/**
 * Asserts that two values are equal
 * @param {Mixed} arg1
 * @param {Mixed} arg2
 * @returns {Boolean}
 */
function assertEquals(arg1, arg2) {
    var a = (arg1 === arg2);
    assert(arguments.callee.caller, a, true);
}

module.exports.assertEquals = assertEquals;

/**
 * Asserts that two values are not equal
 * @param {Mixed} arg1
 * @param {Mixed} arg2
 * @returns {Boolean}
 */
function assertNotEquals(arg1, arg2) {
    var a = (arg1 !== arg2);
    assert(arguments.callee.caller, a, true);
}

module.exports.assertNotEquals = assertNotEquals;

/**
 * Asserts that arg1 is greater than arg2
 * @param {Mixed} arg1
 * @param {Mixed} arg2
 * @returns {Boolean} 
 */
function assertGreaterThan(arg1, arg2) {
    var a = (arg1 > arg2);
    assert(arguments.callee.caller, a, true);

}

module.exports.assertGreaterThan = assertGreaterThan;

/**
 * Asserts that arg1 is greater than or equal to arg2
 * @param {Mixed} arg1
 * @param {Mixed} arg2
 * @returns {Boolean}
 */
function assertGreaterThanEqualTo(arg1, arg2) {
    var a = (arg1 >= arg2);
    assert(arguments.callee.caller, a, true);

}

module.exports.assertGreaterThanEqualTo = assertGreaterThanEqualTo;

/**
 * Asserts that arg1 is less than arg2
 * @param {Mixed} arg1
 * @param {Mixed} arg2
 * @returns {Boolean}
 */
function assertLessThan(arg1, arg2) {
    var a = (arg1 < arg2);
    assert(arguments.callee.caller, a, true);

}

module.exports.assertLessThan = assertLessThan;

/**
 * Asserts that arg1 is than or equal to arg2
 * @param {Mixed} arg1
 * @param {Mixed} arg2
 * @returns {Boolean}
 */
function assertLessThanEqualTo(arg1, arg2) {
    var a = (arg1 <= arg2);
    assert(arguments.callee.caller, a, true);

}

module.exports.assertLessThanEqualTo = assertLessThanEqualTo;

/**
 * Asserts that arg1 exists as a key of arg2
 * @param {Mixed} arg1
 * @param {Mixed} arg2
 * @returns {Boolean}
 */
function assertExists(arg1, arg2) {
    var a = (arg2.hasOwnProperty(arg1));
    assert(arguments.callee.caller, a, true);
}

module.exports.assertExists = assertExists;

/**
 * Asserts that arg1 does not exist as a key of arg2
 * @param {Mixed} arg1
 * @param {Mixed} arg2
 * @returns {Boolean}
 */
function assertNotExists(arg1, arg2) {
    var a = (!arg2.hasOwnProperty(arg1));
    assert(arguments.callee.caller, a, true);
}

module.exports.assertNotExists = assertNotExists;

/**
 * Public module functions
 */

/**
 * Adds a test function to assertion list
 * @param {Function} test the test function to add to the suite
 * @return {Void}
 */
module.exports.addTest = function (test) {
    module.exports.JSUNIT.variables.tests.push(test);
}

/**
 * @private
 * @type {Object}
 */
module.exports.resetTests = function (filename) {
    module.exports.JSUNIT.variables = {
        assertions: [],
        tests: [],
        passed: 0,
        failed: 0,
        filename: filename
    };
}

/**
 * Runs all the tests currently registered with the system. If a callback is provided
 * then the test results are passed to it as the only parameter, otherwise the test 
 * results are printed to the console
 * @param {Function} callback the callback to execute at the completion of the test suite run
 * @return {Void}
 */
module.exports.runTests = function (callback) {

    module.exports.JSUNIT.variables.assertions = [];
    module.exports.JSUNIT.variables.passed = 0;
    module.exports.JSUNIT.variables.failed = 0;

    module.exports.JSUNIT.variables.tests.forEach(function (test) {
        if (!callback) {
            console.log('');
            console.log('Running: ' + module.exports.JSUNIT.variables.filename + ':' + test.name);
        }
        test();
    });

    if (callback) {
        callback(module.exports.JSUNIT.variables);
        return;
    }
    
    console.log('');
    console.log('ran ' + module.exports.JSUNIT.variables.tests.length + ' tests ' 
        + 'with ' + module.exports.JSUNIT.variables.assertions.length + ' assertions, ' 
        + module.exports.JSUNIT.variables.passed + ' passed, ' 
        + module.exports.JSUNIT.variables.failed + ' failed');

    module.exports.JSUNIT.variables.assertions.forEach(function (assertion) {
        if (assertion.assertion !== assertion.expected) {
            console.log('Failed: ' + module.exports.JSUNIT.variables.filename + ':' + assertion.caller + ', line ' + 
                assertion.line + ': ' + assertion.callee + 
                ', expected: ' + assertion.expected + ', got: ' + assertion.assertion);
        }
    });

    console.log('---------------------------------------------');
    console.log('');
}