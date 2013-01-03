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

var sculedb   = require('../lib/com.scule.db');

exports['test LinkedListSize'] = function(beforeExit, assert) {
    var list = sculedb.Scule.$d.getLinkedList();
    list.add(1);
    list.add(2);
    list.add(3);
    list.add(4);
    assert.equal(list.getLength(), 4);
}

exports['test LinkedListGet'] = function(beforeExit, assert) {
    var list = sculedb.Scule.$d.getLinkedList();
    list.add(1);
    list.add(2);
    list.add(3);
    list.add(4);
    list.add(5);
    list.add(6);
    list.add(7);
    list.add(8);
    var node = list.get(4);
    assert.equal(node.getElement(), 5);
};

exports['test LinkedListSplit'] = function(beforeExit, assert) {
    var list1 = sculedb.Scule.$d.getLinkedList();
    list1.add(1);
    list1.add(2);
    list1.add(3);
    list1.add(4);
    list1.add(5);
    list1.add(6);
    list1.add(7);
    list1.add(8);
    var list2 = list1.split(4);
    assert.equal(list1.getLength(), 4);
    assert.equal(list1.tail.getElement(), 4);
    assert.equal(list2.getLength(), 4);
    assert.equal(list2.tail.getElement(), 8);
}

exports['test LinkedListSplit2'] = function(beforeExit, assert) {
    var list1 = sculedb.Scule.$d.getLinkedList();
    list1.add(1);
    list1.add(2);
    list1.add(3);
    list1.add(4);
    list1.add(5);
    list1.add(6);
    list1.add(7);
    list1.add(8);
    list1.add(9);
    var list2 = list1.split();
    assert.equal(list1.getLength(), 5);
    assert.equal(list1.tail.getElement(), 5);
    assert.equal(list2.getLength(), 4);
    assert.equal(list2.tail.getElement(), 9);
}

exports['test LinkedListClear'] = function(beforeExit, assert) {
    var list = sculedb.Scule.$d.getLinkedList();
    list.add(1);
    list.add(2);
    list.add(3);
    list.add(4);
    list.add(5);
    list.add(6);
    list.add(7);
    list.add(8);
    list.clear();
    assert.equal(list.getLength(), 0);
    assert.equal(list.getHead(), null);
}

exports['test LinkedListContains'] = function(beforeExit, assert) {
    var list = sculedb.Scule.$d.getLinkedList();
    list.add(1);
    list.add(2);
    list.add(3);
    list.add(4);
    list.add(5);
    list.add(6);
    list.add(7);
    list.add(8);
    assert.equal(true, list.contains(6)); 
    assert.equal(false, list.contains(10));
};

exports['test LinkedListIsEmpty'] = function(beforeExit, assert) {
    var list = sculedb.Scule.$d.getLinkedList();
    list.add(1);
    list.add(2);
    assert.equal(false, list.isEmpty());
}

exports['test LinkedListRemove'] = function(beforeExit, assert) {
    var list = sculedb.Scule.$d.getLinkedList();
    list.add(1);
    list.add(2);
    list.add(3);
    list.add(4);
    list.add(5);
    list.add(6);
    list.add(7);
    list.add(8);
    list.remove(4);
    assert.equal(list.remove(-1), null);
    assert.equal(list.remove(10), null);
    assert.equal(list.getLength(), 7);
    assert.equal(list.get(4).getElement(), 6);
};

exports['test LinkedListReverse'] = function(beforeExit, assert) {
    var list = sculedb.Scule.$d.getLinkedList();
    list.add(1);
    list.add(2);
    list.add(3);
    list.add(4);
    list.add(5);
    list.add(6);
    list.add(7);
    list.add(8);
    list.reverse();
    assert.equal(list.getHead().getElement(), 8);
    assert.equal(list.getTail().getElement(), 1);
};

exports['test LinkedListSearch'] = function(beforeExit, assert) {
    var list = sculedb.Scule.$d.getLinkedList();
    for(var i=0; i < 1000; i++) {
        list.add(i);
    }
    assert.equal(true, list.search(555) !== null);
    assert.equal(true, list.search('foo') === null);
};

exports['test LinkedListArraySearch'] = function(beforeExit, assert) {
    var list = sculedb.Scule.$d.getLinkedList();
    for(var i=0; i < 1000; i++) {
        list.add([i, (i*2), (i-1)]);
    }    
    assert.equal(true, list.search([500, 1000, 499], null, sculedb.Scule.$f.compareArray) !== null);
    assert.equal(true, list.search([500, 1000, 498], null, sculedb.Scule.$f.compareArray) === null);
};

exports['test LinkedListSort'] = function(beforeExit, assert) {
    var list = sculedb.Scule.$d.getLinkedList();
    for(var i=0; i < 30; i++) {
        list.add(sculedb.Scule.$f.randomFromTo(10, 10000));
    }
    list.sort();
    var curr = list.head;
    while(curr && curr.next) {
        assert.equal(true, (curr.element <= curr.next.element));
        curr = curr.next;
    }
};