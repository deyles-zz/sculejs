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
"use strict";

var md5 = {
    m: require('./com.jkm3.md5'),
    hash: function(s) {
        return this.m.hash(s);
    }
};

/**
 * @private
 * @type {Object}
 */
module.exports = {
    Scule:{
        functions:{},
        classes:{},
        variables:{
            line:0
        },
        instructions:{},
        constants:require('./com.scule.constants'),
        $f:require('./com.scule.functions').Scule.functions,
        $d:require('./com.scule.datastructures'),
        $q:require('./com.scule.db.parser').Scule,
        $p:require('./com.scule.db.parser')
    }
};

/**
 * @private
 * @type {Object}
 */
module.exports.Scule.instructions.table = {
    'halt':     0x00,
    'and':      0x01,
    'or':       0x02,
    'nor':      0x03,
    'not':      0x04,
    'lt':       0x05,
    'lte':      0x06,
    'gt':       0x07,
    'gte':      0x08,
    'all':      0x09,
    'in':       0xA,
    'nin':      0xB,
    'eq':       0xC,
    'ne':       0xD,
    'size':     0xE,
    'exists':   0xF,
    'within':   0x10,
    'near':     0x11,
    'set':      0x12,
    'unset':    0x13,
    'inc':      0x14,
    'opull':    0x15,
    'opullall': 0x16,
    'opop':     0x17,
    'opush':    0x18,
    'opushall': 0x19,
    'break':    0x1A,
    'find':     0x1B,
    'scan':     0x1C,
    'range':    0x1D,
    'push':     0x1E,
    'pop':      0x1F,
    'shift':    0x20,
    'store':    0x21,
    'merge':    0x22,
    'intersect':0x23,
    'start':    0x24,
    'jump':     0x25,
    'goto':     0x26,
    'read':     0x27,
    'transpose':0x28,
    'limit':    0x29,
    'sort':     0x2A,
    'rread':    0x2B,
    'rindex':   0x2C
};

/**
 * @private
 * @type {Object}
 */
module.exports.Scule.instructions.lookup = {
    0x00: 'halt',
    0x01: 'and',
    0x02: 'or',
    0x03: 'nor',
    0x04: 'not',
    0x05: 'lt',
    0x06: 'lte',
    0x07: 'gt',
    0x08: 'gte',
    0x09: 'all',
    0xA:  'in',
    0xB:  'nin',
    0xC:  'eq',
    0xD:  'ne',
    0xE:  'size',
    0xF:  'exists',
    0x10: 'within',
    0x11: 'near',
    0x12: 'set',
    0x13: 'unset',
    0x14: 'inc',
    0x15: 'opull',
    0x16: 'opullall',
    0x17: 'opop',
    0x18: 'opush',
    0x19: 'opushall',
    0x1A: 'break',
    0x1B: 'find',
    0x1C: 'scan',
    0x1D: 'range',
    0x1E: 'push',
    0x1F: 'pop',
    0x20: 'shift',
    0x21: 'store',
    0x22: 'merge',
    0x23: 'intersect',
    0x24: 'start',
    0x25: 'jump',
    0x26: 'goto',
    0x27: 'read',
    0x28: 'transpose',
    0x29: 'limit',
    0x2A: 'sort',
    0x2B: 'rread',
    0x2C: 'rindex'
};

/**
 * @private
 * @type {Object}
 */
module.exports.Scule.instructions.mapping = {
    $eq:     'eq',
    $ne:     'ne',
    $gt:     'gt',
    $gte:    'gte',
    $lt:     'lt',
    $lte:    'lte',
    $in:     'in',
    $nin:    'nin',
    $all:    'all',
    $size:   'size',
    $exists: 'exists',
    $near:   'near',
    $within: 'within',
    $and:    'and',
    $or:     'or',
    $limit:  'limit',
    $sort:   'sort',
    $set:    'set',
    $unset:  'unset',
    $inc:    'inc',
    $push:   'opush',
    $pushAll:'opushall',
    $pull:   'opull',
    $pullAll:'opullall',
    $pop:    'opop'
};

/**
 * @private
 * @type {Object}
 */
module.exports.Scule.instructions.index = {
    'find':  true,
    'range': true,
    'scan':  true
};

/**
 * A simple visitor pattern implementation
 * This object modifies a Scule QueryTree AST and replaces nodes covered by indices
 * with QueryIndex instances.
 * @see http://en.wikipedia.org/wiki/Visitor_pattern
 * @public
 * @constructor
 * @class {QueryTreeIndexSelectionVisitors}
 * @param {Collection} collection
 * @returns {Void}
 */
