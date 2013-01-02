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

function testLIFOStackPushPop() {
    var stack = sculedb.Scule.$d.getLIFOStack();
    stack.push(1);
    stack.push(2);
    stack.push(3);
    stack.push(4);
    jsunit.assertEquals(stack.pop(), 4);
    jsunit.assertEquals(stack.pop(), 3);
    jsunit.assertEquals(stack.pop(), 2);
    jsunit.assertEquals(stack.pop(), 1);
};

function testLIFOStackPeek() {
    var stack = sculedb.Scule.$d.getLIFOStack();
    stack.push(1);
    stack.push(2);
    stack.push(3);
    stack.push(4);
    jsunit.assertEquals(stack.peek(), 4);
    stack.pop();
    jsunit.assertEquals(stack.pop(), 3);
};

function testLIFOStackClear() {
    var stack = sculedb.Scule.$d.getLIFOStack();
    stack.push(1);
    stack.push(2);
    stack.push(3);
    stack.push(4);
    stack.clear();
    jsunit.assertEquals(stack.getLength(), 0);
    jsunit.assertTrue(stack.isEmpty());
};

function testFIFOStackPushPop() {
    var stack = sculedb.Scule.$d.getFIFOStack();
    stack.push(1);
    stack.push(2);
    stack.push(3);
    stack.push(4);
    jsunit.assertEquals(stack.pop(), 1);
    jsunit.assertEquals(stack.pop(), 2);
    jsunit.assertEquals(stack.pop(), 3);
    jsunit.assertEquals(stack.pop(), 4);    
};

function testFIFOStackPeek() {
    var stack = sculedb.Scule.$d.getFIFOStack();
    stack.push(1);
    stack.push(2);
    stack.push(3);
    stack.push(4);
    jsunit.assertEquals(stack.peek(), 1);
    stack.pop();
    jsunit.assertEquals(stack.pop(), 2);    
};

function testFIFOStackClear() {
    var stack = sculedb.Scule.$d.getFIFOStack();
    stack.push(1);
    stack.push(2);
    stack.push(3);
    stack.push(4);
    stack.clear();
    jsunit.assertEquals(stack.getLength(), 0);
    jsunit.assertTrue(stack.isEmpty());    
};

function testQueueEnqueueDequeue() {
    var queue = sculedb.Scule.$d.getQueue();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    queue.enqueue(4);
    jsunit.assertEquals(queue.dequeue(), 1);
    jsunit.assertEquals(queue.dequeue(), 2);
    jsunit.assertEquals(queue.dequeue(), 3);
    jsunit.assertEquals(queue.dequeue(), 4);    
};

function testQueueClear() {
    var queue = sculedb.Scule.$d.getQueue();
    queue.push(1);
    queue.push(2);
    queue.push(3);
    queue.push(4);
    queue.clear();
    jsunit.assertEquals(queue.getLength(), 0);
    jsunit.assertTrue(queue.isEmpty());    
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testLIFOStackPushPop);
    jsunit.addTest(testLIFOStackPeek);
    jsunit.addTest(testLIFOStackClear);
    jsunit.addTest(testFIFOStackPushPop);
    jsunit.addTest(testFIFOStackPeek);
    jsunit.addTest(testFIFOStackClear);
    jsunit.addTest(testQueueEnqueueDequeue);
    jsunit.addTest(testQueueClear);    
    jsunit.runTests();
}());