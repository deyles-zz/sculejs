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

var md5 = {
    hash: function(s) {
        return Ti.Utils.md5HexDigest(s);
    }
};

var sha1 = {
    hash: function(s) {
        return Ti.Utils.sha1(s);
    }
};

/**
 * @public
 * @type {Object}
 */
module.exports = {
    Scule:{
        constants:{
            INDEX_TYPE_BTREE: 0,     // the type code for b+tree indices
            INDEX_TYPE_RTREE: 1,
            INDEX_TYPE_HASH: 2,      // the type code for hash indices
            INDEX_TYPE_CLUSTERED: 3, // the type code for clustered indices
            ID_FIELD: '_id',         // the global key for ObjectId attributes
            REF_FIELD:'_ref',        // the global key for DBRef attributes
            OBJECT_WILDCARD: '*'
        },
        functions:{},
        classes:{},
        objects:{
            core:{
                collections:{}
            }
        },        
        variables:{
            line:0,
            inst:0,            
            lineNo:-1,
            debug:false
        },
        instructions:{
            table:{},
            lookup:{},
            mapping:{},
            index:{}
        },        
        symbols:{
            table:{}
        },
        plugins:{},
        engines:{},        
        arities:{
            expression:-1,
            logical:    0,
            binary:     1,
            selective:  2,
            negative:   3,
            range:      4,
            mutate:     5,
            array:      6,
            geospatial: 7,
            variable:   8,
            operand:    9,
            index:     10
        }        
    }
};

/**
 * All valid symbols for Scule queries
 * @private
 * @type {Object}
 */
module.exports.Scule.symbols.table = {
    $and:       module.exports.Scule.arities.selective,
    $or:        module.exports.Scule.arities.selective,
    $nor:       module.exports.Scule.arities.negative,
    $not:       module.exports.Scule.arities.negative,
    $lt:        module.exports.Scule.arities.range,
    $lte:       module.exports.Scule.arities.range,
    $gt:        module.exports.Scule.arities.range,
    $gte:       module.exports.Scule.arities.range,
    $all:       module.exports.Scule.arities.array,
    $in:        module.exports.Scule.arities.array,
    $nin:       module.exports.Scule.arities.array,
    $elemMatch: module.exports.Scule.arities.array,
    $eq:        module.exports.Scule.arities.binary,
    $ne:        module.exports.Scule.arities.binary,
    $size:      module.exports.Scule.arities.binary,
    $exists:    module.exports.Scule.arities.binary,
    $within:    module.exports.Scule.arities.geospatial,
    $near:      module.exports.Scule.arities.geospatial,
    $set:       module.exports.Scule.arities.mutate,
    $inc:       module.exports.Scule.arities.mutate,
    $unset:     module.exports.Scule.arities.mutate,
    $pull:      module.exports.Scule.arities.mutate,
    $pullAll:   module.exports.Scule.arities.mutate,
    $pop:       module.exports.Scule.arities.mutate,
    $push:      module.exports.Scule.arities.mutate,
    $pushAll:   module.exports.Scule.arities.mutate,
    $rename:    module.exports.Scule.arities.mutate
};

/**
 * Given a map, extracts all key => value pairs where the value is true
 * and the key is not prefixed with a $
 * @param {Object} object the object to extra true values from
 * @returns {Object}
 */