module.exports.Scule.classes.QueryTreeIndexSelectionVisitor = function(collection) {

    /**
     * @private
     */
    this.collection = collection;

    /**
     * Sets the collection for the visitor instance
     * @public
     * @param {Collection} collection the collection to use when visiting the parse tree
     * @returns {Void}
     */
    this.setCollection = function(collection) {
        this.collection = collection;
    };

    /**
     * Returns the collection for the visitor instance
     * @public
     * @returns {Null|Collection}
     */
    this.getCollection = function() {
        return this.collection;
    };
    
    /**
     * Visits the provided tree
     * @public
     * @param {QueryTree} tree the tree to visit
     * @returns {Void}
     */
    this.visit = function(tree) {
        var newRoot = module.exports.Scule.$f.cloneObject(tree.getRoot());
        try {
            this.visitNode(newRoot);
        } catch (e) {
            return;
        }
        tree.setRoot(newRoot);
    };    
    
    /**
     * @private
     */
    this.visitNode = function(node) {
        var self  = this;
        var range = module.exports.Scule.$d.getHashTable();
        var exact = module.exports.Scule.$d.getHashTable();
        this.populateAttributes(node, range, exact);
        range = range.getKeys().sort();
        exact = exact.getKeys().sort();

        if(range.length === 0 && exact.length === 0) {
            return;
        }
        
        var matches  = null;
        var indices  = this.collection.indices;
        
        for(var i=0; i < indices.length; i++) {
            var index = indices[i];
            matches = index.applies(exact, false);
            if(matches) {
                self.selectExactIndexes(node, matches);
            }
            matches = index.applies(range, true);
            if(matches) {
                self.selectRangeIndexes(node, matches);
            }
        }
    };

    /**
     * @private
     */
    this.populateAttributes = function(node, range, exact) {
        var self = this;
        node.children.forEach(function(child) {
            switch(child.getType()) {
                case module.exports.Scule.$q.arities.variable:
                    if(child.getFirstChild().getType() == module.exports.Scule.$q.arities.selective) {
                        child.children.forEach(function(clause) {
                            self.processClauses(child.getSymbol(), clause, range, exact);
                        });                        
                    } else {
                        self.processClauses(child.getSymbol(), child, range, exact);
                    }
                    break;
                    
                case module.exports.Scule.$q.arities.selective:
                    throw 'sub-expressions cannot use indexes';
                    break;
            }
        });
    };

    /**
     * @private
     */
    this.processClauses = function(symbol, node, range, exact) {
        node.children.forEach(function(child) {
            switch(child.getType()) {                   
                case module.exports.Scule.$q.arities.range:
                    range.put(symbol, true);
                    break;
                   
                case module.exports.Scule.$q.arities.operand:    
                case module.exports.Scule.$q.arities.binary:
                    exact.put(symbol, true);
                    break;                   
            }
        });
    };

    /**
     * @private
     */
    this.selectExactIndexes = function(node, matches) {
        
        var index = new module.exports.Scule.$q.classes.QueryIndex(matches.$index.getName());
        index.index = matches.$index;
        index.range = false;
        
        var values    = [];
        var backtrack = [];
        for(var i=0; i < node.children.length; i++) {
            var child  = node.children[i];
            var symbol = child.getSymbol();
            if(symbol in matches.$attr && matches.$attr[symbol]) {
                var clauses = child.children;
                if(child.getFirstChild().getType() == module.exports.Scule.$q.arities.selective) {
                    clauses = child.getFirstChild().children;
                }
                for(var j=0; j < clauses.length; j++) {
                    if(clauses[j].getSymbol() == '$eq') {
                        values.push(clauses[j].getFirstChild().getSymbol());
                        backtrack.push({
                            i_index: i,
                            j_index: j,
                            carray:   clauses,
                            parray:   node.children
                        });
                        break;
                    }
                }
            }
        }
        
        if(backtrack.length !== matches.$index.astrings.length) {
            return;
        } else {
            backtrack = backtrack.reverse();
            backtrack.forEach(function(tuple) {
                tuple.carray.splice(tuple.j_index, 1);
                if(tuple.carray.length === 0) {
                    tuple.parray.splice(tuple.i_index, 1);
                }
            });
        }
        
        node.children.unshift(index);
        index.args = values.join(',');
    };

    /**
     * @private
     */
    this.selectRangeIndexes = function(node, matches) {
        
        if(matches.$index.astrings.length > 1) {
            return;
        }
        
        var index = new module.exports.Scule.$q.classes.QueryIndex(matches.$index.getName());
        index.index = matches.$index;
        index.range = true;
        
        var backtrack = [];
        var count = 0;
        var values = [null, null];
        var flags  = [null, null];
        for(var i=0; i < node.children.length; i++) {
            var child  = node.children[i];
            var symbol = child.getSymbol();
            if(symbol in matches.$attr && matches.$attr[symbol]) {  
                if(!child.getFirstChild()) {
                    continue;
                }
                count++;
                var clauses = child.getFirstChild().children;
                for(var j=0; j < clauses.length; j++) {
                    var clause = clauses[j];
                    var match  = false;
                    switch(clause.getSymbol()) {
                        case '$gt':
                            match = true;
                            values[0] = clause.getFirstChild().getSymbol();
                            flags[0]  = false;
                            break;
                            
                        case '$gte':
                            match = true;
                            values[0] = clause.getFirstChild().getSymbol();
                            flags[0]  = true;                            
                            break;
                            
                        case '$lt':
                            match = true;
                            values[1] = clause.getFirstChild().getSymbol();
                            flags[1]  = false;                            
                            break;
                            
                        case '$lte':
                            match = true;
                            values[1] = clause.getFirstChild().getSymbol();
                            flags[1]  = true;                            
                            break;
                    }
                    if(match) {
                        backtrack.push({
                            i_index: i,
                            j_index: j,
                            carray:  clauses,
                            parray:  node.children                    
                        });                        
                    }
                }
            }
        }
        
        if(backtrack.length === 0 || count < matches.$index.astrings.length) {
            return;
        } else {
            backtrack = backtrack.reverse();
            backtrack.forEach(function(tuple) {
                tuple.carray.splice(tuple.j_index, 1);
                if(tuple.carray.length === 0) {
                    tuple.parray.splice(tuple.i_index, 1);
                }
            });
        }
        
        node.children.unshift(index);
        index.args = values.concat(flags);       
    };
    
};

