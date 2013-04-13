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
 * @module com.scule.functions
 * @private
 * @type {Object}
 */
module.exports = {
    Scule: {
        functions: {},
        variables: {},
        constants: require(__dirname + '/com.scule.constants')
    }
};

/**
 * Given a map, extracts all key => value pairs where the value is true
 * and the key is not prefixed with a $
 * @param {Object} object the object to extra true values from
 * @returns {Object}
 */
module.exports.Scule.functions.extractTrueValues = function (object) {
    var map  = {};
    var name = null;
    for (name in object) {
        if (name.match(/^\$/)) {
            continue;
        }
        if (object[name]) {
            map[name] = true;
        }
    }
    return map;
};

/**
 * Pushes a value to the provided array if it's not null/false/undefined
 * @param {Array} array the array to push to
 * @param {Mixed} value the value to push
 * @returns {Void}
 */
module.exports.Scule.functions.pushIfNotNull = function (array, value) {
    if (value) {
        array.push(value);
    }
};

/**
 * Pushes a value to the provided array if it exists as an attribute on the provided object
 * @param {Array} array the array to push to
 * @param {Object} object the object to check against
 * @param {String} key the key to check for
 * @returns {Void}
 */
module.exports.Scule.functions.pushIfExists = function (array, object, key) {
    if (object.hasOwnProperty(key)) {
        array.push(object[key]);
    }
};

/**
 * Returns the value corresponding to the provided key in the object, returning
 * the provided default if the key doesn't exist as an attribute of the provided object
 * @param {Object} object the object to retrieve the value from
 * @param {String} key the key to retrieve the value for
 * @param {Mixed} def the default value to return if the provided key isn't found
 */
module.exports.Scule.functions.getObjectAttribute = function (object, key, def) {
    if (!object.hasOwnProperty(key)) {
        return def;
    }
    return object[key];
};

/**
 * Returns the ObjectId for an Object, optionally as a String representation
 * @param {Object} object the object to retrieve the {ObjectId} for
 * @param {Boolean} toString a flag indicating whether or not to return the {ObjectId} as a {String}
 * @returns {ObjectId|String}
 */
module.exports.Scule.functions.getObjectId = function (object, toString) {
    if (toString === undefined) {
        toString = false;
    }
    return toString ? object[module.exports.Scule.constants.ID_FIELD].toString() : object[module.exports.Scule.constants.ID_FIELD];
};

/**
 * Performs a deep clone of an object, returning a pointer to the clone
 * @param {The} o object to clone
 * @returns {Object}
 */
module.exports.Scule.functions.cloneObject = function (o) {
    var c = {};
    if (module.exports.Scule.functions.isArray(o)) {
        c = [];
    }
    var a = null;
    for (a in o) {
        if (typeof(o[a]) == "object") {
            if (o[a] instanceof RegExp) {
                c[a] = new RegExp(o[a].source);
            } else {
                c[a] = module.exports.Scule.functions.cloneObject(o[a]);
            }
        } else {
            c[a] = o[a];
        }
    }
    return c;
};

/**
 * Traverses a JavaScript object given a datastructure representing the path to
 * walk and returns the nested struct corresponding to the second to last path
 * element. Confused? Good.
 * 
 * The attributes provided should be in the following format:
 * 
 * {a:true} => (corresponds to) 'a'
 * {a: {b:true}} => (corresponds to) 'a.b'
 * {a: {b:true, c: {d:true}}} => (corresponds to) 'a.b,c.d'
 * 
 * @param {Object} attributes the attributes to search for
 * @param {Object} object the object to search
 * @returns {Object}
 */
module.exports.Scule.functions.traverseObject = function (attributes, object) {
    var depth = 0;
    var leaf  = null;
    var k     = null;
    var probe = function (attr) {
        for (k in attr) {
            if (attr[k] === true) {
                leaf = k;
                break;
            } else {
                depth++;
                probe(attr[k]);
            }
        }
    }
    probe(attributes);
    var i = 0;
    var trvs = function (attr, o) {
        if (i == depth) {
            return o;
        }
        for (k in attr) {
            if (k == module.exports.Scule.constants.OBJECT_WILDCARD) {
                return o;
            }
            if (!(k in o)) {
                return null;
            }
            if (attr[k] === true) {
                return o;
            } else {
                i++;
                return trvs(attr[k], o[k]);
            }
        }
    };
    return [leaf, trvs(attributes, object)];
};

