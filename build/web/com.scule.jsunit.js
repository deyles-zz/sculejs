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
 * Global JSUNIT namespace
 */
var JSUNIT = {
    functions:{},
    variables:{
        assertions: [],
        tests: [],
        passed: 0,
        failed: 0,
        output: ''
    }
};

/**
 * Registers an assertion with the system
 * @param function caller the calling function
 * @param mixed assertion
 * @param mixed expected
 * @return void
 */
JSUNIT.assert = function(caller, assertion, expected) {
    if(assertion === expected) {
        JSUNIT.variables.output += '.';
        JSUNIT.variables.passed++;
    } else {
        JSUNIT.variables.output += 'F';  
        JSUNIT.variables.failed++;
    }
    JSUNIT.variables.assertions.push({
        caller: caller.name,
        callee: arguments.callee.caller.name,
        assertion: assertion,
        expected: expected
    });
};

/**
 * Asserts that a value is false
 * @param mixed arg
 */
JSUNIT.assertFalse = function(arg) {
    var a = (!arg);
    JSUNIT.assert(arguments.callee.caller, a, true)    
}

/**
 * Asserts that a value is true
 * @param mixed arg
 */
JSUNIT.assertTrue = function(arg) {
    var a = !(!arg);
    JSUNIT.assert(arguments.callee.caller, a, true);
};

/**
 * Asserts that two values are equal
 */
JSUNIT.assertEquals = function(arg1, arg2) {
    var a = (arg1 === arg2);
    JSUNIT.assert(arguments.callee.caller, a, true);
};

/**
 * Asserts that two values are not equal
 */
JSUNIT.assertNotEquals = function(arg1, arg2) {
    var a = (arg1 !== arg2);
    JSUNIT.assert(arguments.callee.caller, a, true);
};

JSUNIT.assertGreaterThan = function(arg1, arg2) {
    var a = (arg1 > arg2);
    JSUNIT.assert(arguments.callee.caller, a, true);    
};

JSUNIT.assertGreaterThanEqualTo = function(arg1, arg2) {
    var a = (arg1 >= arg2);
    JSUNIT.assert(arguments.callee.caller, a, true);    
};

JSUNIT.assertLessThan = function(arg1, arg2) {
    var a = (arg1 < arg2);
    JSUNIT.assert(arguments.callee.caller, a, true);    
};

JSUNIT.assertLessThanEqualTo = function(arg1, arg2) {
    var a = (arg1 <= arg2);
    JSUNIT.assert(arguments.callee.caller, a, true);    
};

JSUNIT.assertExists = function(arg1, arg2) {
    var a = (arg1 in arg2);
    JSUNIT.assert(arguments.callee.caller, a, true);
};

JSUNIT.assertNotExists = function(arg1, arg2) {
    var a = (!(arg1 in arg2));
    JSUNIT.assert(arguments.callee.caller, a, true);
};

/**
 * Public module functions
 */

/**
 * Adds a test function to assertion list
 * @param function test
 * @return void
 */
JSUNIT.addTest = function(test) {
    JSUNIT.variables.tests.push(test);
};

JSUNIT.resetTests = function(filename) {
    JSUNIT.variables = {
        assertions: [],
        tests: [],
        passed: 0,
        failed: 0,
        output: ''
    };    
};

/**
 * Runs all the tests currently registered with the system
 * @param callback function
 * @return void
 */
JSUNIT.runTests = function(callback) {

    JSUNIT.variables.assertions = [];
    JSUNIT.variables.passed = 0;
    JSUNIT.variables.failed = 0;

    JSUNIT.variables.tests.forEach(function(test) {
        JSUNIT.variables.output = '';
        if(!callback) {
            console.log('');
            console.log('Running: ' + test.name);
        }
        test();
        console.log(JSUNIT.variables.output);
    });
    
    if(callback) {
        callback(JSUNIT.variables);
        return;
    }
    
    console.log('ran ' + JSUNIT.variables.tests.length + ' tests ' 
        + 'with ' + JSUNIT.variables.assertions.length + ' assertions, ' 
        + JSUNIT.variables.passed + ' passed, ' 
        + JSUNIT.variables.failed + ' failed');

    JSUNIT.variables.assertions.forEach(function(assertion) {
        if(assertion.assertion !== assertion.expected) {
            console.log('Failed: ' + assertion.caller + ' ' + assertion.callee + 
                ', expected: ' + assertion.expected + ', got: ' + assertion.assertion);
        }
    });
    
    console.log('---------------------------------------------');
    console.log('');
};