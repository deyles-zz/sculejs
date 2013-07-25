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

describe('DoublyLinkedList', function() {
    it('should verify the size of the list', function() {
        var list = Scule.getDoublyLinkedList();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        assert.equal(list.getLength(), 4);        
    });
    it('should retrieve an entry from a list', function() {
        var list = Scule.getDoublyLinkedList();
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
    });
    it('should remove all elements from a list', function() {
        var list = Scule.getDoublyLinkedList();
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
    });
    it('should should empty a list', function() {
        var list = Scule.getDoublyLinkedList();
        list.add(1);
        list.add(2);
        assert.equal(list.isEmpty(), false);        
    });
    it('should remove an element from a list', function() {
        var list = Scule.getDoublyLinkedList();
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
    });
    it('should remove the last element from a list', function() {
        var list = Scule.getDoublyLinkedList();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        list.trim();
        assert.equal(list.getLength(), 7);
        assert.equal(list.get(6).getElement(), 7);
        assert.equal(list.get(7), null);
        list.trim();
        assert.equal(list.getLength(), 6);
        assert.equal(list.get(5).getElement(), 6);        
    });
    it('should add an element to the head of the list', function() {
        var list = Scule.getDoublyLinkedList();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        list.prepend(0);
        assert.equal(list.getLength(), 9);
        assert.equal(list.getHead().getElement(), 0);
        list.prepend(-1);
        assert.equal(list.getLength(), 10);
        assert.equal(list.getHead().getElement(), -1);
        list.trim();
        assert.equal(list.getLength(), 9);
        assert.equal(list.getHead().getElement(), -1);  
        list.prepend(22);
        assert.equal(list.getLength(), 10);
        assert.equal(list.getHead().getElement(), 22);         
    });
    it('should split a list into two lists', function() {
        var list1 = Scule.getDoublyLinkedList();
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
        
        list1 = Scule.getDoublyLinkedList();
        list1.add(1);
        list1.add(2);
        list1.add(3);
        list1.add(4);
        list1.add(5);
        list1.add(6);
        list1.add(7);
        list1.add(8);
        list1.add(9);
        list2 = list1.split();
        assert.equal(list1.getLength(), 5);
        assert.equal(list1.tail.getElement(), 5);
        assert.equal(list2.getLength(), 4);
        assert.equal(list2.tail.getElement(), 9);        
    });
    it('should return the element at the middle of the list', function() {
        var list = Scule.getDoublyLinkedList();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        assert.equal(list.middle().getElement(), 4);
        list.add(9);
        assert.equal(list.middle().getElement(), 5); 
        list.add(10);
        assert.equal(list.middle().getElement(), 5);        
    });
    it('should reverse a list', function() {
        var list = Scule.getDoublyLinkedList();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        assert.equal(list.getHead().getElement(), 1);
        assert.equal(list.getTail().getElement(), 8);
        list.reverse();
        assert.equal(list.getHead().getElement(), 8);
        assert.equal(list.getTail().getElement(), 1);        
    });
    it('should sort a list', function() {
        var list = Scule.getDoublyLinkedList();
        for(var i=0; i < 30; i++) {
            list.add(Scule.global.functions.randomFromTo(10, 10000));
        }
        list.sort();
        var curr = list.head;
        while(curr && curr.next) {
            assert.equal((curr.element <= curr.next.element), true);
            curr = curr.next;
        }        
    });
    it('should determine is a list contains a given value', function() {
        var list = Scule.getDoublyLinkedList();
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
    });
});