/**
 * Sorts an object's keys alphabetically and returns a sorted, shallow copy of the object
 * @param {Object} object the object to sort and clone
 * @returns {Object}
 */
module.exports.Scule.functions.sortObjectKeys = function (object) {
    var o   = {};
    var k   = [];
    var key = null;
    for (key in object) {
        k.push(key);
    }
    k.sort(function (v1, v2){
        var v1o = false;
        if (v1.match(/^\$/)) {
            v1 = v1.substr(1);
            v1o = true;
        }
        var v2o = false;
        if (v2.match(/^\$/)) {
            v2 = v2.substr(1);
            v2o = true;
        }
        if (v1o && !v2o) {
            return 1;
        } else if (v2o && !v1o) {
            return -1;
        }
        if (v2 > v1) {
            return -1;
        } else if (v2 < v1) {
            return 1;
        } else {
            return 0;
        }
    });
    k.forEach(function (i) {
        o[i] = object[i];
    });
    return o;
};

module.exports.Scule.functions.objectValues = function(object) {
    var values = [];
    for (var k in object) {
        if (!object.hasOwnProperty(k)) {
            continue;
        }
        values.push(object[k]);
    }
    return values;
};

module.exports.Scule.functions.objectKeys = function(object) {
    var keys = [];
    for (var k in object) {
        if (!object.hasOwnProperty(k)) {
            continue;
        }
        keys.push(k);
    }
    return keys;
};

/**
 * Returns a count of the number of top level attributes in an object
 * @param {Object} o the object to count the keys of
 * @returns {Integer}
 */
module.exports.Scule.functions.sizeOf = function (o) {
    if (o instanceof Array || typeof(o) === 'string') {
        return o.length;
    } else {
    
        var size = 0, key;
        for (key in o) {
            if (o.hasOwnProperty(key)) size++;
        }
        return size;
    }
    return null;
};

/**
 * Randomizes the order of elements in an array
 * @param {Array} c the array to randomize
 * @returns {void}
 */
module.exports.Scule.functions.shuffle = function (c) {
    var tmp, current, top = c.length;
    if (top) while(--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = c[current];
        c[current] = c[top];
        c[top] = tmp;
    }
};

/**
 * Returns all unique values in an Array as an Array
 * @param {Array} a
 * @returns {Array}
 */
module.exports.Scule.functions.unique = function (a) {
    var map = {};
    var i   = 0;
    var key = null;
    for (i=0; i < a.length; i++) {
        map[a[i]] = true;
    }
    var keys = [];
    for (key in map) {
        keys.push(key);
    }
    return keys;
};

/**
 * Returns a boolean value indicating whether or not the provided key exists
 * within the provided object
 * @param {Object} object the object to search
 * @param {String} key the key to search for
 * @returns {Void}
 */
module.exports.Scule.functions.contains = function (object, key) {
    return (object.hasOwnProperty(key));
};

/**
 * Returns a normalized, JSON encoded string representation of an object
 * @param {Object} o the object to serialize
 * @returns {String}
 */
module.exports.Scule.functions.stringify = function (o) {
    var clone = {};
    var key   = null;
    for (key in o) {
        if (typeof(o[key]) == 'function') {
            clone[key] = o[key].toString();
        } else {
            clone[key] = o[key];
        }
    }
    return JSON.stringify(clone);
};

/**
 * Determines whether or not a variable references an array
 * @param {Mixed} o the variable to determine the type for
 * @returns {Boolean}
 */
module.exports.Scule.functions.isArray = function (o) {
    return (Object.prototype.toString.call(o) === '[object Array]');
};

/**
 * Determines whether or not a value represents and integer
 * @param {Mixed} o the variable to evaluate
 * @returns {Boolean}
 */
