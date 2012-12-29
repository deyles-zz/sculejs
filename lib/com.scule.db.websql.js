/**
 * Global module namespace
 */
module.exports = {
    Scule:{
        functions:{},
        classes:{},
        constants:require('./com.scule.constants'),
        $f:require('./com.scule.functions').Scule.functions,
        $d:require('./com.scule.datastructures'),
        $q:require('./com.scule.db.parser')
    }
};

/**
 * Core Scule data types and pattern implementations
 * @param {String} name the name of the collection
 */
module.exports.Scule.classes.WebSQLCollection = function(name) {
        
    this.version    = 2.0;
    this.lastId     = null;
    this.name       = name;
    this.autoCommit = false;
    this.open       = false;
    this.schema     = {};
    
    /**
     * Sets the storage engine for the collection
     * @param {StorageEngine} storage
     * @return {Void}
     */
    this.setStorageEngine = function(storage) {
        return false;
    };
    
    /**
     * Ensures that an index exists on the collection with the provided attributes
     * @param {Integer} type the type of index
     * @param {String} definition the attributes to use when building the index
     * @param {Object} options the index type specific options to use
     * @return {Void}
     */
    this.ensureIndex = function(type, definition, options) {
        // TODO: this
    };
    
    /**
     * Ensures a b+tree index exists using the provided definition and options
     * @param {String} definition
     * @param {Object} options
     * @return {Void}
     */
    this.ensureBTreeIndex = function(definition, options) {
        // TODO: this
    };


    /**
     * Ensures a hash index exists using the provided definition and options
     * @param {String} definition
     * @param {Object} options
     * @return {Void}
     */
    this.ensureHashIndex = function(definition, options) {
        // TODO: this
    };
    
    this.installSchema = function(schema) {
        
    };
    
    /**
     * Sets whether or not the collection should auto-commit changes to storage
     * @param {Boolean} semaphor
     * @return {Void}
     */
    this.setAutoCommit = function(semaphor) {
        this.autoCommit = semaphor;
    };
    
    this.getName = function() {
        return this.name;
    };
    
    /**
     * Returns the number of objects in the collection as an integer
     * @return {Integer}
     */
    this.getLength = function() {
        // TODO: this
    };
    
    /**
     * Returns the ObjectId created by the last insertion operation on the collection
     * @return {Null|ObjectId}
     */
    this.getLastInsertId = function() {
        return this.lastId;
    };
    
    /**
     * Loads the collection from storage and initializes all encapsulated objects
     * @param {Function} callback 
     * @return {Void}
     */
    this.open = function(callback) {
        var self = this;
        return openDatabase('scule', self.version, 'Scule Database', 5*1024*1024, function (db) {
            db.changeVersion('', self.version, function (t) {
               t.executeSql('CREATE TABLE ' + self.getName() + ' COLUMN NAMES ');
            }, callback);
        });
    };
    
    /**
     * Commits the collection to storage
     * @param {Function} callback
     * @return {Void}
     */
    this.commit = function(callback) {
        var collection = {
            _sig: null,
            _salt: null,
            _name: this.name,
            _version: this.version,
            _objects: this.documents.table            
        };
        // TODO: this
    };

    /**
     * Performs a query on the collection, returning the results as an array
     * @param {Object} query
     * @param {Object} conditions
     * @param {Function} callback
     * @return {Array}
     */
    this.find = function(query, conditions, callback) {
        // TODO: this
    };
    
    /**
     * Clears the collection - removing all objects
     * @param {Function} callback
     * @return {Void}
     */
    this.clear = function(callback) {
        // TODO: this
    };
    
    /**
     * Returns all objects in the collection as an Array
     * @param {Function} callback
     * @return {Array}
     */
    this.findAll = function(callback) {
        // TODO: this
    };
    
    /**
     * Returns the object identified by the provided ObjectId, returns null if no entry
     * exists in the documents index
     * @param {ObjectId} id
     * @param {Function} callback
     * @return {Object|null}
     */
    this.findOne = function(id, callback) {
        // TODO: this
    };
    
    /**
     * Saves an object to the collection, adding an ObjectId using the attribute name _id
     * if none exists.
     * @param {Object} document
     * @param {Function} callback
     * @return {Void}
     */
    this.save = function(document, callback) {
        // TODO: this
    };
    
    /**
     * Performs an update on documents in the collection
     * @param {Object} query
     * @param {Object} updates
     * @param {Object} conditions
     * @param {Boolean} upsert
     * @param {Function} callback
     * @return {Array}
     */
    this.update = function(query, updates, conditions, upsert, callback) {
        // TODO: this
    };
    
    /**
     * Returns a count of the number of documents matching the query criteria
     * @param {Object} query
     * @param {Function} callback
     * @return {Integer}
     */
    this.count = function(query, callback) {
        // TODO: this
    };
    
    /**
     * Removes the documents matching the query criteria and sort/limit conditions
     * from the collection and associated indices
     * @param {Object} query
     * @param {Object} conditions
     * @param {Function} callback
     * @return {Integer}
     */
    this.remove = function(query, conditions, callback) {
        // TODO: this
    };
    
    this.distinct = function(key, query) {
        // TODO: write this now
    };
    
};

/**
 * Register default collection plugin and storage engines
 */
(function() {
    Scule.registerCollectionPlugin('websql', module.exports.Scule.classes.WebSQLCollection);    
}());