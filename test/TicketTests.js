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

var assert = require('assert');
var Scule = require('../lib/com.scule');

describe('Tickets', function() {
    it('should test conditions for Ticket #6', function() {
        Scule.dropAll();
        var a = [];
        var collection = Scule.factoryCollection('scule+dummy://test');
        for (var i = 0; i < 100; i++) {
            var o = {i: i};
            collection.save(o);
            a.push(o);
        }
        var o = null;
        o = collection.find({}, {$skip: 5});
        assert.equal(95, o.length);
        assert.equal(o[0].i, a[5].i);
        o = collection.find({}, {$skip: 5, $limit: 10});
        assert.equal(10, o.length);
        assert.equal(o[0].i, a[5].i);
        assert.equal(o[9].i, a[14].i);
        o = collection.find({}, {$skip: 5, $limit: 10, $sort: {i: -1}});
        assert.equal(10, o.length);
        assert.equal(o[0].i, a[94].i);
        assert.equal(o[9].i, a[85].i);
        o = collection.find({}, {$skip: 100});
        assert.equal(o.length, 0);
        o = collection.find({i: {$gte: 50}}, {$skip: 30});
        assert.equal(o.length, 20);
        assert.equal(o[0].i, a[80].i);
        assert.equal(o[19].i, a[99].i);        
    });
    it('should test conditions for Ticket #14a', function() {
        var collection = Scule.factoryCollection('scule+dummy://test', {
            secret: 'mysecretkey'
        });
        for (var i = 0; i < 1000; i++) {
            collection.save({
                _id: i,
                index: i,
                remainder: (i % 10)
            });
        }
        collection.update({_id: 500}, {$set: {index: 1909, foo: 'bar'}}, {}, true);
        collection.commit();
        var o = collection.findOne(500);
        assert.equal(1909, o.index);
        assert.equal('bar', o.foo);
        assert.equal(500, o._id.id);        
    });
    it('should test conditions for Ticket #14a', function() {
        var collection = Scule.factoryCollection('scule+dummy://test', {
            secret: 'mysecretkey'
        });
        collection.clear();
        collection.save({
            _id: 1,
            a: 10
        });
        collection.update({_id: 1}, {$set: {a: 20, b: 50}}, {}, true);
        collection.commit();
        var o = collection.findOne(1);
        assert.equal(1, o._id.id);
        assert.equal(20, o.a);
        assert.equal(50, o.b);
    });
    it('should test conditions for Ticket #22', function() {
        Scule.dropAll();
        var collection = Scule.factoryCollection('scule+dummy://test', {
            secret: 'mysecretkey'
        });
        collection.clear();

        for (var i = 0; i < 1000; i++) {
            collection.save({a: 'test' + i});
        }
        assert.equal(111, collection.count({a: /test[1]/g}));
        assert.equal(333, collection.count({a: /test[1-3]/g}));
        assert.equal(100, collection.count({a: /test([1-9][0-9]?$|100$)/g}));
    });
    it('should test conditions for Ticket #26', function() {
        Scule.dropAll();
        var o = null;
        var collection = Scule.factoryCollection('scule+dummy://test');
        collection.clear();
        collection.save({date: Scule.getObjectDate(1372603560, 212), id: 1});
        collection.save({date: Scule.getObjectDateFromDate((new Date(1362395600 * 1000))), id: 2});
        collection.commit();
        collection.update({id: 1}, {$set: {zero: 0}}, {}, true);
        o = collection.find({date: {$gt: (new Date(1372395600 * 1000))}});
        assert.equal(1, o.length);
        assert.equal(1, o[0].id);
        assert.equal(1372603560212, o[0].date.toDate().getTime());
        o = collection.find({date: {$gt: Scule.getObjectDateFromDate((new Date(1362395600 * 1000)))}});
        assert.equal(1, o.length);
        assert.equal(1, o[0].id);
        assert.equal(1372603560212, o[0].date.toDate().getTime());
        o = collection.find({date: {$eq: Scule.getObjectDateFromDate(new Date(1362395600000))}});
        assert.equal(1, o.length);
        assert.equal(2, o[0].id);
        assert.equal(1362395600000, o[0].date.toDate().getTime());        
    });
    it('should test conditions for Ticket #29', function() {
        var ht = Scule.getHashTable();
        ht.put('hasOwnProperty', true);
        ht.put('bar', 'foo');
        assert.equal(null, ht.get('foo'));
        assert.equal(null, ht.search('foo'));
        assert.equal(false, ht.contains('foo'));
        assert.equal(true, ht.contains('hasOwnProperty'));
        assert.equal(true, ht.get('hasOwnProperty'));
        assert.equal(true, ht.contains('bar'));
        assert.equal('foo', ht.get('bar'));
        assert.equal(2, ht.getKeys().length);
        assert.equal('[true,"foo"]', JSON.stringify(ht.getValues()));        
    });
    it('should test conditions for Ticket #32', function() {
        Scule.dropAll();
        var collection1 = Scule.factoryCollection('scule+nodejs://ticket32', {secret:'test', path:'/tmp'});
        collection1.clear();
        for (var i = 0; i < 100; i++) {
            collection1.save({i: i});
        }
        collection1.commit();
        setTimeout(function() {
            var storage = Scule.getNodeJSDiskStorageEngine({secret:'test', path:'/tmp'});
            var collection2 = new Scule.db.classes.Collection('ticket32');
            collection2.setStorageEngine(storage);
            collection2.open(function() {
                collection2.findAll(function(o) {
                    assert.equal(100, o.length);
                });
            });
        }, 100);        
    });
    it('should test conditions for Ticket #33a', function() {
        var lastNames = ['Edgar', 'Adams', 'Jones', 'Bryan', 'Smith', 'Doe', 'Lennard', 'Turkish', 'Allan', 'Collins'];
        Scule.dropAll();
        var collection = Scule.factoryCollection('scule+dummy://ticket33');
        collection.clear();
        for (var i = 0; i < 100; i++) {
            var o = {
                position: i,
                last_name: lastNames[Math.floor((i / 10))]
            };
            collection.save(o);
        }
        var a = ["Adams", "Adams", "Adams", "Adams", "Adams", "Adams", "Adams", "Adams", "Adams", "Adams", "Bryan", "Edgar", "Edgar", "Edgar", "Edgar"];
        collection.find({position: {$lte: 30}}, {$sort: {last_name: 2}, $limit: 15}, function(players) {
            for (var i = 0; i < players.length; i++) {
                assert.equal(a[i], players[i].last_name);
            }
        });        
    });
    it('should test conditions for Ticket #33b', function() {
        var lastNames = ['Edgar', 'Adams', 'Jones', 'Bryan', 'Smith', 'Doe', 'Lennard', 'Turkish', 'Allan', 'Collins'];
        Scule.dropAll();
        var collection = Scule.factoryCollection('scule+dummy://ticket33');
        collection.clear();
        for (var i = 0; i < 100; i++) {
            var o = {
                position: i,
                last_name: lastNames[Math.floor((i / 10))]
            };
            collection.save(o);
        }
        var a = [];
        collection.find({position: {$lte: 60}}, {$sort: {last_name: 2}, $limit: 30}, function(players) {
            for (var i = 0; i < players.length; i++) {
                a.push(players[i].position);
            }
        });
        collection.find({position: {$lte: 60}}, {$sort: {last_name: 2}, $skip: 15, $limit: 15}, function(players) {
            for (var i = 0; i < players.length; i++) {
                assert.equal(a[i + 15], players[i].position);
            }
        });        
    });
    it('should test conditions for Ticket #34', function() {
        Scule.dropAll();
        var collection = Scule.factoryCollection('scule+dummy://ticket34');
        var names = [];
        for (var i=0; i < 100; i++) {
            collection.save({name:'testName' + i});
            if (i === 0 
                    || i === 3
                    || i === 60 
                    || i === 50 
                    || i === 30 
                    || i === 35
                    || i === 20 
                    || i === 10 
                    || i === 99) {
                continue;
            }
            names.push('testName' + i);
        }

        collection.remove({name:'testName3'}, {}, function(results) {
            assert.equal('testName3', results[0].name);
        });
        collection.remove({name:'testName0'}, {}, function(results) {
            assert.equal('testName0', results[0].name);
        });         
        collection.remove({name:'testName60'}, {}, function(results) {
            assert.equal('testName60', results[0].name);
        });  
        collection.remove({name:'testName35'}, {}, function(results) {
            assert.equal('testName35', results[0].name);
        });        
        collection.remove({name:'testName50'}, {}, function(results) {
            assert.equal('testName50', results[0].name);
        });
        collection.remove({name:'testName30'}, {}, function(results) {
            assert.equal('testName30', results[0].name);
        });
        collection.remove({name:'testName20'}, {}, function(results) {
            assert.equal('testName20', results[0].name);
        });
        collection.remove({name:'testName10'}, {}, function(results) {
            assert.equal('testName10', results[0].name);
        });
        collection.remove({name:'testName99'}, {}, function(results) {
            assert.equal('testName99', results[0].name);
        });
        
        var j = 0;
        collection.documents.queue.toArray().forEach(function(document) {
            assert.equal(names[j++], document.name);
        });
        
        var l = 90;
        names.forEach(function(n) {
            collection.remove({name:n}, {}, function(results) {
                assert.equal(n, results[0].name);
            });
            assert.equal(l--, collection.getLength());            
        });
        
        for (i=0; i < 10; i++) {
            assert.equal(i, collection.getLength());
            collection.save({name:'testName' + i});
        }
        
    });
    it('should test conditions for Ticket #35', function() {
        Scule.dropAll();
        var collection = Scule.factoryCollection('scule+dummy://ticket35');
        for (var i=0; i < 1000; i++) {
            collection.save({
                username: i + '@foo.com',
                entity: ((i%2 == 0) ? i + '@foo.com' : 'bar@foo.com')
            });
        }
        var removeUser = function(entity){
            collection.remove({$or:[{username: entity},{email: entity}]}, {}, function(result){
                assert.equal(entity, result[0].username);
                collection.find({username:entity}, {}, function(result) {
                    assert.deepEqual([], result);
                });
            });
        }
        removeUser('10@foo.com'); 
        removeUser('20@foo.com');
        removeUser('500@foo.com');
        removeUser('998@foo.com');
    });
    it('should test conditions for Ticket #38', function() {
        var collection = Scule.factoryCollection('scule+dummy://test', {
            secret: 'mysecretkey'
        });
        for (var i = 0; i < 1000; i++) {
            collection.save({
                _id: i,
                index: i,
                remainder: (i % 10)
            });
        }
        collection.update({_id: 999}, {$set: {index: 1909, foo: 'bar'}}, {}, true);
        collection.commit();
        var o = collection.findOne(999);
        assert.equal(1909, o.index);
        assert.equal('bar', o.foo);
        assert.equal(999, o._id.id);
    });
    it('should test conditions for Ticket #38a', function() {
        var collection = Scule.factoryCollection('scule+dummy://test', {
            secret: 'mysecretkey'
        });
        for (var i = 0; i < 1000; i++) {
            var event = 2;
            if (i%2 > 0) {
                event = 1;
            }
            collection.save({
                _id: i,
                event: event,
                remainder: (i % 10)
            });
        }
        collection.update({event: 1}, {$set: {name:"mike"}}, {}, true);
        var o = collection.find({event:1});
        assert.equal(o[0].name, 'mike');
        assert.equal(o[0].event, 1);
        assert.equal(o[1].name, 'mike');
        assert.equal(o[1].event, 1);        
    });
    it('should test conditions for Ticket #38b', function() {
        var collection = Scule.factoryCollection('scule+dummy://test', {
            secret: 'mysecretkey'
        });
        for (var i = 0; i < 1000; i++) {
            var event = 2;
            if (i%2 > 0) {
                event = 1;
            }
            collection.save({
                _id: i,
                event: event,
                remainder: (i % 10)
            });
        }
        collection.update({event:{$gte:2}}, {$set:{foo:'bar'}}, {$limit:10}, true);
        var o = collection.find({event:{$gte:2}});
        for (var i=0; i < 100; i++) {
            if (i < 10) {
                assert.equal(o[i].foo, 'bar');
            } else {
                assert.equal(false, o[i].hasOwnProperty('foo'));
            }
        }
    });    
});