/**
 * Represents a bytecode instruction
 * @public
 * @constructor
 * @class {ProgramInstruction}
 * @param {String} opcode the opcode for the instruction
 * @param {Array} args the parameters for the instruction
 * @returns {Void}
 */
module.exports.Scule.classes.ProgramInstruction = function(opcode, args) {
    
    /**
     * @private
     * @type {String}
     */
    this.opcode = opcode;
    
    /**
     * @private
     * @type {Array}
     */
    this.args   = args;

    /**
     * Returns an {Array} of bytecode instructions
     * @public
     * @returns {Array}
     */
    this.toByteCode = function() {
        module.exports.Scule.variables.line++;
        return [module.exports.Scule.instructions.table[this.opcode], args];
    };

    /**
     * Prints a human readable version of the block to the console
     * @public
     * @returns {Void}
     */
    this.explain = function() {
        var a = [];
        this.args.forEach(function(arg) {
            if(!arg) {
                return;
            }
            if(module.exports.Scule.$f.isScalar(arg)) {
                a.push(arg);
            } else {
                if('getName' in arg) {
                    a.push(arg.getName()); 
                } else {
                    a.push(arg); 
                }
            }
        });
        var encoded = '';
        if(a.length > 0) {
            try {
                encoded = JSON.stringify(a);
            } catch (e) {
                encoded = a[0].getName();
            }
        }
        console.log((module.exports.Scule.variables.line++) + ' ' + this.opcode + ' ' + encoded);
    };
    
};

/**
 * Represents a block of bytecode instructions in a scule program
 * @public
 * @constructor
 * @class {ProgramBlock}
 * @param {String} operand
 * @returns {Void}
 */
