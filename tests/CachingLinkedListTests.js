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
var jsunit = require('../lib/com.scule.jsunit');

exports['test CachingLinkedListSize'] = function(beforeExit, assert) {
    var list = sculedb.Scule.$d.getCachingLinkedList(10, 'key');
    list.add({
        key: 'foo', 
        bar: 1
    });
    list.add({
        key: 'foo1', 
        bar: 2
    });
    list.add({
        key: 'foo2', 
        bar: 3
    });
    list.add({
        key: 'foo3', 
        bar: 4
    });
    assert.equal(list.getLength(), 4);
}

exports['test CachingLinkedListGet'] = function(beforeExit, assert) {
    var list = sculedb.Scule.$d.getCachingLinkedList(10, 'key');
    list.add({
        key: 'foo', 
        bar: 1
    });
    list.add({
        key: 'foo1', 
        bar: 2
    });
    list.add({
        key: 'foo2', 
        bar: 3
    });
    list.add({
        key: 'foo3', 
        bar: 4
    });
    list.add({
        key: 'foo4', 
        bar: 5
    });
    list.add({
        key: 'foo5', 
        bar: 6
    });
    list.add({
        key: 'foo6', 
        bar: 7
    });
    list.add({
        key: 'foo7', 
        bar: 8
    });
    var node = list.get(4);
    assert.equal(node.getElement().bar, 5);
};

exports['test CachingLinkedListSplit'] = function(beforeExit, assert) {
    var list1 = sculedb.Scule.$d.getCachingLinkedList(10, 'key');
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
    assert.equal(list1.getTail().getElement(), 4);
    assert.equal(list2.getLength(), 4);
    assert.equal(list2.getTail().getElement(), 8);
}

exports['test CachingLinkedListSplit2'] = function(beforeExit, assert) {
    var list1 = sculedb.Scule.$d.getCachingLinkedList(10, 'key');
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
    assert.equal(list1.getTail().getElement(), 5);
    assert.equal(list2.getLength(), 4);
    assert.equal(list2.getTail().getElement(), 9);
}

exports['test CachingLinkedListClear'] = function(beforeExit, assert) {
    var list = sculedb.Scule.$d.getCachingLinkedList(10, 'key');
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

exports['test CachingLinkedListContains'] = function(beforeExit, assert) {
    var list = sculedb.Scule.$d.getCachingLinkedList(10, 'key');
    list.add(1);
    list.add(2);
    list.add(3);
    list.add(4);
    list.add(5);
    list.add(6);
    list.add(7);
    list.add(8);
    assert.equal(list.contains(6), true); 
    assert.equal(list.contains(10), false);
};

exports['test CachingLinkedListIsEmpty'] = function(beforeExit, assert) {
    var list = sculedb.Scule.$d.getCachingLinkedList(10, 'key');
    list.add(1);
    list.add(2);
    assert.equal(list.isEmpty(), false);
}

exports['test CachingLinkedListRemove'] = function(beforeExit, assert) {
    var list = sculedb.Scule.$d.getCachingLinkedList(10, 'key');
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

exports['test CachingLinkedListReverse'] = function(beforeExit, assert) {
    var list = sculedb.Scule.$d.getCachingLinkedList(10, 'key');
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

exports['test CachingLinkedListSort'] = function(beforeExit, assert) {
    var list = sculedb.Scule.$d.getCachingLinkedList(10, 'key');
    for(var i=0; i < 30; i++) {
        list.add(sculedb.Scule.$f.randomFromTo(10, 10000));
    }
    list.sort();
    var curr = list.head;
    while(curr && curr.next) {
        jsunit.assertTrue((curr.element <= curr.next.element));
        curr = curr.next;
    }
};

exports['test CachingLinkedListComparison'] = function(beforeExit, assert) {
    var list  = sculedb.Scule.$d.getLinkedList();
    var clist = sculedb.Scule.$d.getCachingLinkedList(10, 'key');

    var value;
    var i = 0;
    for(; i < 10000; i++) {
        value = 'test' + sculedb.Scule.$f.randomFromTo(100000, 200000);
        list.add({key:i, value:value});
        clist.add({key:i, value:value})
    }
    for(i=0; i < 1000; i++) {
        clist.search(sculedb.Scule.$f.randomFromTo(1, 100000));
    }
    assert.equal(list.search(999, 'key').getElement().key, clist.search(999, 'key').getElement().key);
    assert.equal(list.search(599, 'key').getElement().value, clist.search(599, 'key').getElement().value);
};