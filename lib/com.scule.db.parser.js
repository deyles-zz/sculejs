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

/**
 * @module com.scule.db.parser
 * @private
 * @type {Object}
 */
module.exports = {
    Scule:{
        classes: {},
        variables: {
            lineNo:-1
        },
        symbols:{
            table:{}
        },
        arities:{
            expression:-1,
            logical:    0,
            binary:     1,
            selective:  2,
            negative:   3,
            range:      4,
            mutate:     5,
            array:      6,
            geospatial: 7,
            variable:   8,
            operand:    9,
            index:     10
        },
        $f:require(__dirname + '/com.scule.functions').Scule.functions,
        $d:require(__dirname + '/com.scule.datastructures')
    }
};

/**
 * All valid symbols for Scule queries
 * @private
 * @type {Object}
 */
module.exports.Scule.symbols.table = {
    $and:     module.exports.Scule.arities.selective,
    $or:      module.exports.Scule.arities.selective,
    $nor:     module.exports.Scule.arities.negative,
    $not:     module.exports.Scule.arities.negative,
    $lt:      module.exports.Scule.arities.range,
    $lte:     module.exports.Scule.arities.range,
    $gt:      module.exports.Scule.arities.range,
    $gte:     module.exports.Scule.arities.range,
    $all:     module.exports.Scule.arities.array,
    $in:      module.exports.Scule.arities.array,
    $nin:     module.exports.Scule.arities.array,
    $eq:      module.exports.Scule.arities.binary,
    $ne:      module.exports.Scule.arities.binary,
    $size:    module.exports.Scule.arities.binary,
    $exists:  module.exports.Scule.arities.binary,
    $within:  module.exports.Scule.arities.geospatial,
    $near:    module.exports.Scule.arities.geospatial,
    $set:     module.exports.Scule.arities.mutate,
    $inc:     module.exports.Scule.arities.mutate,
    $unset:   module.exports.Scule.arities.mutate,
    $pull:    module.exports.Scule.arities.mutate,
    $pullAll: module.exports.Scule.arities.mutate,
    $pop:     module.exports.Scule.arities.mutate,
    $push:    module.exports.Scule.arities.mutate,
    $pushAll: module.exports.Scule.arities.mutate,
    $rename:  module.exports.Scule.arities.mutate
};

/**
 * Represents a query parse tree
 * @public
 * @constructor
 * @class {QueryTree}
 * @returns {Void}
 */
module.exports.Scule.classes.QueryTree = function() {
  
    /**
     * @private
     * @type {QuerySymbol}
     */
    this.root = null;
  
    /**
     * Sets the root node for the tree
     * @public
     * @param {QuerySymbol} root the new root node for the {QueryTree} instance
     * @returns {Void}
     */
    this.setRoot = function(root) {
        this.root = root;
    };

    /**
     * Returns the root node for the QueryTree
     * @public
     * @returns {QuerySymbol}
     */
    this.getRoot = function() {
        return this.root;
    };

    /**
     * Prunes operator nodes with no children from the tree
     * @public
     * @returns {Void}
     */
    this.normalize = function() {
        this.root.normalize();
    };

    /**
     * Adds a collection of OR-ed operator nodes to the tree
     * @public
     * @param {Array} ors a list of OR-ed parse nodes to added to the tree instance
     * @returns {Void}
     */
    this.setOrs = function(ors) {
        if(ors.length === 0) {
            return false;
        }
        var token = new module.exports.Scule.classes.QueryOperand('$and', module.exports.Scule.arities.selective);
        ors.forEach(function(or) {
            token.addChild(or);
        });
        this.root.addChild(token);
    };
   
    /**
     * Accepts a visitor pattern implementation
     * @public
     * @param {QueryTreeIndexSelectionVisitor} visitor the visitor pattern implementation to run against the query parse tree instance
     * @returns {Void}
     */
    this.accept = function(visitor) {
        visitor.visit(this);
    };

};

/**
 * Represents a node in a QueryTree
 * @public
 * @constructor
 * @class {QuerySymbol}
 * @param {String} symbol the symbol encapsulated
 * @param {Integer} type the type code for the symbol
 * @returns {Void}
 */