module.exports.Scule.functions.isInteger = function (o) {
    return parseInt(o) == o;
};

/**
 * Determines whether or not a value represents and double
 * @param {Mixed} o the variable to evaluate
 * @returns {Boolean}
 */
module.exports.Scule.functions.isDouble = function (o) {
    return parseFloat(o) == o;
};

/**
 * Determines whether or not a value represents a scalar
 * @param {Mixed} o the variable the evaluate
 * @returns {Boolean}
 */
module.exports.Scule.functions.isScalar = function (o) {
    return o != null && !(o instanceof Object);
};

/**
 * Generates a random number between two numbers
 * @param {Number} from the lower threshold of the range
 * @param {Number} to the upper threshold of the range
 * @returns {Number}
 */
module.exports.Scule.functions.randomFromTo = function (from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
};

/**
 * A simple comparison function, returns 0 if a === b, otherwise returns
 * 1 if a > b, or -1 if b > a
 * @param {Mixed} a
 * @param {Mixed} b
 * @returns {Number}
 */
module.exports.Scule.functions.compare = function (a, b) {
    if (a === b) {
        return 0;
    }
    return (a > b) ? 1 : -1;
};

/**
 * Simple comparison function, this function is based on object key - that is it compares
 * a.key against b.key
 * @see {module.exports.Scule.functions.compare}
 * @param {Mixed} a
 * @param {Mixed} b
 * @returns {Boolean}
 */
module.exports.Scule.functions.compareElementKey = function (a, b) {
    return module.exports.Scule.functions.compare(a.key, b.key);
};

/**
 * Simple comparison function, this function is based on object value - that is it compares
 * a.value against b.value
 * @see {module.exports.Scule.functions.compare}
 * @param {Mixed} a
 * @param {Mixed} b
 * @returns {Boolean}
 */
module.exports.Scule.functions.compareElementValue = function (a, b) {
    return module.exports.Scule.functions.compare(a.value, b.value);
};

/**
 * Deep compares two arrays - seems kind of flakey, don't use this in production.
 * @param {Array} a
 * @param {Array} b
 * @returns {Integer}
 */
module.exports.Scule.functions.compareArray = function (a, b) {
    if (!module.exports.Scule.functions.isArray(a) && module.exports.Scule.functions.isArray(b)) {
        return 1;
    }
    if (module.exports.Scule.functions.isArray(a) && !module.exports.Scule.functions.isArray(b)) {
        return -1;
    }
    if (a.length > b.length) {
        return 1;
    }
    if (b.length > a.length) {
        return -1;
    }
    var same = true;
    var c = 0;
    var i = 0;
    var len = a.length;
    for (i=0; i < len; i++) {
        if (module.exports.Scule.functions.isArray(a[i])) {
            c += module.exports.Scule.functions.compareArray(a[i], b[i]);
        } else {
            c += module.exports.Scule.functions.compare(a[i], b[i]);
        }
        if (c != 0) {
            same = false;

        }
    }
    if (c == 0 && !same) { // same elements in a different order
        c = JSON.stringify(a[0]).localeCompare(JSON.stringify(b[0]));
    }
    if (c > 0) {
        c = 1;
    } else if (c < 0) {
        c = -1;
    }    
    return c;
};

/**
 * Sorts an {Array} of objects using the given key and sort order. Order types
 * are as follows:
 * -1 => DESCENDING
 * 0  => RANDOM
 * 1  => ASCENDING
 * 2  => ALPHABETICALLY
 * 3  => REVERSE ORDER
 * 
 * @param {Number} type the ordering to use when performing the sort
 * @param {Array} collection the array of objects to sort
 * @param {String} key the key to sort on
 * @returns {Void}
 */
