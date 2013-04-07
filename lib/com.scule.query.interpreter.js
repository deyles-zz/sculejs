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
    m: require('crypto'),
    hash: function (s) {
        return this.m.createHash('md5').update(s).digest('hex');
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
        objects:{},
        variables:{},
        constants:require(__dirname + '/com.scule.constants'),
        $f: require(__dirname + '/com.scule.functions').Scule.functions,
        $d: require(__dirname + '/com.scule.datastructures')        
    }
};

module.exports.Scule.classes.IndexSelector = function() {

    this.resolveIndex = function (collection, query) {
        return collection.find({});
    };

    this.selectIndex = function (collection, query) {
        return collection;
    };

};

module.exports.Scule.classes.QueryEngine = function() {

    this.traverse = function (k , o) {
        return module.exports.Scule.$f.traverse(k, o);
    };

    this.$ne = function (a, b) {
        return a != b;
    };

    this.$eq = function (a, b) {
        return a == b;
    };

    this.$gt = function (a, b) {
        return a > b;
    };

    this.$gte = function (a, b) {
        return a >= b;
    };

    this.$lt = function (a, b) {
        return a < b;
    };
    
    this.$lte = function (a, b) {
        return a <= b;
    };
    
    this.$all = function (a, b) {
        if (!module.exports.Scule.$f.isArray(a)
            || !module.exports.Scule.$f.isArray(b)) {
            return false;
        }
        var i = 0;
        var lookup = {};
        for (i=0; i < a.length; i++) {
            lookup[a[i]] = true;
        }
        for (i=0; i < b.length; i++) {
            if (!lookup.hasOwnProperty(b[i])) {
                return false;
            }
        }
        return true;
    };
    
    this.$in = function (a, b) {
        for (var i=0; i < b.length; i++) {
            if (b[i] == a) {
                return true;
            }
        }
        return false;
    };

    this.$nin = function (a, b) {
        for (var i=0; i < b.length; i++) {
            if (b[i] == a) {
                return false;
            }
        }
        return true;
    };

    this.$size = function (a, b) {
        return module.exports.Scule.$f.sizeOf(a) == b;
    };

    this.$exists = function (a, b) {
        return a.hasOwnProperty(b);
    };
    
    this.$sort = function (type, o, key) {
        module.exports.Scule.$f.sort(type, o, key);
    };
    
};

module.exports.Scule.classes.QueryCompiler = function() {

    this.cache  = module.exports.Scule.$d.getHashTable();
    this.engine = new module.exports.Scule.classes.QueryEngine();

    this.compileConditions = function(conditions) {
        var source = '';
        for (var key in conditions) {
            if (!conditions.hasOwnProperty(key)) {
                continue;
            }
            switch (key) {
                case '$limit':
                    source += '\tr.splice(0, ' + conditions[key] + ');';
                    break;
                        
                case '$sort':
                    var o = conditions[key];
                    if (module.exports.Scule.$f.isArray(o) 
                        && o.length == 2) {
                        source += '\tengine.$sort(r, "' + o[0] + '", ' + o[1] + ');';
                    }
                    break;
            }
        }
        source += '\n';
        return source;
    };
    
    this.compileClauseList = function(query) {
        var ands = [];
        for (var key in query) {
            if (!query.hasOwnProperty(key)) {
                continue;
            }
            ands = ands.concat(this.compileClauses(key, query[key]));
        }
        return ands;
    };

    this.compileClauses = function(key, subQuery) {
        var clauses = [];
        for (var operator in subQuery) {
            if (!this.engine.hasOwnProperty(operator)) {
                continue;
            }
            if (key.indexOf('.') < 0) {
                clauses.push('engine.' + operator + '(o.' + key + ', ' + JSON.stringify(subQuery[operator]) + ')'); 
            } else {
                clauses.push('engine.' + operator + '(engine.traverse(' + JSON.stringify(key) + ', o), ' + JSON.stringify(subQuery[operator]) + ')');                
            }
        }
        return clauses;
    };    
    
    this.compileQuery = function(query, conditions, explain) {
        
        var hash = md5.hash(JSON.stringify(query) + JSON.stringify(conditions));
        if(this.cache.contains(hash)) {
            return this.cache.get(hash);
        }        
        
        var closure = 'var c = function(objects, engine) {\n';
        closure    += '\tvar r = [];\n';
        if (conditions && conditions.hasOwnProperty('$skip')) {
            closure += '\tobjects.splice(0, ' + conditions.$skip + ');\n';
            delete(conditions.$skip);
        }
        closure    += '\tobjects.forEach(function(o) {\n';
        var ands    = [];
        var ors     = '';
        for (var key in query) {
            if (!query.hasOwnProperty(key)) {
                continue;
            }
            if (key == '$or') {
                ors = ' || (' + this.compileClauseList(query[key]) + ')';
            } else {
                ands = ands.concat(this.compileClauses(key, query[key]));
            }
        }
        if (ands.length > 0) {
            closure += '\t\tif ((' + ands.join(' && ') + ')' + ors + ') {\n';
            closure += '\t\t\tr.push(o);\n'
            closure += '\t\t}\n';
        }
        closure += '\t});\n';
        if (conditions) {
            closure += this.compileConditions(conditions);
        }
        closure += '\treturn r;\n';
        closure += '};\n';
        this.cache.put(hash, closure);
        
        return closure;
    };

    this.explainQuery = function(query, conditions) {
        var source = this.compileQuery(query, conditions);
        console.log(source);
        return source;
    };

};

module.exports.Scule.classes.QueryInterpreter = function() {

    this.indexer  = new module.exports.Scule.classes.IndexSelector();
    this.compiler = new module.exports.Scule.classes.QueryCompiler();

    this.interpret = function(collection, query, conditions, explain) {
        if (explain) {
            return this.compiler.explainQuery(query, conditions);
        }
        var o = this.indexer.resolveIndex(collection, query);
        eval(this.compiler.compileQuery(query, conditions));
        return c(o, module.exports.Scule.objects.engine);
    };

    this.update = function(collection, query, updates, conditions, explain) {
        var o = this.interpret(collection, query, conditions, explain);
    // do some update shit here
    };

};

module.exports.Scule.objects.engine = new module.exports.Scule.classes.QueryEngine();

module.exports.getIndexSelector = function() {
    return new module.exports.Scule.classes.IndexSelector();
};

module.exports.getQueryEngine = function() {
    return new module.exports.Scule.classes.QueryEngine();
};

module.exports.getQueryCompiler = function() {
    return new module.exports.Scule.classes.QueryCompiler();
};

module.exports.getQueryInterpreter = function() {
    return new module.exports.Scule.classes.QueryInterpreter();
};