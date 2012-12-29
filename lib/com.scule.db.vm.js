/**
 * @module com.scule.db.vm
 * @type {Object}
 */
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
        instructions:{
            table:{},
            mapping:{},
            index:{}
        },
        variables:{
            line:0,
            inst:0
        },
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
module.exports.Scule.instructions.index = {
    'find':  true,
    'range': true,
    'scan':  true
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

        if(range.length == 0 && exact.length == 0) {
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
                } else {
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
                if(tuple.carray.length == 0) {
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
                };
            }
        }
        
        if(backtrack.length == 0 || count < matches.$index.astrings.length) {
            return;
        } else {
            backtrack = backtrack.reverse();
            backtrack.forEach(function(tuple) {
                tuple.carray.splice(tuple.j_index, 1);
                if(tuple.carray.length == 0) {
                    tuple.parray.splice(tuple.i_index, 1);
                }
            });
        }
        
        node.children.unshift(index);
        index.args = values.concat(flags);       
    };
    
};

/**
 * Represents a program as a series of linked "blocks" during the 
 * bytecode compilation process
 * @public
 * @constructor
 * @class {SculeProgram}
 * @returns {Void}
 */
module.exports.Scule.classes.SculeProgram = function() {

    /**
     * @private
     * @type {Array}
     */
    this.blocks = [];
    
    /**
     * @private
     * @type {SculeProgramBlock}
     */
    this.last   = null;
    
    /**
     * @private
     * @type {LIFOStack}
     */
    this.scope  = module.exports.Scule.$d.getLIFOStack();
    
    /**
     * @private
     * @type {Number}
     */
    this.limit  = null;
    
    /**
     * @private
     * @type {String}
     */
    this.sortk  = null;
    
    /**
     * @private
     * @type {Number}
     */
    this.sortt  = null;
    
    /**
     * Sets the limit clause value for the program
     * @public
     * @param {Number} limit
     * @returns {Void}
     */
    this.setLimit = function(limit) {
        this.limit = limit;
    };
    
    /**
     * Sets the sort condition clause value for the program
     * @public
     * @param {String} key the key sort on
     * @param (Number} type the sort type constant value
     * @returns {Void}
     */
    this.setSort = function(key, type) {
        this.sortk = key;
        this.sortt = type;
    };
    
    /**
     * Opens a code block
     * @public
     * @returns {Void}
     */
    this.openBlock = function() {
        var block = new module.exports.Scule.classes.SculeProgramBlock();
        this.blocks.push(block);
        this.scope.push(block);
    };
    
    /**
     * Opens a loop code block - loops are slighly different to other blocks
     * @public
     * @returns {Void}
     */
    this.openLoopBlock = function() {
        var block = new module.exports.Scule.classes.SculeProgramLoop();
        this.blocks.push(block);
        this.scope.push(block);        
    };
    
    /**
     * Opens a sub-block within the currently open block
     * @public
     * @returns {Void}
     */
    this.openSubBlock = function() {
        this.scope.push(this.scope.peek().openSubBlock());
    };
    
    /**
     * Closes the current block
     * @public
     * @returns {Void}
     */
    this.closeBlock = function() {
        if(this.scope.peek().hasSubBlocks()) {
            this.scope.peek().closeSubBlock();
        } else {
            this.scope.pop();
        }
    };

    /**
     * Adds an instruction to the current block
     * @public
     * @param {String} opcode the opcode for the instruction (e.g. halt, jump, goto)
     * @param {Array} args the arguments for the instruction
     * @returns {Void}
     */
    this.addInstruction = function(opcode, args) {
        module.exports.Scule.variables.inst++;
        var instruction = new module.exports.Scule.classes.SculeInstruction(opcode, args);
        if(!(opcode in module.exports.Scule.instructions.index) && (this.last.opcode in module.exports.Scule.instructions.index)) {
            this.scope.peek().addInstruction(new module.exports.Scule.classes.SculeInstruction('intersect', []));
            this.scope.peek().addInstruction(new module.exports.Scule.classes.SculeInstruction('store', []));
            this.openLoopBlock();
        }
        this.scope.peek().addInstruction(instruction);
        this.last = instruction;
    };
    
    /**
     * Returns a bytecode representation of the program
     * @public
     * @returns {Array}
     */
    this.toByteCode = function() {
        module.exports.Scule.variables.line = 0;
        var code = [];
        this.blocks.forEach(function(block) {
            code = code.concat(block.toByteCode());
        });
        if(this.last.opcode in module.exports.Scule.instructions.index) {
            code.push(new module.exports.Scule.classes.SculeInstruction('intersect', []).toByteCode());
            code.push(new module.exports.Scule.classes.SculeInstruction('store', []).toByteCode());
            code.push(new module.exports.Scule.classes.SculeInstruction('transpose', []).toByteCode());
        }
        if(this.sortk !== null) {
            code.push((new module.exports.Scule.classes.SculeInstruction('sort', [this.sortk, this.sortt])).toByteCode());
        }
        if(this.limit !== null) {
            code.push((new module.exports.Scule.classes.SculeInstruction('limit', [this.limit])).toByteCode());
        }
        code.push((new module.exports.Scule.classes.SculeInstruction('halt', [])).toByteCode());
        return code;
    };
    
    /**
     * Prints a human readable representation of the program to the console
     * @public
     * @returns {Void}
     */
    this.explain = function() {
        module.exports.Scule.variables.line = 0;
        this.blocks.forEach(function(block) {
            block.explain();
        });
        if(this.last.opcode in module.exports.Scule.instructions.index) {
            (new module.exports.Scule.classes.SculeInstruction('intersect', [])).explain();
            (new module.exports.Scule.classes.SculeInstruction('store', [])).explain();
            (new module.exports.Scule.classes.SculeInstruction('transpose', [])).explain();
        }
        if(this.sortk !== null) {
            (new module.exports.Scule.classes.SculeInstruction('sort', [this.sortk, this.sortt])).explain();
        }
        if(this.limit !== null) {
            (new module.exports.Scule.classes.SculeInstruction('limit', [this.limit])).explain();
        }        
        (new module.exports.Scule.classes.SculeInstruction('halt', [])).explain(); 
    };
    
};

