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

function testCachingLinkedListSize() {
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
    jsunit.assertEquals(list.getLength(), 4);
}

function testCachingLinkedListGet() {
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
    jsunit.assertEquals(node.getElement().bar, 5);
};

function testCachingLinkedListSplit() {
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
    jsunit.assertEquals(list1.getLength(), 4);
    jsunit.assertEquals(list1.getTail().getElement(), 4);
    jsunit.assertEquals(list2.getLength(), 4);
    jsunit.assertEquals(list2.getTail().getElement(), 8);
}

function testCachingLinkedListSplit2() {
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
    jsunit.assertEquals(list1.getLength(), 5);
    jsunit.assertEquals(list1.getTail().getElement(), 5);
    jsunit.assertEquals(list2.getLength(), 4);
    jsunit.assertEquals(list2.getTail().getElement(), 9);
}

function testCachingLinkedListClear() {
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
    jsunit.assertEquals(list.getLength(), 0);
    jsunit.assertEquals(list.getHead(), null);
}

function testCachingLinkedListContains() {
    var list = sculedb.Scule.$d.getCachingLinkedList(10, 'key');
    list.add(1);
    list.add(2);
    list.add(3);
    list.add(4);
    list.add(5);
    list.add(6);
    list.add(7);
    list.add(8);
    jsunit.assertTrue(list.contains(6)); 
    jsunit.assertFalse(list.contains(10));
};

function testCachingLinkedListIsEmpty() {
    var list = sculedb.Scule.$d.getCachingLinkedList(10, 'key');
    list.add(1);
    list.add(2);
    jsunit.assertFalse(list.isEmpty());
}

function testCachingLinkedListRemove() {
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
    jsunit.assertEquals(list.remove(-1), null);
    jsunit.assertEquals(list.remove(10), null);
    jsunit.assertEquals(list.getLength(), 7);
    jsunit.assertEquals(list.get(4).getElement(), 6);
};

function testCachingLinkedListReverse() {
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
    jsunit.assertEquals(list.getHead().getElement(), 8);
    jsunit.assertEquals(list.getTail().getElement(), 1);
};

function testCachingLinkedListSort() {
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

function testCachingLinkedListComparison() {
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
    jsunit.assertEquals(list.search(999, 'key').getElement().key, clist.search(999, 'key').getElement().key);
    jsunit.assertEquals(list.search(599, 'key').getElement().value, clist.search(599, 'key').getElement().value);
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testCachingLinkedListSize);
    jsunit.addTest(testCachingLinkedListGet);
    jsunit.addTest(testCachingLinkedListSplit);
    jsunit.addTest(testCachingLinkedListSplit2);
    jsunit.addTest(testCachingLinkedListClear);
    jsunit.addTest(testCachingLinkedListIsEmpty);
    jsunit.addTest(testCachingLinkedListContains);
    jsunit.addTest(testCachingLinkedListRemove);
    jsunit.addTest(testCachingLinkedListReverse);
    jsunit.addTest(testCachingLinkedListSort);
    jsunit.addTest(testCachingLinkedListComparison);
    jsunit.runTests();
}());