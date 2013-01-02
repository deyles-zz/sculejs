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
var jsunit    = require('../lib/com.scule.jsunit');

function testLinkedListSize() {
    var list = sculedb.Scule.$d.getLinkedList();
    list.add(1);
    list.add(2);
    list.add(3);
    list.add(4);
    jsunit.assertEquals(list.getLength(), 4);
}

function testLinkedListGet() {
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
    jsunit.assertEquals(node.getElement(), 5);
};

function testLinkedListSplit() {
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
    jsunit.assertEquals(list1.getLength(), 4);
    jsunit.assertEquals(list1.tail.getElement(), 4);
    jsunit.assertEquals(list2.getLength(), 4);
    jsunit.assertEquals(list2.tail.getElement(), 8);
}

function testLinkedListSplit2() {
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
    jsunit.assertEquals(list1.getLength(), 5);
    jsunit.assertEquals(list1.tail.getElement(), 5);
    jsunit.assertEquals(list2.getLength(), 4);
    jsunit.assertEquals(list2.tail.getElement(), 9);
}

function testLinkedListClear() {
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
    jsunit.assertEquals(list.getLength(), 0);
    jsunit.assertEquals(list.getHead(), null);
}

function testLinkedListContains() {
    var list = sculedb.Scule.$d.getLinkedList();
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

function testLinkedListIsEmpty() {
    var list = sculedb.Scule.$d.getLinkedList();
    list.add(1);
    list.add(2);
    jsunit.assertFalse(list.isEmpty());
}

function testLinkedListRemove() {
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
    jsunit.assertEquals(list.remove(-1), null);
    jsunit.assertEquals(list.remove(10), null);
    jsunit.assertEquals(list.getLength(), 7);
    jsunit.assertEquals(list.get(4).getElement(), 6);
};

function testLinkedListReverse() {
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
    jsunit.assertEquals(list.getHead().getElement(), 8);
    jsunit.assertEquals(list.getTail().getElement(), 1);
};

function testLinkedListSearch() {
    var list = sculedb.Scule.$d.getLinkedList();
    for(var i=0; i < 1000; i++) {
        list.add(i);
    }
    jsunit.assertTrue(list.search(555) !== null);
    jsunit.assertTrue(list.search('foo') === null);
};

function testLinkedListArraySearch() {
    var list = sculedb.Scule.$d.getLinkedList();
    for(var i=0; i < 1000; i++) {
        list.add([i, (i*2), (i-1)]);
    }    
    jsunit.assertTrue(list.search([500, 1000, 499], null, sculedb.Scule.$f.compareArray) !== null);
    jsunit.assertTrue(list.search([500, 1000, 498], null, sculedb.Scule.$f.compareArray) === null);
};

function testLinkedListSort() {
    var list = sculedb.Scule.$d.getLinkedList();
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

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testLinkedListSize);
    jsunit.addTest(testLinkedListGet);
    jsunit.addTest(testLinkedListSplit);
    jsunit.addTest(testLinkedListSplit2);
    jsunit.addTest(testLinkedListClear);
    jsunit.addTest(testLinkedListIsEmpty);
    jsunit.addTest(testLinkedListContains);
    jsunit.addTest(testLinkedListRemove);
    jsunit.addTest(testLinkedListReverse);
    jsunit.addTest(testLinkedListSort);
    jsunit.addTest(testLinkedListSearch);
    jsunit.addTest(testLinkedListArraySearch);
    jsunit.runTests();
}());