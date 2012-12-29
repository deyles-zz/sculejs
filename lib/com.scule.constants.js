/**
 * @module com.scule.constants
 * @public
 * @type {Object}
 */
module.exports = {
    INDEX_TYPE_BTREE: 0,     // the type code for b+tree indices
    INDEX_TYPE_RTREE: 1,
    INDEX_TYPE_HASH: 2,      // the type code for hash indices
    INDEX_TYPE_CLUSTERED: 3, // the type code for clustered indices
    ID_FIELD: '_id',         // the global key for ObjectId attributes
    REF_FIELD:'_ref'         // the global key for DBRef attributes
};