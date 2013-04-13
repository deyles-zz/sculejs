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
 * @module com.scule.db
 */

/**
 * External modules
 */
var md5 = {
    m: require('crypto'),
    hash: function (s) {
        return this.m.createHash('md5').update(s).digest('hex');
    }
};

var sha1 = {
    m: require('crypto'),
    hash: function (s) {
        return this.m.createHash('sha1').update(s).digest('hex');
    }
};

/**
 * Global module namespace
 * @private
 * @type {Object}
 */
module.exports = {
    Scule:{
        functions:{},
        classes:{},
        objects:{
            core:{
                collections:{}
            }
        },
        plugins:{},
        engines:{},
        constants:require(__dirname + '/com.scule.constants'),
        $f:require(__dirname + '/com.scule.functions').Scule.functions,
        $d:require(__dirname + '/com.scule.datastructures'),
        $i:require(__dirname + '/com.scule.query.interpreter')
    }
};

/**
 * @private
 */
module.exports.Scule.$c = module.exports.Scule.constants;

/**
 * Name for globally referenced variables - should be considered STATIC and FINAL
 * @type {Object}
 * @private
 */
module.exports.Scule.variables = {
    debug: false
};

/**
 * Represents a "bucketed" hash table, entries are added to the bucket corresponding to the provided key.
 * Buckets are keyed by ObjectId.
 * @public
 * @extends {HashTable}
 * @class {HashBucketTable}
 * @constructor
 */