module.exports.Scule.classes.ProgramBlock = function(operand) {
    
    /**
     * @private
     * @type {String}
     */
    this.operand      = operand;
    
    /**
     * @private
     * @type {Array}
     */
    this.children     = [];
    
    /**
     * @private
     * @type {Array}
     */
    this.instructions = [];
    
    /**
     * @private
     * @type {LIFOStack}
     */
    this.scope = module.exports.Scule.$d.getLIFOStack();
    this.scope.push(this);
    
    /**
     * Adds a sub-block to the current block
     * @public
     * @param {ProgramBlock} block
     * @returns {Void}
     */
    this.addSubBlock = function(block) {
        this.children.push(block);
    };
    
    /**
     * Adds a new instruction to the block
     * @public
     * @param {String} opcode
     * @param {Array} args
     * @returns {Void}
     */
    this.addInstruction = function(opcode, args) {
        this.scope.peek().instructions.push(new module.exports.Scule.classes.ProgramInstruction(opcode, args));
    };
    
    this.startBlock = function() {
        var block = new module.exports.Scule.classes.ProgramBlock();
        this.scope.peek().addSubBlock(block);
        this.scope.push(block);        
    };
    
    /**
     * Starts a header block
     * @public
     * @returns {Void}
     */
    this.startHeadBlock = function() {
        var block = new module.exports.Scule.classes.ProgramBlock('head');
        this.scope.peek().addSubBlock(block);
        this.scope.push(block);
    };
    
    /**
     * Starts a scan block
     * @public
     * @param {Collection} collection
     * @param {Array} args
     * @returns {Void}
     */
    this.startScanBlock  = function(collection, args) {
        this.scope.peek().addInstruction('scan', [collection, args]);
    };
    
    /**
     * Starts a find block
     * @public
     * @param {Index} index
     * @param {Array} args
     * @returns {Void}
     */
    this.startFindBlock = function(index, args) {
        this.scope.peek().addInstruction('find', [index, args]);
    };

    /**
     * Starts a range block
     * @public
     * @param {Index} index
     * @param {Array} args
     * @returns {Void}
     */
    this.startRangeBlock = function(index, args) {
        this.scope.peek().addInstruction('range', [index, args]);
    };
    
    /**
     * Starts a block of AND-ed logical expressions. Stack based logical operations
     * use postfix polish notation http://en.wikipedia.org/wiki/Reverse_Polish_notation
     * @public
     * @returns {Void}
     */
    this.startAndBlock = function() {
        var block = new module.exports.Scule.classes.ProgramAndBlock();
        this.scope.peek().addSubBlock(block);
        this.scope.push(block);        
    };

    /**
     * Starts a block of OR-ed logical expressions. Stack based logical operations
     * use postfix polish notation http://en.wikipedia.org/wiki/Reverse_Polish_notation
     * @public
     * @returns {Void}
     */
    this.startOrBlock = function() {
        var block = new module.exports.Scule.classes.ProgramOrBlock();
        this.scope.peek().addSubBlock(block);
        this.scope.push(block);        
    };
    
    /**
     * Starts a GOTO based block of looped logical expressions
     * @public
     * @returns {Void}
     */
    this.startLoopBlock = function() {
        var block = new module.exports.Scule.classes.ProgramLoopBlock();
        this.scope.peek().addSubBlock(block);
        this.scope.push(block);        
    };
    
    /**
     * Closes the currently opened sub-block
     * @public
     * @returns {Void}
     */
    this.stopBlock = function() {
        this.scope.pop();
    };
    
    /**
     * Returns the operand for the block
     * @public
     * @returns {String}
     */
    this.getOperand = function() {
        return this.operand;
    };
    
    /**
     * Returns the sub-blocks for the block
     * @public
     * @returns {Array}
     */
    this.getChildren = function() {
        return this.children;
    };
    
    /**
     * Returns a bytecode representation of the block as an array of instructions
     * @public
     * @returns {Array}
     */
    this.toByteCode = function() {
        var code = [];
        if(this.children.length > 0) {
            this.children.forEach(function(block) {
                code = code.concat(block.toByteCode());
            });
        } else {
            this.instructions.forEach(function(instruction) {
                code.push(instruction.toByteCode());
            });
        }        
        return code;
    };
    
    /**
     * Prints a human readable version of the block to the console
     * @public
     * @returns {Void}
     */
    this.explain = function() {
        if(this.children.length > 0) {
            this.children.forEach(function(block) {
                block.explain();
            });
        } else {
            this.instructions.forEach(function(instruction) {
                instruction.explain();
            });
        }
    };
    
};

/**
 * Represents a block of OR-ed bytecode instructions in a scule program
 * @public
 * @constructor
 * @class {ProgramOrBlock}
 * @extends {ProgramBlock}
 * @returns {Void}
 */
module.exports.Scule.classes.ProgramOrBlock = function () {
    
    module.exports.Scule.classes.ProgramBlock.call(this, 'or');

    /**
     * Returns a bytecode representation of the block as an array of instructions
     * @public
     * @returns {Array}
     */
    this.toByteCode = function() {
        var code  = [];
        this.children.forEach(function(block) {
            code = code.concat(block.toByteCode());
        });
        if(this.children.length > 1) {
            code.push([0x02, [this.children.length]]);
            module.exports.Scule.variables.line++;
        }
        return code;
    };
 
    /**
     * Prints a human readable version of the block to the console
     * @public
     * @returns {Void}
     */
    this.explain = function() {
        this.children.forEach(function(block) {
            block.explain();
        });
        if(this.children.length > 1) {
            console.log((module.exports.Scule.variables.line++) + ' or [' + this.children.length + ']');
        }
    };

};