module.exports.Scule.functions.sort = function (type, collection, key) {
    switch(type) {
        case -1: // descending
            collection.sort(function (v1, v2){
                return v2[key] - v1[key];
            });
            break;

        case 0: // random
            module.exports.Scule.functions.shuffle(collection);
            break;

        case 1: // ascending
            collection.sort(function (v1, v2){
                return v1[key] - v2[key];
            });
            break;

        case 2: // alphabetically
            collection.sort(function (v1, v2){ 
                if (v2[key] > v1[key]) {
                    return -1;
                } else if (v2[key] < v1[key]) {
                    return 1;
                } else {
                    return 0;
                }
            });
            break;

        case 3: //  reverse
            collection.sort(function (v1, v2){
                if (v2[key] < v1[key]) {
                    return -1;
                } else if (v2[key] > v1[key]) {
                    return 1;
                } else {
                    return 0;
                }
            });
            break;
    }
};

/**
 * Trims a string of leading and trailing whitespace and newline characters. This function will also compress
 * adjacent \s characters to a single character. If the native String.prototype.trim function is available
 * it will be substituted rather than using the regexp based solution
 * @param {String} value the value to trim
 * @returns {String}
 */
module.exports.Scule.functions.trim = function (value) {
    if (!String.prototype.trim) {
        return value.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
    } else {
        return value.trim();
    }
};

/**
 * If using the Titanium framework this function returns the device MAC address, otherwise it returns a random integer per session
 * @returns {Integer}
 */
module.exports.Scule.functions.getMACAddress = function () {
    if (typeof Titanium !== 'undefined') {
        return Titanium.Platform.macaddress;
    } else {
        if (!('SimulatedMacAddress' in module.exports.Scule.variables)) {
            module.exports.Scule.variables['SimulatedMacAddress'] = (new Date()).getTime().toString().substring(9, 11) + '' + module.exports.Scule.functions.randomFromTo(100, 999);
        }
        return module.exports.Scule.variables['SimulatedMacAddress'];
    }
};

/**
 * Parses a String representation (or representations) of an object attribute address, returning a 
 * map containing a nested representation
 * @see {module.exports.Scule.functions.traverseObject}
 * @param {String} attributes the attribute string to parse
 * @returns {Object}
 */
module.exports.Scule.functions.parseAttributes = function (attributes) {
    if (!module.exports.Scule.functions.isArray(attributes)) {
        return module.exports.Scule.functions.parseAttributes(attributes.split(','));
    }
    var build = function (struct, elements, count) {
        var element = module.exports.Scule.functions.trim(elements[count]);
        if (count == (elements.length - 1)) {
            struct[element] = true;
        } else {
            var o = {};
            struct[element] = o;
            build(o, elements, count+1);
        }
    };
    var a = {};
    attributes.forEach(function (attribute) {
        build(a, attribute.split('.'), 0);
    });
    return a;
};

/**
 * Searches the provided object for the given keys, returning an array containing the results in order of incidence
 * @see {module.exports.Scule.functions.traverseObject}
 * @param {Object} keys the keys to search for
 * @param {Object} o the object to search
 * @returns {Array}
 */
module.exports.Scule.functions.searchObject = function (keys, o) {
    var srch = function (ks, o, composite) {
        if (!o) {
            return;
        }
        var k = null;        
        for (k in ks) {
            if (ks[k] == true) {
                if (module.exports.Scule.functions.isInteger(k) && module.exports.Scule.functions.isArray(o)) {
                    composite.push(o[k]);
                } else {
                    if (k in o) {
                        composite.push(o[k]);
                    }
                }
            } else {
                if ((k in o) && !module.exports.Scule.functions.isScalar(o[k])) {
                    srch(ks[k], o[k], composite);
                }
            }
        }
    };
    var composite = [];
    srch(keys, o, composite);
    return composite;
};

/**
 * Retrieves a single attribute from an object given a path statement (e.g 'a.b')
 * @public
 * @param {String} path
 * @param {Object} object
 * @returns {Mixed}
 */
module.exports.Scule.functions.traverse = function (path, object) {
    if (path.indexOf('.') < 0) {
        return object[path];
    }
    var t = function (p, o) {
        if (o === undefined) {
            return undefined;
        }
        if (p.length == 1) {
            return o[p.pop()];
        } else {
            var idx = p.shift();
            return t(p, o[idx]);
        }
    };
    return t(path.split('.'), object);
};