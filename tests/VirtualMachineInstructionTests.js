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

var vm      = require('../lib/com.scule.db.vm');
var db      = require('../lib/com.scule.db');
var inst    = require('../lib/com.scule.instrumentation');

exports['test VirtualMachineExecuteInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    machine.reset();
    machine.registerInstruction(0x42, function(vm, instruction) {
        vm.stack.push(instruction[1][0])
        vm.ipointer++;
    });
    assert.equal(machine.ipointer, 0);
    machine.executeInstruction([0x42, ['lol']]);
    assert.equal(machine.stack.peek(), 'lol');
    assert.equal(machine.ipointer, 1);
};

exports['test VirtualMachineHaltInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    machine.reset();
    machine.running = true;
    machine.executeInstruction([0x00, []]);
    assert.equal(false, machine.running);
    assert.equal(machine.ipointer, 1);
};

exports['test VirtualMachineBreakInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    machine.reset();
    machine.running = true;
    machine.executeInstruction([0x1A, []]);
    assert.equal(false, machine.running);
    assert.equal(machine.ipointer, 1);    
};

exports['test VirtualMachineStartInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    machine.reset();
    machine.executeInstruction([0x24, []]);
    assert.equal(true, machine.running);
    assert.equal(machine.ipointer, 1);    
};

exports['test VirtualMachineScanInstruction'] = function(beforeExit, assert) {
    db.dropAll();
    var collection = db.factoryCollection('scule+dummy://unittest');
    collection.ensureBTreeIndex('a', {
        order:100
    });
    for(var i=0; i < 1000; i++) {
        collection.save({
            a:1,
            b:2,
            c:3
        });
    }    
    var machine = vm.getVirtualMachine();
    machine.reset();
    machine.executeInstruction([0x1C, [collection]]);
    assert.equal(machine.ipointer, 1); 
    assert.equal(machine.stack.peek().length, 1000);
};

exports['test VirtualMachineRangeInstruction'] = function(beforeExit, assert) {
    db.dropAll();
    var collection = db.factoryCollection('scule+dummy://unittest');
    collection.ensureBTreeIndex('a', {
        order:100
    });
    for(var i=0; i < 1000; i++) {
        var r = i%10;
        collection.save({
            a:r,
            b:r,
            c:r
        });
    }    
    var machine = vm.getVirtualMachine();
    machine.reset();
    machine.executeInstruction([0x1D, [collection.indices[0], [3, 5, true, true]]]);
    assert.equal(machine.ipointer, 1); 
    assert.equal(machine.stack.peek().length, 300);
};

exports['test VirtualMachineFindInstruction'] = function(beforeExit, assert) {
    db.dropAll();
    var collection = db.factoryCollection('scule+dummy://unittest');
    collection.ensureHashIndex('a', {});
    for(var i=0; i < 1000; i++) {
        var r = i%10;
        collection.save({
            a:r,
            b:r,
            c:r
        });
    }    
    var machine = vm.getVirtualMachine();
    machine.reset();
    machine.executeInstruction([0x1B, [collection.indices[0], 2]]);
    assert.equal(machine.ipointer, 1); 
    assert.equal(machine.stack.peek().length, 100);
};

exports['test VirtualMachineStoreInstruction'] = function(beforeExit, assert) {
    db.dropAll();
    var collection = db.factoryCollection('scule+dummy://unittest');
    collection.ensureHashIndex('a', {});
    for(var i=0; i < 1000; i++) {
        var r = i%10;
        collection.save({
            a:r,
            b:r,
            c:r
        });
    }    
    var machine = vm.getVirtualMachine();
    machine.reset();
    machine.executeInstruction([0x1B, [collection.indices[0], 2]]);
    assert.equal(machine.ipointer, 1); 
    assert.equal(machine.stack.peek().length, 100);
    machine.executeInstruction([0x21, []]);
    assert.equal(machine.ipointer, 2);
    assert.equal(machine.registers[0].length, 100);
};

exports['test VirtualMachineTransposeInstruction'] = function(beforeExit, assert) {
    db.dropAll();
    var collection = db.factoryCollection('scule+dummy://unittest');
    collection.ensureHashIndex('a', {});
    for(var i=0; i < 1000; i++) {
        var r = i%10;
        collection.save({
            a:r,
            b:r,
            c:r
        });
    }    
    var machine = vm.getVirtualMachine();
    machine.reset();
    machine.executeInstruction([0x1B, [collection.indices[0], 2]]);
    assert.equal(machine.ipointer, 1); 
    assert.equal(machine.stack.peek().length, 100);
    machine.executeInstruction([0x21, []]);
    assert.equal(machine.ipointer, 2);
    assert.equal(machine.registers[0].length, 100);
    machine.executeInstruction([0x28, []]);
    assert.equal(machine.ipointer, 3);
    assert.equal(machine.result.length, 100);
};