/**
 * Represents a block of AND-ed bytecode instructions in a scule program
 * @public
 * @constructor
 * @class {ProgramAndBlock}
 * @extends {ProgramBlock}
 * @returns {Void}
 */
module.exports.Scule.classes.ProgramAndBlock = function () {
    
    module.exports.Scule.classes.ProgramBlock.call(this, 'and');

    /**
     * Returns a bytecode representation of the block as an array of instructions
     * @public
     * @returns {Array}
     */
    this.toByteCode = function() {
        var count = 0;
        var code  = [];
        this.instructions.forEach(function(block) {
            code.push(block.toByteCode());
            count++;
        });
        this.children.forEach(function(block) {
            code = code.concat(block.toByteCode());
            count++;
        });
        if(count > 1) {
            code.push([0x01, [count]]);
            module.exports.Scule.variables.line++;
        }
        return code;        
    };
    
    /**
     * Prints a human readable version of the block to the console
     * @public
     * @returns {Void}
     */    
    this.explain = function() {
        var count = 0;
        this.instructions.forEach(function(block) {
            block.explain();
            count++;
        });
        this.children.forEach(function(block) {
            block.explain();
            count++;
        });        
        if(count > 1) {
            console.log((module.exports.Scule.variables.line++) + ' and [' + count + ']');       
        }
    };

};

/**
 * Represents a block of GOTO looped bytecode instructions in a scule program
 * @public
 * @constructor
 * @class {ProgramLoopBlock}
 * @extends {ProgramBlock}
 * @returns {Void}
 */
module.exports.Scule.classes.ProgramLoopBlock = function () {

    module.exports.Scule.classes.ProgramBlock.call(this, 'loop');

    /**
     * Returns a bytecode representation of the block as an array of instructions
     * @public
     * @returns {Array}
     */
    this.toByteCode = function() {
        var code = [];
        var read = module.exports.Scule.variables.line;
        code.push([0x27, []]);
        module.exports.Scule.variables.line++;
        this.children.forEach(function(block) {
            code = code.concat(block.toByteCode());
        });  
        code.push([0x20, []]);
        module.exports.Scule.variables.line++;
        code.push([0x25, [(module.exports.Scule.variables.line + 2)]]);  
        module.exports.Scule.variables.line++;
        code.push([0x26, [read]]);
        module.exports.Scule.variables.line++;
        return code;
    };

    /**
     * Prints a human readable version of the block to the console
     * @public
     * @returns {Void}
     */
    this.explain = function() {
        var read = module.exports.Scule.variables.line;
        console.log((module.exports.Scule.variables.line++) + ' read');
        this.children.forEach(function(block) {
            block.explain();
        });    
        console.log((module.exports.Scule.variables.line++) + ' shift');
        console.log((module.exports.Scule.variables.line++) + ' jump [' + (module.exports.Scule.variables.line + 1) + ']');        
        console.log((module.exports.Scule.variables.line++) + ' goto [' + read + ']');
    };

};

/**
 * Represents an entire program
 * @public
 * @constructor
 * @class {Program}
 * @extends {ProgramBlock}
 * @returns {Void}
 */
module.exports.Scule.classes.Program = function() {

    this.bytecode = [];

    module.exports.Scule.classes.ProgramBlock.call(this);

    /**
     * clears the generated bytecode instructions for the program
     * @public
     * @returns {Void}
     */
    this.clearByteCode = function() {
        this.bytecode = [];
    };

    /**
     * Returns the bytecode instructions for the program
     * @public
     * @returns {Array}
     */
    this.toByteCode = function() {
        return this.bytecode;
    };

};

/**
 * The builder portion of the Builder Pattern. Builds the actual program.
 * @see http://en.wikipedia.org/wiki/Builder_pattern
 * @public
 * @constructor
 * @class {ProgramBuilder}
 * @returns {Void}
 */
