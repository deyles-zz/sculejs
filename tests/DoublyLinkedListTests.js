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
 *     * Neither the name of the <organization> nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var sculedb   = require('../lib/com.scule.db');
var jsunit = require('../lib/com.scule.jsunit');

function testDoublyLinkedListSize() {
    var list = sculedb.Scule.$d.getDoublyLinkedList();
    list.add(1);
    list.add(2);
    list.add(3);
    list.add(4);
    jsunit.assertEquals(list.getLength(), 4);
}

function testDoublyLinkedListGet() {
    var list = sculedb.Scule.$d.getDoublyLinkedList();
    list.add(1);
    list.add(2);
    list.add(3);
    list.add(4);
    list.add(5);
    list.add(6);
    list.add(7);
    list.add(8);
    var node = list.get(4);
    jsunit.assertEquals(node.getElement(), 5);
};

function testDoublyLinkedListClear() {
    var list = sculedb.Scule.$d.getDoublyLinkedList();
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

function testDoublyLinkedListIsEmpty() {
    var list = sculedb.Scule.$d.getDoublyLinkedList();
    list.add(1);
    list.add(2);
    jsunit.assertFalse(list.isEmpty());
}

function testDoublyLinkedListRemove() {
    var list = sculedb.Scule.$d.getDoublyLinkedList();
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

function testDoublyLinkedListTrim() {
    var list = sculedb.Scule.$d.getDoublyLinkedList();
    list.add(1);
    list.add(2);
    list.add(3);
    list.add(4);
    list.add(5);
    list.add(6);
    list.add(7);
    list.add(8);
    list.trim();
    jsunit.assertEquals(list.getLength(), 7);
    jsunit.assertEquals(list.get(6).getElement(), 7);
    jsunit.assertEquals(list.get(7), null);
    list.trim();
    jsunit.assertEquals(list.getLength(), 6);
    jsunit.assertEquals(list.get(5).getElement(), 6);    
};

function testDoublyLinkedListPrepend() {
    var list = sculedb.Scule.$d.getDoublyLinkedList();
    list.add(1);
    list.add(2);
    list.add(3);
    list.add(4);
    list.add(5);
    list.add(6);
    list.add(7);
    list.add(8);
    list.prepend(0);
    jsunit.assertEquals(list.getLength(), 9);
    jsunit.assertEquals(list.getHead().getElement(), 0);
    list.prepend(-1);
    jsunit.assertEquals(list.getLength(), 10);
    jsunit.assertEquals(list.getHead().getElement(), -1);
};

function testDoublyLinkedListSplit() {
    var list1 = sculedb.Scule.$d.getDoublyLinkedList();
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
    jsunit.assertEquals(list1.tail.getElement(), 4);
    jsunit.assertEquals(list2.getLength(), 4);
    jsunit.assertEquals(list2.tail.getElement(), 8);
}

function testDoublyLinkedListSplit2() {
    var list1 = sculedb.Scule.$d.getDoublyLinkedList();
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
    jsunit.assertEquals(list1.tail.getElement(), 5);
    jsunit.assertEquals(list2.getLength(), 4);
    jsunit.assertEquals(list2.tail.getElement(), 9);
}

function testDoublyLinkedListMiddle() {
    var list = sculedb.Scule.$d.getDoublyLinkedList();
    list.add(1);
    list.add(2);
    list.add(3);
    list.add(4);
    list.add(5);
    list.add(6);
    list.add(7);
    list.add(8);
    jsunit.assertEquals(list.middle().getElement(), 4);
    list.add(9);
    jsunit.assertEquals(list.middle().getElement(), 5); 
    list.add(10);
    jsunit.assertEquals(list.middle().getElement(), 5);
};

function testDoublyLinkedListReverse() {
    var list = sculedb.Scule.$d.getDoublyLinkedList();
    list.add(1);
    list.add(2);
    list.add(3);
    list.add(4);
    list.add(5);
    list.add(6);
    list.add(7);
    list.add(8);
    jsunit.assertEquals(list.getHead().getElement(), 1);
    jsunit.assertEquals(list.getTail().getElement(), 8);
    list.reverse();
    jsunit.assertEquals(list.getHead().getElement(), 8);
    jsunit.assertEquals(list.getTail().getElement(), 1);
};

function testDoublyLinkedListSort() {
    var list = sculedb.Scule.$d.getDoublyLinkedList();
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

function testDoublyLinkedListContains() {
    var list = sculedb.Scule.$d.getDoublyLinkedList();
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

function testDoublyLinkedListArraySearch() {
    var list = sculedb.Scule.$d.getLinkedList();
    for(var i=0; i < 1000; i++) {
        list.add([i, (i*2), (i-1)]);
    }    
    jsunit.assertTrue(list.search([500, 1000, 499], null, sculedb.Scule.$f.compareArray));
    jsunit.assertFalse(list.search([500, 1000, 498], null, sculedb.Scule.$f.compareArray));
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testDoublyLinkedListSize);
    jsunit.addTest(testDoublyLinkedListGet);
    jsunit.addTest(testDoublyLinkedListClear);
    jsunit.addTest(testDoublyLinkedListIsEmpty);
    jsunit.addTest(testDoublyLinkedListRemove);
    jsunit.addTest(testDoublyLinkedListTrim);
    jsunit.addTest(testDoublyLinkedListPrepend);
    jsunit.addTest(testDoublyLinkedListSplit);
    jsunit.addTest(testDoublyLinkedListSplit2);
    jsunit.addTest(testDoublyLinkedListMiddle);
    jsunit.addTest(testDoublyLinkedListReverse);
    jsunit.addTest(testDoublyLinkedListSort);
    jsunit.addTest(testDoublyLinkedListContains);
    jsunit.addTest(testDoublyLinkedListArraySearch);
    jsunit.runTests();
}());