exports['test VirtualMachineReadInstruction'] = function(beforeExit, assert) {
    db.dropAll();
    var collection = db.factoryCollection('scule+dummy://unittest');
    collection.ensureHashIndex('a', {});
    for(var i=0; i < 1000; i++) {
        var r = i%10;
        collection.save({
            a:r,
            b:r,
            c:r
        });
    }    
    var machine = vm.getVirtualMachine();
    machine.reset();
    machine.executeInstruction([0x1B, [collection.indices[0], 2]]);
    assert.equal(machine.ipointer, 1); 
    assert.equal(machine.stack.peek().length, 100);
    machine.executeInstruction([0x21, []]);
    assert.equal(machine.ipointer, 2);
    assert.equal(machine.registers[0].length, 100);
    machine.executeInstruction([0x27, []]);
    assert.equal(machine.ipointer, 3);
    assert.equal(machine.dpointer, 1);
    assert.equal(machine.registers[1].a, 2);
};

exports['test VirtualMachineShiftInstruction'] = function(beforeExit, assert) {
    db.dropAll();
    var collection = db.factoryCollection('scule+dummy://unittest');
    collection.ensureHashIndex('a', {});
    for(var i=0; i < 1000; i++) {
        var r = i%10;
        collection.save({
            a:r,
            b:r,
            c:r
        });
    }    
    var machine = vm.getVirtualMachine();
    machine.reset();
    machine.executeInstruction([0x1B, [collection.indices[0], 2]]);
    assert.equal(machine.ipointer, 1); 
    assert.equal(machine.stack.peek().length, 100);
    machine.executeInstruction([0x21, []]);
    assert.equal(machine.ipointer, 2);
    assert.equal(machine.registers[0].length, 100);
    machine.executeInstruction([0x27, []]);
    assert.equal(machine.ipointer, 3);
    assert.equal(machine.dpointer, 1);
    assert.equal(machine.registers[1].a, 2);
    machine.stack.push(true);
    machine.executeInstruction([0x20, []]);
    assert.equal(machine.ipointer, 4);
    assert.equal(machine.dpointer, 1);
    assert.equal(machine.registers[1], machine.result[machine.result.length - 1]);
};

exports['test VirtualMachineIntersectInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    machine.reset();
    
    var list1 = [];
    var list2 = [];
    
    for(var i=0; i < 1000; i++) {
        var o = {
            _id:db.getObjectId()
        };
        list1.push(o);
        if(i%2 == 0) {
            list2.push(o);
        }
    }
    
    machine.running;
    machine.stack.push(list1);
    machine.stack.push(list2);
    machine.executeInstruction([0x23, []]);
    assert.equal(machine.ipointer, 1);
    assert.equal(machine.dpointer, 0);
    assert.equal(machine.stack.peek().length, 500);
};

exports['test VirtualMachineAndInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    machine.reset();
    machine.running;
    machine.stack.push(true);
    machine.stack.push(true);
    machine.executeInstruction([0x01, [2]]);
    assert.equal(true, machine.stack.peek());
    machine.stack.push(false);
    machine.executeInstruction([0x01, [2]]);
    assert.equal(false, machine.stack.peek());    
};

exports['test VirtualMachineOrInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    machine.reset();
    machine.running;
    machine.stack.push(true);
    machine.stack.push(true);
    machine.executeInstruction([0x02, [2]]);
    assert.equal(true, machine.stack.peek());
    machine.stack.push(false);
    machine.executeInstruction([0x02, [2]]);
    assert.equal(true, machine.stack.peek());    
};

exports['test VirtualMachineGotoInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    machine.reset();
    machine.running;
    assert.equal(machine.ipointer, 0);
    machine.executeInstruction([0x26, [42]]); 
    assert.equal(machine.ipointer, 42);
};

exports['test VirtualMachineJumpInstruction'] = function(beforeExit, assert) {
    var list = [];
    for(var i=0; i < 100; i++) {
        var o = {
            _id:db.getObjectId()
        };
        list.push(o);
    }    
    var machine = vm.getVirtualMachine();
    machine.reset();
    machine.running;
    machine.dpointer = 100;
    machine.registers[0] = list;
    assert.equal(machine.ipointer, 0);
    machine.executeInstruction([0x25, [42]]); 
    assert.equal(machine.ipointer, 42);
    machine.reset();
    machine.running;
    machine.dpointer = 50;
    machine.registers[0] = list;
    assert.equal(machine.ipointer, 0);
    machine.executeInstruction([0x25, [42]]);
    assert.equal(machine.ipointer, 1);    
};

