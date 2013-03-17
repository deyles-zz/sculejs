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
 * @module com.scule.datastructures
 * @private
 * @type {Object}
 */
module.exports = {
    Scule: {
        classes: {},
        variables: {},
        $f: require(__dirname + '/com.scule.functions').Scule.functions
    }
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
 * Represents a singly linked list. The list is terminated by a null pointer.
 * @public
 * @constructor
 * @class {LinkedList}
 * @returns {Void}
 */
module.exports.Scule.classes.LinkedList = function () {

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
    this.getHead = function () {
        return this.head;
    };

    /**
     * Returns the tail element of the list
     * @public
     * @returns {LinkedListNode|null}
     */
    this.getTail = function () {
        return this.tail;
    };

    /**
     * Returns the number of elements in the list
     * @public
     * @returns {Number}
     */
    this.getLength = function () {
        return this.length;
    };

    /**
     * Returns a boolean value indicating whether or not the list is empty
     * @public
     * @returns {Boolean}
     */
    this.isEmpty = function () {
        return this.length === 0;
    };

    /**
     * Empties the list - setting head and tail to null and reseting the element count to 0
     * @public
     * @returns {Void}
     */
    this.clear = function () {
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
    this.get = function (idx) {
        if (idx < 0 || idx > this.length) {
            return null;
        } else if (idx === 0) {
            return this.head;
        }
        var curr = this.head;
        var i = 0;
        while (curr) {
            if (idx == i) {
                break;
            }
            i += 1;
            curr = curr.next;
        }
        return curr;
    };

    /**
     * Adds an element to the head of the list
     * @public
     * @param {Mixed} value the value to prepend to the list
     * @returns {Boolean}
     */
    this.prepend = function (value) {
        var temp = new module.exports.Scule.classes.LinkedListNode(null, value);
        if (this.head === null) {
            this.head = temp;
        } else {
            var curr = this.head;
            temp.next = curr;
            this.head = temp;
        }
        this.length = this.length + 1;
        return temp;        
    };

    /**
     * Adds an element to the tail of the list
     * @public
     * @param {Mixed} value the value to append to the list
     * @returns {LinkedListNode}
     */
    this.add = function (value) {
        var temp = new module.exports.Scule.classes.LinkedListNode(null, value);
        if (this.head === null) {
            this.head = temp;
        } else if (this.tail === null) {
            this.head.next = temp;
            this.tail = temp;
        } else {
            var curr = this.tail;
            curr.next = temp;
            this.tail = curr.next;
        }
        this.length = this.length + 1;
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
    this.search = function (value, key, cmp) {
        if (!cmp) {
            cmp = module.exports.Scule.$f.compare;
        }
        var curr = this.head;
        while (curr) {
            if (key) {
                if (cmp(curr.element[key], value) === 0) {
                    break;
                }
            } else {
                if (cmp(curr.element, value) === 0) {
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
    this.contains = function (value, cmp) {
        if (value === null) {
            return false;
        }
        if (!cmp) {
            cmp = module.exports.Scule.$f.compare;
        }

        var curr = this.head;
        while (curr) {
            if (cmp(curr.element, value) === 0) {
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
    this.split = function (idx) {
        var node;
        if (idx === undefined) {
            idx = Math.floor(this.length / 2);
            node = this.middle();
            if (!node) {
                return null;
            }
        } else {
            if (idx < 1 || idx > this.length) {
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
    this.middle = function () {
        if (!this.head) {
            return null;
        }
        var slow = this.head;
        var fast = this.head;
        while (fast.next && fast.next.next) {
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
    this.remove = function (idx) {
        if (idx < 0 || idx > this.length) {
            return null;
        }
        var curr;
        if (this.length === 1) { // only one node in the list - just remove that instead
            curr = this.head;
            this.clear();
        } else {
            var prev = this.get(idx - 1);
            if (prev.next == this.tail) { // we're just shifting the tail back one position
                curr = this.tail;
                this.tail = prev;
            } else { // otherwise we know it's a straight up deletion
                curr = prev.next;
                prev.next = prev.next.next;
            }
            this.length = this.length - 1;
        }
        return curr;
    };

    /**
     * Reverses the list
     * @public
     * @returns {Void}
     */
    this.reverse = function () { // CS101 - pay attention kids, Amazon will ask you this question one day
        var prev = null;
        var curr = this.head;
        var temp = null;
        while (curr) {
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
    this.toArray = function () {
        var nodes = [];
        var curr  = this.head;
        while (curr) {
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
    this.forEach = function (callback) {
        var curr = this.head;
        while (curr) {
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
    this.sort = function (cmp, key) {

        if (this.length < 2) { // empty or 1 element lists are already sorted
            return this;
        }

        if (!cmp) {
            cmp = module.exports.Scule.$f.compare;
        }

        var middle = function (node) {
            if (!node) {
                return node;
            }
            var slow = node;
            var fast = node;
            while (fast.next && fast.next.next) {
                slow = slow.next;
                fast = fast.next.next;
            }
            return slow;
        };

        var merge = function (left, right) {
            var head = {
                next: null
            };
            var curr = head;
            var a;
            var b;
            while (left && right) {
                if (key) {
                    a = right.element[key];
                    b = left.element[key];
                } else {
                    a = right.element;
                    b = left.element;
                }

                if (cmp(a, b) > -1) {
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

        var merge_sort = function (node) {
            if (!node || !node.next) {
                return node;
            }

            var m = middle(node);
            var s = m.next;
            m.next = null;
            return merge(merge_sort(node), merge_sort(s));
        };

        this.head = merge_sort(this.head);

    };

    /**
     * Removes the last entry from the list, shortening it by one
     * @public
     * @returns {DoublyLinkedListNode}
     */
    this.trim = function () {
        if (this.isEmpty()) {
            return null;
        }
        return this.remove(this.length - 1);
    };

};

/**
 * Class representing a doubly linked list
 * @public
 * @constructor
 * @class {DoublyLinkedList}
 * @returns {Void}
 */
module.exports.Scule.classes.DoublyLinkedList = function () {

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
    this.getHead = function () {
        return this.head;

    };

    /**
     * Returns the tail elements from the list
     * @public
     * @returns {DoublyLinkedListNode}
     */
    this.getTail = function () {
        return this.tail;

    };

    /**
     * Returns a boolean value indicating whether or not the list is empty
     * @public
     * @returns {Boolean}

     */

    this.isEmpty = function () {
        return this.length === 0;
    };

    /**
     * Returns the number of elements in the list
     * @public
     * @returns {Number}
     */

    this.getLength = function () {
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
    this.search = function (value, key, cmp) {
        if (!cmp) {
            cmp = module.exports.Scule.$f.compare;
        }

        var curr = this.head;
        while (curr) {
            if (key) {
                if (cmp(curr.element[key], value) === 0) {
                    break;
                }
            } else {
                if (cmp(curr.element, value) === 0) {
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
    this.contains = function (value, cmp) {
        if (value === null) {
            return false;
        }
        if (!cmp) {
            cmp = module.exports.Scule.$f.compare;
        }

        var curr = this.head;
        while (curr) {
            if (cmp(curr.element, value) === 0) {
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
    this.get = function (idx) {
        if (idx < 0 || idx > this.length) {
            return null;
        }
        if (idx === 0) {
            return this.head;
        }
        var curr = this.head;
        var i = 0;
        while (curr) {
            if (idx == i) {
                break;
            }
            i += 1;
            curr = curr.next;
        }
        return curr;
    };

    /**
     * Adds an element to the head of the list
     * @public
     * @param {Mixed} value the value to prepend to the list
     * @returns {DoublyLinkedListNode}
     */
    this.prepend = function (value) {
        var temp = new module.exports.Scule.classes.DoublyLinkedListNode(null, value);
        if (this.head === null) {
            this.head = temp;
        } else {
            var curr = this.head;
            temp.next = curr;
            curr.prev = temp;
            this.head = temp;
        }
        this.length = this.length + 1;
        return temp;        
    };

    /**
     * Adds an element to the end list
     * @public
     * @param {Mixed} value
     * @returns {DoublyLinkedListNode}
     */
    this.add = function (value) {
        var node = new module.exports.Scule.classes.DoublyLinkedListNode(null, null, value);
        if (this.isEmpty()) {
            this.head = node;
        } else if (!this.tail) {
            this.tail = node;
            this.tail.prev = this.head;
            this.head.next = node;
        } else {
            var curr = this.tail;
            curr.next = node;
            node.prev = curr;
            this.tail = node;
        }
        this.length = this.length + 1;
        return node;
    };

    /**
     * Removes the element at the provided index. If the index is out of range this function returns null.
     * @public
     * @param {Number} idx the index of the node to remove
     * @returns {LinkedListNode|null}
     */
    this.remove = function (idx) {
        if (idx < 0 || idx > this.length) {
            return null;
        }
        var curr;
        if (this.length === 1) { // only one node in the list - just remove that instead
            curr = this.head;
            this.clear();
        } else {
            var prev = this.get(idx - 1);
            if (prev.next == this.tail) { // we're just shifting the tail back one position
                curr = this.tail;
                this.tail = prev;
                this.tail.prev = curr.prev;
                this.tail.next = null;
            } else { // otherwise we know it's a straight up deletion
                curr = prev.next;
                prev.next = prev.next.next;
                if (prev.next) {
                    prev.next.prev = prev;
                }
            }
            this.length = this.length - 1;
        }
        // clean up pointers
        if (curr) {
            curr.detach();
        }
        return curr;
    };

    /**
     * Removes the last entry from the list, shortening it by one
     * @public
     * @returns {DoublyLinkedListNode}
     */
    this.trim = function () {
        if (this.isEmpty()) {
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
    this.split = function (idx) {
        var node;
        if (idx === undefined) {
            idx = Math.floor(this.length / 2);
            node = this.middle();
            if (!node) {
                return null;
            }
        } else {
            if (idx < 1 || idx > this.length) {
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
    this.middle = function () {
        if (!this.head) {
            return null;
        }
        var slow = this.head;
        var fast = this.head;
        while (fast.next && fast.next.next) {
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
    this.sort = function (cmp, key) {

        if (this.length < 2) { // empty or 1 element lists are already sorted
            return this;
        }

        if (!cmp) {
            cmp = module.exports.Scule.$f.compare;
        }

        var middle = function (node) {
            if (!node) {
                return node;
            }
            var slow = node;
            var fast = node;
            while (fast.next && fast.next.next) {
                slow = slow.next;
                fast = fast.next.next;
            }
            return slow;
        };

        var merge = function (left, right) {
            var head = {
                next: null
            };
            var curr = head;
            var a;
            var b;
            while (left && right) {
                if (key) {
                    a = right.element[key];
                    b = left.element[key];
                } else {
                    a = right.element;
                    b = left.element;
                }
                if (cmp(a, b) > -1) {
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

        var merge_sort = function (node) {
            if (!node || !node.next) {
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
    this.reverse = function () {
        var curr = this.head;
        var temp = null;
        while (curr) {
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
    this.prepend = function (value) {
        var node = new module.exports.Scule.classes.DoublyLinkedListNode(null, null, value);
        if (this.isEmpty()) {
            this.head = node;
        } else {
            var curr = this.head;
            this.head = node;
            curr.prev = this.head;
            this.head.next = curr;
            if (!this.tail) {
                this.tail = curr;
            }
        }
        this.length = this.length + 1;
        return node;
    };

    /**
     *  Empties the list
     *  @public
     *  @returns {Void}
     */
    this.clear = function () {
        this.head = null;
        this.tail = null;
        this.length = 0;
    };

    /**
     * Returns the contents of the list (values) as an array
     * @public
     * @returns {Array}
     */
    this.toArray = function () {
        var nodes = [];
        var curr  = this.head;
        while (curr) {
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
    this.forEach = function (callback) {
        var curr = this.head;
        while (curr) {
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
module.exports.Scule.classes.CachingLinkedList = function (threshold, cacheKey, list) {

    if (!cacheKey) {
        throw 'A valid cache key is required to use a CachingLinkedList';
    }

    if (!threshold) {
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

    if (!list) {
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
    this.clear = function () {
        this.cache.clear();
        this.list.clear();
    };

    /**
     * Removes the element at the provided index. If the index is out of range this function returns null.
     * @public
     * @param {Number} idx the index of the node to remove
     * @returns {LinkedListNode|null}
     */
    this.remove = function (idx) {

        var node = this.list.remove(idx);
        if (node) {
            this.cache.remove(node.element[this.cacheKey]);
        }
        return node;
    };

    /**
     * Returns the element at the (approximate) middle of the list - should execute in O(n/2) time and O(1) space
     * @public
     * @returns {LinkedListNode|null}
     */

    this.middle = function () {
        return this.list.middle();
    };

    /**
     * Splits the list at the given index
     * @public
     * @returns {LinkedList}
     */

    this.split = function () {
        this.cache.clear();
        return this.list.split();
    };

    /**
     * Adds an element to the end list
     * @public
     * @param {Mixed} value the value to add to the list
     * @returns {LinkedListNode|DoublyLinkedListNode}
     */

    this.add = function (value) {
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

    this.search = function (value) {
        if (this.cache.contains(value)) {
            return this.cache.get(value);

        }
        var node = this.list.search(value, this.cacheKey);
        if (node) {
            this.cache.put(node.element[this.cacheKey], node);
        }
        return node;
    };

    /**
     * Returns the number of elements in the list
     * @public
     * @returns {Number}
     */

    this.getLength = function () {
        return this.list.getLength();
    };

    /**
     * Returns the tail elements from the list
     * @public
     * @returns {LinkedListNode|DoublyLinkedListNode}
     */

    this.getTail = function () {
        return this.list.getTail();
    };

    /**
     * Returns the head elements from the list
     * @public
     * @returns {LinkedListNode|DoublyLinkedListNode}
     */

    this.getHead = function () {
        return this.list.getHead();
    };

    /**
     * Returns a boolean value indicating whether or not the list is empty
     * @public
     * @returns {Boolean}
     */

    this.isEmpty = function () {
        return this.list.isEmpty();

    };

    /**
     * Returns the element residing at the specified index. Returns null if none exists or index is out of range.
     * @public
     * @param {Number} idx the index of the node to return
     * @returns {Mixed|null}
     */

    this.get = function (idx) {
        return this.list.get(idx);

    };

    /**
     * Performs a linear scan to determine if a given value exists in the list
     * @public
     * @param {Mixed} value the value to search for in the list
     * @returns {Boolean}
     */

    this.contains = function (value) {
        return this.list.contains(value);
    };

    /**
     * Reverses the list
     * @public
     * @returns {Void}
     */
    this.reverse = function () {
        this.list.reverse();
    };

    /**
     * Performs an in place merge sort on the list, optionally taking a comparison function as a parameter
     * @public
     * @param {Function} cmp the comparison function to use during the merge step
     * @returns {Null}
     */

    this.sort = function (cmp) {
        this.list.sort(cmp, this.cacheKey);

    };

    /**
     * Returns the contents of the list (values) as an array
     * @public
     * @returns {Array}
     */
    this.toArray = function () {
        return this.list.toArray();
    };

    /**
     * Emulates the Array forEach prototype function
     * @public
     * @param {Function} callback the callback to execute at each step in the loop
     * @returns {Void}
     */
    this.forEach = function (callback) {
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
module.exports.Scule.classes.LinkedListNode = function (next, element) {

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
    this.getNext = function () {
        return this.next;
    };

    /**
     * Sets the next element in the list
     * @public
     * @param {LinkedListNode} next sets the right sibling for the node
     * @returns {Void}
     */
    this.setNext = function (next) {
        this.next = next;
    };

    /**
     * Returns the element value for the list node
     * @public
     * @returns {Mixed}
     */
    this.getElement = function () {
        return this.element;
    };

    /**
     * Sets the element value for the list node
     * @public
     * @param {Mixed} element sets the element value for the node
     * @returns {Void}
     */
    this.setElement = function (element) {
        this.element = element;
    };

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
module.exports.Scule.classes.DoublyLinkedListNode = function (prev, next, element) {

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
    this.getPrev = function () {
        return this.prev;
    };

    /**
     * Sets the previous element in the list
     * @public
     * @param {LinkedListNode} prev sets the left sibling for the node
     * @returns {Void}
     */
    this.setPrev = function (prev) {
        this.prev = prev;
    };

    /**
     * Nulls out the prev and next pointers on the node
     * @public
     * @returns {Void}
     */
    this.detach = function () {
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
module.exports.Scule.classes.LRUCache = function (threshold) {

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
    this.contains = function (key) {
        return this.cache.contains(key);
    };

    /**
     * Removes an entry from the cache, returns null if the entry doesn't exist
     * @public
     * @param {String} key the key to use when removing a value from the cache
     * @returns {Null|boolean}
     */
    this.remove = function (key) {
        if (!this.cache.contains(key)) {
            return null;
        }

        var entry = this.cache.get(key);
        this.cache.remove(key);

        var prev = entry.node.prev;
        var next = entry.node.next;
        if (prev) {
            prev.next = next;
        }
        if (next) {
            next.prev = prev;
        }
        entry.node.detach();
        this.queue.length = this.queue.length - 1;
        return true;
    };

    /**
     *  Returns an entry from the cache for the given key, returns null if no entry exists
     *  @public
     *  @param {Mixed} key the key to use when retrieving a value from the cache
     *  @returns {Mixed|null}
     */
    this.get = function (key) {
        if (!this.cache.contains(key)) {
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
    this.put = function (key, value) {
        var entry;
        if (this.cache.contains(key)) {
            // if the entry exists in the cache update it and move it to the head of the priority queue
            entry = this.cache.get(key);
            entry.value = value;
            entry.node.element = {
                key: key,
                value: value
            };
            entry.requeue(this.queue);
        } else {
            // otherwise we add it to the head of the queue
            entry = new module.exports.Scule.classes.LRUCacheEntry(key, value, this.queue.prepend({
                key: key,
                value: value
            }));
            this.cache.put(key, entry);
        }
        // trim stale cache entries if we've reached our threshold
        if (this.queue.length > this.threshold) {
            var o = this.queue.trim();
            if (!this.cache.remove(o.getElement().key)) {
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
    this.getLength = function () {
        return this.cache.getLength();
    };

    /**
     * Clears the LRU cache
     * @public
     * @returns {Void}
     */
    this.clear = function () {
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
module.exports.Scule.classes.LRUCacheEntry = function (key, value, node) {

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
    this.getKey = function () {
        return this.key;

    };

    /**
     * Returns the value for the cache entry
     * @public
     * @returns {Mixed}
     */
    this.getValue = function () {
        return this.value;
    };

    /**
     * Return the linked list node for the entry
     * @public
     * @returns {LinkedListNode}
     */
    this.getNode = function () {
        return this.node;
    };

    /**
     * Re-queues the node for the list entry (moving it to the head of the priority queue)
     * @public
     * @param {DoublyLinkedList} queue the node to re-queue
     * @returns {Void}
     */
    this.requeue = function (queue) {
        if (!this.node.prev) { // already at the head of the queue
            return;
        }
        // no some magic pointer switching
        var prev = this.node.prev;
        var next = this.node.next;
        prev.next = next;
        if (next) {
            next.prev = prev;
        }
        // clean up the pointers for the current node
        this.node.detach();
        queue.length = queue.length - 1;
        // requeue the cache entry
        this.node = queue.prepend({
            key:   this.key,
            value: this.value
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
module.exports.Scule.classes.LIFOStack = function () {

    module.exports.Scule.classes.LinkedList.call(this);

    /**
     * Pushes a new node to the head of the stack
     * @public
     * @param {Mixed} value the element value for the new node
     * @returns {Void}
     */
    this.push = function (value) {
        this.prepend(value);
    };

    /**
     * Pops the head element value off the stack, returns null if the stack is empty
     * @public
     * @returns {Mixed|null}
     */
    this.pop = function () {
        if (this.isEmpty()) {
            return null;
        }
        var curr = this.head;
        this.head = curr.next;
        this.length = this.length - 1;
        curr.next = null;
        return curr.getElement();
    };

    /**
     * Returns the head element value without mutating the stack, returns null of the stack is empty
     * @public
     * @returns {Mixed|null}
     */
    this.peek = function () {
        if (this.isEmpty()) {
            return null;
        }
        return this.head.getElement();
    };

};

/**
 * Represents a FIFO stack
 * @public
 * @constructor
 * @class {FIFOStack}
 * @extends {LIFOStack}
 * @returns {Void}
 */
module.exports.Scule.classes.FIFOStack = function () {

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
    this.pop = function () {
        if (this.isEmpty()) {
            return null;
        }
        var curr = this.head;
        this.head = curr.next;
        this.length = this.length - 1;
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
module.exports.Scule.classes.Queue = function () {

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
module.exports.Scule.classes.HashMap = function (size) {

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

    this.hash = module.exports.Scule.variables.djb2_hash;

    /**
     * Rebuilds the table
     * @private
     * @returns {Void}
     */
    this.retable = function () {
        var factor = this.length / this.size;
        if (this.length >= this.buckets && factor < 0.7) {
            return;
        }
        var elements = this.toArray();
        var i = 0;
        this.clear();
        this.size = this.size * 2;
        for (i = 0; i < elements.length; i++) {
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
    this.bucket = function (key) {
        if (!this.table[key]) {
            this.buckets += 1;
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
    this.put = function (key, value) {
        var k = this.hash(key, this.size);
        var b = this.bucket(k);
        var r = b.insert(key, value);
        if (r) {
            this.length += 1;
            if (b.getLength() % 10 === 0) {
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
    this.contains = function (key) {
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
    this.get = function (key) {
        var k = this.hash(key, this.size);
        var b = this.bucket(k);
        var v = b.search(key);
        if (v === null) {
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
    this.search = function (key) {
        return this.get(key);
    };

    /**
     * Removes a key/value pair from the table
     * @public
     * @returns {Boolean}
     */
    this.remove = function (key) {
        var k = this.hash(key, this.size);
        var b = this.bucket(k);
        if (b.remove(key)) {
            this.length = this.length - 1;
            this.retable();
            return true;
        }
        return false;
    };

    /**
     * Empties the table
     * @public
     * @returns {Void}
     */
    this.clear = function () {
        this.table   = [];
        this.length  = 0;
        this.buckets = 0;
    };

    /**
     * Returns the length of the table as an integer
     * @public
     * @returns {Number}
     */
    this.getLength = function () {
        return this.length;
    };

    /**
     * Returns an {Array} containing all keys in the table
     * @public
     * @returns {Array}
     */
    this.getKeys = function () {
        var keys = [];
        var getKeys = function (node) {
            if (node === null) {
                return;
            }
            keys.push(node.getKey());
            getKeys(node.getLeft());
            getKeys(node.getRight());
        };
        this.table.forEach(function (bucket) {
            if (!bucket) {
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
    this.getValues = function () {
        var values = [];
        var getValues = function (node) {
            if (node === null) {
                return;
            }
            values.push(node.getData());
            getValues(node.getLeft());
            getValues(node.getRight());
        };
        this.table.forEach(function (bucket) {
            if (!bucket) {
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
    this.toArray = function () {
        var array = [];
        this.table.forEach(function (bucket) {
            if (!bucket) {
                return;
            }
            array = array.concat(bucket.toArray());
        });
        return array;
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
module.exports.Scule.classes.HashTable = function () {

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
    this.put = function (key, value) {
        if (!this.contains(key)) {
            this.length += 1;
        }
        this.table[key] = value;
    };

    /**
     * Returns the value for a given key, returns null if no matching key exists
     * @public
     * @param {Mixed} key the key to use when searching the table
     * @returns {Mixed|null}
     */
    this.get = function (key) {
        if (this.contains(key)) {
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
    this.search = function (key) {
        return this.get(key);
    };

    /**
     * Removes a key, value mapping from the table, returns a boolean signfiying success or failure
     * @public
     * @param {Mixed} key the key to use when removing a value from the table
     * @returns {Boolean}
     */
    this.remove = function (key) {
        if (this.contains(key)) {
            delete this.table[key];
            this.length = this.length - 1;
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
    this.contains = function (key) {
        return this.table.hasOwnProperty(key);
    };

    /**
     * Empties the table
     * @public
     * @returns {Void}
     */
    this.clear = function () {
        this.table = {};
        this.length = 0;
    };

    /**
     * Returns the number of elements in the table as an integer
     * @public
     * @returns {Number}
     */
    this.getLength = function () {
        return this.length;
    };

    /**
     * Returns an array containing all keys in the table
     * @public
     * @returns {Array}
     */
    this.getKeys = function () {
        var keys = [];
        var ky = null;
        for (ky in this.table) {
            if (this.table.hasOwnProperty(ky)) {
                keys.push(ky);
            }
        }
        return keys;
    };

    /**
     * Returns an array containing all values in the table
     * @public
     * @returns {Array}
     */
    this.getValues = function () {
        var values = [];
        var ky = null;
        for (ky in this.table) {
            if (this.table.hasOwnProperty(ky)) {
                values.push(this.table[ky]);
            }
        }
        return values;
    };

    /**
     * Returns the contents of the HashTable as an associative array
     * @returns {Array}
     */
    this.toArray = function () {
        var a = [];
        var ky = null;
        for (ky in this.table) {
            if (this.table.hasOwnProperty(ky)) {
                a[ky] = this.table[ky];
            }
        }

        return a;
    };

};

/**
 * Represents the base class for a B+Tree node
 * @public
 * @constructor
 * @class {BPlusTreeNode}
 * @returns {Void}
 */
module.exports.Scule.classes.BPlusTreeNode = function () {

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
    this.getOrder = function () {
        return this.order;
    };

    /**
     * Sets the order (block size) for the node
     * @public
     * @param {Number} order the order for the node
     * @returns {Void}
     */
    this.setOrder = function (order) {
        this.order = order;
    };

    /**
     * Returns the merge threshold for the node
     * @public
     * @returns {Number}
     */

    this.getMergeThreshold = function () {
        return this.threshold;
    };

    /**
     * Sets the merge threshold for the node
     * @public
     * @param {Number} threshold the merge threshold for the node
     * @returns {Void}
     */

    this.setMergeThreshold = function (threshold) {
        this.threshold = threshold;
    };

    /**
     * Returns a boolean value indicating whether or not the node is a leaf node
     * @returns {Boolean}
     */
    this.isLeaf = function () {
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
module.exports.Scule.classes.BPlusTreeLeafNode = function (left, right) {

    module.exports.Scule.classes.BPlusTreeNode.call(this, left, right);

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
    this.getRight = function () {
        return this.right;
    };

    /**
     * Sets the right sibling for the node
     * @public
     * @param {BPlusTreeLeafNode} right the right sibling for the node
     * @returns {Void}
     */
    this.setRight = function (right) {
        this.right = right;
    };

    /**
     * Returns the left sibling for the node
     * @public
     * @returns {Null|BPlusTreeLeafNode}
     */
    this.getLeft = function () {
        return this.left;
    };

    /**
     * Sets the left sibling for the node
     * @public
     * @param {BPlusTreeLeafNode} left the left sibling for the node
     * @returns {Void}
     */
    this.setLeft = function (left) {
        this.left = left;
    };

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
    this.search = function (key) {
        var element = this.lookup.get(key);
        if (!element) {
            element = this.sequentialSearch(key);
            if (element) {
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
    this.sequentialSearch = function (key) {
        var index = this.indexSearch(key);
        var element = this.data[index];
        if (index < this.data.length && element.key == key) {
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
    this.indexSearch = function (key) {
        var data = this.data;
        if (data.length === 0) {
            return 0;
        }
        var left   = 0;
        var right  = this.data.length - 1;
        var middle = left + Math.floor((right - left) / 2);
        var found  = false;

        do {
            middle = left + Math.floor((right - left) / 2);
            if (data[middle].key < key) {
                left = middle + 1;
            } else if (data[middle].key > key) {
                right = middle;
            } else {
                found = true;
            }
        } while (left < right && !found);
        if (found) {
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
    this.identifySiblings = function (parent) {
        var siblings = {
            index: null,
            left: null,
            key: null,
            right: null
        };
        var right = this.getRight();
        var left  = this.getLeft();
        var i = 0;
        for (i = 0; i < parent.data.length; i = i + 2) {
            var node = parent.data[i];
            if (node == right) {
                siblings.right = right;
                siblings.index = i - 2;
                siblings.right_key = parent.data[i - 1];
                siblings.right_key_index = i - 1;
            }
            if (node == left) {
                siblings.left = left;
                siblings.index = i + 2;
                siblings.left_key = parent.data[i + 1];
                siblings.left_key_index = i + 1;
            }
        }
        if (siblings.index === null) {
            siblings.index = (i >= 2) ? i - 2 : 0;
        }
        return siblings;
    };

    /**
     * Returns the keys for this node as an array
     * @public
     * @returns {Array}
     */
    this.getKeys = function () {
        var keys = [];
        this.data.forEach(function (element) {
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
    this.insert = function (key, value) {
        var index = this.indexSearch(key);
        if (index == this.data.length) {
            this.data.push({
                key: key,
                value: value
            });
        } else {
            var element = this.data[index];
            if (element.key == key) {
                element.value = value;
            } else if (element.key < key) {
                this.data.splice(index + 1, 0, {
                    key: key,
                    value: value
                });
            } else {
                this.data.splice(index, 0, {
                    key: key,
                    value: value
                });
            }
        }
        this.lookup.put(key, {
            key: key,
            value: value
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
    this.remove = function (key, parent) {
        var index   = this.indexSearch(key);
        var element = this.data[index];

        if (index < this.data.length && element.key == key) {
            this.data.splice(index, 1);
            this.lookup.remove(key);
            if (!parent) {
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
    this.redistribute = function (oldkey, parent) {
        if (this.data.length > this.threshold) {
            return {
                operation: 2,
                oldkey: oldkey,
                key: this.data[0].key
            };
        }
        var siblings = this.identifySiblings(parent);
        var deficit = this.threshold - this.data.length;
        var sibling, key;
        var left = false;

        if (siblings.left) {
            sibling = siblings.left;
            key = siblings.left_key;
            left = true;
            if (sibling.data.length - deficit >= this.threshold) {
                this.data = sibling.data.splice(deficit * -1, deficit).concat(this.data);
                this.lookup.clear();
                return {
                    key: this.data[0].key,
                    oldkey: siblings.left_key,
                    index: siblings.left_key_index,
                    operation: 0
                };
            }

        }

        if (siblings.right) {
            sibling = siblings.right;
            key = siblings.right_key;
            left = false;
            if (sibling.data.length - deficit >= this.threshold) {

                this.data = this.data.concat(sibling.data.splice(0, deficit));
                this.lookup.clear();
                return {
                    key: sibling.data[0].key,
                    oldkey: siblings.right_key,
                    index: siblings.right_key_index,
                    operation: 0
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
    this.merge = function (sibling, index, oldkey, isleft)  {
        if (this.data.length > this.threshold) {
            return null;
        }

        if (!sibling) { // PANIC! this condition should never be met
            throw 'Unable to merge - no siblings';
        }

        if (isleft) {
            sibling.data = sibling.data.concat(this.data.splice(0, this.data.length));
            sibling.setRight(this.getRight());
            if (sibling.getRight()) {
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
            if (sibling.getLeft()) {
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
    this.range = function (min, max, includeMin, includeMax) {
        if (includeMax === undefined) {
            includeMax = false;
        }
        if (includeMin === undefined) {
            includeMin = false;
        }
        if (min === undefined) {
            min = null;
        }
        if (max === undefined) {
            max = null;
        }

        var curr  = this;
        var rng   = null;
        if (includeMin && includeMax) {
            rng = function (min, max, key, range, value) {
                if (min === null) {
                    if (key <= max) {
                        range = range.concat(value);
                    }
                } else if (max === null) {
                    if (key >= min) {
                        range = range.concat(value);
                    }
                } else {
                    if (key >= min && key <= max) {
                        range = range.concat(value);
                    }
                }
                return range;
            };
        } else if (includeMin) {
            rng = function (min, max, key, range, value) {
                if (min === null) {
                    if (key < max) {
                        range = range.concat(value);
                    }
                } else if (max === null) {
                    if (key >= min) {
                        range = range.concat(value);
                    }
                } else {
                    if (key >= min && key < max) {
                        range = range.concat(value);
                    }
                }
                return range;
            };
        } else { // includeMax
            rng = function (min, max, key, range, value) {
                if (min === null) {
                    if (key <= max) {
                        range = range.concat(value);
                    }
                } else if (max === null) {
                    if (key > min) {
                        range = range.concat(value);
                    }
                } else {
                    if (key > min && key <= max) {
                        range = range.concat(value);
                    }
                }
                return range;
            };

        }
        var range = [];
            outer:
            while (curr) {
                var data  = curr.data;
                var left  = curr.indexSearch(min);
                var right = (max === null || max === undefined) ? (data.length - 1) : curr.indexSearch(max);
                if (right >= data.length) {
                    right = data.length - 1;
                }
                if (left <= data.length) {
                    var i = null;
                    for (i = left; i <= right; i++) {
                        if (max !== null && data[i].key > max) {
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
    this.split = function () {
        if (this.data.length <= this.order) {
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
        if (this.getLeft()) {
            this.getLeft().setRight(left);
        }

        right.setLeft(left);
        if (this.getRight()) {
            this.getRight().setLeft(right);
        }

        return {
            left: left,
            key: right.data[0].key,
            right: right
        };
    };

    /**
     * Returns a string representation of the node object
     * @public
     * @returns {String}
     */
    this.toString = function () {
        return JSON.stringify(this.toArray(), null, "\t");
    };

    /**
     * Returns an array based representation of the node object
     * @public
     * @returns {Array}
     */
    this.toArray = function () {
        var o = {
            type: 'leaf'
        };
        var i = null;
        for (i = 0; i < this.data.length; i++) {
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
module.exports.Scule.classes.BPlusTreeInteriorNode = function () {

    module.exports.Scule.classes.BPlusTreeNode.call(this);

    /**
     * @private
     * @type {Boolean}
     */
    this.leaf  = false;

    /**
     * Returns the index of the nearest node for a given key
     * @private
     * @param {Mixed} key the key to search for
     * @returns {Number}
     */
    this.nodeSearch = function (key) {
        var len = this.data.length;
        var i = null;
        for (i = 1; i < len; i = i + 2) {
            var ky = this.data[i];
            if (ky == key) {
                return i + 1;
            } else if (ky >= key) {
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
    this.indexSearch = function (key) {
        var len = this.data.length;
        var i = null;
        for (i = 1; i < len; i = i + 2) {
            var ky = this.data[i];
            if (ky == key) {
                return i;
            } else if (ky >= key) {
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
    this.childSearch = function (key) {
        if (this.data.length === 0) {
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
    this.search = function (key) {
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
    this.range = function (min, max, includeMin, includeMax) {
        return this.childSearch(min).range(min, max, includeMin, includeMax);
    };

    /**
     * Inserts a key/value pair into the data for the node
     * @public
     * @param {Mixed} key the key to insert
     * @param {Mixed} value the value to insert
     * @returns {Null|Object}
     */

    this.insert = function (key, value) {
        var index = this.indexSearch(key);
        if (this.data[index] > key) {
            index = index - 1;
        } else {
            index += 1;
        }
        var node  = this.data[index];
        var split = node.insert(key, value);
        if (split) {
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

    this.split = function () {
        var len = Math.floor((this.data.length - 1) / 2);
        if (len < this.order) {
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
            left: left,
            key: this.data[0],
            right: right
        };
    };

    /**
     * Removes a key from the node data
     * @public
     * @param {Mixed} key the key to remove
     * @param {BPlusTreeInteriorNode} parent the parent for the node
     * @returns {Null|object}
     */

    this.remove = function (key, parent) {
        var index = this.indexSearch(key);
        var eindex = index;

        if (this.data[index] > key) {
            eindex = index - 1;
        } else {
            eindex = index + 1;
        }

        var node  = this.data[eindex];

        var result = node.remove(key, this);
        if (!result) {
            return null;
        }
        switch (result.operation) {
            case 0: // redistribution
                break;

            case 1: // merge
                if (this.data.length == 3) {
                    return result.node;
                }
                var collapseIndex = result.index;
                if (result.left) {
                    collapseIndex = result.index - 2;
                }
                this.data.splice(collapseIndex, 3, result.node);
                break;

            case 2: // bubbling a new key up the tree to replace the removed one
                var replaced = false;
                var i = null;
                for (i = 1; i < this.data.length; i = i + 2) {
                    if (this.data[i] == result.oldkey) {
                        this.data[i] = result.key;
                        replaced = true;
                    }
                }
                if (!replaced) {
                    if (!parent) {
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
    this.reassignKeys = function () {
        var i = null;
        for (i = 2; i < this.data.length; i = i + 2) {
            if (this.data[i].isLeaf()) {
                this.data[i - 1] = this.data[i].data[0].key;
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
    this.merge = function (parent, key, oldkey) {
        if (!parent) {
            return null;
        }
        var len = Math.floor((this.data.length - 1) / 2);
        if (len >= (this.threshold - 1)) {
            return {
                key: key,
                oldkey: oldkey,
                operation: 2
            };
        }

        var index, pkey, sibling;
        var left = false;
        var i = 0;
        for (i = 0; i < parent.data.length; i = i+2) {
            if (parent.data[i] == this) {
                if (i === 0 || i < parent.data.length - 1) {
                    sibling = parent.data[i+2];
                    index = i + 1;
                } else {
                    left = true;
                    sibling = parent.data[i - 2];
                    index = i - 1;
                }
                break;
            }
        }
        pkey = parent.data[index];

        var node = new module.exports.Scule.classes.BPlusTreeInteriorNode();
        node.setOrder(this.getOrder());
        node.setMergeThreshold(this.getMergeThreshold());

        if (left) {
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
    this.toString = function () {
        return JSON.stringify(this.toArray(), null, "\t");
    };

    /**
     * Returns an array representation of the node
     * @public
     * @returns {Array}
     */
    this.toArray = function () {

        var o = {
            type:'interior'
        };
        var i = 0;
        var j=1;
        while (j < this.data.length) {
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
module.exports.Scule.classes.BPlusTree = function (order, threshold) {

    if (!order) {
        order = 100;

    }

    if (!threshold) {
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
    this.insert = function (key, value) {
        var split = this.root.insert(key, value);
        if (split) {
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
    this.search = function (key) {
        return this.root.search(key);
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
    this.range = function (min, max, includeMin, includeMax) {
        return this.root.range(min, max, includeMin, includeMax);
    };

    /**
     * Removes a key (and all associated values) from the tree
     * @public
     * @param {Mixed} key the key to remove
     * @returns {Boolean}
     */
    this.remove = function (key) {
        var node = this.root.remove(key);
        if (node) {
            this.root = node;
        }
        return true;
    };

    /**
     * Resets the root node for the tree to a new instance of BPlusTreeLeadNode
     * @public
     * @returns {Void}
     */
    this.clear = function () {
        this.root = new module.exports.Scule.classes.BPlusTreeLeafNode();
        this.root.setOrder(this.order);
        this.root.setMergeThreshold(this.threshold);

    };

    /**
     * Returns a string representation of the tree
     * @public
     * @returns {String}
     */
    this.toString = function () {
        return this.root.toString();
    };

    /**
     * Returns an Array representation of the tree
     * @public
     * @returns {Array}
     */
    this.toArray = function () {
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
module.exports.Scule.classes.BinarySearchTreeNode = function (key, data) {

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
    this.setParent = function (parent) {
        this.parent = parent;
    };

    /**
     * Returns the parent for the node
     * @public
     * @returns {BinarySearchTreeNode|null}
     */
    this.getParent = function () {
        return this.parent;
    };

    /**
     * Sets the left child for the node
     * @public
     * @param {BinarySearchTreeNode} left the new left sibling for the node
     * @returns {Void}
     */
    this.setLeft = function (left) {
        if (!left) {
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
    this.getLeft = function () {
        return this.left;
    };

    /**
     * Sets the right child for the node
     * @public
     * @param {BinarySearchTreeNode} right the new right sibling for the node
     * @returns {Void}
     */
    this.setRight = function (right) {
        if (!right) {
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

    this.getRight = function () {
        return this.right;
    };

    /**
     * Returns the key for the node
     * @public
     * @returns {Mixed}
     */
    this.getKey = function () {
        return this.key;
    };

    /**
     * Sets the data for the node
     * @public
     * @param {Mixed} data the new data for the node
     * @returns {Void}
     */
    this.setData = function (data) {
        this.data = data;
    };

    /**
     * Returns the data for the node
     * @public
     * @returns {Mixed}
     */
    this.getData = function () {
        return this.data;
    };

    /**
     * Sets the data for the node to null
     * @public
     * @returns {Void}
     */
    this.clear = function () {
        this.data = null;
    };

    /**
     * Removes the provided child from the node - shifting node to rebalance the tree
     * @public
     * @param {BinarySearchTreeNode} child the child to remove from the node
     * @returns {Boolean}
     */
    this.remove = function (child) {
        if (!child) {
            return false;
        }
        if (child == this.right) {
            this.setRight(child.getRight());
            this.getRight().setLeft(child.getLeft());
            child.parent = null;
            child.left   = null;
            child.right  = null;
            return true;
        } else if (child == this.left) {
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
module.exports.Scule.classes.BinarySearchTree = function () {

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
    this.insert = function (key, data) {
        var self = this;
        var node = new module.exports.Scule.classes.BinarySearchTreeNode(key, data);
        if (this.root === null) {
            this.length += 1;
            this.root = node;
            return true;
        }
        var insrt = function (node, parent) {
            if (node.getKey() == parent.getKey()) {
                parent.setData(node.getData());
                return false;
            }
            if (node.getKey() <= parent.getKey()) {
                if (!parent.getLeft()) {
                    self.length += 1;
                    parent.setLeft(node);
                } else {
                    insrt(node, parent.getLeft());
                }
            } else {
                if (!parent.getRight()) {
                    self.length += 1;
                    parent.setRight(node);
                } else {
                    insrt(node, parent.getRight());
                }
            }
            return true;
        };
        return insrt(node, this.root);
    };

    /**
     * Recursively searches the tree for the provided key, returning the corresponding node if found
     * @public
     * @param {Mixed} key the key to search for
     * @returns {BinarySearchTreeNode|null}
     */
    this.search = function (key) {
        var srch = function (key, node) {
            if (!node) {
                return null;
            }
            if (node.getKey() == key) {
                return node;
            } else if (node.getKey() > key) {
                return srch(key, node.getLeft());
            } else {
                return srch(key, node.getRight());
            }

        };
        return srch(key, this.root);
    };

    /**
     * Removes the first instance of a key from the tree
     * @public
     * @param {Mixed} key the key to remove
     * @returns {Boolean}
     */
    this.remove = function (key) {
        var node = this.search(key);
        if (!node) {
            return false;
        }
        if (!node.getParent()) {
            if (node.getRight()) {
                this.root = node.getRight();
                this.root.setLeft(node.getLeft());
            } else if (node.getLeft()) {
                this.root = node.getRight();
                this.root.setLeft(node.getLeft());
            } else {
                this.root = null;
            }
            this.length = this.length - 1;
            return true;
        }
        var r = node.getParent().remove(node);
        if (r) {
            this.length = this.length - 1;
        }
        return r;
    };

    /**
     * Balances the tree in place
     * @public
     * @returns {Void}
     */
    this.balance = function () {
        var self    = this;
        var list    = this.toArray();
        var rebuild = function (list) {
            var left   = list;
            var right  = list.splice(Math.ceil(list.length/2), list.length);
            var middle = left.pop();
            self.insert(middle[0], middle[1]);
            if (left.length > 0) {
                rebuild(left);
            }
            if (right.length > 0) {
                rebuild(right);
            }
        };
        this.length = 0;
        this.root   = null;
        rebuild(list);
    };

    this.clear = function () {
        this.root = null;
        this.length = 0;
    };

    /**
     * @public
     * @returns {Number}
     */
    this.getLength = function () {
        return this.length;
    };

    /**
     * Returns the nodes of the tree as an array of arrays containing key at index 0 and data at index 1.
     * Due to the nature of binary trees the returned list is intrinsically sorted in ascending order by key.
     * @public
     * @returns {Array}
     */
    this.toArray = function () {
        var flatten = function (node) {
            if (!node) {
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
    this.getRoot = function () {
        return this.root;
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

    if (!module.exports.Scule.$f.isInteger(initial)) {
        throw "Unable to initialize counter with non-integer value";
    }

    this.count = parseInt(initial);

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
        if (!module.exports.Scule.$f.isInteger(value)) {
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
        if (!module.exports.Scule.$f.isInteger(value)) {
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

    this.clear = function() {
        this.count = 0;
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
  
    if (capacity === undefined || !module.exports.Scule.$f.isInteger(capacity) || capacity <= 0) {
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
    this.unset = function(index) {
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
        
    if (m === undefined || !module.exports.Scule.$f.isInteger(m) || m <= 0) {
        throw "Unable to initialize bloom filter with non-integer m";
    }    

    if (k === undefined || !module.exports.Scule.$f.isInteger(k) || k <= 0) {
        k = Math.floor(m/Math.ceil(m/3));
    }    

    module.exports.Scule.classes.BitSet.call(this, m);
    
    this.k = k;
    this.f = [];
    
    for (var i=0; i < this.k; i++) {
        this.f.push([
            module.exports.Scule.$f.randomFromTo(0, 999999),
            module.exports.Scule.$f.randomFromTo(0, 999999)
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
 * Returns an instance of the {LinkedList} class
 * @returns {LinkedList}
 */
module.exports.getLinkedList = function () {
    return new module.exports.Scule.classes.LinkedList();
};

/**
 * Returns an instance of the {CachingLinkedList} class
 * @see {LinkedList}
 * @param {Number} threshold
 * @param {String} cacheKey
 * @returns {CachingLinkedList}
 */
module.exports.getCachingLinkedList = function (threshold, cacheKey) {
    return new module.exports.Scule.classes.CachingLinkedList(threshold, cacheKey);
};

/**
 * Returns an instance of the {DoublyLinkedList} class
 * @returns {DoublyLinkedList}
 */
module.exports.getDoublyLinkedList = function () {
    return new module.exports.Scule.classes.DoublyLinkedList();
};

/**
 * Returns an instance of the {HashTable} class
 * @returns {HashTable}
 */
module.exports.getHashTable = function () {
    return new module.exports.Scule.classes.HashTable();
};

/**
 * Returns an instance of the {HashMap} class
 * @param {Number} size the table size
 * @returns {HashMap}
 */
module.exports.getHashMap = function (size) {
    return new module.exports.Scule.classes.HashMap(size);
};

/**
 * Returns an instance of the {LIFOStack} class
 * @returns {LIFOStack}
 */
module.exports.getLIFOStack = function () {
    return new module.exports.Scule.classes.LIFOStack();
};

/**
 * Returns an instance of the {FIFOStack} class
 * @returns {FIFOStack}
 */
module.exports.getFIFOStack = function () {
    return new module.exports.Scule.classes.FIFOStack();
};

/**
 * Returns an instance of the {Queue} class
 * @returns {Queue}
 */
module.exports.getQueue = function () {
    return new module.exports.Scule.classes.Queue();
};

/**
 * Returns an instance of the {LRUCache} class
 * @param {Number} threshold
 * @returns {LRUCache}
 */
module.exports.getLRUCache = function (threshold) {
    return new module.exports.Scule.classes.LRUCache(threshold);
};

/**
 * Returns an instance of the {BPlusTree} class
 * @param {Number} order
 * @param {Number} threshold
 * @returns {BPlusTree}
 */
module.exports.getBPlusTree = function (order, threshold) {
    return new module.exports.Scule.classes.BPlusTree(order, threshold);
};

/**
 * Returns an instance of the {BPlusTreeNode} class
 * @returns {BPlusTreeNode}
 */
module.exports.getBPlusTreeNode = function () {
    return new module.exports.Scule.classes.BPlusTreeNode();
};

/**
 * Returns an instance of the {BPlusTreeLeafNode} class
 * @param {Null|BPlusTreeLeafNode} left
 * @param {Null|BPlusTreeLeafNode} right
 * @returns {BPlusTreeLeafNode}
 */
module.exports.getBPlusTreeLeafNode = function (left, right) {
    return new module.exports.Scule.classes.BPlusTreeLeafNode(left, right);
};

/**
 * Returns an instance of the {BPlusTreeInteriorNode} class
 * @returns {BPlusTreeInteriorNode}
 */
module.exports.getBPlusTreeInteriorNode = function () {
    return new module.exports.Scule.classes.BPlusTreeInteriorNode();
};

/**
 * Returns an instance of the {BinarySearchTreeNode} class
 * @param {String} key
 * @param {Mixed} data
 * @returns {BinarySearchTreeNode}
 */
module.exports.getBinarySearchTreeNode = function (key, data) {
    return new module.exports.Scule.classes.BinarySearchTreeNode(key, data);
};

/**
 * Returns an instance of the {BinarySearchTree} class
 * @returns {BinarySearchTree}
 */
module.exports.getBinarySearchTree = function () {
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