module.exports.Scule.classes.ProgramBuilder = function() {
  
    /**
     * @private
     * @type {Program}
     */
    this.program = new module.exports.Scule.classes.Program();

    /**
     * Builds the header of the program
     * @public
     * @returns {Void}
     */
    this.buildHead = function() {
        var children = this.program.getChildren();
        var block;
        for(var i=0; i < children.length; i++) {
            block = children[i];
            if(block.getOperand() == 'head') {
                this.program.bytecode = this.program.bytecode.concat(block.toByteCode());
                break;
            }
        }
        this.program.bytecode.push([0x23, []]);
        module.exports.Scule.variables.line++;
        this.program.bytecode.push([0x21, []]);
        module.exports.Scule.variables.line++;
    };

    /**
     * Prints a human readable version of the program to the console
     * @public
     * @returns {Void}
     */
    this.explainHead = function() {
        var children = this.program.getChildren();
        var block;
        for(var i=0; i < children.length; i++) {
            block = children[i];
            if(block.getOperand() == 'head') {
                block.explain();
                break;
            }
        }
        console.log((module.exports.Scule.variables.line++) + ' intersect');
        console.log((module.exports.Scule.variables.line++) + ' store');
    };

    /**
     * Builds the body of the program
     * @public
     * @returns {Void}
     */
    this.buildBody = function() {
        var children = this.program.getChildren();
        var count    = 0;
        var block;
        for(var i=0; i < children.length; i++) {
            block = children[i];
            if(block.getOperand() != 'head') {
                count++;
                this.program.bytecode = this.program.bytecode.concat(block.toByteCode());
            }
        }
        if(count === 0) {
            this.program.bytecode.push([0x28, []]);
            module.exports.Scule.variables.line++;
        }
    };
 
    /**
     * Prints a human readable version of the program body to the console
     * @public
     * @returns {Void}
     */
    this.explainBody = function() {
        var children = this.program.getChildren();
        var count    = 0;
        var block;
        for(var i=0; i < children.length; i++) {
            block = children[i];
            if(block.getOperand() != 'head') {
                count++;
                block.explain();
            }
        }  
        if(count === 0) {
            console.log((module.exports.Scule.variables.line++) + ' transpose');
        }
    };
    
    /**
     * Builds the tail of the program
     * @public
     * @returns {Void}
     */
    this.buildTail = function() {
        this.program.bytecode.push([0x00, []]);
        module.exports.Scule.variables.line++;
    };

    /**
     * Prints a human readable version of the program tail to the console
     * @public
     * @returns {Void}
     */
    this.explainTail = function() {
        console.log((module.exports.Scule.variables.line++) + ' halt');
    };

    /**
     * Returns the program instance for the builder
     * @public
     * @returns {Program}
     */
    this.getProgram = function() {
        return this.program;
    };

    /**
     * Prints a human readable version of the program to the console
     * @public
     * @returns {Void}
     */
    this.explainProgram = function() {
        module.exports.Scule.variables.line = 0;
        this.program.clearByteCode();
        this.explainHead();
        this.explainBody();
        this.explainTail();        
    };

    /**
     * Builds the program
     * @public
     * @returns {Void}
     */
    this.buildProgram = function() {
        module.exports.Scule.variables.line = 0;
        this.program.clearByteCode();
        this.buildHead();
        this.buildBody();
        this.buildTail();
    };
    
};

/**
 * The director portion of the builder pattern
 * @see http://en.wikipedia.org/wiki/Builder_pattern
 * @public
 * @constructor
 * @class {ProgramDirector}
 * @returns {Void}
 */
module.exports.Scule.classes.ProgramDirector = function() {
    
    /**
     * @private
     * @type {ProgramBuilder}
     */
    this.builder = null;
    
    /**
     * Sets the builder for the director
     * @public
     * @param {ProgramBuilder} builder
     * @returns {Void}
     */
    this.setProgramBuilder = function(builder) {
        this.builder = builder;
    };
    
    /**
     * Returns the program for the director/builder
     * @public
     * @returns {Program} program
     */
    this.getProgram = function() {
        return this.builder.getProgram();
    };
    
    /**
     * Builds the program
     * @public
     * @returns {Void}
     */
    this.buildProgram = function() {
        this.builder.buildProgram();
    };
    
    /**
     * Prints a human readable version of the program to the console
     * @public
     * @returns {Void}
     */
    this.explainProgram = function() {
        this.builder.explainProgram();
    };
    
};

/**
 * A class used to compile AST instances to scule bytecode
 * @public
 * @constructor
 * @class {AbstractSyntaxTreeCompiler}
 * @returns {Void}
 */