/**
 * Represents a block of instructions in a Scule bytecode program
 * @public
 * @constructor
 * @class {SculeProgramBlock}
 * @returns {Void}
 */
module.exports.Scule.classes.SculeProgramBlock = function() {
    
    /**
     * @private
     * @type {Array}
     */
    this.instructions = [];
    
    /**
     * @private
     * @type {Array}
     */    
    this.blocks       = [];
    
    /**
     * @private
     * @type LIFOStack
     */
    this.scope        = module.exports.Scule.$d.getLIFOStack();
    
    /**
     * Adds an instruction to the program block
     * @public
     * @param {SculeInstruction} the instruction to add to the block
     * @returns {Void}
     */
    this.addInstruction = function(instruction) {
        this.instructions.push(instruction);
    };
  
    /**
     * Opens a nested sub-block
     * @returns {SculeProgramBlock}
     */
    this.openSubBlock = function() {
        var block = new module.exports.Scule.classes.SculeProgramBlock();
        this.blocks.push(block);
        this.scope.push(block);
        return block;        
    };
  
    /**
     * Closes the last opened nested sub-block
     * @return {Void}
     */
    this.closeSubBlock = function() {
        this.scope.pop();
    };

    /**
     * Returns a {Boolean} value indicating whether or not the block has any
     * nested sub-blocks
     * @return {Boolean}
     */
    this.hasSubBlocks = function() {
        return this.blocks.length > 0;
    };

    /**
     * Returns an {Array} of bytecode instructions
     * @returns {Array}
     */
    this.toByteCode = function() {
        var code = [];
        this.instructions.forEach(function(instruction) {
            code = code.concat([instruction.toByteCode()]);
        });
        this.blocks.forEach(function(block) {
            code = code.concat(block.toByteCode());
        });        
        return code;
    };

    /**
     * Prints a human readable version of the block to the console
     * @returns {Void}
     */
    this.explain = function() {
        this.instructions.forEach(function(instruction) {
            instruction.explain();
        });
        this.blocks.forEach(function(block) {
            block.explain();
        });        
    };

};

/**
 * Represents a loop construct in the context of a Scule bytecode program
 * @public
 * @constructor
 * @class {SculeProgramLoop}
 * @extends {SculeProgramBlock}
 * @returns {Void}
 */
