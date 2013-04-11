/**
 * @module com.scule.jsunit
 * @private
 * @type {Object}
 */
module.exports = {
    JSUNIT:{}
};

/**
 * @private
 * @type {Object}
 */
module.exports.JSUNIT.variables = {
    assertions: [],
    tests: [],
    passed: 0,
    failed: 0,
    output: ''
};

/**
 * Registers an assertion with the system
 * @param {Function} caller the calling function
 * @param {Mixed} assertion the value being asserted
 * @param {Mixed} expected the expected value being asserted against
 * @return {Void}
 */
function assert(caller, assertion, expected) {
    if(assertion === expected) {
        module.exports.JSUNIT.variables.output += '.';
        module.exports.JSUNIT.variables.passed++;
    } else {
        module.exports.JSUNIT.variables.output += 'F';  
        module.exports.JSUNIT.variables.failed++;
    }
    module.exports.JSUNIT.variables.assertions.push({
        caller: caller.name,
        callee: arguments.callee.caller.name,
        assertion: assertion,
        expected: expected
    });
};

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
    var a = !(!arg);
    assert(arguments.callee.caller, a, true);
};

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
};

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
};

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
};

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
};

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
};

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
};

module.exports.assertLessThanEqualTo = assertLessThanEqualTo;

/**
 * Asserts that arg1 exists as a key of arg2
 * @param {Mixed} arg1
 * @param {Mixed} arg2
 * @returns {Boolean}
 */
function assertExists(arg1, arg2) {
    var a = (arg1 in arg2);
    assert(arguments.callee.caller, a, true);
};

module.exports.assertExists = assertExists;

/**
 * Asserts that arg1 does not exist as a key of arg2
 * @param {Mixed} arg1
 * @param {Mixed} arg2
 * @returns {Boolean}
 */
function assertNotExists(arg1, arg2) {
    var a = (!(arg1 in arg2));
    assert(arguments.callee.caller, a, true);
};

module.exports.assertNotExists = assertNotExists;

/**
 * Public module functions
 */

/**
 * Adds a test function to assertion list
 * @param {Function} test the test function to add to the suite
 * @return {Void}
 */
module.exports.addTest = function(test) {
    module.exports.JSUNIT.variables.tests.push(test);
};

/**
 * @private
 * @type {Object}
 */
module.exports.resetTests = function(filename) {
    module.exports.JSUNIT.variables = {
        assertions: [],
        tests: [],
        passed: 0,
        failed: 0,
        output: ''
    };    
};

/**
 * Runs all the tests currently registered with the system. If a callback is provided
 * then the test results are passed to it as the only parameter, otherwise the test 
 * results are printed to the console
 * @param {Function} callback the callback to execute at the completion of the test suite run
 * @return {Void}
 */
module.exports.runTests = function(callback) {

    module.exports.JSUNIT.variables.assertions = [];
    module.exports.JSUNIT.variables.passed = 0;
    module.exports.JSUNIT.variables.failed = 0;

    module.exports.JSUNIT.variables.tests.forEach(function(test) {
        if(!callback) {
            Ti.API.info('');
            Ti.API.info('Running: ' + test.name);
        }
        test();
        console.log(module.exports.JSUNIT.variables.output);
    });
    
    if(callback) {
        callback(module.exports.JSUNIT.variables);
        return;
    }
    
    Ti.API.info('');
    Ti.API.info('ran ' + module.exports.JSUNIT.variables.tests.length + ' tests ' 
        + 'with ' + module.exports.JSUNIT.variables.assertions.length + ' assertions, ' 
        + module.exports.JSUNIT.variables.passed + ' passed, ' 
        + module.exports.JSUNIT.variables.failed + ' failed');

    module.exports.JSUNIT.variables.assertions.forEach(function(assertion) {
        if(assertion.assertion !== assertion.expected) {
            Ti.API.info('Failed: ' + assertion.caller + ': ' + assertion.expected + ', got: ' + assertion.assertion);
        }
    });
    
    Ti.API.info('---------------------------------------------');
    Ti.API.info('');
};