module.exports.Scule.classes.QuerySymbol = function(symbol, type) {
    
    this.children = [];
    this.symbol   = symbol;
    this.type     = type;
    
    /**
     * Sets the symbol for the node
     * @public
     * @param {Mixed} symbol the symbol value to set
     * @returns {Void}
     */
    this.setSymbol = function(symbol) {
        this.symbol = symbol;
    };
    
    /**
     * Returns the symbol for the node
     * @public
     * @returns {String}
     */
    this.getSymbol = function() {
        return this.symbol;
    };
    
    /**
     * Sets the type for the node
     * @public
     * @param {Integer} type the type code value to set
     * @returns {Void}
     */
    this.setType = function(type) {
        this.type = type;
    };
    
    /**
     * Returns the type for the node
     * @public
     * @returns {Integer}
     */
    this.getType = function() {
        return this.type;
    };
    
    /**
     * Adds a child node to the current node
     * @public
     * @param {QuerySymbol} child the child node to add
     * @returns {Void}
     */
    this.addChild = function(child) {
        this.children.push(child);
    };
    
    /**
     * Returns all children for the current node
     * @public
     * @returns {Array}
     */
    this.getChildren = function() {
        return this.children;
    };

    /**
     * Counts the number of operands (and nested operands) for the node
     * @public
     * @returns {Integer}
     */
    this.countOperands = function() {
        var c = 0;
        var count = function(symbol) {
            symbol.children.forEach(function(child) {
                if(child.getType() == module.exports.Scule.arities.operand) {
                    c++;
                } else {
                    count(child);
                }
            });
        };
        count(this);
        return c;
    };
    
    /**
     * Returns the child node corresponding to the provided index
     * @public
     * @param {Number} index the index of the child to return
     * @return {QueryParseNode|Null}
     */
    this.getChild = function(index) {
        if(index > this.children.length || !this.children[index]) {
            return null;
        }
        return this.children[index];
    };
    
    /**
     * Returns the first child node - alias to this.getChild(0)
     * @public
     * @return {QueryParseNode}
     */
    this.getFirstChild = function() {
        return this.getChild(0);
    };
    
    /**
     * Returns a boolean value indicating whether or not the current node has children
     * @public
     * @returns {Boolean}
     */
    this.hasChildren = function() {
        return this.children.length > 0;
    };
    
    /**
     * Prunes operator nodes with no children from the tree
     * @public
     * @returns {Void}
     */
    this.normalize = function() {
        var child  = null;
        var i      = 0;
        for(; i < this.children.length; i++) {
            if(this.children.length === 0) {
                break;
            }
            child = this.children[i];
            if(child.getType() == module.exports.Scule.arities.selective) {
                if(!child.hasChildren()) {
                    this.children.splice(i, 1);
                    i--;                    
                } else {
                    child.normalize();
                    if(!child.hasChildren()) {
                        this.children.splice(i, 1);
                        i--;
                    }
                }
            }
        }
    };    

};

/**
 * Represents an expression in the context of a QueryTree
 * @public
 * @constructor
 * @class {QueryExpression}
 * @extends {QuerySymbol}
 * @returns {Void}
 */
module.exports.Scule.classes.QueryExpression = function() {
    
    module.exports.Scule.classes.QuerySymbol.call(this);
    
    this.type = module.exports.Scule.arities.expression;
    
};

/**
 * Represents a logical operation in the context of a QueryTree
 * @public
 * @constructor
 * @class {QueryOperator}
 * @param {String} symbol
 * @param {Number} type
 * @extends {QuerySymbol}
 * @returns {Void}
 */
module.exports.Scule.classes.QueryOperator = function(symbol, type) {
    
    module.exports.Scule.classes.QuerySymbol.call(this, symbol, type);
    
};

/**
 * Represents an operand operation in the context of a QueryTree
 * @public
 * @constructor
 * @class {QueryOperand}
 * @param {String} symbol
 * @param {Number} type
 * @extends {QuerySymbol}
 * @returns {Void}
 */
module.exports.Scule.classes.QueryOperand = function(symbol, type) {
    
    module.exports.Scule.classes.QuerySymbol.call(this, symbol, type);
    
};

/**
 * Represents a variable name in the context of a QueryTree
 * @public
 * @constructor
 * @class {QueryVariable}
 * @param {String} symbol
 * @extends {QuerySymbol}
 * @returns {Void}
 */
module.exports.Scule.classes.QueryVariable = function(symbol) {
    
    module.exports.Scule.classes.QuerySymbol.call(this, symbol);
    
    this.type = module.exports.Scule.arities.variable;
    
};

/**
 * Represents an index in the context of a QueryTree. This symbol node replaces
 * individual QuerySymbol instances covered by single attribute and compound indices
 * when run throught the visitor implementation in com.scule.db.vm and is an essential
 * optimization step for generating efficient bytecode for the provided query
 * @public
 * @constructor
 * @class {QueryIndex}
 * @param {String} symbol
 * @extends {QuerySymbol}
 * @returns {Void}
 */
module.exports.Scule.classes.QueryIndex = function(symbol) {

    module.exports.Scule.classes.QuerySymbol.call(this, symbol);
    
    this.type  = module.exports.Scule.arities.index;
    this.index = null;
    this.range = false;
    this.args  = [];

};

/**
 * A non-predictive recursive descent parser for Scule/MongoDB query objects.
 * Parses a query into a QueryTree AST object encapsulating linked QuerySymbol instances.
 * Yeah, I know you're not supposed to write parsers by hand, but I wanted to solve
 * this problem from the ground up :-)
 * @public
 * @constructor
 * @class {QueryParser}
 * @returns {Void}
 */