module.exports.Scule.classes.SculeProgramLoop = function() {

    module.exports.Scule.classes.SculeProgramBlock.call(this);

    this.instructions.push(new module.exports.Scule.classes.SculeInstruction('read', []));
    module.exports.Scule.variables.inst++;
    
    /**
     * @private
     * @type {Number}
     */
    this.readIndex = module.exports.Scule.variables.inst;

    /**
     * Returns an {Array} of bytecode instructions
     * @returns {Array}
     */
    this.toByteCode = function() {
        var code = [];
        this.instructions.forEach(function(instruction) {
            code = code.concat([instruction.toByteCode()]);
        });
        this.blocks.forEach(function(block) {
            code = code.concat(block.toByteCode());
        });
        var ands = (this.instructions.length - 1) + this.blocks.length;
        if(ands > 1 && (this.instructions[this.instructions.length - 1].opcode !== 'or' || this.blocks.length > 0)) {
            code.push((new module.exports.Scule.classes.SculeInstruction('and', [ands])).toByteCode());
        }
        code.push((new module.exports.Scule.classes.SculeInstruction('shift', [])).toByteCode());
        code.push((new module.exports.Scule.classes.SculeInstruction('jump', [module.exports.Scule.variables.line + 2])).toByteCode());
        code.push((new module.exports.Scule.classes.SculeInstruction('goto', [this.readIndex])).toByteCode());        
        return code;
    };

    /**
     * Prints a human readable version of the block to the console
     * @returns {Void}
     */
    this.explain = function() {
        this.instructions.forEach(function(instruction) {
            instruction.explain();
        });
        this.blocks.forEach(function(block) {
            block.explain();
        });
        var ands = (this.instructions.length - 1) + this.blocks.length;
        if(ands > 1 && (this.instructions[this.instructions.length - 1].opcode !== 'or' || this.blocks.length > 0)) {
            (new module.exports.Scule.classes.SculeInstruction('and', [ands])).explain();
        }
        (new module.exports.Scule.classes.SculeInstruction('shift', [])).explain();
        (new module.exports.Scule.classes.SculeInstruction('jump', [module.exports.Scule.variables.line + 2])).explain();
        (new module.exports.Scule.classes.SculeInstruction('goto', [this.readIndex])).explain();        
    };

};

/**
 * Represents a bytecode instruction
 * @public
 * @constructor
 * @class {SculeInstruction}
 * @param {String} opcode the opcode for the instruction
 * @param {Array} args the parameters for the instruction
 * @returns {Void}
 */