module.exports.Scule.functions.extractTrueValues = function(object) {
    var map = {};
    for(var name in object) {
        if(name.match(/^\$/)) {
            continue;
        }
        if(object[name]) {
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
module.exports.Scule.functions.pushIfNotNull = function(array, value) {
    if(value) {
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
module.exports.Scule.functions.pushIfExists = function(array, object, key) {
    if(key in object) {
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
module.exports.Scule.functions.getObjectAttribute = function(object, key, def) {
    if(!(key in object)) {
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
module.exports.Scule.functions.getObjectId = function(object, toString) {
    if(toString === undefined) {
        toString = false;
    }
    return (toString) ? object[module.exports.Scule.constants.ID_FIELD].toString() : object[module.exports.Scule.constants.ID_FIELD];
};

/**
 * Performs a deep clone of an object, returning a pointer to the clone
 * @param {The} o object to clone
 * @returns {Object}
 */
module.exports.Scule.functions.cloneObject = function(o) {
    var c = {};
    if(module.exports.Scule.functions.isArray(o)) {
        c = [];
    }
    for(var a in o) {
        if(typeof(o[a]) == "object") {
            if(o[a] instanceof RegExp) {
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
 * {a:{b:true}} => (corresponds to) 'a.b'
 * {a:{b:true, c:{d:true}}} => (corresponds to) 'a.b,c.d'
 * 
 * @param {Object} attributes the attributes to search for
 * @param {Object} object the object to search
 * @returns {Object}
 */
module.exports.Scule.functions.traverseObject = function(attributes, object) {
    var depth = 0;
    var leaf  = null;
    var probe = function(attr) {
        for(var k in attr) {
            if(attr[k] === true) {
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
    var trvs = function(attr, o) {
        if(i == depth) {
            return o;
        }
        for(var k in attr) {
            if(!(k in o)) {
                return null;
            }
            if(attr[k] === true) {
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
module.exports.Scule.functions.sortObjectKeys = function(object) {
    var o = {};
    var k = [];
    for(var key in object) {
        k.push(key);
    }
    k.sort(function(v1, v2){
        var v1o = false;
        if(v1.match(/^\$/)) {
            v1 = v1.substr(1);
            v1o = true;
        }
        var v2o = false;
        if(v2.match(/^\$/)) {
            v2 = v2.substr(1);
            v2o = true;
        }
        if(v1o && !v2o) {
            return 1;
        } else if(v2o && !v1o) {
            return -1;
        }
        if(v2 > v1) {
            return -1;
        } else if(v2 < v1) {
            return 1;
        } else {
            return 0;
        }
    });
    k.forEach(function(i) {
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
 * Calculates the intersection between the provided array of Document arrays, returning
 * an array containing the resulting product
 * @param {Array} lists an array containing the lists to calculate intersection against
 * @returns {Array}
 */
module.exports.Scule.functions.intersection = function (lists) {
    if (lists.length == 1) {
        return lists[0];
    }
    var table = module.exports.getHashTable();
    var list  = null;
    lists.forEach(function (o) {
        if (!list || o.length < list.length) {
            list = o;
        }
    });
    if (!list) {
        return [];
    }    
    list.forEach(function (o) {
        table.put(module.exports.Scule.functions.getObjectId(o), {
            c:1, 
            o:o
        });
    });
    var intersection = [];
    var len = lists.length;
    for (var i=0; i < len; i++) {
        if (lists[i] == list) {
            continue;
        }
        var func = function (o) {
            var o2 = table.get(module.exports.Scule.functions.getObjectId(o));
            if (o2) {
                o2.c++;
                if (o2.c == len) {
                    intersection.push(o);
                }
            }
        };
        lists[i].forEach(func);
    }
    return intersection;
};

/**
 * Returns a count of the number of top level attributes in an object
 * @param {Object} o the object to count the keys of
 * @returns {Integer}
 */
module.exports.Scule.functions.sizeOf = function(o) {
    if(o instanceof Array || typeof(o) === 'string') {
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
module.exports.Scule.functions.shuffle = function(c) {
    var tmp, current, top = c.length;
    if(top) while(--top) {
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
module.exports.Scule.functions.unique = function(a) {
    var map = {};
    for(var i=0; i < a.length; i++) {
        map[a[i]] = true;
    }
    var keys = [];
    for(var key in map) {
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
module.exports.Scule.functions.contains = function(object, key) {
    return (key in object);
};

/**
 * Returns a normalized, JSON encoded string representation of an object
 * @param {Object} o the object to serialize
 * @returns {String}
 */
module.exports.Scule.functions.stringify = function(o) {
    var clone = {};
    for(var key in o) {
        if(typeof(o[key]) == 'function') {
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
module.exports.Scule.functions.isArray = function(o) {
    return (Object.prototype.toString.call(o) === '[object Array]');
};

/**
 * Determines whether or not a value represents and integer
 * @param {Mixed} o the variable to evaluate
 * @returns {Boolean}
 */
module.exports.Scule.functions.isInteger = function(o) {
    return parseInt(o) == o;
};

/**
 * Determines whether or not a value represents and double
 * @param {Mixed} o the variable to evaluate
 * @returns {Boolean}
 */
module.exports.Scule.functions.isDouble = function(o) {
    return parseFloat(o) == o;
};

/**
 * Determines whether or not a value represents a scalar
 * @param {Mixed} o the variable the evaluate
 * @returns {Boolean}
 */
module.exports.Scule.functions.isScalar = function(o) {
    return o != null && !(o instanceof Object);
};

/**
 * Generates a random number between two numbers
 * @param {Number} from the lower threshold of the range
 * @param {Number} to the upper threshold of the range
 * @returns {Number}
 */
module.exports.Scule.functions.randomFromTo = function(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
};

/**
 * A simple comparison function, returns 0 if a === b, otherwise returns
 * 1 if a > b, or -1 if b > a
 * @param {Mixed} a
 * @param {Mixed} b
 * @returns {Number}
 */
module.exports.Scule.functions.compare = function(a, b) {
    if(a === b) {
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
module.exports.Scule.functions.compareElementKey = function(a, b) {
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
module.exports.Scule.functions.compareElementValue = function(a, b) {
    return module.exports.Scule.functions.compare(a.value, b.value);
};

/**
 * Deep compares two arrays - seems kind of flakey, don't use this in production.
 * @param {Array} a
 * @param {Array} b
 * @returns {Integer}
 */
module.exports.Scule.functions.compareArray = function(a, b) {
    if(!module.exports.Scule.functions.isArray(a) && module.exports.Scule.functions.isArray(b)) {
        return 1;
    }
    if(module.exports.Scule.functions.isArray(a) && !module.exports.Scule.functions.isArray(b)) {
        return -1;
    }
    if(a.length > b.length) {
        return 1;
    }
    if(b.length > a.length) {
        return -1;
    }
    var same = true;
    var c = 0;
    var len = a.length;
    for(var i=0; i < len; i++) {
        if(module.exports.Scule.functions.isArray(a[i])) {
            c += module.exports.Scule.functions.compareArray(a[i], b[i]);
        } else {
            c += module.exports.Scule.functions.compare(a[i], b[i]);
        }
        if(c != 0) {
            same = false; 
        }
    }
    if(c == 0 && !same) { // same elements in a different order
        c = JSON.stringify(a[0]).localeCompare(JSON.stringify(b[0]));
    }
    if(c > 0) {
        c = 1;
    } else if(c < 0) {
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
module.exports.Scule.functions.sort = function(type, collection, key) {
    switch(type) {
        case -1: // descending
            collection.sort(function(v1, v2){
                return v2[key] - v1[key];
            });
            break;

        case 0: // random
            module.exports.Scule.functions.shuffle(collection);
            break;

        case 1: // ascending
            collection.sort(function(v1, v2){
                return v1[key] - v2[key];
            });
            break;

        case 2: // alphabetically
            collection.sort(function(v1, v2){ 
                if(v2[key] > v1[key]) {
                    return -1;
                } else if(v2[key] < v1[key]) {
                    return 1;
                } else {
                    return 0;
                }
            });
            break;

        case 3: //  reverse
            collection.sort(function(v1, v2){
                if(v2[key] < v1[key]) {
                    return -1;
                } else if(v2[key] > v1[key]) {
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
module.exports.Scule.functions.trim = function(value) {
    if(!String.prototype.trim) {
        return value.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
    } else {
        return value.trim();
    }
};

/**
 * If using the Titanium framework this function returns the device MAC address, otherwise it returns a random integer per session
 * @returns {Integer}
 */
module.exports.Scule.functions.getMACAddress = function() {
    return Titanium.Platform.macaddress;
};

/**
 * Parses a String representation (or representations) of an object attribute address, returning a 
 * map containing a nested representation
 * @see {module.exports.Scule.functions.traverseObject}
 * @param {String} attributes the attribute string to parse
 * @returns {Object}
 */
module.exports.Scule.functions.parseAttributes = function(attributes) {
    if(!module.exports.Scule.functions.isArray(attributes)) {
        return module.exports.Scule.functions.parseAttributes(attributes.split(','));
    }
    var build = function(struct, elements, count) {
        var element = module.exports.Scule.functions.trim(elements[count]);
        if(count == (elements.length - 1)) {
            struct[element] = true;
        } else {
            var o = {};
            struct[element] = o;
            build(o, elements, count+1);
        }
    };
    var a = {};
    attributes.forEach(function(attribute) {
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
module.exports.Scule.functions.searchObject = function(keys, o) {
    var srch = function(ks, o, composite) {
        if(!o) {
            return;
        }
        for(var k in ks) {
            if(ks[k] == true) {
                if(module.exports.Scule.functions.isInteger(k) && module.exports.Scule.functions.isArray(o)) {
                    composite.push(o[k]);
                } else {
                    if(k in o) {
                        composite.push(o[k]);
                    }
                }
            } else {
                if((k in o) && !module.exports.Scule.functions.isScalar(o[k])) {
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
module.exports.Scule.functions.traverse = function(path, object) {
    var t = function(p, o) {
        if(o === undefined) {
            return undefined;
        }
        if(p.length == 1) {
            return o[p.pop()];
        } else {
            var idx = p.shift();
            return t(p, o[idx]);
        }
    };
    return t(path.split('.'), object);
};

/**
 * Represents a singly linked list. The list is terminated by a null pointer.
 * @public
 * @constructor
 * @class {LinkedList}
 * @returns {Void}
 */
module.exports.Scule.classes.LinkedList = function() {
    
    /**
     * @private
     * @type {Null|LinkedListNode}
     */
    this.head     = null;

    /**
     * @private
     * @type {Null|LinkedListNode}
     */
    this.tail     = null;
    
    /**
     * @private
     * @type {Number}
     */
    this.length = 0;
    
    /**
     * Returns the head element of the list
     * @public
     * @returns {LinkedListNode|null}
     */
    this.getHead = function() {
        return this.head;
    }
    
    /**
     * Returns the tail element of the list
     * @public
     * @returns {LinkedListNode|null}
     */
    this.getTail = function() {
        return this.tail;
    };
    
    /**
     * Returns the number of elements in the list
     * @public
     * @returns {Number}
     */
    this.getLength = function() {
        return this.length;
    };
    
    /**
     * Returns a boolean value indicating whether or not the list is empty
     * @public
     * @returns {Boolean}
     */
    this.isEmpty = function() {
        return this.length == 0;
    };
    
    /**
     * Empties the list - setting head and tail to null and reseting the element count to 0
     * @public
     * @returns {Void}
     */
    this.clear = function() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    };
    
    /**
     * Returns the element residing at the specified index. Returns null if none exists or index is out of range.
     * @public
     * @param {Number} idx the index of the node to retrieve
     * @returns {Mixed|null}
     */
    this.get = function(idx) {
        if(idx < 0 || idx > this.length) {
            return null;
        }
        if(idx == 0) {
            return this.head;
        } else {
            var curr = this.head;
            var i = 0;
            while(curr) {
                if(idx == i) {
                    break;
                }
                i++;
                curr = curr.next;
            }
            return curr;
        }
    };
    
    /**
     * Adds an element to the tail of the list
     * @public
     * @param {Mixed} value the value to append to the list
     * @returns {Boolean}
     */
    this.add = function(value) {
        var temp = new module.exports.Scule.classes.LinkedListNode(null, value);
        if(this.head == null) {
            this.head = temp;
        } else if(this.tail == null) {
            this.head.next = temp;
            this.tail = temp;
        } else {
            var curr = this.tail;
            curr.next = temp;
            this.tail = curr.next;
        }
        this.length++;
        return temp;
    };
    
    /**
     * Performs a linear scan on the list to determine if an element exists. Optionally takes a key
     * that is used to introspect elements (e.g. 'bar', foo => {foo:'bar'}. Returns null if no results are found
     * @public
     * @param {Mixed} value the value to search for
     * @param {Mixed} key an optional introspection key
     * @param cmp Function an optional comparison function, defaults to module.exports.Scule.functions.compare
     * @returns {Mixed|null}
     */
    this.search = function(value, key, cmp) {
        if(!cmp) {
            cmp = module.exports.Scule.functions.compare;
        }        
        var curr = this.head;
        while(curr) {
            if(key) {
                if(cmp(curr.element[key], value) == 0) {
                    break;
                }
            } else {
                if(cmp(curr.element, value) == 0) {
                    break;
                }
            }
            curr = curr.next;
        }
        return curr;
    };
    
    /**
     * Performs a linear scan to determine if a given value exists in the list
     * @public
     * @param {Mixed} value the value to search for in the list
     * @param cmp Function an optional comparison function, defaults to module.exports.Scule.functions.compare
     * @returns {Boolean}
     */
    this.contains = function(value, cmp) {
        if(value == null) {
            return false;
        }
        if(!cmp) {
            cmp = module.exports.Scule.functions.compare;
        }        
        var curr = this.head;
        while(curr) {
            if(cmp(curr.element, value) == 0) {
                break;
            }
            curr = curr.next;
        }
        return (curr !== null);
    };
    
    /**
     * Splits the list at the given index. Returns the resulting list.
     * @public
     * @param {Number} idx the index to split the list on
     * @returns {LinkedList}
     */
    this.split = function(idx) {
        var node;
        if(idx === undefined) {
            idx = Math.floor(this.length / 2);
            node = this.middle();
            if(!node) {
                return null;
            }
        } else {
            if(idx < 1 || idx > this.length) {
                return null;
            }
            node = this.get(idx - 1);
        }
        
        var list = new module.exports.Scule.classes.LinkedList();

        // fix the lists
        list.head = node.next;
        node.next = null;
        list.tail = this.tail;
        this.tail = node;
        
        // fix lengths
        list.length = idx;
        this.length = this.length - idx;
        
        return list;
    };
    
    /**
     * Returns the element at the (approximate) middle of the list - should execute in O(n/2) time and O(1) space
     * @public
     * @returns {LinkedListNode|null}
     */
    this.middle = function() {
        if(!this.head) {
            return null;
        }
        var slow = this.head;
        var fast = this.head;
        while(fast.next && fast.next.next) {
            slow = slow.next;
            fast = fast.next.next;
        }
        return slow;
    };
    
    /**
     * Removes the element at the provided index. If the index is out of range this function returns null.
     * @public
     * @param {Number} idx the index of the node to remove
     * @returns {LinkedListNode|null}
     */
    this.remove = function(idx) {
        if(idx < 0 || idx > this.length) {
            return null;
        }
        var curr;
        if(this.length == 1) { // only one node in the list - just remove that instead
            curr = this.head;
            this.clear();
        } else {
            var prev = this.get(idx - 1);
            if(prev.next == this.tail) { // we're just shifting the tail back one position
                curr = this.tail;
                this.tail = prev;
            } else { // otherwise we know it's a straight up deletion
                curr = prev.next;
                prev.next = prev.next.next
            }
            this.length--;
        }
        return curr;
    };
    
    /**
     * Reverses the list
     * @public
     * @returns {Void}
     */
    this.reverse = function() { // CS101 - pay attention kids, Amazon will ask you this question one day
        var prev = null;
        var curr = this.head;
        var temp = null;
        while(curr) {
            temp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = temp;
        }
        temp = this.head;
        this.head = this.tail;
        this.tail = temp;
    };
    
    /**
     * Returns the contents of the list (values) as an array
     * @public
     * @returns {Array}
     */
    this.toArray = function() {
        var nodes = [];
        var curr  = this.head;
        while(curr) {
            nodes.push(curr.element);
            curr = curr.next;
        }
        return nodes;
    };
    
    /**
     * Emulates the Array forEach prototype function
     * @public
     * @param {Function} callback the callback to execute at each step in the loop
     * @returns {Void}
     */
    this.forEach = function(callback) {
        var curr = this.head;
        while(curr) {
            callback(curr);
            curr = curr.next;
        }
        return true;
    };
    
    /**
     * Performs an in place merge sort on the list, optionally taking a comparison function as a parameter
     * @public
     * @param {Function} cmp the comparison function to use during the merge step
     * @param {Mixed} key the key to use during comparisons
     * @returns {Void}
     */
    this.sort = function(cmp, key) {
        
        if(this.length < 2) { // empty or 1 element lists are already sorted
            return this;
        }
        
        if(!cmp) {
            cmp = module.exports.Scule.functions.compare;
        }

        var middle = function(node) {
            if(!node) {
                return node;
            }
            var slow = node;
            var fast = node;
            while(fast.next && fast.next.next) {
                slow = slow.next;
                fast = fast.next.next;
            }
            return slow;
        };

        var merge = function(left, right) {
            var head = {
                next: null
            };
            var curr = head;
            var a;
            var b;
            while(left && right) {
                if(key) {
                    a = right.element[key];
                    b = left.element[key];
                } else {
                    a = right.element;
                    b = left.element;
                }                
                if(cmp(a, b) > -1) {
                    curr.next = left;
                    left = left.next;
                } else {
                    curr.next = right;
                    right = right.next;
                }
                curr = curr.next;
            }
            curr.next = (!left) ? right : left;
            return head.next;
        };

        var merge_sort = function(node) {
            if(!node || !node.next) {
                return node;
            }    
            var m = middle(node);
            var s = m.next;
            m.next = null;
            return merge(merge_sort(node), merge_sort(s));
        };

        this.head = merge_sort(this.head);

    };
    
};

/**
 * Class representing a doubly linked list
 * @public
 * @constructor
 * @class {DoublyLinkedList}
 * @returns {Void}
 */
module.exports.Scule.classes.DoublyLinkedList = function() {
  
    /**
     * @private
     * @type {Null|DoublyLinkedListNode}
     */
    this.head   = null;
    
    /**
     * @private
     * @type {Null|DoublyLinkedListNode}
     */    
    this.tail   = null;
    
    /**
     * @private
     * @type {Number}
     */
    this.length = 0;
  
    /**
     * Returns the head elements from the list
     * @public
     * @returns {DoublyLinkedListNode}
     */
    this.getHead = function() {
        return this.head;  
    };

    /**
     * Returns the tail elements from the list
     * @public
     * @returns {DoublyLinkedListNode}
     */
    this.getTail = function() {
        return this.tail;  
    };
  
    /**
     * Returns a boolean value indicating whether or not the list is empty
     * @public
     * @returns {Boolean}  
     */     
    this.isEmpty = function() {
        return this.length == 0;
    }
    
    /**
     * Returns the number of elements in the list
     * @public
     * @returns {Number}
     */    
    this.getLength = function() {
        return this.length;
    };
  
    /**
     * Performs a linear scan on the list to determine if an element exists. Optionally takes a key
     * that is used to introspect elements (e.g. 'bar', foo => {foo:'bar'}. Returns null if no results are found
     * @public
     * @param {Mixed} value the value to search for
     * @param {Mixed} key an optional introspection key
     * @param {Function} cmp an optional comparison function, defaults to module.exports.Scule.functions.compare
     * @returns {Mixed}
     */
    this.search = function(value, key, cmp) {
        if(!cmp) {
            cmp = module.exports.Scule.functions.compare;
        }        
        var curr = this.head;
        while(curr) {
            if(key) {
                if(cmp(curr.element[key], value) == 0) {
                    break;
                }
            } else {
                if(cmp(curr.element, value) == 0) {
                    break;
                }
            }
            curr = curr.next;
        }
        return curr;
    };  
  
    /**
     * Performs a linear scan to determine if a given value exists in the list
     * @public
     * @param {Mixed} value the value to search for in the list
     * @param cmp Function an optional comparison function, defaults to module.exports.Scule.functions.compare
     * @returns {Boolean}
     */
    this.contains = function(value, cmp) {
        if(value == null) {
            return false;
        }
        if(!cmp) {
            cmp = module.exports.Scule.functions.compare;
        }        
        var curr = this.head;
        while(curr) {
            if(cmp(curr.element, value) == 0) {
                break;
            }
            curr = curr.next;
        }
        return (curr !== null);
    };  
  
    /**
     * Returns the element residing at the specified index. Returns null if none exists or index is out of range.
     * @public
     * @param {Number} idx the index of the element to return - returns null if the provided index is out of range
     * @returns {Mixed|null}
     */
    this.get = function(idx) {
        if(idx < 0 || idx > this.length) {
            return null;
        }
        if(idx == 0) {
            return this.head;
        } else {
            var curr = this.head;
            var i = 0;
            while(curr) {
                if(idx == i) {
                    break;
                }
                i++;
                curr = curr.next;
            }
            return curr;
        }
    };
  
    /**
     * Adds an element to the end list
     * @public
     * @param {Mixed} value
     * @returns {DoublyLinkedListNode}
     */
    this.add = function(value) {
        var node = new module.exports.Scule.classes.DoublyLinkedListNode(null, null, value);
        if(this.isEmpty()) {
            this.head = node;
        } else if(!this.tail) {
            this.tail = node;
            this.tail.prev = this.head;
            this.head.next = node;
        } else {
            var curr = this.tail;
            curr.next = node;
            node.prev = curr;
            this.tail = node;
        }
        this.length++;
        return node;
    };
    
    /**
     * Removes the element at the provided index. If the index is out of range this function returns null.
     * @public
     * @param {Number} idx the index of the node to remove
     * @returns {LinkedListNode|null}
     */
    this.remove = function(idx) {
        if(idx < 0 || idx > this.length) {
            return null;
        }
        var curr;
        if(this.length == 1) { // only one node in the list - just remove that instead
            curr = this.head;
            this.clear();
        } else {
            var prev = this.get(idx - 1);
            if(prev.next == this.tail) { // we're just shifting the tail back one position
                curr = this.tail;
                this.tail = prev;
                this.tail.prev = curr.prev;
                this.tail.next = null;
            } else { // otherwise we know it's a straight up deletion
                curr = prev.next;
                prev.next = prev.next.next
                if(prev.next) {
                    prev.next.prev = prev;
                }
            }
            this.length--;
        }
        // clean up pointers
        if(curr) {
            curr.detach();
        }
        return curr;
    };
    
    /**
     * Removes the last entry from the list, shortening it by one
     * @public
     * @returns {DoublyLinkedListNode}
     */
    this.trim = function() {
        if(this.isEmpty()) {
            return null;
        }
        return this.remove(this.length - 1);
    };
    
    /**
     * Splits the list at the given index. The resulting list is returned.
     * @public
     * @param {Number} idx the index to split the list on
     * @returns {LinkedList}
     */
    this.split = function(idx) {
        var node;
        if(idx === undefined) {
            idx = Math.floor(this.length / 2);
            node = this.middle();
            if(!node) {
                return null;
            }
        } else {
            if(idx < 1 || idx > this.length) {
                return null;
            }
            node = this.get(idx - 1);
        }
        var list = new module.exports.Scule.classes.DoublyLinkedList();
        list.head = node.next;
        node.next = null;
        node.prev = null;
        list.tail = this.tail;
        this.tail = node;
        list.length = idx;
        this.length = this.length - idx;
        return list;
    };
    
    /**
     * Returns the element at the (approximate) middle of the list - should execute in O(n/2) time and O(1) space
     * @public
     * @returns {LinkedListNode|null}
     */
    this.middle = function() {
        if(!this.head) {
            return null;
        }
        var slow = this.head;
        var fast = this.head;
        while(fast.next && fast.next.next) {
            slow = slow.next;
            fast = fast.next.next;
        }
        return slow;
    };
    
    /**
     * Performs an in place merge sort on the list, optionally taking a comparison function as a parameter
     * @public
     * @param {Function} cmp the comparison function to use during the merge step
     * @param {Mixed} key the key to use when making comparisons (optional)
     * @returns {Null}
     */
    this.sort = function(cmp, key) {
        
        if(this.length < 2) { // empty or 1 element lists are already sorted
            return this;
        }
        
        if(!cmp) {
            cmp = module.exports.Scule.functions.compare;
        }

        var middle = function(node) {
            if(!node) {
                return node;
            }
            var slow = node;
            var fast = node;
            while(fast.next && fast.next.next) {
                slow = slow.next;
                fast = fast.next.next;
            }
            return slow;
        };

        var merge = function(left, right) {
            var head = {
                next: null
            };
            var curr = head;
            var a;
            var b;
            while(left && right) {
                if(key) {
                    a = right.element[key];
                    b = left.element[key];
                } else {
                    a = right.element;
                    b = left.element;
                }
                if(cmp(a, b) > -1) {
                    curr.next = left;
                    curr.prev = right;
                    left = left.next;
                } else {
                    curr.next = right;
                    curr.prev = left;
                    right = right.next;
                }
                curr = curr.next;
            }
            curr.next = (!left) ? right : left;
            return head.next;
        };

        var merge_sort = function(node) {
            if(!node || !node.next) {
                return node;
            }    
            var m = middle(node);
            var s = m.next;
            m.next = null;
            s.prev = null;
            return merge(merge_sort(node), merge_sort(s));
        };

        this.head = merge_sort(this.head);

    };
    
    /**
     * Reverses the list in place
     * @public
     * @returns {Void}
     */
    this.reverse = function() {
        var curr = this.head;
        var temp = null;
        while(curr) {
            temp = curr.next;
            curr.next = curr.prev;
            curr.prev = temp;
            curr = temp;
        }
        temp = this.head;
        this.head = this.tail;
        this.tail = temp;
    };
    
    /**
     * Adds a node to the beginning of the list, lengthening it by one
     * @public
     * @param {Mixed} value the value to prepend to the list
     * @returns {DoublyLinkedListNode}
     */
    this.prepend = function(value) {
        var node = new module.exports.Scule.classes.DoublyLinkedListNode(null, null, value);
        if(this.isEmpty()) {
            this.head = node;
        } else {
            var curr = this.head;
            this.head = node;
            curr.prev = this.head;
            this.head.next = curr;
            if(!this.tail) {
                this.tail = curr;
            }
        }
        this.length++;
        return node;
    };

    /**
     *  Empties the list
     *  @public
     *  @returns {Void}
     */
    this.clear = function() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    };
    
    /**
     * Returns the contents of the list (values) as an array
     * @public
     * @returns {Array}
     */
    this.toArray = function() {
        var nodes = [];
        var curr  = this.head;
        while(curr) {
            nodes.push(curr.element);
            curr = curr.next;
        }
        return nodes;
    };    

    /**
     * Emulates the Array forEach prototype function
     * @public
     * @param {Function} callback the callback to execute at each step in the loop
     * @returns {Void}
     */
    this.forEach = function(callback) {
        var curr = this.head;
        while(curr) {
            callback(curr);
            curr = curr.next;
        }
        return true;
    };

};

/**
 * A proxy pattern implementation wrapping a linked list, this class provides an 
 * LRU cache for various access methods on the list - most notably search. It becomes an O(1)
 * operation rather than O(n) once the cache is warmed up as long as the entry remains in the cache.
 * See the LinkedList class for function documentation.
 * @public
 * @constructor
 * @class {CachingLinkedList}
 * @param {Number} threshold  the LRU cache threshold - maximum number of entries
 * @param {String} cacheKey the object key to cache on
 * @param {LinkedList|DoublyLinkedList} list (optional) the linked list to encapsulate
 * @returns {Void}
 */
module.exports.Scule.classes.CachingLinkedList = function(threshold, cacheKey, list) {

    if(!cacheKey) {
        throw 'A valid cache key is required to use a CachingLinkedList';
    }

    if(!threshold) {
        threshold = 100;
    }
    
    /**
     * @private
     * @type {String}
     */
    this.cacheKey  = cacheKey;
    
    /**
     * @private
     * @type {Number}
     */
    this.threshold = threshold;
    
    /**
     * @private
     * @type LRUCache
     */
    this.cache = new module.exports.Scule.classes.LRUCache(threshold);
    
    if(!list) {
        list = new module.exports.Scule.classes.LinkedList();
    }
    
    /**
     * @private
     * @type {LinkedList|DoublyLinkedList}
     */
    this.list = list;

    /**
     *  Empties the list
     *  @public
     *  @returns {Void}
     */
    this.clear = function() {
        this.cache.clear();
        this.list.clear();
    };

    /**
     * Removes the element at the provided index. If the index is out of range this function returns null.
     * @public
     * @param {Number} idx the index of the node to remove
     * @returns {LinkedListNode|null}
     */
    this.remove = function(idx) {  
        var node = this.list.remove(idx);
        if(node) {
            this.cache.remove(node.element[this.cacheKey]);
        }
        return node;
    };
    
    /**
     * Returns the element at the (approximate) middle of the list - should execute in O(n/2) time and O(1) space
     * @public
     * @returns {LinkedListNode|null}
     */    
    this.middle = function() {
        return this.list.middle();
    };
    
    /**
     * Splits the list at the given index
     * @public
     * @returns {LinkedList}
     */    
    this.split = function() {
        this.cache.clear();
        return this.list.split()
    };
    
    /**
     * Adds an element to the end list
     * @public
     * @param {Mixed} value the value to add to the list
     * @returns {LinkedListNode|DoublyLinkedListNode}
     */    
    this.add = function(value) {
        var node = this.list.add(value);
        this.cache.put(node.element[this.cacheKey], node);
        return node;
    };
    
    /**
     * Performs a linear scan on the list to determine if an element exists. Optionally takes a key
     * that is used to introspect elements (e.g. 'bar', foo => {foo:'bar'}. Returns null if no results are found
     * @public
     * @param {Mixed} value the value to search for in the list
     * @returns {Mixed|null}
     */    
    this.search = function(value) {
        if(this.cache.contains(value)) {
            return this.cache.get(value); 
        }
        var node = this.list.search(value, this.cacheKey);
        if(node) {
            this.cache.put(node.element[this.cacheKey], node);
        }
        return node;
    };
    
    /**
     * Returns the number of elements in the list
     * @public
     * @returns {Number}
     */     
    this.getLength = function() {
        return this.list.getLength();
    };
    
    /**
     * Returns the tail elements from the list
     * @public
     * @returns {LinkedListNode|DoublyLinkedListNode}
     */    
    this.getTail = function() {
        return this.list.getTail();
    };
    
    /**
     * Returns the head elements from the list
     * @public
     * @returns {LinkedListNode|DoublyLinkedListNode}
     */    
    this.getHead = function() {
        return this.list.getHead();
    };
    
    /**
     * Returns a boolean value indicating whether or not the list is empty
     * @public
     * @returns {Boolean}
     */    
    this.isEmpty = function() {
        return this.list.isEmpty();  
    };
    
    /**
     * Returns the element residing at the specified index. Returns null if none exists or index is out of range.
     * @public
     * @param {Number} idx the index of the node to return
     * @returns {Mixed|null}
     */    
    this.get = function(idx) {
        return this.list.get(idx);  
    };
    
    /**
     * Performs a linear scan to determine if a given value exists in the list
     * @public
     * @param {Mixed} value the value to search for in the list
     * @returns {Boolean}
     */    
    this.contains = function(value) {
        return this.list.contains(value);
    };

    /**
     * Reverses the list
     * @public
     * @returns {Void}
     */
    this.reverse = function() {
        this.list.reverse();
    };
    
    /**
     * Performs an in place merge sort on the list, optionally taking a comparison function as a parameter
     * @public
     * @param {Function} cmp the comparison function to use during the merge step
     * @returns {Null}
     */    
    this.sort = function(cmp) {
        this.list.sort(cmp, this.cacheKey);  
    };

    /**
     * Returns the contents of the list (values) as an array
     * @public
     * @returns {Array}
     */
    this.toArray = function() {
        return this.list.toArray();
    };

    /**
     * Emulates the Array forEach prototype function
     * @public
     * @param {Function} callback the callback to execute at each step in the loop
     * @returns {Void}
     */
    this.forEach = function(callback) {
        return this.list.forEach(callback);
    };

};

/**
 * Represents a linked list node
 * @public
 * @constructor
 * @class {LinkedListNode}
 * @param {LinkedListNode} next the next node in the list
 * @param {Mixed} element the element value for the node
 * @returns {Void}
 */
module.exports.Scule.classes.LinkedListNode = function(next, element) {
    
    /**
     * @private
     * @type {Null|LinkedListNode}
     */
    this.next    = next;
    
    /**
     * @private
     * @type {Null|LinkedListNode}
     */    
    this.element = element;
    
    /**
     * Returns the next element in the list - returns null if the list terminates at this node
     * @public
     * @returns {LinkedListNode|null}
     */
    this.getNext = function() {
        return this.next;
    };
    
    /**
     * Sets the next element in the list
     * @public
     * @param {LinkedListNode} next sets the right sibling for the node
     * @returns {Void}
     */
    this.setNext = function(next) {
        this.next = next;
    };
    
    /**
     * Returns the element value for the list node
     * @public
     * @returns {Mixed}
     */
    this.getElement = function() {
        return this.element;
    }
    
    /**
     * Sets the element value for the list node
     * @public
     * @param {Mixed} element sets the element value for the node
     * @returns {Void}
     */
    this.setElement = function(element) {
        this.element = element;
    }
    
};

/**
 * Represents a doubly linked list node
 * @public
 * @constructor
 * @class {DoublyLinkedListNode}
 * @param {DoublyLinkedListNode} next the next node in the list
 * @param {DoublyLinkedListNode} prev the previous node in the list
 * @param {Mixed} element the element value for the node
 * @extends {LinkedListNode}
 * @returns {Void}
 */
module.exports.Scule.classes.DoublyLinkedListNode = function(prev, next, element) {
    
    module.exports.Scule.classes.LinkedListNode.call(this, next, element);
    
    /**
     * @private
     * @type {Null|DoublyLinkedListNode}
     */
    this.prev = prev;
    
    /**
     * Returns the previous element in the list - returns null if the list terminates at this node
     * @public
     * @returns {LinkedListNode|null}
     */
    this.getPrev = function() {
        return this.prev;
    };
    
    /**
     * Sets the previous element in the list
     * @public
     * @param {LinkedListNode} prev sets the left sibling for the node
     * @returns {Void}
     */
    this.setPrev = function(prev) {
        this.prev = prev;
    };
    
    /**
     * Nulls out the prev and next pointers on the node
     * @public
     * @returns {Void}
     */
    this.detach = function() {
        this.prev = null;
        this.next = null;
    };
    
};

/**
 * Represents a last recently used cache - elements are automatically trimmed as more recent entries are created or accessed.
 * Interally the class uses a doubly linked list as a priority queue to track LRU and trim elements
 * @public
 * @constructor
 * @class {LRUCache}
 * @param {Number} threshold the threshold for cache entry removal
 * @returns {Void}
 */
module.exports.Scule.classes.LRUCache = function(threshold) {
    
    /**
     * @private
     * @type {Number}
     */
    this.threshold = threshold;
    
    /**
     * @private
     * @type {HashTable}
     */
    this.cache = new module.exports.Scule.classes.HashTable();
    
    /**
     * @private
     * @type {DoublyLinkedList}
     */
    this.queue = new module.exports.Scule.classes.DoublyLinkedList();
    
    /**
     * Returns a boolean value indicating whether or not a key exists within the cache
     * @public
     * @param {String} key the key to use when searching for a value in the cache
     * @returns {Boolean}
     */
    this.contains = function(key) {
        return this.cache.contains(key);
    };
    
    /**
     * Removes an entry from the cache, returns null if the entry doesn't exist
     * @public
     * @param {String} key the key to use when removing a value from the cache
     * @returns {Null|boolean}
     */
    this.remove = function(key) {
        if(!this.cache.contains(key)) {
            return null;
        }   
        var entry = this.cache.get(key);
        this.cache.remove(key);
        
        var prev = entry.node.prev;
        var next = entry.node.next;
        if(prev) {
            prev.next = next;
        }
        if(next) {
            next.prev = prev;
        }
        entry.node.detach();
        this.queue.length--;
        return true;
    };
    
    /**
     *  Returns an entry from the cache for the given key, returns null if no entry exists
     *  @public
     *  @param {Mixed} key the key to use when retrieving a value from the cache
     *  @returns {Mixed|null}
     */
    this.get = function(key) {
        if(!this.cache.contains(key)) {
            return null;
        }
        var entry = this.cache.get(key);
        entry.requeue(this.queue);
        return entry.value;
    };
    
    /**
     * Adds an entry to the cache. This function will over-write existing entries for the same key.
     * @public
     * @param {Mixed} key the key to use when storing a value in the cache
     * @param {Mixed} value the value to store
     * @returns {Boolean}
     */
    this.put = function(key, value) {
        var entry;
        if(this.cache.contains(key)) {
            // if the entry exists in the cache update it and move it to the head of the priority queue
            entry = this.cache.get(key);
            entry.value = value;
            entry.node.element = {
                key:key, 
                value:value
            };
            entry.requeue(this.queue);
        } else { 
            // otherwise we add it to the head of the queue
            entry = new module.exports.Scule.classes.LRUCacheEntry(key, value, this.queue.prepend({
                key:key, 
                value:value
            }));
            this.cache.put(key, entry);
        }
        // trim stale cache entries if we've reached our threshold
        if(this.queue.length > this.threshold) {
            var o = this.queue.trim();
            if(!this.cache.remove(o.getElement().key)) {
                throw 'LRU cache is corrupt';
            }
            o = null;
        }
        return true;
    };
    
    /**
     * Returns the number of elements in the cache
     * @public
     * @returns {Number}
     */
    this.getLength = function() {
        return this.cache.getLength();
    };
    
    /**
     * Clears the LRU cache
     * @public
     * @returns {Void}
     */
    this.clear = function() {
        this.cache.clear();
        this.queue.clear();
    };
    
};

/**
 * Represents an entry in a LRU cache - contains some helper functions to perform re-queue operations
 * @public
 * @constructor
 * @class {LRUCacheEntry}
 * @param {String} key the key for the cache entry
 * @param {Mixed} value the value for the cache entry
 * @param {DoublyLinkedListNode} node the linked list node for the cache entry - forms part of the priority queue
 * @returns {Void}
 */
module.exports.Scule.classes.LRUCacheEntry = function(key, value, node) {
  
    /**
     * @private
     * @type {String}
     */
    this.key   = key;
    
    /**
     * @private
     * @type {Mixed}
     */
    this.value = value;
    
    /**
     * @private
     * @type {DoublyLinkedListNode}
     */
    this.node  = node;
    
    /**
     * Returns the key for the cache entry
     * @public
     * @returns {String}
     */
    this.getKey = function() {
        return this.key;  
    };
    
    /**
     * Returns the value for the cache entry
     * @public
     * @returns {Mixed}
     */
    this.getValue = function() {
        return this.value;
    }
    
    /**
     * Return the linked list node for the entry
     * @public
     * @returns {LinkedListNode}
     */
    this.getNode = function() {
        return this.node;
    };
    
    /**
     * Re-queues the node for the list entry (moving it to the head of the priority queue)
     * @public
     * @param {DoublyLinkedList} queue the node to re-queue
     * @returns {Void}
     */
    this.requeue = function(queue) {
        if(!this.node.prev) { // already at the head of the queue
            return;
        }
        // no some magic pointer switching
        var prev = this.node.prev;
        var next = this.node.next;
        prev.next = next;
        if(next) {
            next.prev = prev;
        }
        // clean up the pointers for the current node
        this.node.detach();
        queue.length--;
        // requeue the cache entry
        this.node = queue.prepend({
            key:this.key, 
            value:this.value
        });
    };

};

/**
 * Represents a LIFO stack
 * @public
 * @constructor
 * @class {LIFOStack}
 * @extends {LinkedList}
 * @returns {Void}
 */
module.exports.Scule.classes.LIFOStack = function() {
    
    module.exports.Scule.classes.LinkedList.call(this);

    /**
     * Pushes a new node to the head of the stack
     * @public
     * @param {Mixed} value the element value for the new node
     * @returns {Void}
     */
    this.push = function(value) {
        var curr = this.head;
        this.head = new module.exports.Scule.classes.LinkedListNode(curr, value);
        this.length++;
    };
    
    /**
     * Pops the head element value off the stack, returns null if the stack is empty
     * @public
     * @returns {Mixed|null}
     */
    this.pop = function() {
        if(this.isEmpty()) {
            return null;
        }        
        var curr = this.head;
        this.head = curr.next;
        this.length--;
        curr.next = null;
        return curr.getElement();
    };
    
    /**
     * Returns the head element value without mutating the stack, returns null of the stack is empty
     * @public
     * @returns {Mixed|null}
     */
    this.peek = function() {
        if(this.isEmpty()) {
            return null;
        }
        return this.head.getElement();   
    };

}

/**
 * Represents a FIFO stack
 * @public
 * @constructor
 * @class {FIFOStack}
 * @extends {LIFOStack}
 * @returns {Void}
 */
module.exports.Scule.classes.FIFOStack = function() {
  
    module.exports.Scule.classes.LIFOStack.call(this);

    /**
     * Appends a new LinkedListNode to the tail of the stack
     * @public
     * @param {Value} mixed the element value to append to the stack
     * @returns {Void}
     */
    this.push = this.add;

    /**
     * Pops the head element value off the stack, returns null if the stack is empty
     * @public
     * @returns {Mixed|null}
     */
    this.pop = function() {
        if(this.isEmpty()) {
            return null;
        }
        var curr = this.head;
        this.head = curr.next;
        this.length--;
        return curr.getElement();    
    };

};

/**
 * Represents a queue
 * @public
 * @constructor
 * @class {Queue}
 * @extends {LIFOStack}
 * @returns {Void}
 */
module.exports.Scule.classes.Queue = function() {
    
    module.exports.Scule.classes.FIFOStack.call(this);

    /**
     * Appends a new LinkedListNode to the tail of the queue
     * @public
     * @param {Value} mixed the element value to append to the queue
     * @returns {Void}
     */
    this.enqueue = this.push;
    
    /**
     * Pops the head element value off the queue, returns null if the queue is empty
     * @public
     * @returns {Mixed|null}
     */    
    this.dequeue = this.pop;

};

module.exports.Scule.variables.fnv_hash = function (key, size) {
    var hash  = 2166136261;
    var prime = 16777619;
    var len   = key.length;
    for (var i=0; i < len; i++) {
        hash = (hash ^ key.charCodeAt(i)) * prime;
    }
    hash += hash << 13;
    hash ^= hash >> 7;
    hash += hash << 3;
    hash ^= hash >> 17;
    hash += hash << 5;
    if (hash < 0) {
        hash = hash * -1;
    }
    return hash % size;
};

/**
 * Hashes the provided string key to an integer value in the table range (djb2)
 * @private
 * @param {String} key the key to hash
 * @returns {Number}
 */
module.exports.Scule.variables.djb2_hash = function (key, size) {
    var hash = 5381;
    var len  = key.length;
    var i    = 0;
    for (i = 0; i < len; i++) {
        hash = ((hash << 5) + hash) + key.charCodeAt(i);
    }
    if (hash < 0) {
        hash = hash * -1;
    }
    return hash % size;
};

/**
 * Hashes the provided string key to an integer value in the table range (jooat)
 * @private
 * @param {String} key the key to hash
 * @returns {Number}
 */
module.exports.Scule.variables.joaat_hash = function (key, size) {
    var hash = 0;
    var len  = key.length;
    var i = 0;
    for (i = 0; i < len; i++) {
        hash += key.charCodeAt(i);
        hash += (hash << 10);
        hash ^= (hash >> 6);
    }
    hash += (hash << 3);
    hash ^= (hash >> 11);
    hash += (hash << 15);
    if (hash < 0) {
        hash = hash * -1;
    }
    return hash % size;

};

module.exports.Scule.variables.elf_hash = function (key, size) {
    var h = 0, g;
    for (var i=0; i < key.length; i++)
    {
        h = (h << 4) + key.charCodeAt(i);
        if (g = h & 0xF0000000) {
            h ^= g >> 24;
        }
        h &= ~g;
    }
    return h % size;        
};

/**
 * A simple Hash Table implementation in JavaScript - internally uses the joaat hashing algorithm.
 * The data structure resizes itself geometrically (size = size * 2) once the load factor surpases 0.7.
 * Bucketing is handled using open addressing and self balancing binary search trees, so search time 
 * should be O(n) + O(log n).
 * 
 * It's kind of slow. Stick with using the HashTable class.
 * 
 * @public
 * @constructor
 * @class HashMap
 * @param {Number} size the initial size of the hash table
 * @returns {Void}
 */
module.exports.Scule.classes.HashMap = function(size) {

    /**
     * @private
     * @type {Number}
     */
    this.size    = size;

    /**
     * @private
     * @type {Number}
     */
    this.buckets = 0;
    
    /**
     * @private
     * @type {Number}
     */    
    this.length  = 0;
    
    /**
     * @private
     * @type {Array}
     */    
    this.table   = [];

    this.hash = module.exports.Scule.variables.joaat_hash;

    /**
     * Rebuilds the table
     * @private
     * @returns {Void}
     */
    this.retable = function() {
        var factor = this.length/this.size;
        if(this.length >= this.buckets && factor < 0.7) {
            return;
        }
        var elements = this.toArray();
        this.clear();
        this.size = this.size * 2;
        for(var i=0; i < elements.length; i++) {
            this.put(elements[i][0], elements[i][1]);
        }
    };

    /**
     * Returns the bucket corresponding to the provided key, if no bucket exists
     * one is created and placed in the table
     * @private
     * @param {Number} key the key to return the bucket for
     * @returns {BinarySearchTree}
     */
    this.bucket = function(key) {
        if(!this.table[key]) {
            this.buckets++;
            this.table[key] = new module.exports.Scule.classes.BinarySearchTree();
        }
        return this.table[key];
    };

    /**
     * Adds a key/value pair to the table
     * @public
     * @param {String} key
     * @param {Mixed} value
     * @returns {Boolean}
     */
    this.put = function(key, value) {
        var k = this.hash(key, this.size);
        var b = this.bucket(k);
        var r = b.insert(key, value);
        if(r) {
            this.length++;
            if(b.getLength()%10 == 0) {
                b.balance();
            }            
        }
        this.retable();
        return r;
    };

    /**
     * Returns a boolean value indicating whether or not the key exists in the table
     * @public
     * @param {String} key
     * @returns {Boolean}
     */
    this.contains = function(key) {
        var k = this.hash(key, this.size);
        var b = this.bucket(k);
        return (b.search(key) !== null);        
    };

    /**
     * Returns the value corresponding to the provided key, returns null if the 
     * key does not exist in the table
     * @public
     * @param {String} key
     * @returns {Mixed}
     */
    this.get = function(key) {
        var k = this.hash(key, this.size);
        var b = this.bucket(k);
        var v = b.search(key);
        if(v == null) {
            return null;
        }   
        return v.getData();
    };

    /**
     * Returns the value corresponding to the provided key, returns null if the 
     * key does not exist in the table
     * @public
     * @param {String} key
     * @returns {Mixed}
     */
    this.search = function(key) {
        return this.get(key);
    };
    
    /**
     * Removes a key/value pair from the table
     * @public
     * @returns {Boolean}
     */
    this.remove = function(key) {
        var k = this.hash(key, this.size);
        var b = this.bucket(k);
        if(b.remove(key)) {
            this.length--;
            this.retable();
            return true;
        } else {
            return false;
        }
    };
    
    /**
     * Empties the table
     * @public
     * @returns {Void}
     */
    this.clear = function() {
        this.table   = [];
        this.length  = 0;
        this.buckets = 0;
    };

    /**
     * Returns the length of the table as an integer
     * @public
     * @returns {Number}
     */
    this.getLength = function() {
        return this.length;
    };

    /**
     * Returns an {Array} containing all keys in the table
     * @public
     * @returns {Array}
     */
    this.getKeys = function() {
        var keys = [];
        var getKeys = function(node) {
            if(node === null) {
                return;
            }
            keys.push(node.getKey());
            getKeys(node.getLeft());
            getKeys(node.getRight());
        };
        this.table.forEach(function(bucket) {
            if(!bucket) {
                return;
            }
            getKeys(bucket.getRoot());
        });
        return keys;
    };

    /**
     * Returns an {Array} containing all values in the table
     * @public
     * @returns {Array}
     */
    this.getValues = function() {
        var values = [];
        var getValues = function(node) {
            if(node === null) {
                return;
            }
            values.push(node.getData());
            getValues(node.getLeft());
            getValues(node.getRight());
        };
        this.table.forEach(function(bucket) {
            if(!bucket) {
                return;
            }
            getValues(bucket.getRoot());
        });
        return values;        
    };

    /**
     * Returns all key/value pairs in the table as an {Array}
     * @public
     * @returns {Array}
     */
    this.toArray = function() {
        var array = [];
        this.table.forEach(function(bucket) {
            if(!bucket) {
                return;
            }
            array = array.concat(bucket.toArray());
        });
        return array;
    };

};

/**
 * Represents a counter
 * @public
 * @constructor
 * @class {AtomicCounter}
 * @param {Integer} initial the initial value for the counter - defaults to 0
 * @returns {Void}
 */
module.exports.Scule.classes.AtomicCounter = function(initial) {

    if (initial === undefined) {
        initial = 0;
    }

    if (!module.exports.Scule.functions.isInteger(initial)) {
        throw "Unable to initialize counter with non-integer value";
    }

    this.count = initial;

    /**
     * Increments the counter using the provided integer value. If not value is
     * provided the counter is incremented by 1
     * @public
     * @param {Integer} the amount to increment the counter by
     * @returns {Integer}
     */
    this.increment = function(value) {
        if (value === undefined) {
            value = 1;
        }
        if (!module.exports.Scule.functions.isInteger(value)) {
            throw "Unable to increment counter with non-integer value";
        }
        this.count += value;
        return this.count;
    };

    /**
     * Decrements the counter using the provided integer value. If not value is
     * provided the counter is Decremented by 1
     * @public
     * @param {Integer} the amount to decrement the counter by
     * @returns {Integer}
     */
    this.decrement = function(value) {
        if (value === undefined) {
            value = 1;
        }
        if (!module.exports.Scule.functions.isInteger(value)) {
            throw "Unable to decrement counter with non-integer value";
        }
        this.count -= value;
        return this.count;        
    };
    
    /**
     * Returns the value of the counter
     * @public
     * @returns {Integer}
     */
    this.getCount = function() {
        return this.count;
    };

};

/**
 * Represents a bit set (bit array)
 * @public
 * @see http://stackoverflow.com/questions/1436438/how-do-you-set-clear-and-toggle-a-single-bit-in-javascript
 * @constructor
 * @class {BitSet}
 * @param {Integer} capacity the capacity of the bit set
 * @returns {Void}
 */
module.exports.Scule.classes.BitSet = function(capacity) {
  
    if (capacity === undefined || !module.exports.Scule.functions.isInteger(capacity) || capacity <= 0) {
        throw "Unable to initialize bitset with non-integer capacity";
    }

    this.capacity = capacity;
    this.words = null;
    
    /**
     * Fills the word array with zero bits
     * @public
     * @returns {void}
     */    
    this.zeroFill = function() {
        this.words = [];
        var b = Math.ceil(this.capacity / 32);
        for (var i=0; i <= b; i++) {
            this.words[i] = 0x00;
        }
    };
    
    /**
     * Converts the provided bit address to an array and bit offset
     * @public
     * @returns {Object}
     */    
    this.indexToAddress = function(index) {
        if (index < 0 || index >= this.capacity) {
            throw "Index out of bounds";
        }
        if (index < 32) {
            return {
                addr:0, 
                offs:index
            };
        }
        var addr = Math.floor(index/32);
        var offs = index%32;
        return {
            addr:addr, 
            offs:offs
        };
    };
    
    /**
     * Returns state of the bit at the given offset
     * @public
     * @param {Integer} the offset of the bit to check (e.g. 128 for the 128th bit)
     * @returns {Boolean}
     */    
    this.get = function(index) {
        var o = this.indexToAddress(index);
        return ((this.words[o.addr] & (1 << o.offs)) != 0);
    };

    /**
     * Sets the bit at the given offset to "on"
     * @public
     * @param {Integer} the offset of the bit to check (e.g. 128 for the 128th bit)
     * @returns {Boolean}
     */    
    this.set = function(index) {
        var o = this.indexToAddress(index);
        this.words[o.addr] |= 0x01 << o.offs;
    };

    /**
     * Sets the bit at the given offset to "off"
     * @public
     * @param {Integer} the offset of the bit to check (e.g. 128 for the 128th bit)
     * @returns {Boolean}
     */    
    this.clear = function(index) {
        var o = this.indexToAddress(index);
        this.words[o.addr] &= ~(0x01 << o.offs);
    };

    /**
     * Returns the bit capacity of the bit set
     * @public
     * @returns {Integer}
     */
    this.getLength = function() {
        return this.capacity;
    };

    /**
     * Returns a string representation of the bit set - e.g. 1 = 1000000
     * @public
     * @returns {String}
     */
    this.toString = function() {
        var string = '';
        for (var i=0; i < this.capacity; i++) {
            string += (this.get(i) ? 1 : 0);
        }
        return string;
    };

    this.zeroFill();

};

/**
 * Represents a bloom filter
 * @public
 * @see http://en.wikipedia.org/wiki/Bloom_Filter
 * @constructor
 * @class {BloomFilter}
 * @extends {BitSet}
 * @param {Integer} m capacity the capacity of the bit set
 * @param {Integer} k the number of hash functions to implement
 * @returns {Void}
 */
module.exports.Scule.classes.BloomFilter = function(m, k) {
        
    if (m === undefined || !module.exports.Scule.functions.isInteger(m) || m <= 0) {
        throw "Unable to initialize bloom filter with non-integer m";
    }    

    if (k === undefined || !module.exports.Scule.functions.isInteger(k) || k <= 0) {
        k = Math.floor(m/Math.ceil(m/3));
    }    

    module.exports.Scule.classes.BitSet.call(this, m);
    
    this.k = k;
    this.f = [];
    
    for (var i=0; i < this.k; i++) {
        this.f.push([
            module.exports.Scule.functions.randomFromTo(0, 999999),
            module.exports.Scule.functions.randomFromTo(0, 999999)
            ]);
    }

    this.hash = function(i, key, capacity) {
        return module.exports.Scule.variables.fnv_hash(this.f[i][0] + key + this.f[i][1], capacity);
    };

    /**
     * Adds a key to the filter
     * @param {String} the key to hash to a bit position in the filter
     * @returns {Void}
     */
    this.add = function(key) {
        for (var i=0; i < this.k; i++) {
            this.set(this.hash(i, key, this.capacity));
        }
    };

    /**
     * Queries to determine the state of the bit corresponding to the hash
     * for the given key
     * @param {String} the key to hash to a bit position in the filter
     * @returns {Boolean}
     */
    this.query = function(key) {
        for (var i=0; i < this.k; i++) {
            if (!this.get(this.hash(i, key, this.capacity))) {
                return false;
            }
        }
        return true;
    };
    
};

/**
 * Represents a Hash Table - really just a thin wrapper around a JavaScript associative array.
 * It depends on the implementation but I believe most JS engines use b-trees under the hood for this.
 * @public
 * @constructor
 * @class {HashTable}
 * @returns {Void}
 */
module.exports.Scule.classes.HashTable = function() {

    /**
     * @private
     * @type {Object}
     */
    this.table  = {};
    
    /**
     * @private
     * @type {Number}
     */
    this.length = 0;

    /**
     * Adds a key, value pair to the table
     * @public
     * @param {Mixed} key the key to use when storing the value in the table
     * @param {Mixed} value the value to store
     * @returns {Void}
     */
    this.put = function(key, value) {
        if(!this.contains(key)) {
            this.length++;
        }
        this.table[key] = value;
    };
    
    /**
     * Returns the value for a given key, returns null if no matching key exists
     * @public
     * @param {Mixed} key the key to use when searching the table
     * @returns {Mixed|null}
     */
    this.get = function(key) {
        if(this.contains(key)) {
            return this.table[key];
        }
        return null;
    };
    
    /**
     * Alias for the get function
     * @public
     * @see {HashTable.get}
     * @param {Mixed} key the key to use when searching the table
     * @returns {Mixed|null}
     */
    this.search = function(key) {
        return this.get(key);
    }
    
    /**
     * Removes a key, value mapping from the table, returns a boolean signfiying success or failure
     * @public
     * @param {Mixed} key the key to use when removing a value from the table
     * @returns {Boolean}
     */
    this.remove = function(key) {
        if(this.contains(key)) {
            delete this.table[key];
            this.length--;
            return true;
        }
        return false;
    };
    
    /**
     * Returns a boolean value indicating whether or not the given key exists in the table
     * @public
     * @param {Mixed} key the key to test with
     * @returns {Boolean}
     */
    this.contains = function(key) {
        return key in this.table;
    };
    
    /**
     * Empties the table
     * @public
     * @returns {Void}
     */
    this.clear = function() {
        this.table = {};
        this.length = 0;
    };

    /**
     * Returns the number of elements in the table as an integer
     * @public
     * @returns {Number}
     */
    this.getLength = function() {
        return this.length;
    };

    /**
     * Returns an array containing all keys in the table
     * @public
     * @returns {Array}
     */
    this.getKeys = function() {
        var keys = [];
        for(var ky in this.table) {
            keys.push(ky);
        }
        return keys;
    };
    
    /**
     * Returns an array containing all values in the table
     * @public
     * @returns {Array}
     */
    this.getValues = function() {
        var values = [];
        for(var ky in this.table) {
            values.push(this.table[ky]);
        }
        return values;
    };
    
    /**
     * Returns the contents of the HashTable as an associative array
     * @returns {Array}
     */
    this.toArray = function() {
        var a = [];
        for(var ky in this.table) {
            a[ky] = this.table[ky];
        }        
        return a;
    };

};

/**
 * Represents the base class for a B+Tree node
 * @public
 * @constructor
 * @class {BPlusTreeNode}
 * @param {Null|BPlusTreeNode} left the left sibling for the node
 * @param {Null|BPlusTreeNode} right the right sibling for the node
 * @returns {Void}
 */
module.exports.Scule.classes.BPlusTreeNode = function(left, right) {
    
    /**
     * @private
     * @type {Boolean}
     */
    this.leaf      = false;

    /**
     * @private
     * @type {Number}
     */
    this.order     = 100;
   
    /**
     * @private
     * @type {Number}
     */   
    this.threshold = 40;
    
    /**
     * @private
     * @type {Array}
     */    
    this.data      = [];
  
    /**
     * Returns the order (block size) for the node
     * @public
     * @returns {Number}
     */
    this.getOrder = function() {
        return this.order;
    };
    
    /**
     * Sets the order (block size) for the node
     * @public
     * @param {Number} order the order for the node
     * @returns {Void}
     */
    this.setOrder = function(order) {
        this.order = order;
    };
  
    /**
     * Returns the merge threshold for the node
     * @public
     * @returns {Number}
     */  
    this.getMergeThreshold = function() {
        return this.threshold;
    };
  
    /**
     * Sets the merge threshold for the node
     * @public
     * @param {Number} threshold the merge threshold for the node
     * @returns {Void}
     */  
    this.setMergeThreshold = function(threshold) {
        this.threshold = threshold;
    };

    /**
     * Returns a boolean value indicating whether or not the node is a leaf node
     * @returns {Boolean}
     */
    this.isLeaf = function() {
        return this.leaf;
    };

};

/**
 * Represents a leaf node in the B+Tree
 * @public
 * @constructor
 * @class {BPlusTreeLeafNode}
 * @extends {BPlusTreeNode}
 * @param {Null|BPlusTreeNode} left the left sibling for the node
 * @param {Null|BPlusTreeNode} right the right sibling for the node
 * @returns {Void}
 */
module.exports.Scule.classes.BPlusTreeLeafNode = function(left, right) {
    
    module.exports.Scule.classes.BPlusTreeNode.call(this);
    
    /**
     * @private
     * @type {Boolean}
     */
    this.leaf  = true;
    
    /**
     * @private
     * @type {Null|BPlusTreeLeadNode}
     */
    this.left  = left;
    
    /**
     * @private
     * @type {Null|BPlusTreeLeadNode}
     */    
    this.right = right;
    
    /**
     * Returns the right sibling for the node
     * @public
     * @returns {Null|BPlusTreeLeafNode}
     */
    this.getRight = function() {
        return this.right;
    }
    
    /**
     * Sets the right sibling for the node
     * @public
     * @param {BPlusTreeLeafNode} right the right sibling for the node
     * @returns {Void}
     */
    this.setRight = function(right) {
        this.right = right;
    }
    
    /**
     * Returns the left sibling for the node
     * @public
     * @returns {Null|BPlusTreeLeafNode}
     */
    this.getLeft = function() {
        return this.left;
    }

    /**
     * Sets the left sibling for the node
     * @public
     * @param {BPlusTreeLeafNode} left the left sibling for the node
     * @returns {Void}
     */
    this.setLeft = function(left) {
        this.left = left;
    }
    
    /**
     * Use for lookups to avoid a sequential search
     * @private
     * @type {LRUCache}
     */
    this.lookup = new module.exports.Scule.classes.LRUCache(Math.floor(this.threshold / 2));    
    
    /**
     * Searches for a key in the node data
     * @public
     * @param {Mixed} key
     * @returns {Null|mixed}
     */
    this.search = function(key) {
        var element = this.lookup.get(key);
        if(!element) {
            element = this.sequentialSearch(key);
            if(element) {
                this.lookup.put(element.key, element);
            } else {
                return null;
            }
        }
        return element.value;
    };    
    
    /**
     * Performs a sequential search on the node's data to locate the the node matching the provided key
     * @public
     * @param {Mixed} key the key to search for
     * @returns {Object|null}
     */
    this.sequentialSearch = function(key) {
        var index = this.indexSearch(key);
        var element = this.data[index];
        if(index < this.data.length && element.key == key) {
            return element;
        }
        return null;
    };
    
    /**
     * Performs a binary search on the data for the node
     * @private
     * @param {Mixed} key the key to search for
     * @returns {The} integer integer index of the data in the array, if not found returns the array length
     */
    this.indexSearch = function(key) {
        var data   = this.data;
        if(data.length == 0) {
            return 0;
        }
        var left   = 0;
        var right  = this.data.length - 1;
        var middle = left + Math.floor((right - left) / 2);
        var found  = false;    
        do {
            middle = left + Math.floor((right - left) / 2);
            if(data[middle].key < key) {
                left = middle + 1;
            } else if(data[middle].key > key) {
                right = middle;
            } else {
                found = true;
            }
        } while(left < right && !found);
        if(found) {
            return middle;
        } else {
            return right;
        }
    };

    /**
     * Identifies the siblings for the current node - i.e. adjacent nodes with the same parent
     * @private
     * @param {BPlusTreeInteriorNode} parent the parent node to use when identifying siblings
     * @returns {Mixed}
     */
    this.identifySiblings = function(parent) {
        var siblings = {
            index:null,
            left:null,
            key:null,
            right:null
        };
        var right = this.getRight();
        var left  = this.getLeft();
        var i=0;
        for(; i < parent.data.length; i = i+2) {
            var node = parent.data[i];
            if(node == right) {
                siblings.right = right;
                siblings.index = i-2;
                siblings.right_key = parent.data[i-1];
                siblings.right_key_index = i-1;
            }
            if(node == left) {
                siblings.left = left;
                siblings.index = i+2;
                siblings.left_key = parent.data[i+1];
                siblings.left_key_index = i+1;
            }
        }
        if(siblings.index == null) {
            siblings.index = (i >= 2) ? i-2 : 0;
        }
        return siblings;
    };

    /**
     * Returns the keys for this node as an array
     * @public
     * @returns {Array}
     */
    this.getKeys = function() {
        var keys = [];
        this.data.forEach(function(element) {
            keys.push(element.key);
        });
        return keys;
    };    
    
    /**
     * Inserts a key/value pair into the data for the node
     * @public
     * @param {Mixed} key the key to insert
     * @param {Mixed} value the value to insert
     * @returns {Null|object}
     */
    this.insert = function(key, value) {
        var index = this.indexSearch(key);
        if(index == this.data.length) {
            this.data.push({
                key:key, 
                value:value
            });
        } else {
            var element = this.data[index];
            if(element.key == key) {
                element.value = value;
            } else if(element.key < key) {
                this.data.splice(index + 1, 0, {
                    key:key, 
                    value:value
                });
            } else {
                this.data.splice(index, 0, {
                    key:key, 
                    value:value
                });
            }
        }
        this.lookup.put(key, {
            key:key, 
            value:value
        });
        return this.split();
    };

    
    /**
     * Removes a key from the node data
     * @public
     * @param {Mixed} key the key to remove
     * @param {BPlusTreeNode} parent the parent node
     * @returns {Null|object}
     */
    this.remove = function(key, parent) {
        var index   = this.indexSearch(key);
        var element = this.data[index];        
        if(index < this.data.length && element.key == key) {
            this.data.splice(index, 1);
            this.lookup.remove(key);
            if(!parent) {
                return null;
            }
            return this.redistribute(key, parent);
        } else {
            return null;
        } 
    };
    
    /**
     * Attempts to redistribute values between siblings of the node - first checking left then right.
     * If redistribute fails, the node merges with the selected sibling
     * @public
     * @param {Mixed} oldkey the key for the node prior to redistribution
     * @param {BPlusTreeInteriorNode} parent the parent for the node
     * @returns {Object}
     */
    this.redistribute = function(oldkey, parent) {
        if(this.data.length > this.threshold) {
            return {
                operation:2,
                oldkey:oldkey,
                key:this.data[0].key
            };
        }
        var siblings = this.identifySiblings(parent);
        var deficit = this.threshold - this.data.length;
        var sibling, key;
        var left = false; 
        if(siblings.left) {
            sibling = siblings.left;
            key = siblings.left_key;
            left = true;
            if(sibling.data.length - deficit >= this.threshold) {
                this.data = sibling.data.splice(deficit * -1, deficit).concat(this.data);
                this.lookup.clear();
                return {
                    key:this.data[0].key, 
                    oldkey:siblings.left_key,
                    index:siblings.left_key_index,
                    operation:0
                };
            }          
        }        
        if(siblings.right) {
            sibling = siblings.right;
            key = siblings.right_key;
            left = false;
            if(sibling.data.length - deficit >= this.threshold) {           
                this.data = this.data.concat(sibling.data.splice(0, deficit));
                this.lookup.clear();
                return {
                    key:sibling.data[0].key,  
                    oldkey:siblings.right_key,
                    index:siblings.right_key_index,
                    operation:0
                };
            }  
        }
        return this.merge(sibling, siblings.index, key, left);
    };
    
    /**
     * Performs a merge with the selected sibling
     * @public
     * @param {BPlusTreeLeafNode} sibling the sibling to merge with
     * @param {Number} index
     * @param {String} oldkey
     * @param {Boolean} isLeft
     * @returns {Mixed}
     */
    this.merge = function(sibling, index, oldkey, isleft)  {
        if(this.data.length > this.threshold) {
            return null;
        }  
        if(!sibling) { // PANIC! this condition should never be met
            throw 'Unable to merge - no siblings';
        }        
        if(isleft) {
            sibling.data = sibling.data.concat(this.data.splice(0, this.data.length));
            sibling.setRight(this.getRight());
            if(sibling.getRight()) {
                sibling.getRight().setLeft(sibling);
            }
            sibling.lookup.clear();
            this.setLeft(null);
            this.setRight(null);
            return {
                left: true,
                index: index,
                node: sibling, 
                key: sibling.data[0].key,
                oldkey: oldkey,
                operation: 1
            };            
        } else {            
            var d = this.data.splice(0, this.data.length);
            sibling.data = d.concat(sibling.data.splice(0, sibling.data.length));
            sibling.setLeft(this.getLeft());
            if(sibling.getLeft()) {
                sibling.getLeft().setRight(sibling);
            }
            sibling.lookup.clear();
            this.setLeft(null);
            this.setRight(null);            
            return {
                left: false,
                index: index,
                key: sibling.data[0].key,
                node: sibling,
                oldkey: oldkey,
                operation: 1
            };            
        }
    };    
    
    /**
     * Returns a range of values from the node (and siblints) between min and max
     * @public
     * @param {Mixed} min
     * @param {Mixed} max
     * @param {Boolean} includeMin
     * @param {Boolean} includeMax
     * @returns {Array}
     */
    this.range = function(min, max, includeMin, includeMax) {
        if(includeMax === undefined) {
            includeMax = false;
        }
        if(includeMin === undefined) {
            includeMin = false;
        }
        if(min === undefined) {
            min = null;
        }
        if(max === undefined) {
            max = null;
        }            
        var curr  = this;
        var rng   = null;
        if(includeMin && includeMax) {
            rng = function(min, max, key, range, value) {
                if(min === null) {
                    if(key <= max) {
                        range = range.concat(value);
                    }
                } else if(max === null) {
                    if(key >= min) {
                        range = range.concat(value);
                    }
                } else {
                    if(key >= min && key <= max) {
                        range = range.concat(value);
                    }
                }
                return range;
            };
        } else if(includeMin) {
            rng = function(min, max, key, range, value) {
                if(min === null) {
                    if(key < max) {
                        range = range.concat(value);
                    }
                } else if(max === null) {
                    if(key >= min) {
                        range = range.concat(value);
                    }
                } else {
                    if(key >= min && key < max) {
                        range = range.concat(value);
                    }
                }
                return range;
            };
        } else { // includeMax
            rng = function(min, max, key, range, value) {
                if(min === null) {
                    if(key <= max) {
                        range = range.concat(value);
                    }
                } else if(max === null) {
                    if(key > min) {
                        range = range.concat(value);
                    }
                } else {
                    if(key > min && key <= max) {
                        range = range.concat(value);
                    }
                }
                return range;
            };            
        }
        var range = [];
            outer:
            while(curr) {
                var data  = curr.data;
                var left  = curr.indexSearch(min);
                var right = (max === null || max === undefined) ? (data.length - 1) : curr.indexSearch(max);
                if(right >= data.length) {
                    right = data.length - 1;
                }
                if(left <= data.length) {
                    for(var i=left; i <= right; i++) {
                        if(max !== null && data[i].key > max) {
                            break outer;
                        }
                        range = rng(min, max, data[i].key, range, data[i].value);
                    }
                }
                curr = curr.getRight();
            }
        return range;
    };    
    
    /**
     * If the node data length has exceeded the block size this function will divide it into two new nodes
     * connected by a junction and identified by a key
     * @public
     * @returns {Null|object}
     */
    this.split = function() {
        if(this.data.length <= this.order) {
            return null;
        }
        var middle = Math.floor(this.data.length / 2);

        var left = new module.exports.Scule.classes.BPlusTreeLeafNode(this.getLeft());
        left.setOrder(this.getOrder());
        left.setMergeThreshold(this.getMergeThreshold());
        left.data = this.data.splice(0, middle);
        
        var right = new module.exports.Scule.classes.BPlusTreeLeafNode(null, this.getRight());
        right.setOrder(this.getOrder());
        right.setMergeThreshold(this.getMergeThreshold());
        right.data = this.data.splice(0, middle + 1);

        left.setRight(right);
        if(this.getLeft()) {
            this.getLeft().setRight(left);
        }
        
        right.setLeft(left);
        if(this.getRight()) {
            this.getRight().setLeft(right);
        }
        
        return {
            left:left, 
            key:right.data[0].key, 
            right:right
        };
    };
    
    /**
     * Returns a string representation of the node object
     * @public
     * @returns {String}
     */
    this.toString = function() {
        return JSON.stringify(this.toArray(), null, "\t");
    };    
    
    /**
     * Returns an array based representation of the node object
     * @public
     * @returns {Array}
     */
    this.toArray = function() {
        var o = {
            type:'leaf'
        };
        for(var i=0; i < this.data.length; i++) {
            o[i + ':' + this.data[i].key] = this.data[i];
        }
        return o;
    };
    
};

/**
 * Represents a B+tree interior node
 * @public
 * @constructor
 * @extends {BPlusTreeNode}
 * @returns {Void}
 */
module.exports.Scule.classes.BPlusTreeInteriorNode = function() {
    
    module.exports.Scule.classes.BPlusTreeNode.call(this);

    /**
     * Returns the index of the nearest node for a given key
     * @private
     * @param {Mixed} key the key to search for
     * @returns {Number}
     */
    this.nodeSearch = function(key) {
        var len = this.data.length;
        for(var i=1; i < len; i = i + 2) {
            var ky = this.data[i];
            if(ky == key) {
                return i + 1;
            } else if(ky >= key) {
                return i - 1;
            }
        }
        return len - 1;
    };

    /**
     * Returns the index of the given key - this function does left/right switching based on key value
     * @private
     * @param {Mixed} key the key to search for
     * @returns {Number}
     */
    this.indexSearch = function(key) {
        var len = this.data.length;
        for(var i=1; i < len; i = i + 2) {
            var ky = this.data[i];
            if(ky == key) {
                return i;
            } else if(ky >= key) {
                return i;
            }
        }
        return len - 2;
    };

    /**
     * Searches for a child node
     * @private
     * @param {Mixed} key the key to search for
     * @returns {BPlusTreeNode}
     */
    this.childSearch = function(key) {
        if(this.data.length == 0) {
            return null;
        }
        return this.data[this.nodeSearch(key)];
    };

    /**
     * Searches the tree for a key, returns the value if it exists - otherwise returns null
     * @public
     * @param {Mixed} key the key to search for
     * @returns {Null|Mixed}
     */
    this.search = function(key) {
        return this.childSearch(key).search(key);
    };
 
    /**
      * Returns a range of values from the tree, bounding values inclusive
      * @public
      * @param {Mixed} min the lower bound of the range
      * @param {Mixed} max the upper bound of the range
      * @param {Boolean} includeMin
      * @param {Boolean} includeMax
      * @returns {Array}
      */
    this.range = function(min, max, includeMin, includeMax) {
        return this.childSearch(min).range(min, max, includeMin, includeMax);
    };
    
    /**
     * Inserts a key/value pair into the data for the node
     * @public
     * @param {Mixed} key the key to insert
     * @param {Mixed} value the value to insert
     * @returns {Null|Object}
     */    
    this.insert = function(key, value) {
        var index = this.indexSearch(key);
        if(this.data[index] > key) {
            index--;
        } else {
            index++;
        }
        var node  = this.data[index];
        var split = node.insert(key, value);
        if(split) {
            this.data.splice(index, 1, split.left, split.key, split.right);
        }
        return this.split();
    };
    
    /**
     * If the node data length has exceeded the block size this function will divide it into two new nodes
     * connected by a junction and identified by a key
     * @public
     * @returns {Null|object}
     */    
    this.split = function() {
        var len = Math.floor((this.data.length - 1) / 2);
        if(len < this.order) {
            return null;
        }
        
        var middle = Math.floor((this.data.length - 1) / 2);
        
        var left = new module.exports.Scule.classes.BPlusTreeInteriorNode(this.left, null);
        left.setOrder(this.order);
        left.setMergeThreshold(this.threshold);
        left.data = this.data.splice(0, middle);

        var right = new module.exports.Scule.classes.BPlusTreeInteriorNode(null, this.right);
        right.setOrder(this.order);
        right.setMergeThreshold(this.threshold);
        right.data = this.data.splice(1, middle);
        
        return {
            left:left, 
            key:this.data[0], 
            right:right
        };
    };
    
    /**
     * Removes a key from the node data
     * @public
     * @param {Mixed} key the key to remove
     * @param {BPlusTreeInteriorNode} parent the parent for the node
     * @returns {Null|object}
     */    
    this.remove = function(key, parent) {
        var index = this.indexSearch(key);
        var eindex = index;
       
        if(this.data[index] > key) {
            eindex = index - 1;
        } else {
            eindex = index + 1;
        }
        
        var node  = this.data[eindex];        
        var result = node.remove(key, this);
        if(!result) {
            return null;
        }
        switch(result.operation) {
            case 0: // redistribution
                break;
                
            case 1: // merge
                if(this.data.length == 3) {
                    return result.node;
                }
                var collapseIndex = result.index;
                if(result.left) {
                    collapseIndex = result.index - 2;
                }
                this.data.splice(collapseIndex, 3, result.node);
                break;
                
            case 2: // bubbling a new key up the tree to replace the removed one
                var replaced = false;
                for(var i=1; i < this.data.length; i=i+2) {
                    if(this.data[i] == result.oldkey) {
                        this.data[i] = result.key;
                        replaced = true;
                    }
                }
                if(!replaced) {
                    if(!parent) {
                        return null;
                    }
                    return result;
                }
                break;
        }
        this.reassignKeys();
        return this.merge(parent, result.key, key);
    };

    /**
     * Re-assigns the keys within the data array for the node to ensure correct ordering
     * @public
     * @returns {Void}
     */
    this.reassignKeys = function() {
        for(var i=2; i < this.data.length; i=i+2) {
            if(this.data[i].isLeaf()) {
                this.data[i-1] = this.data[i].data[0].key;
            }
        }
    };

    /**
     * Forces the node to merge with one of the adjacent sibling nodes in the tree.
     * This function will destroy both nodes after the merge.
     * @public
     * @param {BPlusTreeInteriorNode} parent the node parent
     * @param {Mixed} key
     * @param {Mixed} oldkey
     * @returns {Mixed}
     */
    this.merge = function(parent, key, oldkey) {
        if(!parent) {
            return null;
        }
        var len = Math.floor((this.data.length - 1) / 2);
        if(len >= (this.threshold - 1)) {
            return {
                key: key,
                oldkey: oldkey,
                operation: 2
            };
        }        
        var index, pkey, sibling;
        var left = false;
        var i = 0;
        for(; i < parent.data.length; i = i+2) {
            if(parent.data[i] == this) {
                if(i == 0 || i < parent.data.length - 1) {
                    sibling = parent.data[i+2];
                    index = i+1;
                } else {
                    left = true;
                    sibling = parent.data[i-2];
                    index = i-1;
                }
                break;
            }
        }
        pkey = parent.data[index];
        
        var node = new module.exports.Scule.classes.BPlusTreeInteriorNode();
        node.setOrder(this.getOrder());
        node.setMergeThreshold(this.getMergeThreshold());
        
        if(left) {
            node.data = sibling.data.splice(0, sibling.data.length);
            node.data = node.data.concat(pkey);
            node.data = node.data.concat(this.data.splice(0, this.data.length));
        }
        else {
            node.data = this.data.splice(0, this.data.length);
            node.data = node.data.concat(pkey);
            node.data = node.data.concat(sibling.data.splice(0, sibling.data.length));
        }
 
        return {
            left: left,
            node: node,
            index: i,
            oldkey: pkey,
            operation: 1
        };

    };
    
    /**
     * Returns a string representation of the node
     * @public
     * @returns {String}
     */
    this.toString = function() {
        return JSON.stringify(this.toArray(), null, "\t");
    };
    
    /**
     * Returns an array representation of the node
     * @public
     * @returns {Array}
     */
    this.toArray = function() {  
        var o = {
            type:'interior'
        };
        var i=0;
        var j=1;
        while(j < this.data.length) {
            o[j + ':' + this.data[j]] = {
                left: this.data[i].toArray(),
                right: this.data[i+2].toArray()
            };
            i=i+2;
            j=j+2;
        }
        return o;
    };

};

/**
 * An implementation of a B+tree
 * @public
 * @constructor
 * @param {Number} order the order for the tree
 * @param {Number} threshold the merge threshold for the tree
 * @returns {Void}
 */
module.exports.Scule.classes.BPlusTree = function(order, threshold) {
  
    if(!order) {
        order = 100;  
    }
    
    if(!threshold) {
        threshold = Math.ceil(order/2);
    }
    
    /**
     * @private
     * @type {Number}
     */
    this.order = order;
    
    /**
     * @private
     * @type {Number}
     */    
    this.threshold = threshold;
  
    /**
     * @private
     * @type {BPlusTreeLeafNode|BPlusTreeNode}
     */  
    this.root = new module.exports.Scule.classes.BPlusTreeLeafNode();
    this.root.setOrder(this.order);
    this.root.setMergeThreshold(this.threshold);
  
    /**
     * Inserts a key, value pair into the b+tree
     * @public
     * @param {Mixed} key the key to insert
     * @param {Mixed} value the value to insert
     * @returns {Boolean}
     */
    this.insert = function(key, value) {
        var split = this.root.insert(key, value);
        if(split) {
            this.root = new module.exports.Scule.classes.BPlusTreeInteriorNode();
            this.root.setOrder(this.order);
            this.root.setMergeThreshold(this.threshold);
            this.root.data.push(split.left);
            this.root.data.push(split.key);
            this.root.data.push(split.right);
        }
        return true;
    };

    /**
     * Searches the tree for a key, returns the value if it exists - otherwise returns null
     * @public
     * @param {Mixed} key the key to search for
     * @returns {Null|mixed}
     */
    this.search = function(key) {
        return this.root.search(key);
    }

    /**
     * Returns a range of values from the tree, bounding values inclusive
     * @public
     * @param {Mixed} min the lower bound of the range
     * @param {Mixed} max the upper bound of the range
     * @param {Boolean} includeMin
     * @param {Boolean} includeMax
     * @returns {Array}
     */
    this.range = function(min, max, includeMin, includeMax) {
        return this.root.range(min, max, includeMin, includeMax);
    }

    /**
     * Removes a key (and all associated values) from the tree
     * @public
     * @param {Mixed} key the key to remove
     * @returns {Boolean}
     */
    this.remove = function(key) {
        var node = this.root.remove(key);
        if(node) {
            this.root = node;
        }
        return true;
    };

    /**
     * Resets the root node for the tree to a new instance of BPlusTreeLeadNode
     * @public
     * @returns {Void}
     */
    this.clear = function() {
        this.root = new module.exports.Scule.classes.BPlusTreeLeafNode();
        this.root.setOrder(this.order);
        this.root.setMergeThreshold(this.threshold);        
    };

    /**
     * Returns a string representation of the tree
     * @public
     * @returns {String}
     */
    this.toString = function() {
        return this.root.toString()
    };

    /**
     * Returns an Array representation of the tree
     * @public
     * @returns {Array}
     */
    this.toArray = function() {
        return this.root.toArray();  
    };

};

/**
 * Represents a node in a binary search tree
 * @public
 * @constructor
 * @class {BinarySearchTreeNode}
 * @param {String} key the key for the node
 * @param {Mixed} data the data for the node
 * @returns {Void}
 */
module.exports.Scule.classes.BinarySearchTreeNode = function(key, data) {

    /**
     * @private
     * @type {Null|BinarySearchTreeNode}
     */
    this.parent = null;
    
    /**
     * @private
     * @type {Null|BinarySearchTreeNode}
     */    
    this.left   = null;
    
    /**
     * @private
     * @type {Null|BinarySearchTreeNode}
     */    
    this.right  = null;
    
    /**
     * @private
     * @type {String}
     */
    this.key    = key;
    
    /**
     * @private
     * @type {Mixed}
     */
    this.data   = data;

    /**
     * Sets the parent for the node
     * @public
     * @param {BinarySearchTreeNode} parent the new parent for the node
     * @returns {Void}
     */
    this.setParent = function(parent) {
        this.parent = parent;
    };

    /**
     * Returns the parent for the node
     * @public
     * @returns {BinarySearchTreeNode|null}
     */
    this.getParent = function() {
        return this.parent;
    };

    /**
     * Sets the left child for the node
     * @public
     * @param {BinarySearchTreeNode} left the new left sibling for the node
     * @returns {Void}
     */
    this.setLeft = function(left) {
        if(!left) {
            return;
        }
        this.left = left;
        this.left.setParent(this);
    };

    /**
     * Returns the left child for the node
     * @public
     * @returns {BinarySearchTreeNode|null}
     */
    this.getLeft = function() {
        return this.left;
    };

    /**
     * Sets the right child for the node
     * @public
     * @param {BinarySearchTreeNode} right the new right sibling for the node
     * @returns {Void}
     */
    this.setRight = function(right) {
        if(!right) {
            return;
        }
        this.right = right;
        this.right.setParent(this);
    };

    /**
     * Returns the right child for the node
     * @public
     * @returns {Void}
     */ 
    this.getRight = function() {
        return this.right;
    };

    /**
     * Returns the key for the node
     * @public
     * @returns {Mixed}
     */
    this.getKey = function() {
        return this.key;
    };

    /**
     * Sets the data for the node
     * @public
     * @param {Mixed} data the new data for the node
     * @returns {Void}
     */
    this.setData = function(data) {
        this.data = data;
    };

    /**
     * Returns the data for the node
     * @public
     * @returns {Mixed}
     */
    this.getData = function() {
        return this.data;
    };

    /**
     * Sets the data for the node to null
     * @public
     * @returns {Void}
     */
    this.clear = function() {
        this.data = null;
    };

    /**
     * Removes the provided child from the node - shifting node to rebalance the tree
     * @public
     * @param {BinarySearchTreeNode} child the child to remove from the node
     * @returns {Boolean}
     */
    this.remove = function(child) {
        if(!child) {
            return false;
        }
        if(child == this.right) {
            this.setRight(child.getRight());
            this.getRight().setLeft(child.getLeft());
            child.parent = null;
            child.left   = null;
            child.right  = null;
            return true;
        } else if(child == this.left) {
            this.setLeft(child.getRight());
            this.getLeft().setLeft(child.getLeft());
            child.parent = null;
            child.left   = null;
            child.right  = null;            
            return true;
        }
        return false;
    };

};

/**
 * Represents a binary search tree
 * @public
 * @constructor
 * @class {BinarySearchTree}
 * @returns {Void}
 */
module.exports.Scule.classes.BinarySearchTree = function() {

    /**
     * @private
     * @type {BinarySearchTreeNode}
     */
    this.root = null;

    /**
     * @private
     * @type {Number}
     */
    this.length = 0;

    /**
     * Inserts a key, value pair into the tree
     * @public
     * @param {Mixed} key the key to insert
     * @param {Mixed} data the data to insert
     * @returns {Boolean}
     */
    this.insert = function(key, data) {
        var self = this;
        var node = new module.exports.Scule.classes.BinarySearchTreeNode(key, data);
        if(this.root == null) {
            this.length++;
            this.root = node;
            return true;
        }
        var insrt = function(node, parent) {
            if(node.getKey() == parent.getKey()) {
                parent.setData(node.getData());
                return false;
            }
            if(node.getKey() <= parent.getKey()) {
                if(!parent.getLeft()) {
                    self.length++;
                    parent.setLeft(node);
                } else {
                    insrt(node, parent.getLeft());
                }
            } else {
                if(!parent.getRight()) {
                    self.length++;
                    parent.setRight(node);
                } else {
                    insrt(node, parent.getRight());
                }
            }
            return true;
        }
        return insrt(node, this.root);
    };

    /**
     * Recursively searches the tree for the provided key, returning the corresponding node if found
     * @public
     * @param {Mixed} key the key to search for
     * @returns {BinarySearchTreeNode|null}
     */
    this.search = function(key) {
        var srch = function(key, node) {
            if(!node) {
                return null;
            }
            if(node.getKey() == key) {
                return node;
            } else if(node.getKey() > key) {
                return srch(key, node.getLeft());
            } else {
                return srch(key, node.getRight());
            }           
        }
        return srch(key, this.root);
    };

    /**
     * Removes the first instance of a key from the tree
     * @public
     * @param {Mixed} key the key to remove
     * @returns {Boolean}
     */
    this.remove = function(key) {
        var node = this.search(key);
        if(!node) {
            return false;
        }
        if(!node.getParent()) {
            if(node.getRight()) {
                this.root = node.getRight();
                this.root.setLeft(node.getLeft());
            } else if(node.getLeft()) {
                this.root = node.getRight();
                this.root.setLeft(node.getLeft());
            } else {
                this.root = null;
            }
            this.length--;
            return true;
        }
        var r = node.getParent().remove(node);
        if(r) {
            this.length--;
        }
        return r;
    };

    /**
     * Balances the tree in place
     * @public
     * @returns {Void}
     */
    this.balance = function() {
        var self    = this;
        var list    = this.toArray();
        var rebuild = function(list) {
            var left   = list;
            var right  = list.splice(Math.ceil(list.length/2), list.length);
            var middle = left.pop();
            self.insert(middle[0], middle[1]);
            if(left.length > 0) {
                rebuild(left);
            }
            if(right.length > 0) {
                rebuild(right);
            }
        };
        this.length = 0;
        this.root   = null;
        rebuild(list);
    };

    /**
     * @public
     * @returns {Number}
     */
    this.getLength = function() {
        return this.length;
    };

    /**
     * Returns the nodes of the tree as an array of arrays containing key at index 0 and data at index 1.
     * Due to the nature of binary trees the returned list is intrinsically sorted in ascending order by key.
     * @public
     * @returns {Array}
     */
    this.toArray = function() {
        var flatten = function(node) {
            if(!node) {
                return [];
            }
            return flatten(node.getLeft()).concat([[node.getKey(), node.getData()]]).concat(flatten(node.getRight()));
        };
        return flatten(this.root);
    };

    /**
     * Returns the root node of the tree
     * @public
     * @returns {BinarySearchTreeNode|null}
     */
    this.getRoot = function() {
        return this.root;
    };

};

/**
 * A simple timer for instrumenting intervals during program execution
 * @public
 * @constructor
 * @class {Timer}
 * @returns {Void}
 */
module.exports.Scule.classes.Timer = function() {

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
    this.intervals = new module.exports.Scule.classes.LIFOStack();

    /**
     * Resets all intervals in the timer
     * @public
     * @returns {Void}
     */
    this.resetTimer = function() {
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
    this.startInterval = function(tag) {
        this.intervalCounter++;
        if(tag == undefined) {
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
    this.stopInterval = function() {
        if(this.intervals.isEmpty()) {
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
    this.stopAllIntervals = function() {
        while(!this.intervals.isEmpty()) {
            this.intervals.pop().stop();
        }
    };

    /**
     * Logs all timers to the console
     * @public
     * @returns {Void}
     */
    this.logToConsole = function() {
        this.intervalArray.forEach(function(interval) {
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
module.exports.Scule.classes.TimerInterval = function(tag) {
    
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
    this.stopped = function() {
        return this.endTimestamp !== null;
    };
    
    /**
     * Stops the interval
     * @public
     * @returns {Void}
     */
    this.stop = function() {
        this.endTimestamp = (new Date()).getTime();
    };
   
    /**
     * Returns the difference between the start and end timestamps for the interval as milliseconds
     * @public
     * @returns {Number}
     */
    this.getDifference = function() {
        if(this.endTimestamp == null) {
            return false;
        }
        return this.endTimestamp - this.startTimestamp;
    };
   
    /**
     * Logs the interval to the console
     * @public
     * @returns {Void}
     */
    this.logToConsole = function() {
        var diff = this.getDifference();
        if(diff === false) {
            Ti.API.info('interval ' + this.tag + ' is still in progress');
        }
        Ti.API.info('interval ' + this.tag + ' lasted ' + diff + 'ms');
    };   
   
};

/**
 * Represents a "bucketed" hash table, entries are added to the bucket corresponding to the provided key.
 * Buckets are keyed by ObjectId.
 * @public
 * @extends {HashTable}
 * @class {HashBucketTable}
 * @constructor
 */
module.exports.Scule.classes.HashBucketTable = function() {
  
    module.exports.Scule.classes.HashTable.call(this);

    /**
     * Adds a new entry corresponding to the bucket corresponding to the provided key
     * @public
     * @param {Mixed} key the key to insert
     * @param {Mixed} value the value corresponding to the provided key
     * @returns {Boolean}
     */
    this.insert = function(key, value) {
        var table;
        if(!this.contains(key)) {
            table = new module.exports.Scule.classes.HashTable();
            table.put(module.exports.Scule.functions.getObjectId(value), value);
            this.put(key, table);
        } else {
            table = this.get(key);
            table.put(module.exports.Scule.functions.getObjectId(value), value);
        }
        return true;
    };

};

/**
 * A B+plus tree leaf node that hashes entries by their ObjectId value
 * @public
 * @constructor
 * @param {BPlusTreeHashingLeafNode|Null} left the left sibling of the node
 * @param {BPlusTreeHashingLeafNode|Null} right the right sibling of the node
 * @returns {Void}
 * @extends {BPlusTreeLeafNode}
 */
module.exports.Scule.classes.BPlusTreeHashingLeafNode = function(left, right) {
  
    module.exports.Scule.classes.BPlusTreeLeafNode.call(this, left, right);

    /**
     * Inserts a key/value pair into the data for the node
     * @public
     * @param {Mixed} key the key to insert
     * @param {Mixed} value the value corresponding to the provided key
     * @returns {null|Object}
     */
    this.insert = function(key, value) {
        var table;
        var index = this.indexSearch(key);
        if(index == this.data.length) {
            table = new module.exports.Scule.classes.HashTable();
            table.put(module.exports.Scule.functions.getObjectId(value, true), value);
            this.data.push({
                key:key, 
                value:table
            });
        } else {
            var element = this.data[index];
            if(element.key == key) {
                element.value.put(module.exports.Scule.functions.getObjectId(value, true), value);
            } else if(element.key < key) {
                table = new module.exports.Scule.classes.HashTable();
                table.put(module.exports.Scule.functions.getObjectId(value, true), value);                
                this.data.splice(index + 1, 0, {
                    key:key, 
                    value:table
                });
            } else {
                table = new module.exports.Scule.classes.HashTable();
                table.put(module.exports.Scule.functions.getObjectId(value, true), value);
                this.data.splice(index, 0, {
                    key:key, 
                    value:table
                });               
            }
        }
        if(table) {
            this.lookup.put(key, {
                key:key, 
                value:table
            });           
        }
        return this.split();
    };

    /**
     * If the node data length has exceeded the block size this function will divide it into two new nodes
     * connected by a junction and identified by a key
     * @public
     * @returns {Null|Object}
     */
    this.split = function() {
        if(this.data.length <= this.order) {
            return null;
        }
        var middle = Math.floor(this.data.length / 2);

        var left = new module.exports.Scule.classes.BPlusTreeHashingLeafNode(this.getLeft());
        left.setOrder(this.getOrder());
        left.setMergeThreshold(this.getMergeThreshold());
        left.data = this.data.splice(0, middle);
        
        var right = new module.exports.Scule.classes.BPlusTreeHashingLeafNode(null, this.getRight());
        right.setOrder(this.getOrder());
        right.setMergeThreshold(this.getMergeThreshold());
        right.data = this.data.splice(0, middle + 1);

        left.setRight(right);
        if(this.getLeft()) {
            this.getLeft().setRight(left);
        }
        
        right.setLeft(left);
        if(this.getRight()) {
            this.getRight().setLeft(right);
        }
        
        return {
            left:left, 
            key:right.data[0].key, 
            right:right
        };
    };

    /**
     * Returns a range of values from the node (and siblints) between min and max
     * @public
     * @param {Mixed} min the minimum value for the range
     * @param {Mixed} max the maxmium value for the range
     * @param {Boolean} includeMin a boolean indicating whether or not to include the minimum bound in the range result
     * @param {Boolean} includeMax a boolean indicating whether or not to include the maximum bound in the range result
     * @returns {Array}
     */
    this.range = function(min, max, includeMin, includeMax) {
        if(includeMax === undefined) {
            includeMax = false;
        }
        if(includeMin === undefined) {
            includeMin = false;
        }
        if(min === undefined) {
            min = null;
        }
        if(max === undefined) {
            max = null;
        }
        var curr  = this;
        var rng = null;
        if(includeMin && includeMax) {
            rng = function(min, max, key, range, value) {
                if(min === null) {
                    if(key <= max) {
                        range = range.concat(value);
                    }
                } else if(max === null) {
                    if(key >= min) {
                        range = range.concat(value);
                    }
                } else {
                    if(key >= min && key <= max) {
                        range = range.concat(value);
                    }
                }
                return range;
            };
        } else if(includeMin) {
            rng = function(min, max, key, range, value) {
                if(min === null) {
                    if(key < max) {
                        range = range.concat(value);
                    }
                } else if(max === null) {
                    if(key >= min) {
                        range = range.concat(value);
                    }
                } else {
                    if(key >= min && key < max) {
                        range = range.concat(value);
                    }
                }
                return range;
            };
        } else { // includeMax
            rng = function(min, max, key, range, value) {
                if(min === null) {
                    if(key <= max) {
                        range = range.concat(value);
                    }
                } else if(max === null) {
                    if(key > min) {
                        range = range.concat(value);
                    }
                } else {
                    if(key > min && key <= max) {
                        range = range.concat(value);
                    }
                }
                return range;
            };            
        }

        var range = [];
            outer:
            while(curr) {
                var data  = curr.data;
                var left  = curr.indexSearch(min);
                var right = (max === null || max === undefined) ? (data.length - 1) : curr.indexSearch(max);
                if(right >= data.length) {
                    right = data.length - 1;
                }
                if(left <= data.length) {
                    for(var i=left; i <= right; i++) {
                        if(max !== null && data[i].key > max) {
                            break outer;
                        }
                        range = rng(min, max, data[i].key, range, data[i].value.getValues());
                    }
                }
                curr = curr.getRight();
            }
        return range;
    };

    /**
     * Returns an array based representation of the node object
     * @public
     * @returns {Array}
     */
    this.toArray = function() {
        var o = {
            type:'hashing-leaf'
        };
        for(var i=0; i < this.data.length; i++) {
            o[i + ':' + this.data[i].key] = this.data[i].value;
        }
        return o;
    };

};

/**
 * A B+tree with leaf nodes that hash added entries by their ObjectId value
 * @see http://en.wikipedia.org/wiki/B+Tree
 * @public
 * @constructor
 * @param {Number} order the branching factor for the tree
 * @param {Number} threshold the merge threshold for the tree
 * @returns {Void}
 * @extends {BPlusTree}
 */
module.exports.Scule.classes.BPlusHashingTree = function(order, threshold) {
    
    module.exports.Scule.classes.BPlusTree.call(this, order, threshold);
    
    /**
     * @type {BPlusTreeHashingLeafNode}
     * @private
     */
    this.root = new module.exports.Scule.classes.BPlusTreeHashingLeafNode();
    this.root.setOrder(this.order);
    this.root.setMergeThreshold(this.threshold);    
    
    /**
     * Resets the root node for the tree to a new instance of {BPlusTreeHashingLeafNode}
     * @public
     * @returns {Void}
     */
    this.clear = function() {
        this.root = new module.exports.Scule.classes.BPlusTreeHashingLeafNode();
        this.root.setOrder(this.order);
        this.root.setMergeThreshold(this.threshold);        
    };    
    
};

/**
 * Abstract index implementation - all other index types should descend from this class
 * @see http://en.wikipedia.org/wiki/Database_index
 * @public
 * @abstract
 * @constructor
 * @class {Index}
 * @returns {Void}
 */
module.exports.Scule.classes.Index = function() {
    
    /**
     * @type {Object}
     * @private
     */
    this.attributes = {};
    
    /**
     * @type {HashTable}
     * @private
     */
    this.astrings   = new module.exports.Scule.classes.HashTable();
    
    /**
     * @type {HashTable}
     * @private
     */    
    this.leaves     = new module.exports.Scule.classes.HashTable();
    
    /**
     * @type {Mixed}
     * @private
     */
    this.structure  = null;
    
    /**
     * @type {Mixed}
     * @private
     */    
    this.type       = null;
    
    /**
     * Sets the attributes to be indexed on Objects within this index. Attributes should be provided
     * as an object with keys mapping to the Object keys to index.
     * @public
     * @param {Object} attributes the attributes to set on the index
     * @returns {Void}
     */
    this.setAttribtues = function(attributes) {
        this.attributes = attributes;
        this.attributes = module.exports.Scule.functions.sortObjectKeys(this.attributes);
    };
    
    /**
     * Parses an index attribute descriptor string or array of descriptor strings to build the index attributes
     * @public
     * @param {Mixed} attributes the attribute string(s) to parse
     * @returns {Void}
     */
    this.parseAttributes = function(attributes) {
        this.populateAttributeStrings(attributes);
        this.attributes = module.exports.Scule.functions.parseAttributes(attributes);
        this.attributes = module.exports.Scule.functions.sortObjectKeys(this.attributes);
    };
    
    /**
     * Populates the attribute strings
     * @public
     * @param {Mixed} attributes populates the attribute strings for the given attributes
     * @returns {Void}
     */
    this.populateAttributeStrings = function(attributes) {
        var self = this;
        if(!module.exports.Scule.functions.isArray(attributes)) {
            attributes = attributes.split(',');
        }
        attributes.forEach(function(attr) {
            self.astrings.put(attr, true);
        });        
    };
    
    /**
     * Resets the attributes for the index, this also clears the index
     * @public
     * @returns {Void}
     */
    this.resetAttributes = function() {
        this.attributes = {};
        this.clear();
    };
    
    /**
     * Returns the type for the index - type values are defined in the constants for Scule
     * @public
     * @returns {Number}
     */
    this.getType = function() {
        return this.type;
    };
    
    /**
     * Returns the name of the index
     * @public
     * @returns {String}
     */
    this.getName = function() {
        return this.astrings.getKeys().sort().join(',');
    };
    
    /**
     * Determines whether or not the provided attributes applies to this index
     * @public
     * @param {Array} attributes the attributes to validate
     * @param {Boolean} range whether or not the attributes are part of a range query
     * @returns {boolean|Object}
     */
    this.applies = function(attributes, range) {
        if(range && this.getType() == module.exports.Scule.constants.INDEX_TYPE_HASH) {
            return false;
        }
        if(attributes.length < this.astrings.getLength()) {
            return false;
        }
        var matches = {
            $partial:false, 
            $none:true,
            $range:range,
            $attr:{},
            $index:this
        };
        var self = this;
        attributes.forEach(function(attr) {
            if(self.astrings.contains(attr)) {
                matches.$attr[attr] = true;
                matches.$none = false;
            } else {
                if(!matches.$partial) {
                    matches.$partial = true;
                }
                matches.$attr[attr] = false;
            }
        });
        if(matches.$none) {
            return false;
        }
        return matches;
    };
    
    /**
     * Generates a key for the index using the provided document and index attributes
     * @public
     * @param {Object} document the document to generate an index key for
     * @returns {String}
     */
    this.generateIndexKey = function(document) {
        var composite = module.exports.Scule.functions.searchObject(this.attributes, document);
        if(composite.length == 1) {
            return composite[0];
        }
        return composite.join(',');
    };
    
    /**
     * Add a document to the index
     * @public
     * @param {Object} document the document to index
     * @returns {Boolean}
     */
    this.index = function(document) {
        if(!this.structure) {
            return false;
        }
        var id  = module.exports.Scule.functions.getObjectId(document, true);
        var key = this.generateIndexKey(document);
        this.structure.insert(key, document);
        var table = this.structure.search(key);
        this.leaves.put(id, {
            table: table,
            key:   key
        });
        return true;
    };
    
    /**
     * Removes a document from the index
     * @public
     * @param {Object} document the document to remove
     * @returns {Boolean}
     */
    this.remove = function(document) {
        if(!this.structure) {
            return false;
        }
        var id = module.exports.Scule.functions.getObjectId(document, true);
        if(!this.leaves.contains(id)) {
            return false;
        }
        var node = this.leaves.get(id);
        node.table.remove(id);
        if(node.table.getLength() == 0) {
            this.structure.remove(node.key);
        }
        return true;
    };
    
    /**
     * Prunes an entire keyspace from the index
     * @public
     * @param {Mixed} key the key to remove
     * @returns {Boolean}
     */
    this.removeKey = function(key) {
        if(!this.structure) {
            return false;
        }  
        var table = this.structure.search(key);
        if(table && table.length > 0) {
            this.structure.remove(key);
            for(var k in table.table) {
                this.leaves.remove(module.exports.Scule.functions.getObjectId(table.get(k), true));
            }
        }
        return true;
    };
    
    /**
     * Searches the index using the provided key
     * @public
     * @param {Object} key the key to search for within the index
     * @returns {Array}
     */
    this.search = function(key) {
        if(this.structure) {
            var table = this.structure.search(key);
            if(table) {
                return table.getValues();
            }
        }
        return [];
    };
    
    /**
     * Searches the index for a range of values bounded by min and max values
     * @public
     * @param {Mixed} min the minimum boundary of the range
     * @param {Mixed} max the maximum boundary of the range
     * @param {Boolean} includeMin a boolean flag indicating whether or not to include the minimum bound in the range
     * @param {Boolean} includeMax a boolean flag indicating whether or not to include the maximum bound in the range
     * @returns {Array}
     */
    this.range = function(min, max, includeMin, includeMax) {
        if(this.structure) {
            return this.structure.range(min, max, includeMin, includeMax);
        }
        return false;
    };
    
    /**
     * Removes all values from the index
     * @public
     * @returns {Void}
     */
    this.clear = function() {
        if(this.structure) {
            this.structure.clear();
            return true;
        }
        return false;
    };
    
    /**
     * Returns the length of the index as an integer value
     * @public
     * @returns {Number}
     */
    this.getLength = function() {
        return this.leaves.length;
    };
    
};

/**
 * Represents a B+tree index extending the Index class interface contract
 * @see http://en.wikipedia.org/wiki/B+Tree
 * @public
 * @constructor
 * @class {BPlusTreeIndex}
 * @param {Number} order the branching factor for the encapsulated b+tree datastructure
 * @extends {Index}
 * @returns {Void}
 */
module.exports.Scule.classes.BPlusTreeIndex = function(order) {
    
    module.exports.Scule.classes.Index.call(this);
    
    if(!order) {
        order = 100;
    }
    
    /**
     * @private
     * @type {BPlusHashingTree}
     */
    this.structure = new module.exports.Scule.classes.BPlusHashingTree(order);
    
    /**
     * @private
     * @type {Number}
     */
    this.type      = module.exports.Scule.constants.INDEX_TYPE_BTREE;
    
};

/**
 * Represents a HashTable index extending the Index class interface contract.
 * This index type does not support the range operation.
 * @see http://en.wikipedia.org/wiki/Hashtable
 * @public
 * @constructor
 * @extends {Index}
 * @returns {Void}
 */
module.exports.Scule.classes.HashTableIndex = function() {
    
    module.exports.Scule.classes.Index.call(this);
    
    /**
     * @private
     * @type {HashBucketTable}
     */
    this.structure = new module.exports.Scule.classes.HashBucketTable();
    
    /**
     * @private
     * @type {Number}
     */
    this.type      = module.exports.Scule.constants.INDEX_TYPE_HASH;
    
    /**
     * This is actually a no-op, hash indices cannot support range queries. Calling
     * this function throws an {Exception}
     * @public
     * @param {Mixed} min the minimum boundary of the range
     * @param {Mixed} max the maximum boundary of the range
     * @param {Boolean} includeMin a boolean flag indicating whether or not to include the minimum bound in the range
     * @param {Boolean} includeMax a boolean flag indicating whether or not to include the maximum bound in the range
     * @throws {Exception}
     */
    this.range = function(min, max, includeMin, includeMax) {
        throw 'HashTable type indices to not support range query operations';
    };    
    
};

/**
 * A simple cryptography provider with convenience functions to allow the signing of data
 * @public
 * @constructor
 * @class {SimpleCryptographyProvider}
 * @returns {Void}
 */
module.exports.Scule.classes.SimpleCryptographyProvider = function() {
  
    /**
     * Returns an SHA-1 signature for the provided data using a secret and salt
     * @public
     * @param {String} data the data to sign
     * @param {String} secret the secret to use when signing
     * @param {String} salt the salt to use when signing
     * @returns {String}
     */
    this.signString = function(data, secret, salt) {
        return sha1.hash(sha1.hash(data + secret) + salt);
    };
  
    /**
     * Returns an SHA-1 signature for the provided object using a secret and salt
     * @public
     * @param {Object} object the object to sign
     * @param {String} secret the secret to use when signing
     * @param {String} salt the salt to use when signing
     * @returns {String}
     */
    this.signObject = function(object, secret, salt) {
        object._sig = salt;
        return this.signString(JSON.stringify(object), secret, salt);
    };
  
    /**
     * Returns an SHA-1 signature on the JSON serialized version of an object using a secret and salt
     * @public
     * @param {Object} object the object to sign the JSON string for
     * @param {String} secret the secret to use when signing
     * @param {String} salt the salt to use when signing
     * @returns {String}
     */
    this.signJSONString = function(object, secret, salt) {
        return this.signString(JSON.stringify(object), secret, salt);
    };
  
    /**
     * Verifies the signature on an object
     * @public
     * @param {Object} object the object to verify the signature for
     * @param {String} secret the secret to use when verifying the signature
     * @param {String} salt the salt to use when verifying the signature
     * @returns {Boolean}
     */
    this.verifyObjectSignature = function(object, secret, salt) {
        var oldSig = object._sig;
        var newSig = this.signObject(object, secret, salt);
        return oldSig == newSig;      
    };

};

/**
 * An abstract storage engine interface contract - all storage engines should descend from this class
 * @public
 * @constructor
 * @param {Object} configuration the configuration parameters for the storage engine instance
 * @class {StorageEngine}
 * @returns {Void}
 */
module.exports.Scule.classes.StorageEngine = function(configuration) {
    
    /**
     * @private
     * @type {Object}
     */
    this.configuration = configuration;
    
    /**
     * @private
     * @type {SimpleCryptographyProvider}
     */
    this.crypto        = null;
    
    /**
     * Sets the configuration for the storage engine
     * @public
     * @param {Object} configuration the configuration parameters to set
     * @returns {Void}
     */
    this.setConfiguration = function(configuration) {
        this.configuration = configuration;
    };
    
    /**
     * Returns the configuration for the storage engine
     * @public
     * @returns {Object}
     */
    this.getConfiguration = function() {
        return this.configuration;
    };
    
    /**
     * Sets the cryptography provider for the storage engine
     * @public
     * @param {SimpleCryptographyProvider} provider the cryptography provider instance to set
     * @returns {Void}
     */
    this.setCryptographyProvider = function(provider) {
        this.crypto = provider;
    };
    
    /**
     * Returns the cryptography provider for the storage engine
     * @public
     * @returns {SimpleCryptographyProvider}
     */
    this.getCryptographyProvider = function() {
        return this.crypto;
    };
    
    /**
     * Writes data to storage
     * @public
     * @param {String} name the name of the file to write data to
     * @param {Object} object the data to write
     * @param {Function} callback the callback to execute once writing to storage is complete
     * @returns {Void}
     */
    this.write = function(name, object, callback) {
        throw 'function not implemented in abstract class';
    };
    
    /**
     * Reads data from storage
     * @public
     * @param {String} name the name of the file to read data from
     * @param {Function} callback the callback to execute one reading from storage is complete
     * @returns {Object}
     */
    this.read  = function(name, callback) {
        throw 'function not implemented in abstract class';
    };
    
};

/**
 * A dummy storage engine - does nothing but execute callbacks
 * @public
 * @constructor
 * @param {Object} configuration
 * @extends {StorageEngine}
 * @returns {Void}
 */
module.exports.Scule.classes.DummyStorageEngine = function(configuration) {
  
    module.exports.Scule.classes.StorageEngine.call(this, configuration);
  
    /**
     * Writes data to storage
     * @public
     * @param {String} name the name of the file to write data to
     * @param {Object} object the data to write
     * @param {Function} callback the callback to execute once writing to storage is complete
     * @returns {Void}
     */  
    this.write = function(name, object, callback) {
        if(callback) {
            callback(object);
        }
    };
 
    /**
     * Reads data from storage
     * @public
     * @param {String} name the name of the file to read data from
     * @param {Function} callback the callback to execute one reading from storage is complete
     * @returns {Object}
     */ 
    this.read = function(name, callback) {
        if(callback) {
            callback();
        }
    };

};

/**
 * A memory based storage engine - used for testing
 * @public
 * @constructor
 * @param {Object} configuration the configuration parameters for the storage engine instance
 * @extends {StorageEngine}
 * @returns {Void}
 */
module.exports.Scule.classes.MemoryStorageEngine = function(configuration) {
  
    module.exports.Scule.classes.StorageEngine.call(this, configuration);
  
    this.setCryptographyProvider(new module.exports.Scule.classes.SimpleCryptographyProvider());
    this.storage = {};
  
    /**
     * Writes data to storage
     * @public
     * @param {String} name the name of the file to write data to 
     * @param {Object} object the data to write
     * @param {Function} callback the callback to execute once writing to storage is complete
     * @returns {Void}
     */  
    this.write = function(name, object, callback) {
        if(!object._salt) {
            object._salt = sha1.hash((new Date()).getTime() + '');
        }
        object._sig = this.crypto.signObject(object, this.configuration.secret, object._salt);
        this.storage['__scule_collection__' + name] = JSON.stringify(object);
        if(callback) {
            callback(object);
        }
    };
  
    /**
     * Reads data from storage
     * @public
     * @param {String} name the name of the file to read data from
     * @param {Function} callback the callback to execute one reading from storage is complete
     * @returns {Object}
     */  
    this.read  = function(name, callback) {
        if(!('__scule_collection__' + name in this.storage)) {
            var object = {
                _sig: null,
                _salt: sha1.hash((new Date()).getTime() + ''),
                _version: 2.0,
                _name: name,
                _objects: {}
            };
            object._sig = this.crypto.signObject(object, this.configuration.secret, object._salt);
            this.storage['__scule_collection__' + name] = JSON.stringify(object);
        }
        var data = this.storage['__scule_collection__' + name];
        var o = JSON.parse(data);
        if(this.crypto.verifyObjectSignature(o, this.configuration.secret, o._salt) == false) {
            throw JSON.stringify({
                event:'SculeDataTampered', 
                filename:this.configuration.collection
            });
            return false;
        }
        delete o._sig;
        if(callback) {
            callback(o); 
        }
    };

};

/**
 * A disk based storage engine for Titanium Appceletator apps
 * @public
 * @constructor
 * @class {TitaniumDiskStorageEngine}
 * @param {Object} configuration the configuration parameters for the storage engine instance
 * @extends {StorageEngine}
 * @returns {Void}
 */
module.exports.Scule.classes.TitaniumDiskStorageEngine = function(configuration) {
    
    module.exports.Scule.classes.StorageEngine.call(this, configuration);
    
    if(!this.configuration.path) {
        this.configuration.path = Titanium.Filesystem.applicationDataDirectory;
    }
    
    this.setConfiguration = function(configuration) {
        this.configuration = configuration;
        if(!this.configuration.path) {
            this.configuration.path = Titanium.Filesystem.applicationDataDirectory;
        }        
    };    
    
    this.setCryptographyProvider(new module.exports.Scule.classes.SimpleCryptographyProvider());

    /**
     * Writes data to storage
     * @public
     * @param {String} name the name of the file to write data to
     * @param {Object} object the data to write
     * @param {Function} callback the callback to execute once writing to storage is complete
     * @returns {Void}
     */ 
    this.write = function(name, object, callback) {
        if(!object._salt) {
            object._salt = sha1.hash((new Date()).getTime() + '');
        }
        object._sig = this.crypto.signObject(object, this.configuration.secret, object._salt);
        var file = Titanium.Filesystem.getFile(this.configuration.path, name + '.json');
        file.write(JSON.stringify(object));
        if(callback) {
            callback(object);
        }
        return true;
    };

    /**
     * Reads data from storage
     * @public
     * @param {String} name the name of the file to read data from
     * @param {Function} callback the callback to execute one reading from storage is complete
     * @returns {Object}
     */ 
    this.read = function(name, callback) {
        var file = Titanium.Filesystem.getFile(this.configuration.path, name + '.json');
        if(file.exists()) {
            var o = JSON.parse(file.read());
            if(this.crypto.verifyObjectSignature(o, this.configuration.secret, o._salt) == false) {
                Ti.App.fireEvent("SculeDataTampered", {
                    filename: name
                });
                return false;
            }
            delete o._sig;
            if(callback) {
                callback(o);
            }
            return o;
        }
        return false;
    };
    
};

/**
 * Represents a BSON Object Identifier
 * @public
 * @constructor
 * @class {ObjectId}
 * @param {String} id the identifier to initialize the object with
 * @returns {Void}
 */
module.exports.Scule.classes.ObjectId = function(id) {
    
    if(id === undefined) {
        var ts = Math.floor((new Date()).getTime()/1000).toString(16);
        var hs = md5.hash(module.exports.Scule.functions.getMACAddress()).substring(0, 6);
        var pid = module.exports.Scule.functions.randomFromTo(1000, 9999).toString(16);
        while(pid.length < 4) {
            pid = '0' + pid;
        }
        var inc = module.exports.Scule.functions.randomFromTo(100000, 999999).toString(16);
        while(inc.length < 6) {
            inc = '0' + inc;
        }
        id = ts + hs + pid + inc;        
    }
    
    /**
     * @private
     * @type {String}
     */
    this.id = id;
    
    /**
     * @private
     * @type {String}
     */
    this.$type = 'id';
    
    /**
     * Returns a String representation of the ObjectId
     * @public
     * @returns {String}
     */
    this.toString = function() {
        return this.id.toString();
    };
    
};

/**
 * Represents a MongoDate object with microtime precision
 * @public
 * @constructor
 * @class {ObjectDate}
 * @param {Number} sec the number of seconds
 * @param {Number} usec the number of microseconds
 * @returns {Void}
 */
module.exports.Scule.classes.ObjectDate = function(sec, usec) {
    
    if(sec === undefined && usec == undefined) {
        var ts = (new Date()).getTime().toString();
        sec  = parseInt(ts.substring(0, 10));
        usec = parseInt(ts.substring(10));
    }

    /**
     * @private
     * @type {Number}
     */
    this.ts    = parseInt(sec + usec);
    
    /**
     * @private
     * @type {Number}
     */    
    this.sec   = sec;
    
    /**
     * @private
     * @type {Number}
     */    
    this.usec  = usec;
    
    /**
     * @private
     * @type {String}
     */    
    this.$type = 'date';
    
    /**
     * Returns the unix timestamp for the object without microsecond precision
     * @returns {Number}
     */
    this.getTimestamp = function() {
        return this.ts;
    };
    
    /**
     * Returns the seconds value of the timestamp
     * @returns {Number}
     */
    this.getSeconds = function() {
        return this.sec;
    };
    
    /**
     * Returns the microseconds value of the timestamp
     * @returns {Number}
     */
    this.getMicroSeconds = function() {
        return this.usec;
    };
    
};

/**
 * Represents a DBRef object
 * @public
 * @constructor
 * @class {DBRef}
 * @param {String} ref the collection name the referenced object resides in
 * @param {String} id the identifier for the referenced object
 * @returns {Void}
 * @throws {Exception}
 */
module.exports.Scule.classes.DBRef = function(ref, id) {

    if(ref === undefined || id === undefined) {
        throw "illegal object reference";
    }

    /**
     * @private
     * @type {String}
     */
    this.ref = ref;
    
    /**
     * @private
     * @type {ObjectId}
     */    
    this.id  = new module.exports.Scule.classes.ObjectId(id);
    
    /**
     * @private
     * @type {String}
     */    
    this.$type = 'dbref';

    /**
     * Returns the collection name for the reference
     * @public
     * @returns {String}
     */
    this.getRef = function() {
        return this.ref;
    }
    
    /**
     * Returns the ObjectId instance for the reference
     * @public
     * @returns {Object}Id
     */
    this.getId = function() {
        return this.id;
    }

    /**
     * Resolves the reference, this function is an alias of DBRef::resolveReference
     * @public
     * @returns {Null|Object}
     */
    this.resolve = function() {
        return this.resolveReference();
    }

    /**
     * Resolves the reference
     * @public
     * @returns {Null|Object}
     */
    this.resolveReference = function() {
        var collection = module.exports.factoryCollection(this.ref);
        return collection.findOne(this.id);
    }

};

module.exports.Scule.classes.QueryNormalizer = function() {

    this.normalize = function(query) {
        var normalize = function(o) {
            for (var key in o) {
                if (module.exports.Scule.functions.isScalar(o[key]) || o[key] instanceof RegExp) {
                    var v = o[key];
                    delete o[key];
                    o[key] = {
                        $eq:v
                    };
                } else {
                    if (key == '$or' || key == '$elemMatch') {
                        normalize(o[key]);
                    } else {
                        o[key] = module.exports.Scule.functions.sortObjectKeys(o[key]);
                    }
                }
            }
            return module.exports.Scule.functions.sortObjectKeys(o);
        };
        return normalize(query);
    };

};

module.exports.Scule.classes.IndexSelector = function() {

    this.resolveIndices = function (collection, query) {
        var containers = this.selectIndices(collection, query);
        if (!containers || !containers.selected) {
            return collection.documents.table;
        }
        return this.queryIndices(containers, query);
    };

    /**
     * @private
     */
    this.buildHashIndexKey = function(keys, query) {
        var ikey = [];
        for (var key in keys) {
            if (!query.hasOwnProperty(key)) {
                continue;
            }
            ikey.push(query[key].$eq);
        }
        if (ikey.length == 1) {
            return ikey[0];
        }
        return ikey.join(',');
    };

    /**
     * @private
     */
    this.buildRangeIndexKey = function(keys, query) {
        var ikey   = [null, null, false, false];  
        var minkey = [];
        var maxkey = [];
        for (var key in keys) {
            if (!query.hasOwnProperty(key)) {
                continue;
            }
            for (var skey in query[key]) {
                switch (skey) {
                    case '$gt':
                        minkey.push(query[key][skey]);
                        break;
                    
                    case '$gte':
                        minkey.push(query[key][skey]);
                        ikey[2] = true;
                        break;
                    
                    case '$lt':
                        maxkey.push(query[key][skey]);
                        break;
                    
                    case '$lte':
                        maxkey.push(query[key][skey]);
                        ikey[3] = true;
                        break;
                }
            }
        }
        if (minkey.length > 0) {
            if (minkey.length == 1) {
                ikey[0] = minkey[0];
            } else {
                ikey[0] = minkey.join(',');
            }
        }
        if (maxkey.length > 0) {
            if (maxkey.length == 1) {
                ikey[1] = maxkey[0];
            } else {
                ikey[1] = maxkey.join(',');
            }
        }
        return ikey;
    };

    /**
     * @private
     */
    this.queryHashIndex = function(container, key) {
        return container.$index.search(key);
    };

    /**
     * @private
     */
    this.queryRangeIndex = function(container, min, max, imin, imax) {
        return container.$index.range(min, max, imin, imax);
    };

    /**
     * @private
     */
    this.queryIndices = function(containers, query) {
        var o         = [];
        var key       = null;
        var ikey      = null;
        var container = null;
        for (key in containers.range) {
            container = containers.range[key];
            ikey      = this.buildRangeIndexKey(container.$attr, query);
            o.push(this.queryRangeIndex(container, ikey[0], ikey[1], ikey[2], ikey[3]));
        }
        for (key in containers.exact) {
            container = containers.exact[key];
            ikey      = this.buildHashIndexKey(container.$attr, query);
            o.push(this.queryHashIndex(container, ikey));
        }
        return module.exports.Scule.functions.intersection(o);
    };

    /**
     * @private
     */
    this.selectIndices = function (collection, query) {
        var range = module.exports.getHashTable();
        var exact = module.exports.getHashTable();
        
        this.populateAttributes(query, range, exact);

        range = range.getKeys().sort();
        exact = exact.getKeys().sort();

        if(range.length === 0 && exact.length === 0) {
            return;
        }
        
        var hkey     = null;
        var m        = null;
        var matches  = {
            range:{}, 
            exact:{}, 
            selected:false
        };
        var indices  = collection.indices;

        for(var i=0; i < indices.length; i++) {
            var index = indices[i];
            m = index.applies(range, true);
            if(m && !m.$partial) {
                hkey = JSON.stringify(m.$index.astrings.getKeys().sort());
                matches.range[hkey] = m;
                matches.selected = true;
            }            
            m = index.applies(exact, false);
            if(m && !m.$partial) {
                hkey = JSON.stringify(m.$index.astrings.getKeys().sort());
                matches.exact[hkey] = m;
                matches.selected = true;
            }
        }
        
        return matches;
    };

    /**
     * @private
     */
    this.populateAttributes = function(query, range, exact) {
        for (var key in query) {
            for (var sub in query[key]) {
                if (!module.exports.Scule.symbols.table.hasOwnProperty(sub)) {
                    continue;
                }
                switch (module.exports.Scule.symbols.table[sub]) {
                    case module.exports.Scule.arities.range:
                        range.put(key, true);
                        break;
                   
                    case module.exports.Scule.arities.operand:    
                    case module.exports.Scule.arities.binary:
                        if (key == '$eq') {
                            exact.put(key, true);
                        }
                        break;                   
                    
                    case module.exports.Scule.arities.selective:
                        throw 'sub-expressions cannot use indexes';
                        break;                    
                }
            }
        }
    };

};

module.exports.Scule.classes.QueryEngine = function() {

    this.traverse = function (k , o) {
        return module.exports.Scule.functions.traverse(k, o);
    };

    this.traverseObject = function(k, o) {
        return module.exports.Scule.functions.traverseObject(module.exports.Scule.functions.parseAttributes(k), o);
    };

    this.updateIndexes = function (document, collection) {
        collection.indices.forEach(function (index) {
            index.remove(document);
            index.index(document);
        });
    };

    this.$ne = function (a, b) {
        return a != b;
    };

    this.$eq = function (a, b) {
        if (b instanceof RegExp) {
            return b.test(a);
        } else {
            return a == b;
        }
    };

    this.$gt = function (a, b) {
        return a > b;
    };

    this.$gte = function (a, b) {
        return a >= b;
    };

    this.$lt = function (a, b) {
        return a < b;
    };
    
    this.$lte = function (a, b) {
        return a <= b;
    };
    
    this.$all = function (a, b) {
        if (!module.exports.Scule.functions.isArray(a)
            || !module.exports.Scule.functions.isArray(b)) {
            return false;
        }
        var i = 0;
        var lookup = {};
        for (i=0; i < a.length; i++) {
            lookup[a[i]] = true;
        }
        for (i=0; i < b.length; i++) {
            if (!lookup.hasOwnProperty(b[i])) {
                return false;
            }
        }
        return true;
    };
    
    this.$in = function (a, b) {
        for (var i=0; i < b.length; i++) {
            if (b[i] == a) {
                return true;
            }
        }
        return false;
    };

    this.$nin = function (a, b) {
        for (var i=0; i < b.length; i++) {
            if (b[i] == a) {
                return false;
            }
        }
        return true;
    };

    this.$elemMatch = function(o, c) {
        if (!module.exports.Scule.functions.isArray(o)) {
            return false;
        }
        for (var i=0; i < o.length; i++) {
            if (c(o[i])) {
                return true;
            }
        }
        return false;
    };
    
    this.$size = function (a, b) {
        if (!module.exports.Scule.functions.isInteger(b)) {
            return false;
        }
        return module.exports.Scule.functions.sizeOf(a) == b;
    };

    this.$exists = function (a, b) {
        if (b) {
            return a !== undefined;
        }
        return a === undefined;
    };
    
    this.$within = function(o, q) {
        if (!o.hasOwnProperty('lat') || !o.hasOwnProperty('lon')) {
            return false;
        }
        if (!q.hasOwnProperty('lat') || !q.hasOwnProperty('lon')) {
            return false;
        }
        var d = Math.sqrt(Math.pow(q.lat - o.lat, 2) + Math.pow(q.lon - o.lon, 2));
        return d <= q.distance;
    };
    
    this.$near = function(o, q) {
        if (!o.hasOwnProperty('lat') || !o.hasOwnProperty('lon')) {
            return false;
        }
        if (!q.hasOwnProperty('lat') || !q.hasOwnProperty('lon')) {
            return false;
        }
        var d = Math.acos(Math.sin(o.lat) * Math.sin(q.lat) + Math.cos(o.lat) * Math.cos(q.lat) * Math.cos(q.lon - o.lon)) * 6371;
        return d <= q.distance;
    };
    
    this.$sort = function (type, o, key) {
        module.exports.Scule.functions.sort(type, o, key);
    };
    
    this.$set = function (struct, value, upsert) {
        var leaf = struct[0];
        var o    = struct[1];
        if (!(leaf in o)) {
            if (upsert === true) {
                o[leaf] = value;
            }
        } else {
            o[leaf] = value;
        }        
    };
    
    this.$unset = function (struct, value, upsert) {
        var leaf = struct[0];
        var o    = struct[1];
        if (leaf in o) {
            delete o[leaf];
        }        
    };
    
    this.$inc = function (struct, value, upsert) {
        if (!module.exports.Scule.functions.isInteger(value)) {
            value = 1;
        }
        var leaf = struct[0];
        var o    = struct[1];
        if (!(leaf in o)) {
            if (upsert) {
                o[leaf] = value;
            }
        } else {
            if (module.exports.Scule.functions.isInteger(o[leaf]) || module.exports.Scule.functions.isDouble(o[leaf])) {
                o[leaf] += value;   
            }
        }        
    };
    
    this.$pull = function (struct, value, upsert) {
        var leaf = struct[0];
        var o    = struct[1];
        if (leaf in o && module.exports.Scule.functions.isArray(o[leaf])) {
            var a = [];            
            for (var i=0; i < o[leaf].length; i++) {
                if (o[leaf][i] !== value) {
                    a.push(o[leaf][i]);
                }
            }  
            o[leaf] = a;
        }        
    };
    
    this.$pullall = function (struct, value, upsert) {
        var leaf = struct[0];
        var o    = struct[1];
        if (leaf in o && module.exports.Scule.functions.isArray(o[leaf])) {
            if (!module.exports.Scule.functions.isArray(value)) {
                throw 'the $pullAll operator requires an associated array as an operand';
            }
            var table = module.exports.getHashTable();
            value.forEach(function (val) {
                table.put(val, true); 
            });
            for (var i=0; i < o[leaf].length; i++) {
                if (table.contains(o[leaf][i])) {
                    o[leaf].splice(i, 1);
                    i--;
                }
            }  
        }        
    };
    
    this.$pop = function (struct, value, upsert) {
        var leaf = struct[0];
        var o    = struct[1];
        if (leaf in o && module.exports.Scule.functions.isArray(o[leaf])) {
            o[leaf].pop();   
        }        
    };
    
    this.$push = function (struct, value, upsert) {
        var leaf = struct[0];
        var o    = struct[1];
        if (!(leaf in o) && upsert) {
            o[leaf] = value;
        } else {
            if (module.exports.Scule.functions.isArray(o[leaf])) {
                o[leaf].push(value);   
            }
        }        
    };
    
    this.$pushall = function (struct, value, upsert) {
        var leaf = struct[0];
        var o    = struct[1];
        if (!(leaf in o) && upsert) {
            o[leaf] = value;
        } else {
            if (!module.exports.Scule.functions.isArray(value)) {
                throw 'the $pushAll operator requires an associated array as an operand';
            }            
            if (module.exports.Scule.functions.isArray(o[leaf])) {
                o[leaf] = o[leaf].concat(value);   
            }
        }        
    };
    
};

module.exports.Scule.classes.QueryCompiler = function() {

    this.cache      = module.exports.getHashTable();
    this.engine     = new module.exports.Scule.classes.QueryEngine();
    this.normalizer = new module.exports.Scule.classes.QueryNormalizer();

    this.compileConditions = function(conditions) {
        var source = '';
        for (var key in conditions) {
            if (!conditions.hasOwnProperty(key)) {
                continue;
            }
            switch (key) {
                case '$limit':
                    source += '\tif (r.length > ' + conditions[key] + ') {\n';
                    source += '\t\tr.splice(' + conditions[key] + ');\n';
                    source += '\t}\n';
                    break;
                        
                case '$sort':
                    var o = conditions[key];
                    var k = module.exports.Scule.functions.objectKeys(o);
                    if (k.length == 1) {
                        source += '\tengine.$sort(' + o[k[0]] + ', r, "' + k[0] + '");\n';
                    }
                    break;
            }
        }
        return source;
    };
    
    this.compileClauseList = function(queries) {
        var __t  = this;
        var ors = [];
        if (!module.exports.Scule.functions.isArray(queries)) {
            return ors;
        }
        queries.forEach(function(query) {
            var ands = [];
            for (var key in query) {
                if (!query.hasOwnProperty(key)) {
                    continue;
                }
                ands = ands.concat(__t.compileQueryClauses(key, query[key]));
            }
            ors.push(ands.join(' && '));
        });
        return ors.join(' || ');
    };

    this.compileExpressions = function(query) {
        query = this.normalizer.normalize(query);
        var ands = [];
        for (var key in query) {
            ands = ands.concat(this.compileQueryClauses(key, query[key]));
        }
        return ands;
    };

    this.compileQueryClauses = function(key, subQuery) {
        var clauses = [];
        for (var operator in subQuery) {
            if (!this.engine.hasOwnProperty(operator)) {
                continue;
            }
            if (operator == '$elemMatch') {
                var sands = this.compileExpressions(subQuery[operator]);
                var src = 'function(o) { return (' + sands.join(' && ') + '); }';
                if (key.indexOf('.') < 0) {
                    clauses.push('engine.$elemMatch(o.' + key + ', ' + src + ')'); 
                } else {
                    clauses.push('engine.$elemMatch(engine.traverse(' + JSON.stringify(key) + ', o), ' + src + ')');                
                }                
            } else {
                if (key.indexOf('.') < 0) {
                    var v = null;
                    if (subQuery[operator] instanceof RegExp) {
                        v = subQuery[operator].toString();
                    } else {
                        v = JSON.stringify(subQuery[operator]);
                    }
                    clauses.push('engine.' + operator + '(o.' + key + ', ' + v + ')'); 
                } else {
                    clauses.push('engine.' + operator + '(engine.traverse(' + JSON.stringify(key) + ', o), ' + v + ')');                
                }
            }
        }
        return clauses;
    };    
    
    this.compileUpdateClauses = function(key, subQuery, upsert) {
        var clauses = [];
        for (var operator in subQuery) {
            if (!this.engine.hasOwnProperty(operator)) {
                continue;
            }
            clauses.push('\t\tengine.' + operator + '(engine.traverseObject(' + JSON.stringify(key) + ', o), ' + JSON.stringify(subQuery[operator]) + ', ' + JSON.stringify(upsert) + ');');                
        }
        return clauses;
    };
    
    this.compileUpdate = function(query, upsert) {

        var hash = md5.hash(JSON.stringify(query));
        if(this.cache.contains(hash)) {
            return this.cache.get(hash);
        }        

        var updates  = [];
        var closure  = 'var u = function(objects, collection, engine) {\n';
        closure     += '\tobjects.forEach(function(o) {\n';
        
        for (var key in query) {
            if (!query.hasOwnProperty(key)) {
                continue;
            }
            updates = updates.concat(this.compileUpdateClauses(key, query[key], upsert));
        }
        
        closure     += updates.join('\n');
        closure     += '\n\t\tengine.updateIndexes(o, collection);\n';
        closure     += '\t});\n'
        closure     += '\treturn objects;\n';
        closure     += '}\n';

        this.cache.put(hash, closure);        
        return closure;

    };
    
    this.compileQuery = function(query, conditions) {
        
        query      = this.normalizer.normalize(query);
        
        var hash = md5.hash(JSON.stringify(query) + JSON.stringify(conditions));
        if(this.cache.contains(hash)) {
            return this.cache.get(hash);
        }        
        
        var closure = 'var c = function(objects, engine) {\n';        
        closure    += '\tvar r = [];\n';
        if (module.exports.Scule.functions.sizeOf(query) > 0) {
            closure    += '\tfor (var k in objects) {\n';
            closure    += '\t\tif (!objects.hasOwnProperty(k)) { continue; }\n';
            closure    += '\t\tvar o = objects[k];\n';
            var ands    = [];
            var ors     = '';
            for (var key in query) {
                if (!query.hasOwnProperty(key)) {
                    continue;
                }
                if (key == '$or') {
                    ors = '(' + this.compileClauseList(query[key]) + ')';
                } else {
                    ands = ands.concat(this.compileQueryClauses(key, query[key]));
                }
            }
            if (ands.length > 0) {
                if (ors.length > 0) {
                    ors = ' && ' + ors;
                }
                closure += '\t\tif ((' + ands.join(' && ') + ')' + ors + ') {\n';
                closure += '\t\t\tr.push(o);\n'
                closure += '\t\t}\n';
            } else if (ors.length > 0) {
                closure += '\t\tif (' + ors + ') {\n';
                closure += '\t\t\tr.push(o);\n'
                closure += '\t\t}\n';            
            }
            closure += '\t};\n';
        } else {
            closure    += '\tfor (var k in objects) {\n';
            closure    += '\t\tif (!objects.hasOwnProperty(k)) { continue; }\n';
            closure    += '\t\tr.push(o[k]);\n';
            closure    += '\t}\n';
        }
        if (conditions && conditions.hasOwnProperty('$skip')) {
            closure += '\tr.splice(0, ' + conditions.$skip + ');\n';
            delete(conditions.$skip);
        }        
        if (conditions) {
            closure += this.compileConditions(conditions);
        }
        closure += '\treturn r;\n';
        closure += '};\n';
        
        this.cache.put(hash, closure);        
        return closure;
        
    };

    this.explainQuery = function(query, conditions) {
        var source = this.compileQuery(query, conditions);
        console.log(source);
        return source;
    };

    this.explainUpdate = function(query, upsert) {
        var source = this.compileUpdate(query, upsert);
        console.log(source);
        return source;
    };

};

module.exports.Scule.classes.QueryInterpreter = function() {

    this.indexer  = new module.exports.Scule.classes.IndexSelector();
    this.compiler = new module.exports.Scule.classes.QueryCompiler();

    this.interpret = function(collection, query, conditions, explain) {
        if (explain) {
            return this.compiler.explainQuery(query, conditions);
        }
        var o   = this.indexer.resolveIndices(collection, query);
        var src = this.compiler.compileQuery(query, conditions);
        eval(src);
        return c(o, module.exports.Scule.objects.engine);
    };

    this.update = function(collection, query, updates, conditions, upsert, explain) {
        var o = this.interpret(collection, query, conditions, explain);
        if (explain) {
            return this.compiler.explainUpdate(updates, upsert);
        }
        var src = this.compiler.compileUpdate(updates, upsert);
        eval(src);
        return u(o, collection, module.exports.Scule.objects.engine);
    };

};

/**
 * Core Scule data types and pattern implementations
 * @public
 * @constructor
 * @class Collection
 * @param {String} name the name of the collection
 * @returns {Void}
 */
module.exports.Scule.classes.Collection = function(name) {
    
    /**
     * @private
     * @type {HashTable}
     */    
    this.documents  = new module.exports.Scule.classes.HashTable();
    
    /**
     * @private
     * @type {QueryInterpreter}
     */    
    this.interpreter   = new module.exports.Scule.classes.QueryInterpreter();
    
    /**
     * @private
     * @type {Number}
     */    
    this.version    = 2.0;
    
    /**
     * @private
     * @type {ObjectId}
     */    
    this.lastId     = null;
    
    /**
     * @private
     * @type {String}
     */    
    this.name       = name;
    
    /**
     * @private
     * @type {Boolean}
     */    
    this.autoCommit = false;
    
    /**
     * @private
     * @type {Boolean}
     */    
    this.isOpen     = false;
    
    /**
     * @private
     * @see {StorageEngine}
     * @type {StorageEngine}
     */    
    this.storage    = null;
    
    /**
     * @private
     * @type {Array}
     */    
    this.indices    = [];
    
    /**
     * Sets the storage engine for the collection
     * @public
     * @param {StorageEngine} storage the storage engine to set on the collection
     * @returns {Void}
     */
    this.setStorageEngine = function(storage) {
        this.storage = storage;
    };
    
    /**
     * Ensures that an index exists on the collection with the provided attributes
     * @public
     * @param {Number} type the type of index
     * @param {String} definition the attributes to use when building the index
     * @param {Object} options the index type specific options to use
     * @returns {Void}
     */
    this.ensureIndex = function(type, definition, options) {
        var index;
        switch(type) {
            case module.exports.Scule.constants.INDEX_TYPE_BTREE:
                if(!options) {
                    options = {
                        order:100
                    };
                }
                index = new module.exports.Scule.classes.BPlusTreeIndex(options.order);
                index.parseAttributes(definition);
                break;
                
            case module.exports.Scule.constants.INDEX_TYPE_HASH:
                index = new module.exports.Scule.classes.HashTableIndex();
                index.parseAttributes(definition);
                break;
        }
        if(index) {
            var inserted = false;
            var alen     = index.astrings.length;
            for(var i=0; i < this.indices.length; i++) {
                if(alen > this.indices[i].astrings.length) {
                    this.indices.splice(i, 0, index);
                    inserted = true;
                    break;
                }
            }
            if(!inserted) {
                var o = this.findAll();
                o.forEach(function(document) {
                    index.index(document);
                });
                this.indices.push(index);
            }
        }
    };
    
    /**
     * Ensures a b+tree index exists using the provided definition and options
     * @public
     * @param {String} definition the index definition (e.g. a,b,c.d)
     * @param {Object} options the options for the index implementation
     * @returns {Void}
     */
    this.ensureBTreeIndex = function(definition, options) {
        this.ensureIndex(module.exports.Scule.constants.INDEX_TYPE_BTREE, definition, options);
    };


    /**
     * Ensures a hash index exists using the provided definition and options
     * @public
     * @param {String} definition the index definition (e.g. a,b,c.d)
     * @param {Object} options the options for the index implementation
     * @returns {Void}
     */
    this.ensureHashIndex = function(definition, options) {
        this.ensureIndex(module.exports.Scule.constants.INDEX_TYPE_HASH, definition, options);
    };
    
    /**
     * Sets whether or not the collection should auto-commit changes to storage
     * @public
     * @param {Boolean} semaphor the boolean indicating whether or not auto-commit is enabled (default is FALSE)
     * @returns {Void}
     */
    this.setAutoCommit = function(semaphor) {
        this.autoCommit = semaphor;
    };

    /**
     * Returns the name for the collection as a string
     * @public
     * @returns {String}
     */
    this.getName = function() {
        return this.name;
    };
    
    /**
     * Returns the number of objects in the collection as an integer
     * @public
     * @returns {Number}
     */
    this.getLength = function() {
        return this.documents.getLength();
    };
    
    /**
     * Returns the ObjectId created by the last insertion operation on the collection
     * @public
     * @returns {Null|ObjectId}
     */
    this.getLastInsertId = function() {
        return this.lastId;
    };
    
    /**
     * Loads the collection from storage and initializes all encapsulated objects
     * @public
     * @param {Function} callback the callback to execute once the collection is 
     * opened, the collection is passed as the only argument for the callback closure
     * @returns {Void}
     */
    this.open = function(callback) {
        if(this.isOpen) {
            return;
        }
        var self = this;
        this.storage.read(this.name, function(o) {
            if(!o) {
                return;
            }
            for(var ky in o._objects) {
                var document = o._objects[ky];
                module.exports.Scule.functions.unflattenObject(o._objects[ky]);
                self.documents.put(module.exports.Scule.functions.getObjectId(document, true), document);
                for(var i=0; i < self.indices.length; i++) {
                    self.indices[i].index(document);
                }
            }
            self.isOpen = true;
            if(callback) {
                callback(this);
            }
        });
    };
    
    /**
     * Commits the collection to storage
     * @public
     * @param {Function} callback the callback executed when the collection is successfully commited
     * @returns {Void}
     */
    this.commit = function(callback) {
        var collection = {
            _sig: null,
            _salt: null,
            _name: this.name,
            _version: this.version,
            _objects: this.documents.table            
        };
        this.storage.write(this.name, collection, callback);
    };

    /**
     * Performs a query on the collection, returning the results as an array
     * @public
     * @param {Object} query the query expression(s) to execute against the collection
     * @param {Object} conditions the limit and sort conditions for the query
     * @param {Function} callback the callback to be executed once the query is complete. The only
     * argument for the callback closure is the result set for the query. If no callback is provided
     * the results are returned directly.
     * @returns {Array}
     */
    this.find = function(query, conditions, callback) {
        if(module.exports.Scule.constants.ID_FIELD in query) {
            return [this.findOne(query[module.exports.Scule.constants.ID_FIELD])];
        }
        var result = this.interpreter.interpret(this, query, conditions);
        if(callback) {
            callback(result);
        }
        return result;
    };
    
    /**
     * Prints a human readable version of the Scule virtual machine program
     * generated to service the provided query and conditions
     * @public
     * @param {Object} query the query expression(s) to execute against the collection
     * @param {Object} conditions the limit and sort conditions for the query
     * @param {Function} callback callback the callback to be executed once the query is complete.
     * The callback has no arguments.
     * @returns {Void}
     */
    this.explain = function(query, conditions, callback) {
        this.interpreter.interpret(this, query, conditions, true);
        if(callback) {
            callback();
        }
    };
    
    /**
     * Clears the collection - removing all objects
     * @public
     * @param {Function} callback the callback to be executed once the collection has been cleared.
     * The only argument for the callback closure is a reference to the collection itself.
     * @returns {Void}
     */
    this.clear = function(callback) {
        this.documents.clear();
        for(var i=0; i < this.indices.length; i++) {
            this.indices[i].clear();
        }
        if(callback) {
            callback(this);
        }
    };
    
    /**
     * Returns all objects in the collection as an Array
     * @public
     * @param {Function} callback the callback to be executed once the query is complete. The only
     * argument for the callback closure is the result set for the query. If no callback is provided
     * the results are returned directly.
     * @returns {Array}
     */
    this.findAll = function(callback) {
        var result = [];
        for(var ky in this.documents.table) {
            result.push(this.documents.get(ky));
        }
        if(callback) {
            callback(result);
        }
        return result;
    };
    
    /**
     * Returns the object identified by the provided ObjectId, returns null if no entry
     * exists in the documents index
     * @public
     * @param {ObjectId} id the {ObjectId} to query with
     * @param {Function} callback the callback to be executed once the query is complete. The only
     * argument for the callback closure is the result set for the query. If no callback is provided
     * the results are returned directly.
     * @returns {Object|null}
     */
    this.findOne = function(id, callback) {
        if(!module.exports.Scule.functions.isScalar(id)) {
            id = id.toString();
        }
        var document = null;
        if(this.documents.contains(id)) {
            document = this.documents.get(id);
        }
        if(callback) {
            callback(document);
        }
        return document;
    };
    
    /**
     * Saves an object to the collection, adding an ObjectId using the attribute name _id
     * if none exists.
     * @public
     * @param {Object} document the document object to save to the collection
     * @param {Function} callback the callback to be executed once the query is complete. The only
     * argument for the callback closure is the {ObjectId} for the last inserted document. If no
     * callback is provided the last inserted id is returned directly.
     * @returns {Void}
     */
    this.save = function(document, callback) {
        module.exports.Scule.functions.unflattenObject(document);
        this.documents.put(module.exports.Scule.functions.getObjectId(document, true), document);
        for(var i=0; i < this.indices.length; i++) {
            this.indices[i].remove(document);
            this.indices[i].index(document);
        }
        if(this.autoCommit) {
            this.commit();
        }
        this.lastId = module.exports.Scule.functions.getObjectId(document);
        if(callback) {
            callback(this.lastId);
        }
        return this.lastId;
    };
    
    /**
     * Performs an update on documents in the collection
     * @public
     * @param {Object} query the query expression(s) to execute against the collection
     * @param {Object} updates the update query expression(s) to execute against the collection
     * @param {Object} conditions the limit and sort conditions for the query
     * @param {Boolean} upsert a boolean flag indicating whether or not to upsert
     * @param {Function} callback the callback to be executed once the query is complete. The only
     * argument for the callback closure is the result set for the query. If no callback is provided
     * the results are returned directly.
     * @returns {Array}
     */
    this.update = function(query, updates, conditions, upsert, callback) {
        var result = this.interpreter.update(this, query, updates, conditions, upsert);
        if(callback) {
            callback(result);
        }
        return result;
    };
    
    /**
     * Returns a count of the number of documents matching the query criteria
     * @public
     * @param {Object} query the query expression(s) to execute against the collection
     * @param {Function} callback the callback to be executed once the query is complete. The only
     * argument for the callback closure is the result set for the query. If no callback is provided
     * the results are returned directly.
     * @returns {Number}
     */
    this.count = function(query, conditions, callback) {
        var count = this.find(query, conditions).length;
        if(callback) {
            callback(count);
        }
        return count;
    };
    
    /**
     * Removes the documents matching the query criteria and sort/limit conditions
     * from the collection and associated indices
     * @public
     * @param {Object} query the query expression(s) to execute against the collection. Documents
     * matching the query criteria will be removed from the collection
     * @param {Object} conditions the limit and sort conditions for the query
     * @param {Function} callback the callback to be executed once the query is complete. The only
     * argument for the callback closure is the result set for the query. If no callback is provided
     * the results are returned directly.
     * @returns {Number}
     */
    this.remove = function(query, conditions, callback) {
        var self   = this;
        var results = this.find(query, conditions);
        results.forEach(function(o) {
            self.documents.remove(module.exports.Scule.functions.getObjectId(o));
            self.indices.forEach(function(index) {
                index.remove(o);
            });
        });
        if (callback) {
            callback(results);
        }
        return results;
    };
    
    /**
     * Returns an object containing key, value pairs representing the distinct values for the provided key (and query if provided)
     * @public
     * @param {String} key the key to find distinct values for
     * @param {Object} query the query to use when aggregating results
     * @param {Function} callback the callback to be executed once the query is complete. The only
     * argument for the callback closure is the result set for the query. If no callback is provided
     * the results are returned directly.
     * @returns {Object}
     */    
    this.distinct = function(key, query, callback) {
        var o = this.find(query);
        var t = {};
        o.forEach(function(d) {
            if(!(d[key] in t)) {
                t[d[key]] = 0;
            }
            t[d[key]]++;
        });
        if(callback) {
            callback(t);
        }
        return t;
    };
    
    /**
     * Merges the current collection with the provided collection
     * @public
     * @param {Collection} collection the collection to merge with
     * @param {Function} callback the callback to be executed once the merge is complete. The only
     * argument for the callback closure is a reference to the collection (this).
     * @returns {Boolean}
     */
    this.merge = function(collection, callback) {
        if(!collection) {
            throw 'the merge function requires a valid collection as a parameter';
        }
        var self = this;
        var o    = collection.findAll();
        o.forEach(function(document) {
            if(!self.documents.contains(document._id)) {
                self.documents.put(document._id, document);
            }
        });
        if(callback) {
            callback(this);
        }
        return true;
    };
    
    /**
     * Performs a map/reduce operation against the collection
     * @see http://docs.mongodb.org/manual/applications/map-reduce/
     * @public
     * @param {Function} map the map function - it has two arguments: a reference to the document to map
     * and a reference to a function called "emit"
     * @param {Function} reduce the reduce function - should return the result of the reduce operation
     * @param {Object} options the options for the map/reduce operation - it can optionally contain:
     * 
     * - an "out" value containing a collection connection url as either a "merge" or "reduce" sub-argument. If 
     * provided as a merge the provided collection will be merged with the results of the map/reduce operation.
     * 
     * - a query expression object
     * 
     * - a limit/sort expression object
     * 
     * - a "finalize" value containing a reference to a function. Finalize functions should accept two arguments;
     * a reference to the key being operated on and a reference to results of the reduce function. The finalize function
     * should return a reference to the modified "reduced" value once it has completed execution.
     * 
     * And example options object might look like:
     * {
     *      out:{
     *          merge:'scule+dummy://map-reduce'
     *      },
     *      query:{a:10},
     *      conditions:{$limit:100, $sort:{a:-1}},
     *      finalize:function(key, reduced) {
     *          reduced.finalized = key;
     *          return reduced;
     *      }
     * }
     * @param {Function} callback the callback to be executed once the map/reduce operation is complete. The only
     * argument for this function is the "out" collection.
     * @returns {Void}
     */
    this.mapReduce = function(map, reduce, options, callback) {
        (new module.exports.Scule.classes.MapReduceHandler(map, reduce, options)).run(this, callback);
    };
    
};

/**
 * A simple map/reduce implementation
 * @public
 * @constructor
 * @param {Function} map
 * @param {Function} reduce
 * @param {Object} options
 * @class {MapReduceHandler}
 * @returns {Void}
 */
module.exports.Scule.classes.MapReduceHandler = function(map, reduce, options) {
  
    this.options = options;

    if(!map) {
        throw 'A valid function is requires as the `map` parameter of the map/reduce operation';
    }

    if(!reduce) {
        throw 'A valid function is requires as the `reduce` parameter of the map/reduce operation';
    }

    if(!('out' in options)) {
        throw 'A valid output collection connection url is required as the `out` parameter of the map/reduce options object';
    } else {
        if(!('merge' in options.out) && !('reduce' in options.out)) {
            throw 'A valid output collection connection url is required as either the `merge` or `reduce` out parameter of the map/reduce options object';
        }
    }
 
    if(!('query' in options)) {
        options.query = {};
    }

    if(!('conditions' in options)) {
        options.conditions = {};
    }

    this.map = map;
    
    this.reduce = reduce;

    this.finalize = ('finalize' in options) ? options.finalize : null;

    /**
     * Runs the map reduce operation against the provided collection
     * @public
     * @param {Collection} collection
     * @param {Function} callback called once the map/reduce is complete, providing the out collection as the only parameter
     * @returns {Boolean}
     */
    this.run = function(collection, callback) {
        
        var self  = this;
        var merge = ('merge' in this.options.out); 
        var out   = module.exports.factoryCollection(merge ? this.options.out.merge : this.options.out.reduce);
        var table = new module.exports.Scule.classes.HashTable();
        
        var emit  = function(key, value) {
            if(!table.contains(key)) {
                table.put(key, []);
            }
            table.get(key).push(value);
        };
        
        var o = collection.find(this.options.query, this.options.conditions);
        o.forEach(function(document) {
            self.map(document, emit);
        });

        var temp = null;
        if(merge) {
            temp = module.exports.factoryCollection('scule+dummy://__mr' + (new Date()).getTime());
        }
        
        var result = new module.exports.Scule.classes.HashTable();
        var keys   = table.getKeys();
        keys.forEach(function(key) {
            result.put(key, self.reduce(key, table.get(key)));
            if(self.finalize) {
                result.put(key, self.finalize(key, result.get(key)));
            }
            if(!merge) {
                out.save(result.get(key));
            } else {
                temp.save(result.get(key));
            }
        });
        
        if(merge) {
            out.merge(temp);
        }
        
        if(callback) {
            callback(out);
        }
        
        return true;
    };

};

/**
 * A factory pattern implementation for Collection objects
 * @public
 * @constructor
 * @class {CollectionFactory}
 * @returns {Void}
 */
module.exports.Scule.classes.CollectionFactory = function() {

    /**
     * @private
     * @type {HashTable}
     */
    this.collections = new module.exports.Scule.classes.HashTable();
    
    /**
     * Instantiates and returns a collection corresponding to the provided name and reading from the provided storage engine.
     * If no storage engine is provided the MemoryStorageEngine is selected by default.
     * @public
     * @param {String} url the name of the collection to instantiate
     * @param {Object} configuration a configuration object
     * @returns {Collection}
     */
    this.getCollection = function(url, configuration) {
        if(this.collections.contains(url)) {
            return this.collections.get(url).c;
        }
        
        if(!configuration) {
            configuration = {
                secret:'dummy'
            };
        }
        
        var parts = module.exports.Scule.functions.parseCollectionURL(url);
        if(!(parts.plugin in module.exports.Scule.plugins)) {
            throw parts.plugin + ' is not a registered Scule plugin';
        }
        
        if(!(parts.engine in module.exports.Scule.engines)) {
            throw parts.engine + ' is nto a registered Scule storage engine';
        }
        
        var storage    = new module.exports.Scule.engines[parts.engine](configuration);
        var collection = new module.exports.Scule.plugins[parts.plugin](parts.name);
        collection.setStorageEngine(storage);
        collection.open();
        
        this.collections.put(url, {
            c: collection,
            t: (new Date()).getTime()
        });
        
        return this.collections.get(url).c;
    };
    
};

/**
 * Prints a debug message to the console, conditionally based on the debug settings for the module
 * @public
 * @param {String} message the message to log to the console
 * @returns {Void}
 */
module.exports.Scule.functions.debug = function(message) {
    if(module.exports.Scule.variables.debug == true) {
        if(typeof Titanium !== 'undefined') {
            Ti.API.info(message);
        } else {
            Ti.API.info(message);
        }
    }
};

/**
 * "Unflattens" an object - that is, when invoked on a Scule Object, this function will
 * inject the required object instances to represent embedded types such as ObjectId, ObjectDate, and DBRef
 * @public
 * @param {Object} object the object to unflatten
 * @returns {Void}
 */
module.exports.Scule.functions.unflattenObject = function(object) {
    var u = function(object) {
        if(module.exports.Scule.functions.isScalar(object)) {
            return;
        }
        for(var key in object) {
            var o = object[key];
            if(!module.exports.Scule.functions.isScalar(o) && o && ('$type' in o)) {
                switch(o.$type) {
                    case 'date':
                        object[key] = new module.exports.Scule.classes.ObjectDate(o.sec, o.usec)
                        object[key].ts = o.ts;
                        break;
                            
                    case 'id':
                        object[key] = new module.exports.Scule.classes.ObjectId(o.id);
                        break;
                            
                    case 'dbref':
                        object[key] = new module.exports.Scule.classes.DBRef(o.ref, o.id);
                        break;
                }
            } else {
                u(o);
            }
        }
    }
    u(object);
    if(!(module.exports.Scule.constants.ID_FIELD in object)) {
        object[module.exports.Scule.constants.ID_FIELD] = new module.exports.Scule.classes.ObjectId();
    }
};

/**
 * Parses a collection connect url and returns the required pieces
 * @public
 * @param {String} url the url to parse, should be in the format collection_engine+storage_engine://collection_name (e.g. scule+dummy://test)
 * @returns {Object}
 * @throws {Exception}
 */
module.exports.Scule.functions.parseCollectionURL = function(url) {
    var matches = url.match(/^([^\+]*)\+([^\/]*)\:\/\/(.*)/);
    if(!matches || matches.length != 4) {
        throw url + ' is an invalid collection url';
    }
    return {
        plugin:matches[1],
        engine:matches[2],
        name:  matches[3]
    };    
};

/**
 * @public
 * @type Function
 */
module.exports.Scule.objects.core.collections.factory = new module.exports.Scule.classes.CollectionFactory();

/**
 * @public
 * @type Function
 */
module.exports.Scule.objects.engine = new module.exports.Scule.classes.QueryEngine();

/**
 * Sets a flag signifying whether or not to log console debug output
 * @param {Boolean} semaphor the flag signifying whether or not to log console debug output
 * @returns {Void}
 */
module.exports.debug = function(semaphor) {
    module.exports.Scule.variables.debug = semaphor;
};

/**
 * Registers a storage engine with Scule - throws an exception if an engine with the same name
 * is already registered
 * @param {String} name a unique string name identifying the storage engine class
 * @param {StorageEngine} engine the storage engine class to register
 * @returns {Void}
 */
module.exports.registerStorageEngine = function(name, engine) {
    if(name in module.exports.Scule.engines) {
        throw name + ' storage engine is already registered';
    }
    module.exports.Scule.engines[name] = engine;
};

/**
 * Registers a collection plugin with Scule - throws an exception if a plugin with
 * the same name is already registered
 * @param {String} name a unique string name identifying the collection plugin class
 * @param {Collection} plugin the collection class to register
 * @returns {Void}
 */
module.exports.registerCollectionPlugin = function(name, plugin) {
    if(name in module.exports.Scule.plugins) {
        throw name + ' collection plugin is already registered';
    }
    module.exports.Scule.plugins[name] = plugin;
};

/**
 * Register default collection plugin and storage engines
 */
(function() {
    module.exports.registerStorageEngine('titanium', module.exports.Scule.classes.TitaniumDiskStorageEngine);
    module.exports.registerStorageEngine('memory', module.exports.Scule.classes.MemoryStorageEngine);
    module.exports.registerStorageEngine('dummy', module.exports.Scule.classes.DummyStorageEngine);
    module.exports.registerCollectionPlugin('scule', module.exports.Scule.classes.Collection);    
}());

/**
 * Creates a new Collection instance corresponding to the provided name and using the provided storage engine
 * @param {String} name the name of the collection to load
 * @returns {Collection}
 * @throws {Exception}
 */
module.exports.factoryCollection = function(name) {
    return module.exports.Scule.objects.core.collections.factory.getCollection(name);
};

/**
 * Clears all collections
 * @returns {Void}
 */
module.exports.dropAll = function() {
    module.exports.Scule.objects.core.collections.factory.collections.clear();
};

/**
 * Returns an instance of the {Index} class
 * @returns {Index}
 */
module.exports.getIndex = function() {
    return new module.exports.Scule.classes.Index();
};

/**
 * Returns an instance of the {HashTableIndex} class
 * @param {Number} threshold
 * @returns {HashTableIndex}
 */
module.exports.getHashTableIndex = function(threshold) {
    return new module.exports.Scule.classes.HashTableIndex(threshold);
};

/**
 * Returns an instance of the {BPlusTreeIndex} class
 * @param {Number} threshold
 * @returns {BPlusTreeIndex}
 */
module.exports.getBPlusTreeIndex = function(threshold) {
    return new module.exports.Scule.classes.BPlusTreeIndex(threshold);
};

/**
 * Returns an instance of the {ObjectId} class
 * @param {String} id
 * @returns {ObjectId}
 */
module.exports.getObjectId = function(id) {
    return new module.exports.Scule.classes.ObjectId(id);
};

/**
 * Returns an instance of the {ObjectDate} class
 * @param {Number} sec
 * @param {Number} usec
 * @returns {ObjectDate}
 */
module.exports.getObjectDate = function(sec, usec) {
    return new module.exports.Scule.classes.ObjectDate(sec, usec);
};

/**
 * Returns an instance of the {DBRef} class
 * @param {String} ref the collection connector string for the referenced collection
 * @param {String|ObjectId} id the identifier of the object to reference
 * @returns {DBRef}
 */
module.exports.getDBRef = function(ref, id) {
    return new module.exports.Scule.classes.DBRef(ref, id);
};

/**
 * Returns an instance of the {MemoryStorageEngine} class
 * @param {Object} configuration
 * @returns {MemoryStorageEngine}
 */
module.exports.getMemoryStorageEngine = function(configuration) {
    return new module.exports.Scule.classes.MemoryStorageEngine(configuration);
};

/**
 * Returns an instance of the {TitaniumDiskStorageEngine} class
 * @param {Object} configuration
 * @returns {TitaniumDiskStorageEngine}
 */
module.exports.getTitaniumDiskStorageEngine = function(configuration) {
    return new module.exports.Scule.classes.TitaniumDiskStorageEngine(configuration);
};

/**
 * Returns an instance of the {SimpleCryptographyProvider} class
 * @return {SimpleCryptographyProvider}
 */
module.exports.getSimpleCryptographyProvider = function() {
    return new module.exports.Scule.classes.SimpleCryptographyProvider();
};

/**
 * Returns an instance of the {BPlusHashingTree} class
 * @param {Number} order
 * @param {Number} threshold
 * @returns {BPlusHashingTree}
 */
module.exports.getBPlusHashingTree = function(order, threshold) {
    return new module.exports.Scule.classes.BPlusHashingTree(order, threshold);
};

/**
 * Returns an instance of the {HashBucketTable} class
 * @returns {HashBucketTable}
 */
module.exports.getHashBucketTable = function() {
    return new module.exports.Scule.classes.HashBucketTable();
};

/**
 * Returns an instrumentation timer instance
 * @returns {Timer}
 */
module.exports.getTimer = function() {
    return new module.exports.Scule.classes.Timer();
};

/**
 * Returns an instance of the {LinkedList} class
 * @returns {LinkedList}
 */
module.exports.getLinkedList = function() {
    return new module.exports.Scule.classes.LinkedList();
};

/**
 * Returns an instance of the {CachingLinkedList} class
 * @see {LinkedList}
 * @param {Number} threshold
 * @param {String} cacheKey
 * @returns {CachingLinkedList}
 */
module.exports.getCachingLinkedList = function(threshold, cacheKey) {
    return new module.exports.Scule.classes.CachingLinkedList(threshold, cacheKey);
};

/**
 * Returns an instance of the {DoublyLinkedList} class
 * @returns {DoublyLinkedList}
 */
module.exports.getDoublyLinkedList = function() {
    return new module.exports.Scule.classes.DoublyLinkedList();
};

/**
 * Returns an instance of the {HashTable} class
 * @returns {HashTable}
 */
module.exports.getHashTable = function() {
    return new module.exports.Scule.classes.HashTable();
};

/**
 * Returns an instance of the {HashMap} class
 * @param {Number} size the table size
 * @returns {HashMap}
 */
module.exports.getHashMap = function(size) {
    return new module.exports.Scule.classes.HashMap(size);
};

/**
 * Returns an instance of the {LIFOStack} class
 * @returns {LIFOStack}
 */
module.exports.getLIFOStack = function() {
    return new module.exports.Scule.classes.LIFOStack();
};

/**
 * Returns an instance of the {FIFOStack} class
 * @returns {FIFOStack}
 */
module.exports.getFIFOStack = function() {
    return new module.exports.Scule.classes.FIFOStack();
};

/**
 * Returns an instance of the {Queue} class
 * @returns {Queue}
 */
module.exports.getQueue = function() {
    return new module.exports.Scule.classes.Queue();
};

/**
 * Returns an instance of the {LRUCache} class
 * @param {Number} threshold
 * @returns {LRUCache}
 */
module.exports.getLRUCache = function(threshold) {
    return new module.exports.Scule.classes.LRUCache(threshold);
};

/**
 * Returns an instance of the {BPlusTree} class
 * @param {Number} order
 * @param {Number} threshold
 * @returns {BPlusTree}
 */
module.exports.getBPlusTree = function(order, threshold) {
    return new module.exports.Scule.classes.BPlusTree(order, threshold);
};

/**
 * Returns an instance of the {BPlusTreeNode} class
 * @returns {BPlusTreeNode}
 */
module.exports.getBPlusTreeNode = function() {
    return new module.exports.Scule.classes.BPlusTreeNode();
};

/**
 * Returns an instance of the {BPlusTreeLeafNode} class
 * @param {Null|BPlusTreeLeafNode} left
 * @param {Null|BPlusTreeLeafNode} right
 * @returns {BPlusTreeLeafNode}
 */
module.exports.getBPlusTreeLeafNode = function(left, right) {
    return new module.exports.Scule.classes.BPlusTreeLeafNode(left, right);
};

/**
 * Returns an instance of the {BPlusTreeInteriorNode} class
 * @returns {BPlusTreeInteriorNode}
 */
module.exports.getBPlusTreeInteriorNode = function() {
    return new module.exports.Scule.classes.BPlusTreeInteriorNode();
};

/**
 * Returns an instance of the {BinarySearchTreeNode} class
 * @param {String} key
 * @param {Mixed} data
 * @returns {BinarySearchTreeNode}
 */
module.exports.getBinarySearchTreeNode = function(key, data) {
    return new module.exports.Scule.classes.BinarySearchTreeNode(key, data);
};

/**
 * Returns an instance of the {BinarySearchTree} class
 * @returns {BinarySearchTree}
 */
module.exports.getBinarySearchTree = function() {
    return new module.exports.Scule.classes.BinarySearchTree();
};

/**
 * Returns an instance of the {AtomicCounter} class
 * @param {Integer} initial
 * @returns {AtomicCounter}
 */
module.exports.getAtomicCounter = function(initial) {
    return new module.exports.Scule.classes.AtomicCounter(initial);
};

/**
 * Returns an instance of the {BitSet} class
 * @param {Integer} capacity
 * @returns {BitSet}
 */
module.exports.getBitSet = function(capacity) {
    return new module.exports.Scule.classes.BitSet(capacity);
};

/**
 * Returns an instance of the {BloomFilter} class
 * @param {Integer} capacity
 * @returns {BloomFilter}
 */
module.exports.getBloomFilter = function(capacity) {
    return new module.exports.Scule.classes.BloomFilter(capacity);
};

module.exports.getQueryNormalizer = function() {
    return new module.exports.Scule.classes.QueryNormalizer();
};

module.exports.getIndexSelector = function() {
    return new module.exports.Scule.classes.IndexSelector();
};

module.exports.getQueryEngine = function() {
    return new module.exports.Scule.classes.QueryEngine();
};

module.exports.getQueryCompiler = function() {
    return new module.exports.Scule.classes.QueryCompiler();
};

module.exports.getQueryInterpreter = function() {
    return new module.exports.Scule.classes.QueryInterpreter();
};