module.exports.Scule.classes.HashBucketTable = function () {
  
    module.exports.Scule.$d.Scule.classes.HashTable.call(this);

    /**
     * Adds a new entry corresponding to the bucket corresponding to the provided key
     * @public
     * @param {Mixed} key the key to insert
     * @param {Mixed} value the value corresponding to the provided key
     * @returns {Boolean}
     */
    this.insert = function (key, value) {
        var table;
        if (!this.contains(key)) {
            table = module.exports.Scule.$d.getHashTable();
            table.put(module.exports.Scule.$f.getObjectId(value), value);
            this.put(key, table);
        } else {
            table = this.get(key);
            table.put(module.exports.Scule.$f.getObjectId(value), value);
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
module.exports.Scule.classes.BPlusTreeHashingLeafNode = function (left, right) {
  
    module.exports.Scule.$d.Scule.classes.BPlusTreeLeafNode.call(this, left, right);

    /**
     * Inserts a key/value pair into the data for the node
     * @public
     * @param {Mixed} key the key to insert
     * @param {Mixed} value the value corresponding to the provided key
     * @returns {null|Object}
     */
    this.insert = function (key, value) {
        var table;
        var index = this.indexSearch(key);
        if (index == this.data.length) {
            table = module.exports.Scule.$d.getHashTable();
            table.put(module.exports.Scule.$f.getObjectId(value, true), value);
            this.data.push({
                key:key, 
                value:table
            });
        } else {
            var element = this.data[index];
            if (element.key === key) {
                element.value.put(module.exports.Scule.$f.getObjectId(value, true), value);
            } else if (element.key < key) {
                table = module.exports.Scule.$d.getHashTable();
                table.put(module.exports.Scule.$f.getObjectId(value, true), value);                
                this.data.splice(index + 1, 0, {
                    key:key, 
                    value:table
                });
            } else {
                table = module.exports.Scule.$d.getHashTable();
                table.put(module.exports.Scule.$f.getObjectId(value, true), value);
                this.data.splice(index, 0, {
                    key:key, 
                    value:table
                });               
            }
        }
        if (table) {
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
    this.split = function () {
        if (this.data.length <= this.order) {
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
        if (this.getLeft()) {
            this.getLeft().setRight(left);
        }
        
        right.setLeft(left);
        if (this.getRight()) {
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
        var rng = null;
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
                    for (var i=left; i <= right; i++) {
                        if (max !== null && data[i].key > max) {
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
    this.toArray = function () {
        var o = {
            type:'hashing-leaf'
        };
        for (var i=0; i < this.data.length; i++) {
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
module.exports.Scule.classes.BPlusHashingTree = function (order, threshold) {
    
    module.exports.Scule.$d.Scule.classes.BPlusTree.call(this, order, threshold);
    
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
    this.clear = function () {
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
module.exports.Scule.classes.Index = function () {
    
    /**
     * @type {Object}
     * @private
     */
    this.attributes = {};
    
    /**
     * @type {HashTable}
     * @private
     */
    this.astrings   = module.exports.Scule.$d.getHashTable();
    
    /**
     * @type {HashTable}
     * @private
     */    
    this.leaves     = module.exports.Scule.$d.getHashTable();
    
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
    this.setAttribtues = function (attributes) {
        this.attributes = attributes;
        this.attributes = module.exports.Scule.$f.sortObjectKeys(this.attributes);
    };
    
    /**
     * Parses an index attribute descriptor string or array of descriptor strings to build the index attributes
     * @public
     * @param {Mixed} attributes the attribute string(s) to parse
     * @returns {Void}
     */
    this.parseAttributes = function (attributes) {
        this.populateAttributeStrings(attributes);
        this.attributes = module.exports.Scule.$f.parseAttributes(attributes);
        this.attributes = module.exports.Scule.$f.sortObjectKeys(this.attributes);
    };
    
    /**
     * Populates the attribute strings
     * @public
     * @param {Mixed} attributes populates the attribute strings for the given attributes
     * @returns {Void}
     */
    this.populateAttributeStrings = function (attributes) {
        var self = this;
        if (!module.exports.Scule.$f.isArray(attributes)) {
            attributes = attributes.split(',');
        }
        attributes.forEach(function (attr) {
            self.astrings.put(attr, true);
        });        
    };
    
    /**
     * Resets the attributes for the index, this also clears the index
     * @public
     * @returns {Void}
     */
    this.resetAttributes = function () {
        this.attributes = {};
        this.clear();
    };
    
    /**
     * Returns the type for the index - type values are defined in the constants for Scule
     * @public
     * @returns {Number}
     */
    this.getType = function () {
        return this.type;
    };
    
    /**
     * Returns the name of the index
     * @public
     * @returns {String}
     */
    this.getName = function () {
        return this.astrings.getKeys().sort().join(',');
    };
    
    /**
     * Determines whether or not the provided attributes applies to this index
     * @public
     * @param {Array} attributes the attributes to validate
     * @param {Boolean} range whether or not the attributes are part of a range query
     * @returns {boolean|Object}
     */
    this.applies = function (attributes, range) {
        if (range && this.getType() == module.exports.Scule.$c.INDEX_TYPE_HASH) {
            return false;
        }
        if (attributes.length < this.astrings.getLength()) {
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
        attributes.forEach(function (attr) {
            if (self.astrings.contains(attr)) {
                matches.$attr[attr] = true;
                matches.$none = false;
            } else {
                if (!matches.$partial) {
                    matches.$partial = true;
                }
                matches.$attr[attr] = false;
            }
        });
        if (matches.$none) {
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
    this.generateIndexKey = function (document) {
        var composite = module.exports.Scule.$f.searchObject(this.attributes, document);
        if (composite.length == 1) {
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
    this.index = function (document) {
        if (!this.structure) {
            return false;
        }
        var id  = module.exports.Scule.$f.getObjectId(document, true);
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
    this.remove = function (document) {
        if (!this.structure) {
            return false;
        }
        var id = module.exports.Scule.$f.getObjectId(document, true);
        if (!this.leaves.contains(id)) {
            return false;
        }
        var node = this.leaves.get(id);
        node.table.remove(id);
        if (node.table.getLength() === 0) {
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
    this.removeKey = function (key) {
        if (!this.structure) {
            return false;
        }  
        var table = this.structure.search(key);
        if (table && table.length > 0) {
            this.structure.remove(key);
            for (var k in table.table) {
                if(table.table.hasOwnProperty(k)) {
                    this.leaves.remove(module.exports.Scule.$f.getObjectId(table.get(k), true));
                }
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
    this.search = function (key) {
        if (this.structure) {
            var table = this.structure.search(key);
            if (table) {
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
    this.range = function (min, max, includeMin, includeMax) {
        if (this.structure) {
            return this.structure.range(min, max, includeMin, includeMax);
        }
        return false;
    };
    
    /**
     * Removes all values from the index
     * @public
     * @returns {Void}
     */
    this.clear = function () {
        if (this.structure) {
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
    this.getLength = function () {
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
module.exports.Scule.classes.BPlusTreeIndex = function (order) {
    
    module.exports.Scule.classes.Index.call(this);
    
    if (!order) {
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
    this.type      = module.exports.Scule.$c.INDEX_TYPE_BTREE;
    
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
module.exports.Scule.classes.HashTableIndex = function () {
    
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
    this.type      = module.exports.Scule.$c.INDEX_TYPE_HASH;
    
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
    this.range = function (min, max, includeMin, includeMax) {
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
module.exports.Scule.classes.SimpleCryptographyProvider = function () {
  
    /**
     * Returns an SHA-1 signature for the provided data using a secret and salt
     * @public
     * @param {String} data the data to sign
     * @param {String} secret the secret to use when signing
     * @param {String} salt the salt to use when signing
     * @returns {String}
     */
    this.signString = function (data, secret, salt) {
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
    this.signObject = function (object, secret, salt) {
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
    this.signJSONString = function (object, secret, salt) {
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
    this.verifyObjectSignature = function (object, secret, salt) {
        var oldSig = object._sig;
        var newSig = this.signObject(object, secret, salt);
        return oldSig === newSig;      
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
module.exports.Scule.classes.StorageEngine = function (configuration) {
    
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
    this.setConfiguration = function (configuration) {
        this.configuration = configuration;
    };
    
    /**
     * Returns the configuration for the storage engine
     * @public
     * @returns {Object}
     */
    this.getConfiguration = function () {
        return this.configuration;
    };
    
    /**
     * Sets the cryptography provider for the storage engine
     * @public
     * @param {SimpleCryptographyProvider} provider the cryptography provider instance to set
     * @returns {Void}
     */
    this.setCryptographyProvider = function (provider) {
        this.crypto = provider;
    };
    
    /**
     * Returns the cryptography provider for the storage engine
     * @public
     * @returns {SimpleCryptographyProvider}
     */
    this.getCryptographyProvider = function () {
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
    this.write = function (name, object, callback) {
        throw 'function not implemented in abstract class';
    };
    
    /**
     * Reads data from storage
     * @public
     * @param {String} name the name of the file to read data from
     * @param {Function} callback the callback to execute one reading from storage is complete
     * @returns {Object}
     */
    this.read  = function (name, callback) {
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
module.exports.Scule.classes.DummyStorageEngine = function (configuration) {
  
    module.exports.Scule.classes.StorageEngine.call(this, configuration);
  
    /**
     * Writes data to storage
     * @public
     * @param {String} name the name of the file to write data to
     * @param {Object} object the data to write
     * @param {Function} callback the callback to execute once writing to storage is complete
     * @returns {Void}
     */  
    this.write = function (name, object, callback) {
        if (callback) {
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
    this.read = function (name, callback) {
        if (callback) {
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
module.exports.Scule.classes.MemoryStorageEngine = function (configuration) {
  
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
    this.write = function (name, object, callback) {
        if (!object._salt) {
            object._salt = sha1.hash((new Date()).getTime() + '');
        }
        object._sig = this.crypto.signObject(object, this.configuration.secret, object._salt);
        this.storage['__scule_collection__' + name] = JSON.stringify(object);
        if (callback) {
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
    this.read  = function (name, callback) {
        if (!('__scule_collection__' + name in this.storage)) {
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
        if (this.crypto.verifyObjectSignature(o, this.configuration.secret, o._salt) === false) {
            throw JSON.stringify({
                event:'SculeDataTampered', 
                filename:this.configuration.collection
            });
        }
        delete o._sig;
        if (callback) {
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
module.exports.Scule.classes.TitaniumDiskStorageEngine = function (configuration) {
    
    module.exports.Scule.classes.StorageEngine.call(this, configuration);
    
    if (!this.configuration.path) {
        this.configuration.path = Titanium.Filesystem.applicationDataDirectory;
    }
    
    this.setConfiguration = function (configuration) {
        this.configuration = configuration;
        if (!this.configuration.path) {
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
    this.write = function (name, object, callback) {
        if (!object._salt) {
            object._salt = sha1.hash((new Date()).getTime() + '');
        }
        object._sig = this.crypto.signObject(object, this.configuration.secret, object._salt);
        var file = Titanium.Filesystem.getFile(this.configuration.path, name + '.json');
        file.write(JSON.stringify(object));
        if (callback) {
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
    this.read = function (name, callback) {
        var file = Titanium.Filesystem.getFile(this.configuration.path, name + '.json');
        if (file.exists()) {
            var o = JSON.parse(file.read());
            if (this.crypto.verifyObjectSignature(o, this.configuration.secret, o._salt) === false) {
                Ti.App.fireEvent("SculeDataTampered", {
                    filename: name
                });
                return false;
            }
            delete o._sig;
            if (callback) {
                callback(o);
            }
            return o;
        }
        return false;
    };
    
};

/**
 * A disk based storage engine for NodeJS applications
 * @public
 * @constructor
 * @class {NodeJSDiskStorageEngine}
 * @param {Object} configuration the configuration parameters for the storage engine instance
 * @extends {StorageEngine} 
 * @returns {Void}
 */
module.exports.Scule.classes.NodeJSDiskStorageEngine = function (configuration) {
    
    module.exports.Scule.classes.StorageEngine.call(this, configuration);
    
    this.filesystem = require('fs');
    
    this.setCryptographyProvider(new module.exports.Scule.classes.SimpleCryptographyProvider());

    /**
     * Writes data to storage
     * @public
     * @param {String} name the name of the file to write data to
     * @param {Object} object the data to write
     * @param {Function} callback the callback to execute once writing to storage is complete
     * @returns {Void}
     */ 
    this.write = function (name, object, callback) {
        var path = this.configuration.path + '/' + name + '.json';
        if (!object._salt) {
            object._salt = sha1.hash((new Date()).getTime() + '');
        }
        object._sig = this.crypto.signObject(object, this.configuration.secret, object._salt);
        this.filesystem.writeFile(path, JSON.stringify(object), function (err) {
            if (err) {
                throw err;
            }
            if (callback) {
                callback(object);
            }
        });
    };

    /**
     * Reads data from storage
     * @public
     * @param {String} name the name of the file to read data from
     * @param {Function} callback the callback to execute one reading from storage is complete
     * @returns {Object}
     */
    this.read = function (name, callback) {
        var path = this.configuration.path + '/' + name + '.json';
        var __t  = this;
        this.filesystem.readFile(path, function (err, data) {
            if (err) {
                throw err;
            }
            var o = JSON.parse(data);
            if (__t.crypto.verifyObjectSignature(o, __t.configuration.secret, o._salt) === false) {
                throw JSON.stringify({
                    event:'SculeDataTampered', 
                    filename:name
                });
            }
            delete o._sig;
            if (callback) {
                callback(o);
            }
        });
    };
    
};

/**
 * A disk based storage engine for web broswers that support the LocalStorage standard
 * @public
 * @constructor
 * @class {LocalStorageStorageEngine}
 * @param {Object} configuration the configuration parameters for the storage engine instance
 * @extends {StorageEngine}
 * @returns {Void}
 */
module.exports.Scule.classes.LocalStorageStorageEngine = function (configuration) {
    
    module.exports.Scule.classes.StorageEngine.call(this, configuration);
    
    this.setCryptographyProvider(new module.exports.Scule.classes.SimpleCryptographyProvider());
    
    if (!window || (!('localStorage' in window) && (window.localStorage !== null))) {
        throw JSON.stringify({
            event:'SculeLocalStorageError',
            message:'Local storage is not available on this device'
        });
    }

    /**
     * Writes data to storage
     * @public
     * @param {String} name the name of the file to write data to
     * @param {Object} object the data to write
     * @param {Function} callback the callback to execute once writing to storage is complete
     * @returns {Void}
     */ 
    this.write = function (name, object, callback) {
        if (!object._salt) {
            object._salt = sha1.hash((new Date()).getTime() + '');
        }
        try {
            object._sig = this.crypto.signObject(object, this.configuration.secret, object._salt);
            localStorage.setItem('__scule_collection__' + name, JSON.stringify(object));
            if (callback) {
                callback(object);
            }
        } catch (e) {
            throw JSON.stringify({
                event:'SculeLocalStorageError',
                message:'Storage quota exceeded for origin',
                collection:this.configuration.collection
            });           
        }
    };

    /**
     * Reads data from storage
     * @public
     * @param {String} name the name of the file to read data from
     * @param {Function} callback the callback to execute one reading from storage is complete
     * @returns {Object}
     */
    this.read = function (name, callback) {
        var data = localStorage.getItem('__scule_collection__' + name);
        if (!data) {
            throw JSON.stringify({
                event:'SculeLocalStorageError',
                message:'Unable to load collection from local storage',
                collection:this.configuration.collection
            });
        }
        var o = JSON.parse(data);
        if (this.crypto.verifyObjectSignature(o, this.configuration.secret, o._salt) === false) {
            throw JSON.stringify({
                event:'SculeDataTampered', 
                filename:this.configuration.collection
            });
        }
        delete o._sig;
        if (callback) {
            callback(o);  
        }
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
module.exports.Scule.classes.ObjectId = function (id) {
    
    if (id === undefined) {
        var ts = Math.floor((new Date()).getTime()/1000).toString(16);
        var hs = md5.hash(module.exports.Scule.$f.getMACAddress()).substring(0, 6);
        var pid = module.exports.Scule.$f.randomFromTo(1000, 9999).toString(16);
        while (pid.length < 4) {
            pid = '0' + pid;
        }
        var inc = module.exports.Scule.$f.randomFromTo(100000, 999999).toString(16);
        while (inc.length < 6) {
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
    this.toString = function () {
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
module.exports.Scule.classes.ObjectDate = function (sec, usec) {
    
    if (sec === undefined && usec === undefined) {
        var ts = (new Date()).getTime().toString();
        sec  = parseInt(ts.substring(0, 10), 10);
        usec = parseInt(ts.substring(10), 10);
    }

    /**
     * @private
     * @type {Number}
     */
    this.ts    = parseInt(sec + usec, 10);
    
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
    this.getTimestamp = function () {
        return this.ts;
    };
    
    /**
     * Returns the seconds value of the timestamp
     * @returns {Number}
     */
    this.getSeconds = function () {
        return this.sec;
    };
    
    /**
     * Returns the microseconds value of the timestamp
     * @returns {Number}
     */
    this.getMicroSeconds = function () {
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
module.exports.Scule.classes.DBRef = function (ref, id) {

    if (ref === undefined || id === undefined) {
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
    this.getRef = function () {
        return this.ref;
    };
    
    /**
     * Returns the ObjectId instance for the reference
     * @public
     * @returns {Object}Id
     */
    this.getId = function () {
        return this.id;
    };

    /**
     * Resolves the reference, this function is an alias of DBRef::resolveReference
     * @public
     * @returns {Null|Object}
     */
    this.resolve = function () {
        return this.resolveReference();
    };

    /**
     * Resolves the reference
     * @public
     * @returns {Null|Object}
     */
    this.resolveReference = function () {
        var collection = module.exports.factoryCollection(this.ref);
        return collection.findOne(this.id);
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
module.exports.Scule.classes.Collection = function (name) {
    
    /**
     * @private
     * @type {HashTable}
     */    
    this.documents   = module.exports.Scule.$d.getHashTable();
    
    /**
     * @private
     * @type {QueryInterpreter}
     */    
    this.interpreter = module.exports.Scule.$i.getQueryInterpreter();
    
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
    this.setStorageEngine = function (storage) {
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
    this.ensureIndex = function (type, definition, options) {
        var index;
        switch(type) {
            case module.exports.Scule.$c.INDEX_TYPE_BTREE:
                if (!options) {
                    options = {
                        order:100
                    };
                }
                index = new module.exports.Scule.classes.BPlusTreeIndex(options.order);
                index.parseAttributes(definition);
                break;
                
            case module.exports.Scule.$c.INDEX_TYPE_HASH:
                index = new module.exports.Scule.classes.HashTableIndex();
                index.parseAttributes(definition);
                break;
        }
        if (index) {
            var inserted = false;
            var alen     = index.astrings.length;
            for (var i=0; i < this.indices.length; i++) {
                if (alen > this.indices[i].astrings.length) {
                    this.indices.splice(i, 0, index);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) {
                var o = this.findAll();
                o.forEach(function (document) {
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
    this.ensureBTreeIndex = function (definition, options) {
        this.ensureIndex(module.exports.Scule.constants.INDEX_TYPE_BTREE, definition, options);
    };


    /**
     * Ensures a hash index exists using the provided definition and options
     * @public
     * @param {String} definition the index definition (e.g. a,b,c.d)
     * @param {Object} options the options for the index implementation
     * @returns {Void}
     */
    this.ensureHashIndex = function (definition, options) {
        this.ensureIndex(module.exports.Scule.constants.INDEX_TYPE_HASH, definition, options);
    };
    
    /**
     * Sets whether or not the collection should auto-commit changes to storage
     * @public
     * @param {Boolean} semaphor the boolean indicating whether or not auto-commit is enabled (default is FALSE)
     * @returns {Void}
     */
    this.setAutoCommit = function (semaphor) {
        this.autoCommit = semaphor;
    };

    /**
     * Returns the name for the collection as a string
     * @public
     * @returns {String}
     */
    this.getName = function () {
        return this.name;
    };
    
    /**
     * Returns the number of objects in the collection as an integer
     * @public
     * @returns {Number}
     */
    this.getLength = function () {
        return this.documents.getLength();
    };
    
    /**
     * Returns the ObjectId created by the last insertion operation on the collection
     * @public
     * @returns {Null|ObjectId}
     */
    this.getLastInsertId = function () {
        return this.lastId;
    };
    
    /**
     * Loads the collection from storage and initializes all encapsulated objects
     * @public
     * @param {Function} callback the callback to execute once the collection is 
     * opened, the collection is passed as the only argument for the callback closure
     * @returns {Void}
     */
    this.open = function (callback) {
        if (this.isOpen) {
            return;
        }
        var self = this;
        this.storage.read(this.name, function (o) {
            if (!o) {
                return;
            }
            for (var ky in o._objects) {
                if(o._objects.hasOwnProperty(ky)) {
                    var document = o._objects[ky];
                    module.exports.Scule.$f.unflattenObject(o._objects[ky]);
                    self.documents.put(module.exports.Scule.$f.getObjectId(document, true), document);
                    for (var i=0; i < self.indices.length; i++) {
                        self.indices[i].index(document);
                    }
                }
            }
            self.isOpen = true;
            if (callback) {
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
    this.commit = function (callback) {
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
    this.find = function (query, conditions, callback) {
        if (module.exports.Scule.$c.ID_FIELD in query) {
            return [this.findOne(query[module.exports.Scule.$c.ID_FIELD])];
        }
        var result = this.interpreter.interpret(this, query, conditions);
        if (callback) {
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
    this.explain = function (query, conditions, callback) {
        this.interpreter.interpret(this, query, conditions, true);
        if (callback) {
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
    this.clear = function (callback) {
        this.documents.clear();
        for (var i=0; i < this.indices.length; i++) {
            this.indices[i].clear();
        }
        if (callback) {
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
    this.findAll = function (callback) {
        var result = [];
        for (var ky in this.documents.table) {
            if(this.documents.table.hasOwnProperty(ky)) {
                result.push(this.documents.get(ky));
            }
        }
        if (callback) {
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
    this.findOne = function (id, callback) {
        if (!module.exports.Scule.$f.isScalar(id)) {
            id = id.toString();
        }
        var document = null;
        if (this.documents.contains(id)) {
            document = this.documents.get(id);
        }
        if (callback) {
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
    this.save = function (document, callback) {
        module.exports.Scule.functions.unflattenObject(document);
        this.documents.put(module.exports.Scule.$f.getObjectId(document, true), document);
        for (var i=0; i < this.indices.length; i++) {
            this.indices[i].remove(document);
            this.indices[i].index(document);
        }
        if (this.autoCommit) {
            this.commit();
        }
        this.lastId = module.exports.Scule.$f.getObjectId(document);
        if (callback) {
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
    this.update = function (query, updates, conditions, upsert, callback) {
        var result = this.interpreter.update(this, query, updates, conditions, upsert);
        if (callback) {
            callback(result);
        }
        return result;
    };
    
    /**
     * Returns a count of the number of documents matching the query criteria
     * @public
     * @param {Object} query the query expression(s) to execute against the collection
     * @param {Object} conditions the limit and sort conditions for the query
     * @param {Function} callback the callback to be executed once the query is complete. The only
     * argument for the callback closure is the result set for the query. If no callback is provided
     * the results are returned directly.
     * @returns {Number}
     */
    this.count = function (query, conditions, callback) {
        var count = this.find(query, conditions).length;
        if (callback) {
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
    this.remove = function (query, conditions, callback) {
        var self   = this;
        var results = this.find(query, conditions);
        results.forEach(function (o) {
            self.documents.remove(module.exports.Scule.$f.getObjectId(o));
            self.indices.forEach(function (index) {
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
    this.distinct = function (key, query, callback) {
        var o = this.find(query);
        var t = {};
        o.forEach(function (d) {
            if (!(d[key] in t)) {
                t[d[key]] = 0;
            }
            t[d[key]]++;
        });
        if (callback) {
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
    this.merge = function (collection, callback) {
        if (!collection) {
            throw 'the merge function requires a valid collection as a parameter';
        }
        var self = this;
        var o    = collection.findAll();
        o.forEach(function (document) {
            if (!self.documents.contains(document._id)) {
                self.documents.put(document._id, document);
            }
        });
        if (callback) {
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
     *      finalize:function (key, reduced) {
     *          reduced.finalized = key;
     *          return reduced;
     *      }
     * }
     * @param {Function} callback the callback to be executed once the map/reduce operation is complete. The only
     * argument for this function is the "out" collection.
     * @returns {Void}
     */
    this.mapReduce = function (map, reduce, options, callback) {
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
module.exports.Scule.classes.MapReduceHandler = function (map, reduce, options) {
  
    this.options = options;

    if (!map) {
        throw 'A valid function is requires as the `map` parameter of the map/reduce operation';
    }

    if (!reduce) {
        throw 'A valid function is requires as the `reduce` parameter of the map/reduce operation';
    }

    if (!('out' in options)) {
        throw 'A valid output collection connection url is required as the `out` parameter of the map/reduce options object';
    } else {
        if (!('merge' in options.out) && !('reduce' in options.out)) {
            throw 'A valid output collection connection url is required as either the `merge` or `reduce` out parameter of the map/reduce options object';
        }
    }
 
    if (!('query' in options)) {
        options.query = {};
    }

    if (!('conditions' in options)) {
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
    this.run = function (collection, callback) {
        
        var self  = this;
        var merge = ('merge' in this.options.out); 
        var out   = module.exports.factoryCollection(merge ? this.options.out.merge : this.options.out.reduce);
        var table = module.exports.Scule.$d.getHashTable();
        
        var emit  = function (key, value) {
            if (!table.contains(key)) {
                table.put(key, []);
            }
            table.get(key).push(value);
        };
        
        var o = collection.find(this.options.query, this.options.conditions);
        o.forEach(function (document) {
            self.map(document, emit);
        });
        
        var temp = null;
        if (merge) {
            temp = module.exports.factoryCollection('scule+dummy://__mr' + (new Date()).getTime());
        }
        
        var result = module.exports.Scule.$d.getHashTable();
        var keys   = table.getKeys();
        keys.forEach(function (key) {
            result.put(key, self.reduce(key, table.get(key)));
            if (self.finalize) {
                result.put(key, self.finalize(key, result.get(key)));
            }
            if (!merge) {
                out.save(result.get(key));
            } else {
                temp.save(result.get(key));
            }
        });
        
        if (merge) {
            out.merge(temp);
        }
        
        if (callback) {
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
module.exports.Scule.classes.CollectionFactory = function () {

    /**
     * @private
     * @type {HashTable}
     */
    this.collections = module.exports.Scule.$d.getHashTable();
    
    /**
     * Instantiates and returns a collection corresponding to the provided name and reading from the provided storage engine.
     * If no storage engine is provided the MemoryStorageEngine is selected by default.
     * @public
     * @param {String} url the name of the collection to instantiate
     * @param {Object} configuration a configuration object
     * @returns {Collection}
     */
    this.getCollection = function (url, configuration) {
        if (this.collections.contains(url)) {
            return this.collections.get(url).c;
        }
        
        if (!configuration) {
            configuration = {
                secret:'dummy'
            };
        }
        
        var parts = module.exports.Scule.functions.parseCollectionURL(url);
        if (!(parts.plugin in module.exports.Scule.plugins)) {
            throw parts.plugin + ' is not a registered Scule plugin';
        }
        
        if (!(parts.engine in module.exports.Scule.engines)) {
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
module.exports.Scule.functions.debug = function (message) {
    if (module.exports.Scule.variables.debug === true) {
        if (typeof Titanium !== 'undefined') {
            Ti.API.info(message);
        } else {
            console.log(message);
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
module.exports.Scule.functions.unflattenObject = function (object) {
    var u = function (object) {
        if (module.exports.Scule.$f.isScalar(object)) {
            return;
        }
        for (var key in object) {
            if(object.hasOwnProperty(key)) {
                var o = object[key];
                if (!module.exports.Scule.$f.isScalar(o) && ('$type' in object[key])) {
                    switch(o.$type) {
                        case 'date':
                            object[key] = new module.exports.Scule.classes.ObjectDate(o.sec, o.usec);
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
    };
    u(object);
    if (!(module.exports.Scule.$c.ID_FIELD in object)) {
        object[module.exports.Scule.$c.ID_FIELD] = new module.exports.Scule.classes.ObjectId();
    }
};

/**
 * Parses a collection connect url and returns the required pieces
 * @public
 * @param {String} url the url to parse, should be in the format collection_engine+storage_engine://collection_name (e.g. scule+dummy://test)
 * @returns {Object}
 * @throws {Exception}
 */
module.exports.Scule.functions.parseCollectionURL = function (url) {
    var matches = url.match(/^([^\+]*)\+([^\/]*)\:\/\/(.*)/);
    if (!matches || matches.length != 4) {
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
 * Sets a flag signifying whether or not to log console debug output
 * @param {Boolean} semaphor the flag signifying whether or not to log console debug output
 * @returns {Void}
 */
module.exports.debug = function (semaphor) {
    module.exports.Scule.variables.debug = semaphor;
};

/**
 * Registers a storage engine with Scule - throws an exception if an engine with the same name
 * is already registered
 * @param {String} name a unique string name identifying the storage engine class
 * @param {StorageEngine} engine the storage engine class to register
 * @returns {Void}
 */
module.exports.registerStorageEngine = function (name, engine) {
    if (name in module.exports.Scule.engines) {
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
module.exports.registerCollectionPlugin = function (name, plugin) {
    if (name in module.exports.Scule.plugins) {
        throw name + ' collection plugin is already registered';
    }
    module.exports.Scule.plugins[name] = plugin;
};

/**
 * Register default collection plugin and storage engines
 */
(function () {
    module.exports.registerStorageEngine('titanium', module.exports.Scule.classes.TitaniumDiskStorageEngine);
    module.exports.registerStorageEngine('memory', module.exports.Scule.classes.MemoryStorageEngine);
    module.exports.registerStorageEngine('dummy', module.exports.Scule.classes.DummyStorageEngine);
    module.exports.registerStorageEngine('local', module.exports.Scule.classes.LocalStorageStorageEngine);
    module.exports.registerStorageEngine('nodejs', module.exports.Scule.classes.NodeJSDiskStorageEngine);
    module.exports.registerCollectionPlugin('scule', module.exports.Scule.classes.Collection);    
}());

/**
 * Creates a new Collection instance corresponding to the provided name and using the provided storage engine
 * @param {String} name the name of the collection to load
 * @returns {Collection}
 * @throws {Exception}
 */
module.exports.factoryCollection = function (name) {
    return module.exports.Scule.objects.core.collections.factory.getCollection(name);
};

/**
 * Clears all collections
 * @returns {Void}
 */
module.exports.dropAll = function () {
    module.exports.Scule.objects.core.collections.factory.collections.clear();
};

/**
 * Returns an instance of the {Index} class
 * @returns {Index}
 */
module.exports.getIndex = function () {
    return new module.exports.Scule.classes.Index();
};

/**
 * Returns an instance of the {HashTableIndex} class
 * @param {Number} threshold
 * @returns {HashTableIndex}
 */
module.exports.getHashTableIndex = function (threshold) {
    return new module.exports.Scule.classes.HashTableIndex(threshold);
};

/**
 * Returns an instance of the {BPlusTreeIndex} class
 * @param {Number} threshold
 * @returns {BPlusTreeIndex}
 */
module.exports.getBPlusTreeIndex = function (threshold) {
    return new module.exports.Scule.classes.BPlusTreeIndex(threshold);
};

/**
 * Returns an instance of the {ObjectId} class
 * @param {String} id
 * @returns {ObjectId}
 */
module.exports.getObjectId = function (id) {
    return new module.exports.Scule.classes.ObjectId(id);
};

/**
 * Returns an instance of the {ObjectDate} class
 * @param {Number} sec
 * @param {Number} usec
 * @returns {ObjectDate}
 */
module.exports.getObjectDate = function (sec, usec) {
    return new module.exports.Scule.classes.ObjectDate(sec, usec);
};

/**
 * Returns an instance of the {DBRef} class
 * @param {String} ref the collection connector string for the referenced collection
 * @param {String|ObjectId} id the identifier of the object to reference
 * @returns {DBRef}
 */
module.exports.getDBRef = function (ref, id) {
    return new module.exports.Scule.classes.DBRef(ref, id);
};

/**
 * Returns an instance of the {MemoryStorageEngine} class
 * @param {Object} configuration
 * @returns {MemoryStorageEngine}
 */
module.exports.getMemoryStorageEngine = function (configuration) {
    return new module.exports.Scule.classes.MemoryStorageEngine(configuration);
};

/**
 * Returns an instance of the {NodeJSDiskStorageEngine} class
 * @param {Object} configuration
 * @returns {NodeJSDiskStorageEngine}
 */
module.exports.getNodeJSDiskStorageEngine = function (configuration) {
    return new module.exports.Scule.classes.NodeJSDiskStorageEngine(configuration);
};

/**
 * Returns an instance of the {TitaniumDiskStorageEngine} class
 * @param {Object} configuration
 * @returns {TitaniumDiskStorageEngine}
 */
module.exports.getTitaniumDiskStorageEngine = function (configuration) {
    return new module.exports.Scule.classes.TitaniumDiskStorageEngine(configuration);
};

/**
 * Returns an instance of the {LocalStorageDiskStorageEngine} class
 * @param {Object} configuration
 * @returns {LocalStorageDiskStorageEngine}
 */
module.exports.getLocalStorageDiskStorageEngine = function (configuration) {
    return new module.exports.Scule.classes.LocalStorageDiskStorageEngine(configuration);    
};

/**
 * Returns an instance of the {SimpleCryptographyProvider} class
 * @return {SimpleCryptographyProvider}
 */
module.exports.getSimpleCryptographyProvider = function () {
    return new module.exports.Scule.classes.SimpleCryptographyProvider();
};

/**
 * Returns an instance of the {BPlusHashingTree} class
 * @param {Number} order
 * @param {Number} threshold
 * @returns {BPlusHashingTree}
 */
module.exports.getBPlusHashingTree = function (order, threshold) {
    return new module.exports.Scule.classes.BPlusHashingTree(order, threshold);
};

/**
 * Returns an instance of the {HashBucketTable} class
 * @returns {HashBucketTable}
 */
module.exports.getHashBucketTable = function () {
    return new module.exports.Scule.classes.HashBucketTable();
};

/**
 * Returns the internal MD5 wrapper
 * @returns {Object}
 */
module.exports.getMD5 = function() {
    return md5;
};

/**
 * Returns the internal SHA1 wrapper
 * @returns {Object}
 */
module.exports.getSHA1 = function() {
    return sha1;
};