module.exports.Scule.classes.SculeInstruction = function(opcode, args) {
    
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
     * @returns {Array}
     */
    this.toByteCode = function() {
        var self = this;
        module.exports.Scule.variables.line++
        return [module.exports.Scule.instructions.table[self.opcode], args];
    };

    /**
     * Prints a human readable version of the block to the console
     * @returns {Void}
     */
    this.explain = function() {
        var args = [];
        this.args.forEach(function(arg) {
            if(module.exports.Scule.$f.isScalar(arg)) {
                args.push(arg);
            } else {
                if('getName' in arg) {
                    args.push(arg.getName()); 
                } else {
                    args.push(arg); 
                }
            }
        });
        console.log((module.exports.Scule.variables.line++) + ' ' + this.opcode + ' ' + ((args.length > 0) ? JSON.stringify(args) : ''));
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
    this.cache   = module.exports.Scule.$d.getLRUCache(30);
    
    /**
     * @private
     * @type {QueryParser}
     */
    this.parser  = module.exports.Scule.$p.getQueryParser();
    
    /**
     * @private
     * @type {QueryTreeIndexSelectionVisitor}
     */
    this.visitor = new module.exports.Scule.classes.QueryTreeIndexSelectionVisitor();

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
        
        instructions.push([module.exports.Scule.instructions.table['rread'], []]);
        for(var operator in query) {
            if(!(module.exports.Scule.instructions.mapping[operator] in module.exports.Scule.instructions.table)) {
                throw operator + ' is an unrecognized operator';
            }            
            for(var variable in query[operator]) {
                var opcode  = module.exports.Scule.instructions.table[module.exports.Scule.instructions.mapping[operator]];
                instructions.push([opcode, [module.exports.Scule.$f.parseAttributes(variable), query[operator][variable]]]);
            }
        }
        instructions.push([module.exports.Scule.instructions.table['rindex'], [collection]]);
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
        for(var operator in query) {
            if(!(module.exports.Scule.instructions.mapping[operator] in module.exports.Scule.instructions.table)) {
                throw operator + ' is an unrecognized operator';
            }             
            for(var variable in query[operator]) {
                console.log((line++) + ' ' + module.exports.Scule.instructions.mapping[operator] + ' ' + variable + ', ' + JSON.stringify(query[operator][variable]));
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

        module.exports.Scule.variables.inst = 0;
        this.visitor.setCollection(collection);
        var tree = this.parser.parseQuery(query);
        tree.accept(this.visitor);
        var program = this.compileSyntaxTree(tree, conditions, collection);
        
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

        module.exports.Scule.variables.inst = 0;
        this.visitor.setCollection(collection);
        var tree = this.parser.parseQuery(query);
        tree.accept(this.visitor);
        var program = this.compileSyntaxTree(tree, conditions, collection);

        this.cache.put(hash, program);

        program.explain();
    };

    /**
     * Compiles a Scule AST to a set of Scule virtual machine bytecode instructions
     * @private
     * @param {QueryParseTree} tree the {QueryParseTree} instance to compile to bytecode
     * @param {Object} conditions the sort/limit conditions for the query
     * @param {Collection} collection the collection to compile against - used for index selection
     * @returns {Array}
     */
    this.compileSyntaxTree = function(tree, conditions, collection) {
        
        var node = tree.getRoot();
        
        var program = new module.exports.Scule.classes.SculeProgram();
        program.openBlock();
        
        if(!node.hasChildren() || node.getFirstChild().getType() !== module.exports.Scule.$q.arities.index) {
            program.addInstruction('scan', [collection]);
        }
        
        var compileVariable = function(variable) {
            var ands = 0;
            variable.children.forEach(function(operator) {
                switch(operator.getType()) {
                    case module.exports.Scule.$q.arities.selective:
                        operator.children.forEach(function(op) {
                            compileOperator(variable, op);
                            ands++;
                        });
                        break;
                            
                    case module.exports.Scule.$q.arities.array:
                    case module.exports.Scule.$q.arities.range:
                    case module.exports.Scule.$q.arities.binary:
                    case module.exports.Scule.$q.arities.negative:
                        compileOperator(variable, operator);
                        ands++;
                        break;
                }
            });
            if(ands > 1) {
                program.addInstruction('and', [ands]);
            }
        };
        
        var compileOperator = function(variable, operator) {
            var args = [operator.children[0].getSymbol()];
            args.unshift(module.exports.Scule.$f.parseAttributes(variable.getSymbol()));
            program.addInstruction(module.exports.Scule.instructions.mapping[operator.getSymbol()], args);
        };
        
        var compileIndex = function(index) {
            var args = [index.index, index.args];
            if(index.range) {
                program.addInstruction('range', args);
            } else {
                program.addInstruction('find',  args);
            }
        };
        
        var compile = function(node) {
            node.children.forEach(function(child) {
                switch(child.getType()) {
                    case module.exports.Scule.$q.arities.index:
                        compileIndex(child);
                        break;
                    
                    case module.exports.Scule.$q.arities.selective:
                        var isOr = (child.getSymbol() == '$or');
                        if(isOr) {
                            program.openSubBlock();
                        }
                        compile(child);
                        if(child.children.length > 1) {
                            program.addInstruction(module.exports.Scule.instructions.mapping[child.getSymbol()], [isOr ? child.children.length : child.countOperands()]);
                        }
                        if(isOr) {
                            program.closeBlock();
                        }                        
                        break;
                
                    case module.exports.Scule.$q.arities.variable:
                        compileVariable(child);
                        break;
                
                    case module.exports.Scule.$q.arities.expression:
                        program.openBlock();
                        compile(child);
                        program.closeBlock();
                        break;
                }
            });
        }
        compile(node);
        if('$sort' in conditions) {
            for(var k in conditions.$sort) {
                program.setSort(k, conditions.$sort[k]);
                break;
            }
        }
        if('$limit' in conditions) {
            program.setLimit(conditions.$limit);
        }
        program.closeBlock();
        
        return program;
    };

};

/**
 * A hybrid (stack + registers) virtual machine that executes programs 
 * written in Scule bytecode. The generated bytecode is subroutine threaded
 * @see http://en.wikipedia.org/wiki/Threaded_code#Subroutine_threading
 * @public
 * @constructor
 * @class {VirtualMachine}
 * @returns {Void}
 */
module.exports.Scule.classes.VirtualMachine = function() {
    
    /**
     * @private
     * @type {Boolean}
     */
    this.running      = false;
   
    /**
     * @private
     * @type {Boolean}
     */   
    this.upsert       = false;
    
    /**
     * The program instruction pointer
     * @private
     * @type {Number}
     */    
    this.ipointer     = 0;
    
    /**
     * The program document pointer
     * @private
     * @type {Number}
     */    
    this.dpointer     = 0;
    
    /**
     * The random access registers for the machine
     * @private
     * @type {Array}
     */    
    this.registers    = [];
    
    /**
     * @private
     * @type {Object}
     */    
    this.instructions = {};
    
    /**
     * The execution stack for the machine
     * @private
     * @type {LIFOStack}
     */    
    this.stack        = module.exports.Scule.$d.getLIFOStack();
    
    /**
     * @private
     * @type {Array}
     */    
    this.result       = [];
    
    /**
     * Resets the state of the virtual machine
     * @public
     * @returns {Void}
     */
    this.reset = function() {
        this.running   = false;
        this.upsert    = false;
        this.ipointer  = 0;
        this.dpointer  = 0;
        this.registers = [];
        this.result    = [];
        this.stack.clear();
    };
    
    /**
     * Halts execution
     * @public
     * @returns {Void}
     */
    this.halt = function() {
        this.running = false;
    };
    
    /**
     * Resumes execution
     * @public
     * @returns {Void}
     */
    this.resume = function() {
        this.running = true;
        this.execute();
    };    
    
    /**
     * Executes the provided bytecode program
     * @public
     * @see http://en.wikipedia.org/wiki/Upsert
     * @param {Array} program the bytecode query program instructions to execute
     * @param {Array} mutate the bytecode mutate program instructions to execute
     * @param {Boolean} upsert a boolean flag indicating whether or not to perform upserts
     * @returns {Array}
     */
    this.execute = function(program, mutate, upsert) {
        if(!program) {
            program = this.registers[3];
        } else {
            this.registers[3] = program;
        }
        
        this.running = true;
        while(this.running) {
            this.executeInstruction(program[this.ipointer]);
        }
        this.running = false;
        
        if(mutate) {
            this.dpointer = 0;
            this.ipointer = 0;
            this.running  = true;
            this.upsert   = upsert;
            while(this.running) {
                this.executeInstruction(mutate[this.ipointer]);
            }
        }
        
        return this.result;
    };
    
    /**
     * Registers an instruction with the Scule virtual machine
     * @public
     * @param {Integer} opcode the bytecode opcode to register the sub-routine against
     * @param {Function} macro the sub-routine code to register
     * @returns {Void}
     */
    this.registerInstruction = function(opcode, macro) {
        this.instructions[opcode] = macro;
    };
    
    /**
     * halt
     */
    this.registerInstruction(0x00, function(vm, instruction) {
        vm.running = false;
        vm.ipointer++;
    });
    
    /**
     * break
     */
    this.registerInstruction(0x1A, function(vm, instruction) {
        vm.running = false;
        vm.ipointer++;
    });
    
    /**
     * start
     */
    this.registerInstruction(0x24, function(vm, instruction) {
        vm.running = true;
        vm.ipointer++;
    });
    
    /**
     * scan
     */
    this.registerInstruction(0x1C, function(vm, instruction) {
        var o = instruction[1][0].findAll();
        if(o.length == 0) {
            vm.running = false;
        }
        vm.stack.push(o);
        vm.ipointer++;
    });
    
    /**
     * range
     */
    this.registerInstruction(0x1D, function(vm, instruction) {
        var args = instruction[1][1];
        vm.stack.push(instruction[1][0].range(args[0], args[1], args[2], args[3]));
        vm.ipointer++;       
    });
    
    /**
     * find
     */
    this.registerInstruction(0x1B, function(vm, instruction) {
        vm.stack.push(instruction[1][0].search(instruction[1][1]));
        vm.ipointer++;
    });
    
    /**
     * store
     */
    this.registerInstruction(0x21, function(vm, instruction) {
        vm.registers[0] = vm.stack.pop();
        vm.ipointer++;
    });
    
    /**
     * transpose
     */
    this.registerInstruction(0x28, function(vm, instruction) {
        vm.result = vm.registers[0];
        vm.ipointer++;
    });
    
    /**
     * read
     */
    this.registerInstruction(0x27, function(vm, instruction) {
        vm.registers[1] = vm.registers[0][vm.dpointer++];
        vm.ipointer++;
    });
    
    /**
     * shift
     */
    this.registerInstruction(0x20, function(vm, instruction) {
        if(vm.stack.pop() === true) {
            vm.result.push(vm.registers[1]);
        }
        vm.ipointer++;
    });
    
    /**
     * intersect
     */
    this.registerInstruction(0x23, function(vm, instruction) {
        if(vm.stack.getLength() == 1) {
            vm.ipointer++;
            return;
        }
        var arrays = [];
        while(!vm.stack.isEmpty()) {
            arrays.push(vm.stack.pop());
        }
        var result = module.exports.Scule.functions.intersection(arrays);
        if(result.length == 0) {
            vm.running = false;
        }
        vm.stack.push(result);
        vm.ipointer++;
    });
    
    /**
     * and
     */
    this.registerInstruction(0x01, function(vm, instruction) {
        var count = instruction[1][0];
        var and   = null;
        do {
            if(and == null) {
                and = vm.stack.pop();
            } else {
                and = and && vm.stack.pop();
            }
            count--;
        } while(count > 0);
        vm.stack.push(and);
        vm.ipointer++;
    });    

    /**
     * or
     */
    this.registerInstruction(0x02, function(vm, instruction) {
        var count = instruction[1][0];
        var or    = null;
        do {
            if(or == null) {
                or = vm.stack.pop();
            } else {
                or = or || vm.stack.pop();
            }
            count--;
        } while(count > 0);
        vm.stack.push(or);
        vm.ipointer++;
    });
    
    /**
     * goto
     */
    this.registerInstruction(0x26, function(vm, instruction) {
        vm.ipointer = instruction[1][0];
    });
    
    /**
     * jump
     */
    this.registerInstruction(0x25, function(vm, instruction) {
        if(vm.dpointer >= (vm.registers[0].length - 1)) {
            vm.ipointer = instruction[1][0];
            return;
        }
        vm.ipointer++;
    });
    
    /**
     * eq
     */
    this.registerInstruction(0xC, function(vm, instruction) {
        var object = vm.registers[1];
        var value  = module.exports.Scule.$f.searchObject(instruction[1][0], object);
        vm.stack.push(value.length > 0 && value[0] == instruction[1][1]);
        vm.ipointer++;
    });
    
    /**
     * ne
     */
    this.registerInstruction(0xD, function(vm, instruction) {
        var object = vm.registers[1];
        var value  = module.exports.Scule.$f.searchObject(instruction[1][0], object);
        vm.stack.push(value.length > 0 && value[0] !== instruction[1][1]);
        vm.ipointer++;        
    });
    
    /**
     * gt
     */
    this.registerInstruction(0x07, function(vm, instruction) {
        var object = vm.registers[1];
        var value  = module.exports.Scule.$f.searchObject(instruction[1][0], object);
        vm.stack.push(value.length > 0 && value[0] > instruction[1][1]);
        vm.ipointer++;        
    });

    /**
     * gte
     */
    this.registerInstruction(0x08, function(vm, instruction) {
        var object = vm.registers[1];
        var value  = module.exports.Scule.$f.searchObject(instruction[1][0], object);
        vm.stack.push(value.length > 0 && value[0] >= instruction[1][1]);
        vm.ipointer++;        
    });

    /**
     * lt
     */
    this.registerInstruction(0x05, function(vm, instruction) {
        var object = vm.registers[1];
        var value  = module.exports.Scule.$f.searchObject(instruction[1][0], object);
        vm.stack.push(value.length > 0 && value[0] < instruction[1][1]);
        vm.ipointer++;        
    });

    /**
     * lte
     */
    this.registerInstruction(0x06, function(vm, instruction) {
        var object = vm.registers[1];
        var value  = module.exports.Scule.$f.searchObject(instruction[1][0], object);
        vm.stack.push(value.length > 0 && value[0] <= instruction[1][1]);
        vm.ipointer++;        
    });

    /**
     * in
     */
    this.registerInstruction(0xA, function(vm, instruction) {
        var object = vm.registers[1];
        var value  = module.exports.Scule.$f.searchObject(instruction[1][0], object);
        if(value.length == 0) {
            vm.stack.push(false);
        } else {
            vm.stack.push(instruction[1][1].contains(value[0]));
        }
        vm.ipointer++;
    });

    /**
     * nin
     */
    this.registerInstruction(0xB, function(vm, instruction) {
        var object = vm.registers[1];
        var value  = module.exports.Scule.$f.searchObject(instruction[1][0], object);
        if(value.length == 0) {
            vm.stack.push(true);
        } else {
            vm.stack.push(!instruction[1][1].contains(value[0]));
        }
        vm.ipointer++;
    });

    /**
     * size
     */
    this.registerInstruction(0xE, function(vm, instruction) {
        var object = vm.registers[1];
        var value  = module.exports.Scule.$f.searchObject(instruction[1][0], object);
        vm.stack.push(module.exports.Scule.$f.isArray(value[0]) && value[0].length == instruction[1][1]);
        vm.ipointer++;
    });

    /**
     * exists
     */
    this.registerInstruction(0xF, function(vm, instruction) {
        var object = vm.registers[1];
        var value  = module.exports.Scule.$f.searchObject(instruction[1][0], object);
        vm.stack.push(value.length > 0 && value[0] !== undefined);
        vm.ipointer++;
    });

    /**
     * all
     */
    this.registerInstruction(0x09, function(vm, instruction) {
        var object = vm.registers[1];
        var value  = module.exports.Scule.$f.searchObject(instruction[1][0], object);
        if(!module.exports.Scule.$f.isArray(value[0])) {
            vm.stack.push(false);
        } else {
            var table = instruction[1][1];
            if(value[0].length < table.getLength()) {
                vm.stack.push(false);
            } else {
                var tmp  = module.exports.Scule.$d.getHashTable();
                var keys = table.getKeys();
                keys.forEach(function(key) {
                    tmp.put(key, false);
                });
                for(var i=0; i < value[0].length; i++) {
                    if(tmp.contains(value[0][i])) {
                        tmp.remove(value[0][i]);
                    }
                }
                vm.stack.push(tmp.getLength() == 0);
            }
        }
        vm.ipointer++;
    });

    /**
     * limit
     */
    this.registerInstruction(0x29, function(vm, instruction) {
        if(instruction[1][0] < vm.result.length) {
            vm.result = vm.result.splice(0, instruction[1][0]);
        }
        vm.ipointer++;
    });
    
    /**
     * sort
     */
    this.registerInstruction(0x2A, function(vm, instruction) {
        module.exports.Scule.$f.sort(instruction[1][1], vm.result, instruction[1][0]);
        vm.ipointer++;
    });

    /**
     * rread
     */
    this.registerInstruction(0x2B, function(vm, instruction) {
        if(vm.dpointer >= vm.result.length) {
            vm.halt();
        }
        vm.registers[1] = vm.result[vm.dpointer];
        vm.dpointer++;
        vm.ipointer++;        
    });

    /**
     * set
     */
    this.registerInstruction(0x12, function(vm, instruction) {
        var document = vm.registers[1];
        var struct   = module.exports.Scule.$f.traverseObject(instruction[1][0], document);
        var leaf     = struct[0];
        var o        = struct[1];
        if(!(leaf in o)) {
            if(vm.upsert == true) {
                o[leaf] = instruction[1][1];
            }
        } else {
            o[leaf] = instruction[1][1];
        }
        vm.ipointer++;
    });

    /**
     * unset
     */
    this.registerInstruction(0x13, function(vm, instruction) {
        var document = vm.registers[1];
        var struct   = module.exports.Scule.$f.traverseObject(instruction[1][0], document);
        var leaf     = struct[0];
        var o        = struct[1];
        if(leaf in o) {
            delete o[leaf];
        }
        vm.ipointer++;        
    });

    /**
     * inc
     */
    this.registerInstruction(0x14, function(vm, instruction) {
        var document = vm.registers[1];
        var struct   = module.exports.Scule.$f.traverseObject(instruction[1][0], document);
        var leaf     = struct[0];
        var o        = struct[1];
        if(!(leaf in o)) {
            if(vm.upsert) {
                o[leaf] = instruction[1][1];
            }
        } else {
            if(module.exports.Scule.$f.isInteger(o[leaf]) || module.exports.Scule.$f.isDouble(o[leaf])) {
                o[leaf] += instruction[1][1];   
            }
        }
        vm.ipointer++;        
    });

    /**
     * opull
     */
    this.registerInstruction(0x15, function(vm, instruction) {
        var document = vm.registers[1];
        var struct   = module.exports.Scule.$f.traverseObject(instruction[1][0], document);
        var leaf     = struct[0];
        var o        = struct[1];
        if(leaf in o && module.exports.Scule.$f.isArray(o[leaf])) {
            var val = instruction[1][1];
            for(var i=0; i < o[leaf].length; i++) {
                if(o[leaf][i] == val) {
                    o[leaf].splice(i, 1);
                    i--;
                }
            }  
        }
        vm.ipointer++;         
    });

    /**
     * opullall
     */
    this.registerInstruction(0x16, function(vm, instruction) {
        var document = vm.registers[1];
        var struct   = module.exports.Scule.$f.traverseObject(instruction[1][0], document);
        var leaf     = struct[0];
        var o        = struct[1];
        if(leaf in o && module.exports.Scule.$f.isArray(o[leaf])) {
            var value = instruction[1][1];
            if(!module.exports.Scule.$f.isArray(value)) {
                throw 'the $pullAll operator requires an associated array as an operand';
            }
            var table = module.exports.Scule.$d.getHashTable();
            value.forEach(function(val) {
                table.put(val, true); 
            });
            for(var i=0; i < o[leaf].length; i++) {
                if(table.contains(o[leaf][i])) {
                    o[leaf].splice(i, 1);
                    i--;
                }
            }  
        }
        vm.ipointer++;         
    });

    /**
     * opop
     */
    this.registerInstruction(0x17, function(vm, instruction) {
        var document = vm.registers[1];
        var struct   = module.exports.Scule.$f.traverseObject(instruction[1][0], document);
        var leaf     = struct[0];
        var o        = struct[1];
        if(leaf in o && module.exports.Scule.$f.isArray(o[leaf])) {
            o[leaf].pop();   
        }
        vm.ipointer++;        
    });
    
    /**
     * opush
     */
    this.registerInstruction(0x18, function(vm, instruction) {
        var document = vm.registers[1];
        var struct   = module.exports.Scule.$f.traverseObject(instruction[1][0], document);
        var leaf     = struct[0];
        var o        = struct[1];
        if(!(leaf in o) && vm.upsert) {
            o[leaf] = instruction[1][1];
        } else {
            if(module.exports.Scule.$f.isArray(o[leaf])) {
                o[leaf].push(instruction[1][1]);   
            }
        }
        vm.ipointer++;        
    });
    
    /**
     * opushall
     */
    this.registerInstruction(0x19, function(vm, instruction) {
        var document = vm.registers[1];
        var struct   = module.exports.Scule.$f.traverseObject(instruction[1][0], document);
        var leaf     = struct[0];
        var o        = struct[1];
        if(!(leaf in o) && vm.upsert) {
            o[leaf] = instruction[1][1];
        } else {
            var value = instruction[1][1];
            if(!module.exports.Scule.$f.isArray(value)) {
                throw 'the $pushAll operator requires an associated array as an operand';
            }            
            if(module.exports.Scule.$f.isArray(o[leaf])) {
                o[leaf] = o[leaf].concat(value);   
            }
        }
        vm.ipointer++;         
    });

    /**
     * rindex
     */
    this.registerInstruction(0x2C, function(vm, instruction) {
        module.exports.Scule.functions.updateIndexes(vm.registers[1], instruction[1][0]);
        vm.ipointer++;
    });

    /**
     * within
     */
    this.registerInstruction(0x10, function(vm, instruction) {
        var document = vm.registers[1];
        var loc1     = module.exports.Scule.$f.traverseObject(instruction[1][0], document);
        if(loc1.length < 2 || !('loc' in loc1[1])) {
            vm.stack.push(false);
        } else {        
            loc1 = loc1[1].loc;
            if(!('lat' in loc1) || !('lon' in loc1)) {
                vm.stack.push(false);
            } else {
                var loc2 = instruction[1][1];
                var d    = Math.sqrt(Math.pow(loc2.lat - loc1.lat, 2) + Math.pow(loc2.lon - loc1.lon, 2));
                if(d <= loc2.distance) {
                    document = module.exports.Scule.$f.cloneObject(document);
                    document._meta = {
                        distance: d
                    };
                    vm.registers[1] = document;                
                    vm.stack.push(true);
                } else {
                    vm.stack.push(false);
                }
            }
        }
        vm.ipointer++;        
    });

    /**
     * near
     */
    this.registerInstruction(0x11, function(vm, instruction) {
        var document = vm.registers[1];
        var loc1     = module.exports.Scule.$f.traverseObject(instruction[1][0], document);
        if(loc1.length < 2 || !('loc' in loc1[1])) {
            vm.stack.push(false);
        } else {
            loc1         = loc1[1].loc;
            var loc2     = instruction[1][1];
            var distance = loc2.distance;
            if(!('lat' in loc1) || !('lon' in loc1)) {
                vm.stack.push(false);
            } else {
                var d = Math.acos(Math.sin(loc1.lat) * Math.sin(loc2.lat) + Math.cos(loc1.lat) * Math.cos(loc2.lat) * Math.cos(loc2.lon - loc1.lon)) * 6371;
                if(d <= distance) {
                    document = module.exports.Scule.$f.cloneObject(document);
                    document._meta = {
                        distance: d
                    };
                    vm.registers[1] = document;
                    vm.stack.push(true);
                } else {
                    vm.stack.push(false);
                }
            }
        }
        vm.ipointer++;
    });

    /**
     * Executes a bytecode instruction
     * @public
     * @param {Array} instruction the instruction to execute
     * @returns {Void}
     */
    this.executeInstruction = function(instruction) {
        this.instructions[instruction[0]](this, instruction);
    };
    
};

/**
 * Updates all indices for a collection with a given document
 * @param {Object} document the document to update indices for
 * @param {Collection} collection the collection encapsulating the indices to update
 * @returns {Void}
 */
module.exports.Scule.functions.updateIndexes = function(document, collection) {
    collection.indices.forEach(function(index) {
        index.remove(document);
        index.index(document);
    });
};

/**
 * Calculates the intersection between the provided array of Document arrays, returning
 * an array containing the resulting product
 * @param {Array} lists an array containing the lists to calculate intersection against
 * @returns {Array}
 */
module.exports.Scule.functions.intersection = function(lists) {
    if(lists.length == 1) {
        return lists[0];
    }
    var table = module.exports.Scule.$d.getHashTable();
    var list  = null;
    lists.forEach(function(o) {
        if(!list || o.length < list.length) {
            list = o;
        }
    });
    list.forEach(function(o) {
        table.put(module.exports.Scule.$f.getObjectId(o), {
            c:1, 
            o:o
        });
    });
    var intersection = [];
    var len = lists.length;
    for(var i=0; i < len; i++) {
        if(lists[i] == list) {
            continue;
        }
        lists[i].forEach(function(o) {
            var o2 = table.get(module.exports.Scule.$f.getObjectId(o));
            if(o2) {
                o2.c++;
                if(o2.c == len) {
                    intersection.push(o);
                }
            }
        });
    }
    return intersection;
};

/**
 * Returns an instance of the {QueryTreeIndexSelectionVisitor} class
 * @param {Collection} collection the collection to visit
 * @returns {QueryTreeIndexSelectionVisitor}
 */
module.exports.getQueryTreeIndexSelectionVisitor = function(collection) {
    return new module.exports.Scule.classes.QueryTreeIndexSelectionVisitor(collection);
};

/**
 * Returns an instance of the {QueryCompiler} class
 * @returns {QueryCompiler}
 */
module.exports.getQueryCompiler = function() {
    return new module.exports.Scule.classes.QueryCompiler();
};

/**
 * Returns an instance of the {VirtualMachine} class
 * @returns {VirtualMachine}
 */
module.exports.getVirtualMachine = function() {
    return new module.exports.Scule.classes.VirtualMachine();
};