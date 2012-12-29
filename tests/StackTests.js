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