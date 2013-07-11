var ds = require('../').datastructures;

var tests = module.exports;

tests['define hasOwnProperty key'] = function (test) {
	test.expect(6);

	var ht = ds.getHashTable();
	
	ht.put('hasOwnProperty', true);
	
	test.doesNotThrow(function() {
		ht.get('foo');
	}, Error, 'fail HashTable.get');
	
	test.doesNotThrow(function () {
		ht.search('foo');
	}, Error, 'fail HashTable.search');
	
	test.doesNotThrow(function () {
		ht.contains('foo');
	}, Error, 'fail HashTable.contains');
	
	test.doesNotThrow(function () {
		ht.getKeys();
	}, Error, 'fail HashTable.getKeys');
	
	test.doesNotThrow(function () {
		ht.getValues();
	}, Error, 'fail Hashtable.getValues');
	
	test.doesNotThrow(function () {
		ht.toArray();
	}, Error, 'fail HashTable.toArray');
	
	test.done();
};