module.exports.Scule.classes.QueryParser = function() {

    /**
     * Parses the provided query into a QueryTree
     * @public
     * @param {Object} query the query expression object to parse
     * @returns {QueryTree}
     */
    this.parseQuery = function(query) {
        
        var tree  = new module.exports.Scule.classes.QueryTree();
        var scope = module.exports.Scule.$d.getLIFOStack();
        var ands  = module.exports.Scule.$d.getHashTable();
        var ors   = [];
        var inOr  = false;
        
        var root = new module.exports.Scule.classes.QueryExpression();
        tree.setRoot(root);
        scope.push(root);        
        
        var parse = function(query, level) {            
            var token;
            var type = scope.peek().getType();
            /**
             * Handle a scalar value - this is for implicit AND-s
             */
            if(module.exports.Scule.$f.isScalar(query) || query instanceof RegExp) {
                if(type == module.exports.Scule.arities.variable || type == module.exports.Scule.arities.selective) {
                    token = new module.exports.Scule.classes.QueryOperator('$eq', module.exports.Scule.arities.binary);
                    scope.peek().addChild(token);
                    token.addChild(new module.exports.Scule.classes.QueryOperand(query, module.exports.Scule.arities.operand));
                } else {
                    scope.peek().addChild(new module.exports.Scule.classes.QueryOperand(query, module.exports.Scule.arities.operand));
                }
                return;
            }
            /**
             * Handle an array of clauses - this is for literal AND-s and OR-s
             */
            if(module.exports.Scule.$f.isArray(query)) {
                if(scope.peek().getType() == module.exports.Scule.arities.selective) {
                    var len = query.length;
                    if(query.length < 2) {
                        throw 'operator ' + scope.peek().getSymbol() + ' requires two or more sub-expression';
                    }
                    var i = 0;
                    var s = scope.peek().getSymbol();
                    for(; i < len; i++) {
                        if(s in query[i]) {
                            throw 'operator ' + scope.peek().getSymbol() + ' cannot be nested';
                        }
                        parse(query[i], level++);
                    }
                } else {
                    var table = module.exports.Scule.$d.getHashTable();
                    query.forEach(function(element) {
                        table.put(element, true);
                    });
                    scope.peek().addChild(new module.exports.Scule.classes.QueryOperand(table, module.exports.Scule.arities.operand));
                }
                return;
            } else {
                var operator = scope.peek().getSymbol();
                if(operator == '$near' || operator == '$within') {
                    if(!('lat' in query) || !('lon' in query) || !('distance' in query)) {
                        throw operator + ' operator requires lat, lon, and distance attributes - e.g. {lat:30, lon:-30, distance:10}';
                    }
                    scope.peek().addChild(new module.exports.Scule.classes.QueryOperand(query, module.exports.Scule.arities.operand));
                    return;
                }
            }
            /**
             * Handle a general case query clause Object
             */
            if(!scope.isEmpty() && scope.peek().getSymbol() !== '$and') {
                token = new module.exports.Scule.classes.QueryOperand('$and', module.exports.Scule.arities.selective);
                scope.peek().addChild(token);
                scope.push(token);
            }
            for(var t in query) {
                if(t in module.exports.Scule.symbols.table) {
                    token = new module.exports.Scule.classes.QueryOperator(t, module.exports.Scule.symbols.table[t]);
                    if(t == '$or') {
                        inOr = true;
                        ors.push(token);
                    } else {
                        scope.peek().addChild(token);
                    }
                    scope.push(token);
                    parse(query[t], level++);
                    if(!scope.isEmpty() && scope.pop().getSymbol() == '$or') {
                        inOr = false;
                    }
                } else {
                    token = new module.exports.Scule.classes.QueryVariable(t);
                    /**
                     * Un-nesting ANDs
                     */
                    if(!inOr) {
                        if(ands.contains(t)) {
                            var top = ands.get(t);
                            if(top.getType() !== module.exports.Scule.arities.selective) {
                                if(top.getFirstChild().getType() !== module.exports.Scule.arities.selective) {
                                    var and = new module.exports.Scule.classes.QueryOperand('$and', module.exports.Scule.arities.selective);
                                    and.addChild(top.getFirstChild());
                                    top.children[0] = and;
                                    ands.put(t, and);
                                } else {
                                    ands.put(t, top.getFirstChild());
                                }
                            }
                            scope.push(ands.get(t));
                        } else {
                            ands.put(t, token);
                            tree.getRoot().addChild(token);
                            scope.push(token);
                        }                      
                    } else {
                        scope.peek().addChild(token);
                        scope.push(token);
                    }
                    parse(query[t], level++);
                    scope.pop();
                }
            }
            scope.pop();
        };
        
        parse(query, 0);        
        tree.setOrs(ors);
        tree.normalize();
        
        return tree;
    };

};

/**
 * Returns an instance of the {QueryTree} class
 * @returns {QueryTree}
 */
module.exports.getQueryTree = function() {
    return new module.exports.Scule.classes.QueryTree();
};

/**
 * Returns an instance of the {QuerySymbol} class
 * @see {QuerySymbol}
 * @param {String} symbol the symbol to encapsulate
 * @param {Number} type the type code for the symbol node
 * @returns {QuerySymbol}
 */
module.exports.getQuerySymbol = function(symbol, type) {
    return new module.exports.Scule.classes.QuerySymbol(symbol, type);
};

/**
 * Returns an instance of the {QueryParser} class
 * @returns {QueryParser}
 */
module.exports.getQueryParser = function() {
    return new module.exports.Scule.classes.QueryParser();
};