module.exports.Scule.classes.AbstractSyntaxTreeCompiler = function() {

    /**
     * Compiles an AST to a scule program
     * @public
     * @param {QueryTree} tree
     * @param {Object} conditions
     * @param {Collection} collection
     * @param {Boolean} explain
     * @returns {Program}
     */
    this.compile = function(tree, conditions, collection, explain) {

        if(!conditions) {
            conditions = {};
        }

        var loop     = false;
        var node     = tree.getRoot();
        
        var director = new module.exports.Scule.classes.ProgramDirector();
        director.setProgramBuilder(new module.exports.Scule.classes.ProgramBuilder());

        var program  = director.getProgram();
        
        program.startHeadBlock();
        if(!node.hasChildren() || node.getFirstChild().getType() !== module.exports.Scule.$q.arities.index) {
            program.addInstruction('scan', [collection]);
            program.stopBlock();
            loop = (node.children.length > 0);
        } else {
            var i=0;
            for(; i < node.children.length; i++) {
                var child = node.children[i];
                if(child.getType() !== module.exports.Scule.$q.arities.index) {
                    break;
                } else {
                    if(child.range) {
                        program.startRangeBlock(child.index, child.args);
                    } else {
                        program.startFindBlock(child.index, child.args);
                    }                    
                } 
            }
            program.stopBlock();
            loop = (i < node.children.length);
        }
            
        var compileVariable = function(variable) {
            variable.children.forEach(function(operator) {
                switch(operator.getType()) {
                    case module.exports.Scule.$q.arities.selective:
                        operator.children.forEach(function(op) {
                            compileOperator(variable, op);
                        });
                        break;
                            
                    case module.exports.Scule.$q.arities.array:
                    case module.exports.Scule.$q.arities.range:
                    case module.exports.Scule.$q.arities.binary:
                    case module.exports.Scule.$q.arities.negative:
                        compileOperator(variable, operator);
                        break;
                }
            });
        };
        
        var compileOperator = function(variable, operator) {
            var args = [operator.children[0].getSymbol()];
            args.unshift(variable.getSymbol());
            program.addInstruction(module.exports.Scule.instructions.mapping[operator.getSymbol()], args);
        };        
        
        var compile = function(node) {
            node.children.forEach(function(child) {
                switch(child.getType()) {
                    case module.exports.Scule.$q.arities.selective:
                        if(child.getSymbol() == '$or') {
                            program.startOrBlock();
                        } else {
                            program.startAndBlock();
                        }
                        compile(child);
                        program.stopBlock();
                        break;
                        
                    case module.exports.Scule.$q.arities.variable:
                        compileVariable(child);
                        break;
                        
                    case module.exports.Scule.$q.arities.expression:
                        program.startAndBlock();
                        compile(child);
                        program.stopBlock();
                        break;
                }
            });
        };
        
        if(loop) {
            program.startLoopBlock();
        }
        
        program.startAndBlock();
        compile(node);
        program.stopBlock();
        
        if(loop) {
            program.stopBlock();
        }

        program.startBlock();
        if(conditions.hasOwnProperty('$sort')) {
            for(var k in conditions.$sort) {
                if(conditions.$sort.hasOwnProperty(k)) {
                    program.addInstruction('sort', [k, conditions.$sort[k]]);
                    break;
                }
            }
        }
        if(conditions.hasOwnProperty('$limit')) {
            program.addInstruction('limit', [conditions.$limit]);
        }
        program.stopBlock();
        
        if(!loop) {
            program.startBlock();
            program.addInstruction('transpose', []);
            program.stopBlock();
        }
        
        if(explain) {
            director.explainProgram();
        }
        
        director.buildProgram();
        return director.getProgram();
    };

};

/**
 * A class that compiles query expression objects into Scule bytecode
 * @public
 * @constructor
 * @class {QueryCompiler}
 * @returns {Void}
 */
