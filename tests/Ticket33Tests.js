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

var scule = require('../lib/com.scule.db');

exports['test Ticket33 sort'] = function(beforeExit, assert) {

    var lastNames = ['Edgar', 'Adams', 'Jones', 'Bryan', 'Smith', 'Doe', 'Lennard', 'Turkish', 'Allan', 'Collins'];
 
    scule.dropAll();
    var collection = scule.factoryCollection('scule+dummy://ticket33');
    collection.clear();
    for (var i=0; i < 100; i++) {
        var o = {
            position: i,
            last_name: lastNames[Math.floor((i/10))]
        };
        collection.save(o);
    }

    var a = ["Adams","Adams","Adams","Adams","Adams","Adams","Adams","Adams","Adams","Adams","Bryan","Edgar","Edgar","Edgar","Edgar"];
    collection.find({position:{$lte:30}}, {$sort:{last_name:2}, $limit:15}, function(players) {
        for (var i=0; i < players.length; i++) {
            assert.equal(a[i], players[i].last_name);
        }
    });

};

exports['test Ticket33 skip'] = function(beforeExit, assert) {

    var lastNames = ['Edgar', 'Adams', 'Jones', 'Bryan', 'Smith', 'Doe', 'Lennard', 'Turkish', 'Allan', 'Collins'];
 
    scule.dropAll();
    var collection = scule.factoryCollection('scule+dummy://ticket33');
    collection.clear();
    for (var i=0; i < 100; i++) {
        var o = {
            position: i,
            last_name: lastNames[Math.floor((i/10))]
        };
        collection.save(o);
    }

    var a = [];
    collection.find({position:{$lte:60}}, {$sort:{last_name:2}, $limit:30}, function(players) {
        for (var i=0; i < players.length; i++) {
            a.push(players[i].position);
        }
    });
    
    collection.find({position:{$lte:60}}, {$sort:{last_name:2}, $skip:15, $limit:15}, function(players) {
        for (var i=0; i < players.length; i++) {
            assert.equal(a[i+15], players[i].position);
        }
    });

};