exports['test VirtualMachineEqInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    machine.reset();
    machine.running;
    machine.registers[1] = {
        a: 1,
        b: 2,
        c: {
            d:3
        }
    };
    assert.equal(machine.ipointer, 0);
    assert.equal(true, machine.stack.isEmpty());
    machine.executeInstruction([0xC, ['c.d', 3]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(true, machine.stack.peek());
};

exports['test VirtualMachineNeInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    machine.reset();
    machine.running;
    machine.registers[1] = {
        a: 1,
        b: 2,
        c: {
            d:3
        }
    };
    assert.equal(machine.ipointer, 0);
    assert.equal(true, machine.stack.isEmpty());
    machine.executeInstruction([0xD, ['c.d', 3]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(false, machine.stack.peek());
};

exports['test VirtualMachineGtInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    
    machine.reset();
    machine.running;
    machine.registers[1] = {
        a: 1,
        b: 2,
        c: {
            d:3
        }
    };
    assert.equal(machine.ipointer, 0);
    assert.equal(true, machine.stack.isEmpty());
    machine.executeInstruction([0x07, ['c.d', 2]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(true, machine.stack.peek());

    machine.reset();
    machine.running;
    machine.registers[1] = {
        a: 1,
        b: 2,
        c: {
            d:3
        }
    };
    assert.equal(machine.ipointer, 0);
    assert.equal(true, machine.stack.isEmpty());
    machine.executeInstruction([0x07, ['c.d', 3]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(false, machine.stack.peek());    
};

exports['test VirtualMachineGteInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    
    machine.reset();
    machine.running;
    machine.registers[1] = {
        a: 1,
        b: 2,
        c: {
            d:3
        }
    };
    assert.equal(machine.ipointer, 0);
    assert.equal(true, machine.stack.isEmpty());
    machine.executeInstruction([0x08, ['c.d', 2]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(true, machine.stack.peek());

    machine.reset();
    machine.running;
    machine.registers[1] = {
        a: 1,
        b: 2,
        c: {
            d:3
        }
    };
    assert.equal(machine.ipointer, 0);
    assert.equal(true, machine.stack.isEmpty());
    machine.executeInstruction([0x08, ['c.d', 3]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(true, machine.stack.peek());    
};

exports['test VirtualMachineLtInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    
    machine.reset();
    machine.running;
    machine.registers[1] = {
        a: 1,
        b: 2,
        c: {
            d:3
        }
    };
    assert.equal(machine.ipointer, 0);
    assert.equal(true, machine.stack.isEmpty());
    machine.executeInstruction([0x05, ['c.d', 4]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(true, machine.stack.peek());

    machine.reset();
    machine.running;
    machine.registers[1] = {
        a: 1,
        b: 2,
        c: {
            d:3
        }
    };
    assert.equal(machine.ipointer, 0);
    assert.equal(true, machine.stack.isEmpty());
    machine.executeInstruction([0x05, ['c.d', 3]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(false, machine.stack.peek());    
};

exports['test VirtualMachineLteInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    
    machine.reset();
    machine.running;
    machine.registers[1] = {
        a: 1,
        b: 2,
        c: {
            d:3
        }
    };
    assert.equal(machine.ipointer, 0);
    assert.equal(true, machine.stack.isEmpty());
    machine.executeInstruction([0x06, ['c.d', 4]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(true, machine.stack.peek());

    machine.reset();
    machine.running;
    machine.registers[1] = {
        a: 1,
        b: 2,
        c: {
            d:3
        }
    };
    assert.equal(machine.ipointer, 0);
    assert.equal(true, machine.stack.isEmpty());
    machine.executeInstruction([0x06, ['c.d', 3]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(true, machine.stack.peek());    
};

exports['test VirtualMachineInInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    machine.reset();
    machine.running;
    machine.registers[1] = {
        a: 1,
        b: 2,
        c: {
            d:3
        }
    };
    var table = db.Scule.$d.getHashTable();
    table.put(1, true);
    table.put(3, true);
    table.put(4, true);
    assert.equal(machine.ipointer, 0);
    assert.equal(true, machine.stack.isEmpty());
    machine.executeInstruction([0xA, ['c.d', table]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(true, machine.stack.peek());
    machine.reset();
    machine.running;
    machine.registers[1] = {
        a: 1,
        b: 2,
        c: {
            d:3
        }
    };
    assert.equal(machine.ipointer, 0);
    assert.equal(true, machine.stack.isEmpty());
    machine.executeInstruction([0xA, ['c', table]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(false, machine.stack.peek());    
};

exports['test VirtualMachineNinInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    machine.reset();
    machine.running;
    machine.registers[1] = {
        a: 1,
        b: 2,
        c: {
            d:3
        }
    };
    var table = db.Scule.$d.getHashTable();
    table.put(1, true);
    table.put(3, true);
    table.put(4, true);
    assert.equal(machine.ipointer, 0);
    assert.equal(true, machine.stack.isEmpty());
    machine.executeInstruction([0xB, ['c.d', table]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(false, machine.stack.peek());
    machine.reset();
    machine.running;
    machine.registers[1] = {
        a: 1,
        b: 2,
        c: {
            d:3
        }
    };
    assert.equal(machine.ipointer, 0);
    assert.equal(true, machine.stack.isEmpty());
    machine.executeInstruction([0xB, ['c', table]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(true, machine.stack.peek());    
};

exports['test VirtualMachineSizeInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    
    machine.reset();
    machine.running;
    machine.registers[1] = {
        a:[1, 2, 3, 4, 5, 6, 7]
    };
    assert.equal(machine.ipointer, 0);
    assert.equal(true, machine.stack.isEmpty());
    machine.executeInstruction([0xE, ['a', 7]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(true, machine.stack.peek());
    
    machine.reset();
    machine.running;
    machine.registers[1] = {
        a:[1, 2, 3, 4, 5, 6, 7]
    };
    assert.equal(machine.ipointer, 0);
    assert.equal(true, machine.stack.isEmpty());
    machine.executeInstruction([0xE, ['a', 5]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(false, machine.stack.peek());    
};

exports['test VirtualMachineExistsInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    
    machine.reset();
    machine.running;
    machine.registers[1] = {
        a:[1, 2, 3, 4, 5, 6, 7]
    };
    assert.equal(machine.ipointer, 0);
    assert.equal(true, machine.stack.isEmpty());
    machine.executeInstruction([0xF, ['a', true]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(true, machine.stack.peek());
    
    machine.reset();
    machine.running;
    machine.registers[1] = {
        a:[1, 2, 3, 4, 5, 6, 7]
    };
    assert.equal(machine.ipointer, 0);
    assert.equal(true, machine.stack.isEmpty());
    machine.executeInstruction([0xF, ['c', true]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(false, machine.stack.peek());    
};

exports['test VirtualMachineAllInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    var table = db.Scule.$d.getHashTable();
    table.put('foo', true);
    table.put('bar', true);
    
    machine.reset();
    machine.running;
    machine.registers[1] = {
        a:['foo', 'bar', 'poo']
    };
    assert.equal(machine.ipointer, 0);
    assert.equal(true, machine.stack.isEmpty());
    machine.executeInstruction([0x09, ['a', table]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(true, machine.stack.peek());
    
    table.put('lol');
    machine.reset();
    machine.running;
    machine.registers[1] = {
        a:['foo', 'bar', 'poo']
    };
    assert.equal(machine.ipointer, 0);
    assert.equal(true, machine.stack.isEmpty());
    machine.executeInstruction([0x09, ['c']]);
    assert.equal(machine.ipointer, 1);
    assert.equal(false, machine.stack.peek());    
};

exports['test VirtualMachineLimitInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    for(var i=0; i < 1000; i++) {
        machine.result.push({
            _id:db.getObjectId()
        });
    }
    assert.equal(machine.ipointer, 0);    
    machine.executeInstruction([0x29, [97]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(machine.result.length, 97);
}

exports['test VirtualMachineSetInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    machine.registers[1] = {
        _id:db.getObjectId(),
        foo:'bar'
    };
    
    machine.running = true;
    machine.upsert  = false;
    assert.equal(machine.ipointer, 0);
    machine.executeInstruction([0x12, [{
        foo:true
    }, 'lol']]);
    assert.equal(machine.ipointer, 1);
    assert.equal(machine.registers[1].foo, 'lol');
    machine.executeInstruction([0x12, [{
        bar:true
    }, 'foo']]);
    assert.equal(machine.ipointer, 2);
    assert.equal(false, ('bar' in machine.registers[1]));

    machine.reset();
    machine.running = true;
    machine.upsert  = true;
    machine.registers[1] = {
        _id:db.getObjectId(),
        foo:'bar'
    };    
    assert.equal(machine.ipointer, 0);
    machine.executeInstruction([0x12, [{
        foo:true
    }, 'lol']]);
    assert.equal(machine.ipointer, 1);
    assert.equal(machine.registers[1].foo, 'lol');
    machine.executeInstruction([0x12, [{
        bar:true
    }, 'foo']]);
    assert.equal(machine.ipointer, 2);
    assert.equal(machine.registers[1].bar, 'foo');
};

exports['test VirtualMachineUnsetInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    machine.registers[1] = {
        _id:db.getObjectId(),
        foo:'bar'
    };
    
    machine.running = true;
    machine.upsert  = false;
    assert.equal(machine.ipointer, 0);
    machine.executeInstruction([0x13, [{
        foo:true
    }]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(false, 'foo' in machine.registers[1]);
};

exports['test VirtualMachineIncInstruction'] = function(beforeExit, assert) {
    
    var machine = vm.getVirtualMachine();
    machine.registers[1] = {
        _id:db.getObjectId(),
        foo:'bar',
        count:0
    };
    
    machine.running = true;
    machine.upsert  = false;
    assert.equal(machine.ipointer, 0);
    machine.executeInstruction([0x14, [{
        foo:true
    }, 2]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(machine.registers[1].foo, 'bar');
    machine.executeInstruction([0x14, [{
        count:true
    }, 2]]);
    assert.equal(machine.ipointer, 2);
    assert.equal(machine.registers[1].count, 2);

    machine.reset();
    machine.registers[1] = {
        _id:db.getObjectId(),
        foo:'bar',
        count:0
    };
    
    machine.running = true;
    machine.upsert  = true;
    assert.equal(machine.ipointer, 0);
    machine.executeInstruction([0x14, [{
        count1:true
    }, 66]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(machine.registers[1].count1, 66);
    
};

exports['test VirtualMachineOPullInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    machine.registers[1] = {
        _id:db.getObjectId(),
        foo:'bar',
        arr:['foo', 'bar', 'poo']
    };
    machine.running = true;
    assert.equal(machine.ipointer, 0);
    machine.executeInstruction([0x15, [{
        arr:true
    }, 'poo']]);
    assert.equal(machine.ipointer, 1);
    assert.equal(JSON.stringify(machine.registers[1].arr), JSON.stringify(['foo', 'bar']));
};

exports['test VirtualMachineOPullAllInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    machine.registers[1] = {
        _id:db.getObjectId(),
        foo:'bar',
        arr:['foo', 'bar', 'poo']
    };
    machine.running = true;
    assert.equal(machine.ipointer, 0);
    machine.executeInstruction([0x16, [{
        arr:true
    }, ['poo', 'foo']]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(JSON.stringify(machine.registers[1].arr), JSON.stringify(['bar']));
};

exports['test VirtualMachinePopInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    machine.registers[1] = {
        _id:db.getObjectId(),
        foo:'bar',
        arr:['foo', 'bar', 'poo']
    };
    machine.running = true;
    assert.equal(machine.ipointer, 0);
    machine.executeInstruction([0x17, [{
        arr:true
    }]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(JSON.stringify(machine.registers[1].arr), JSON.stringify(['foo', 'bar']));
    machine.executeInstruction([0x17, [{
        arr:true
    }]]);
    assert.equal(machine.ipointer, 2);
    assert.equal(JSON.stringify(machine.registers[1].arr), JSON.stringify(['foo']));
};

exports['test VirtualMachineOPushInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    machine.registers[1] = {
        _id:db.getObjectId(),
        foo:'bar',
        arr:['foo', 'bar', 'poo']
    };
    machine.running = true;
    assert.equal(machine.ipointer, 0);
    machine.executeInstruction([0x18, [{
        arr:true
    }, 'poo']]);
    assert.equal(machine.ipointer, 1);
    assert.equal(JSON.stringify(machine.registers[1].arr), JSON.stringify(['foo', 'bar', 'poo', 'poo']));
    machine.executeInstruction([0x18, [{
        arr:true
    }, 'poo2']]);
    assert.equal(machine.ipointer, 2);
    assert.equal(JSON.stringify(machine.registers[1].arr), JSON.stringify(['foo', 'bar', 'poo', 'poo', 'poo2']));    
};

exports['test VirtualMachineOPushAllInstruction'] = function(beforeExit, assert) {
    var machine = vm.getVirtualMachine();
    machine.registers[1] = {
        _id:db.getObjectId(),
        foo:'bar',
        arr:['foo', 'bar', 'poo']
    };
    machine.running = true;
    assert.equal(machine.ipointer, 0);
    machine.executeInstruction([0x19, [{
        arr:true
    }, ['poo', 'foo']]]);
    assert.equal(machine.ipointer, 1);
    assert.equal(JSON.stringify(machine.registers[1].arr), JSON.stringify(['foo', 'bar', 'poo', 'poo', 'foo']));
};