module.exports.Scule.classes.QueryCompiler = function() {
  
    /**
     * @private
     * @type {LRUCache}
     */
    this.cache    = module.exports.Scule.$d.getLRUCache(30);
    
    /**
     * @private
     * @type {QueryParser}
     */
    this.parser   = module.exports.Scule.$p.getQueryParser();
    
    /**
     * @private
     * @type {QueryTreeIndexSelectionVisitor}
     */
    this.visitor  = new module.exports.Scule.classes.QueryTreeIndexSelectionVisitor();

    /**
     * @private
     * @type {AbstractSyntaxTreeCompiler}
     */
    this.compiler = new module.exports.Scule.classes.AbstractSyntaxTreeCompiler();

    /**
     * Generates an array of bytecode instructions given a mutate query expression
     * @public
     * @param {Object} query the query expression {Object} to compile to bytecode
     * @param {Collection} collection the collection to compile against - used for index selection
     * @returns {Array}
     * @throws {Exception}
     */
    this.compileMutate = function(query, collection) {
        var instructions = [];
        
        instructions.push([module.exports.Scule.instructions.table.rread, []]);
        var operator = null;
        for(operator in query) {
            if(query.hasOwnProperty(operator)) {
                if(!module.exports.Scule.instructions.table.hasOwnProperty(module.exports.Scule.instructions.mapping[operator])) {
                    throw operator + ' is an unrecognized operator';
                }   
                var variable = null;
                for(variable in query[operator]) {
                    if(query[operator].hasOwnProperty(variable)) {
                        var opcode  = module.exports.Scule.instructions.table[module.exports.Scule.instructions.mapping[operator]];
                        instructions.push([opcode, [module.exports.Scule.$f.parseAttributes(variable), query[operator][variable]]]);
                    }
                }
            }
        }
        instructions.push([module.exports.Scule.instructions.table.rindex, [collection]]);
        instructions.push([module.exports.Scule.instructions.table['goto'], [0]]);
        
        return instructions;
    };

    /**
     * Prints a human readable version of a Scule bytecode program to the console
     * given a mutate query expression
     * @public
     * @param {Object} query the query expression {Object} to compile to bytecode
     * @param {Collection} collection the collection to compile against - used for index selection
     * @returns {Void}
     * @throws {Exception}
     */
    this.explainMutate = function(query, collection) {
        var line = 0;
        
        console.log((line++) + ' rread');
        var operator = null;
        var variable = null;
        for(operator in query) {
            if(query.hasOwnProperty(operator)) {
                if(!(module.exports.Scule.instructions.mapping[operator] in module.exports.Scule.instructions.table)) {
                    throw operator + ' is an unrecognized operator';
                }             
                for(variable in query[operator]) {
                    if(query[operator].hasOwnProperty(variable)) {
                        console.log((line++) + ' ' + module.exports.Scule.instructions.mapping[operator] + ' ' + variable + ', ' + JSON.stringify(query[operator][variable]));
                    }
                }
            }
        }
        console.log((line++) + ' rindex ' + collection.getName());
        console.log((line++) + ' goto 0');
        
    };

    /**
     * Compiles a query expression object into a set of Scule virtual machine bytecode instructions
     * @public
     * @param {Object} query the query expression {Object} to compile to bytecode
     * @param {Object} conditions the sort/limit conditions for the query
     * @param {Collection} collection the collection to compile against - used for index selection
     * @returns {Array}
     */
    this.compileQuery = function(query, conditions, collection) {

        var hash = md5.hash(JSON.stringify(query));
        if(this.cache.contains(hash)) {
            return this.cache.get(hash).toByteCode();
        }

        var walk = function(node) {
            node.children.forEach(function(child) {
                walk(child);
            });
        };

        this.visitor.setCollection(collection);
        var tree = this.parser.parseQuery(query);        
        tree.accept(this.visitor);

        var program = this.compiler.compile(tree, conditions, collection);
        
        this.cache.put(hash, program);      
        return program.toByteCode();

    };

    /**
     * Prints a human readable version of a Scule bytecode program to the console
     * given a mutate query expression
     * @public
     * @param {Object} query the query expression {Object} to compile to bytecode
     * @param {Object} conditions the sort/limit conditions for the query
     * @param {Collection} collection the collection to compile against - used for index selection
     * @returns {Void}
     * @throws {Exception}
     */
    this.explainQuery = function(query, conditions, collection) {

        var hash = md5.hash(JSON.stringify(query));
        if(this.cache.contains(hash)) {
            this.cache.get(hash).explain();
            return;
        }

        this.visitor.setCollection(collection);        
        var tree = this.parser.parseQuery(query);
        tree.accept(this.visitor);
        
        var program = this.compiler.compile(tree, conditions, collection, true);
        
        this.cache.put(hash, program);

    };
    
};

/**
 * Returns a new instance of the {QueryTreeIndexSelectionVisitor} class
 * @param {Collection} collection the collection to visit
 * @returns {QueryTreeIndexSelectionVisitor}
 */
module.exports.getQueryTreeIndexSelectionVisitor = function(collection) {
    return new module.exports.Scule.classes.QueryTreeIndexSelectionVisitor(collection);
};

/**
 * Returns a new instance of the {AbstractSyntaxTreeCompiler} class
 * @returns {AbstractSyntaxTreeCompiler}
 */
module.exports.getAbstractSyntaxTreeCompiler = function() {
    return new module.exports.Scule.classes.AbstractSyntaxTreeCompiler();
};

/**
 * Returns a new instance of the {ProgramDirector} class
 * @returns {ProgramDirector}
 */
module.exports.getProgramDirector = function() {
    return new module.exports.Scule.classes.ProgramDirector();
};

/**
 * Returns a new instance of the {ProgramBuilder} class
 * @returns {ProgramBuilder}
 */
module.exports.getProgramBuilder = function() {
    return new module.exports.Scule.classes.ProgramBuilder();
};

/**
 * Returns an instance of the {QueryCompiler} class
 * @returns {QueryCompiler}
 */
module.exports.getQueryCompiler = function() {
    return new module.exports.Scule.classes.QueryCompiler();
};