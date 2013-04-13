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
        constants:require(__dirname + '/com.scule.constants'),
        $f: require(__dirname + '/com.scule.functions').Scule.functions,
        $d: require(__dirname + '/com.scule.datastructures')        
    }
};

/**
 * All valid symbols for Scule queries
 * @private
 * @type {Object}
 */
module.exports.Scule.symbols.table = {
    $and:       module.exports.Scule.arities.selective,
    $or:        module.exports.Scule.arities.selective,
    $nor:       module.exports.Scule.arities.negative,
    $not:       module.exports.Scule.arities.negative,
    $lt:        module.exports.Scule.arities.range,
    $lte:       module.exports.Scule.arities.range,
    $gt:        module.exports.Scule.arities.range,
    $gte:       module.exports.Scule.arities.range,
    $all:       module.exports.Scule.arities.array,
    $in:        module.exports.Scule.arities.array,
    $nin:       module.exports.Scule.arities.array,
    $elemMatch: module.exports.Scule.arities.array,
    $eq:        module.exports.Scule.arities.binary,
    $ne:        module.exports.Scule.arities.binary,
    $size:      module.exports.Scule.arities.binary,
    $exists:    module.exports.Scule.arities.binary,
    $within:    module.exports.Scule.arities.geospatial,
    $near:      module.exports.Scule.arities.geospatial,
    $set:       module.exports.Scule.arities.mutate,
    $inc:       module.exports.Scule.arities.mutate,
    $unset:     module.exports.Scule.arities.mutate,
    $pull:      module.exports.Scule.arities.mutate,
    $pullAll:   module.exports.Scule.arities.mutate,
    $pop:       module.exports.Scule.arities.mutate,
    $push:      module.exports.Scule.arities.mutate,
    $pushAll:   module.exports.Scule.arities.mutate,
    $rename:    module.exports.Scule.arities.mutate
};

module.exports.Scule.classes.QueryNormalizer = function() {

    this.normalize = function(query) {
        var normalize = function(o) {
            for (var key in o) {
                if (module.exports.Scule.$f.isScalar(o[key]) || o[key] instanceof RegExp) {
                    var v = o[key];
                    delete o[key];
                    o[key] = {
                        $eq:v
                    };
                } else {
                    if (key == '$or' || key == '$elemMatch') {
                        normalize(o[key]);
                    } else {
                        o[key] = module.exports.Scule.$f.sortObjectKeys(o[key]);
                    }
                }
            }
            return module.exports.Scule.$f.sortObjectKeys(o);
        };
        return normalize(query);
    };

};

/**
 * Calculates the intersection between the provided array of Document arrays, returning
 * an array containing the resulting product
 * @param {Array} lists an array containing the lists to calculate intersection against
 * @returns {Array}
 */
module.exports.Scule.functions.intersection = function (lists) {
    if (lists.length == 1) {
        return lists[0];
    }
    var table = module.exports.Scule.$d.getHashTable();
    var list  = null;
    lists.forEach(function (o) {
        if (!list || o.length < list.length) {
            list = o;
        }
    });
    if (!list) {
        return [];
    }    
    list.forEach(function (o) {
        table.put(module.exports.Scule.$f.getObjectId(o), {
            c:1, 
            o:o
        });
    });
    var intersection = [];
    var len = lists.length;
    for (var i=0; i < len; i++) {
        if (lists[i] == list) {
            continue;
        }
        var func = function (o) {
            var o2 = table.get(module.exports.Scule.$f.getObjectId(o));
            if (o2) {
                o2.c++;
                if (o2.c == len) {
                    intersection.push(o);
                }
            }
        };
        lists[i].forEach(func);
    }
    return intersection;
};

module.exports.Scule.classes.IndexSelector = function() {

    this.resolveIndices = function (collection, query) {
        var containers = this.selectIndices(collection, query);
        if (!containers || !containers.selected) {
            return collection.documents.table;
        }
        return this.queryIndices(containers, query);
    };

    /**
     * @private
     */
    this.buildHashIndexKey = function(keys, query) {
        var ikey = [];
        for (var key in keys) {
            if (!query.hasOwnProperty(key)) {
                continue;
            }
            ikey.push(query[key].$eq);
        }
        if (ikey.length == 1) {
            return ikey[0];
        }
        return ikey.join(',');
    };

    /**
     * @private
     */
    this.buildRangeIndexKey = function(keys, query) {
        var ikey   = [null, null, false, false];  
        var minkey = [];
        var maxkey = [];
        for (var key in keys) {
            if (!query.hasOwnProperty(key)) {
                continue;
            }
            for (var skey in query[key]) {
                switch (skey) {
                    case '$gt':
                        minkey.push(query[key][skey]);
                        break;
                    
                    case '$gte':
                        minkey.push(query[key][skey]);
                        ikey[2] = true;
                        break;
                    
                    case '$lt':
                        maxkey.push(query[key][skey]);
                        break;
                    
                    case '$lte':
                        maxkey.push(query[key][skey]);
                        ikey[3] = true;
                        break;
                }
            }
        }
        if (minkey.length > 0) {
            if (minkey.length == 1) {
                ikey[0] = minkey[0];
            } else {
                ikey[0] = minkey.join(',');
            }
        }
        if (maxkey.length > 0) {
            if (maxkey.length == 1) {
                ikey[1] = maxkey[0];
            } else {
                ikey[1] = maxkey.join(',');
            }
        }
        return ikey;
    };

    /**
     * @private
     */
    this.queryHashIndex = function(container, key) {
        return container.$index.search(key);
    };

    /**
     * @private
     */
    this.queryRangeIndex = function(container, min, max, imin, imax) {
        return container.$index.range(min, max, imin, imax);
    };

    /**
     * @private
     */
    this.queryIndices = function(containers, query) {
        var o         = [];
        var key       = null;
        var ikey      = null;
        var container = null;
        for (key in containers.range) {
            container = containers.range[key];
            ikey      = this.buildRangeIndexKey(container.$attr, query);
            o.push(this.queryRangeIndex(container, ikey[0], ikey[1], ikey[2], ikey[3]));
        }
        for (key in containers.exact) {
            container = containers.exact[key];
            ikey      = this.buildHashIndexKey(container.$attr, query);
            o.push(this.queryHashIndex(container, ikey));
        }
        return module.exports.Scule.functions.intersection(o);
    };

    /**
     * @private
     */
    this.selectIndices = function (collection, query) {
        var range = module.exports.Scule.$d.getHashTable();
        var exact = module.exports.Scule.$d.getHashTable();
        
        this.populateAttributes(query, range, exact);

        range = range.getKeys().sort();
        exact = exact.getKeys().sort();

        if(range.length === 0 && exact.length === 0) {
            return;
        }
        
        var hkey     = null;
        var m        = null;
        var matches  = {
            range:{}, 
            exact:{}, 
            selected:false
        };
        var indices  = collection.indices;

        for(var i=0; i < indices.length; i++) {
            var index = indices[i];
            m = index.applies(range, true);
            if(m && !m.$partial) {
                hkey = JSON.stringify(m.$index.astrings.getKeys().sort());
                matches.range[hkey] = m;
                matches.selected = true;
            }            
            m = index.applies(exact, false);
            if(m && !m.$partial) {
                hkey = JSON.stringify(m.$index.astrings.getKeys().sort());
                matches.exact[hkey] = m;
                matches.selected = true;
            }
        }
        
        return matches;
    };

    /**
     * @private
     */
    this.populateAttributes = function(query, range, exact) {
        for (var key in query) {
            for (var sub in query[key]) {
                if (!module.exports.Scule.symbols.table.hasOwnProperty(sub)) {
                    continue;
                }
                switch (module.exports.Scule.symbols.table[sub]) {
                    case module.exports.Scule.arities.range:
                        range.put(key, true);
                        break;
                   
                    case module.exports.Scule.arities.operand:    
                    case module.exports.Scule.arities.binary:
                        if (key == '$eq') {
                            exact.put(key, true);
                        }
                        break;                   
                    
                    case module.exports.Scule.arities.selective:
                        throw 'sub-expressions cannot use indexes';
                        break;                    
                }
            }
        }
    };

};

module.exports.Scule.classes.QueryEngine = function() {

    this.traverse = function (k , o) {
        return module.exports.Scule.$f.traverse(k, o);
    };

    this.traverseObject = function(k, o) {
        return module.exports.Scule.$f.traverseObject(module.exports.Scule.$f.parseAttributes(k), o);
    };

    this.updateIndexes = function (document, collection) {
        collection.indices.forEach(function (index) {
            index.remove(document);
            index.index(document);
        });
    };

    this.$ne = function (a, b) {
        return a != b;
    };

    this.$eq = function (a, b) {
        if (b instanceof RegExp) {
            return b.test(a);
        } else {
            return a == b;
        }
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

    this.$elemMatch = function(o, c) {
        if (!module.exports.Scule.$f.isArray(o)) {
            return false;
        }
        for (var i=0; i < o.length; i++) {
            if (c(o[i])) {
                return true;
            }
        }
        return false;
    };
    
    this.$size = function (a, b) {
        if (!module.exports.Scule.$f.isInteger(b)) {
            return false;
        }
        return module.exports.Scule.$f.sizeOf(a) == b;
    };

    this.$exists = function (a, b) {
        if (b) {
            return a !== undefined;
        }
        return a === undefined;
    };
    
    this.$within = function(o, q) {
        if (!o.hasOwnProperty('lat') || !o.hasOwnProperty('lon')) {
            return false;
        }
        if (!q.hasOwnProperty('lat') || !q.hasOwnProperty('lon')) {
            return false;
        }
        var d = Math.sqrt(Math.pow(q.lat - o.lat, 2) + Math.pow(q.lon - o.lon, 2));
        return d <= q.distance;
    };
    
    this.$near = function(o, q) {
        if (!o.hasOwnProperty('lat') || !o.hasOwnProperty('lon')) {
            return false;
        }
        if (!q.hasOwnProperty('lat') || !q.hasOwnProperty('lon')) {
            return false;
        }
        var d = Math.acos(Math.sin(o.lat) * Math.sin(q.lat) + Math.cos(o.lat) * Math.cos(q.lat) * Math.cos(q.lon - o.lon)) * 6371;
        return d <= q.distance;
    };
    
    this.$sort = function (type, o, key) {
        module.exports.Scule.$f.sort(type, o, key);
    };
    
    this.$set = function (struct, value, upsert) {
        var leaf = struct[0];
        var o    = struct[1];
        if (!(leaf in o)) {
            if (upsert === true) {
                o[leaf] = value;
            }
        } else {
            o[leaf] = value;
        }        
    };
    
    this.$unset = function (struct, value, upsert) {
        var leaf = struct[0];
        var o    = struct[1];
        if (leaf in o) {
            delete o[leaf];
        }        
    };
    
    this.$inc = function (struct, value, upsert) {
        if (!module.exports.Scule.$f.isInteger(value)) {
            value = 1;
        }
        var leaf = struct[0];
        var o    = struct[1];
        if (!(leaf in o)) {
            if (upsert) {
                o[leaf] = value;
            }
        } else {
            if (module.exports.Scule.$f.isInteger(o[leaf]) || module.exports.Scule.$f.isDouble(o[leaf])) {
                o[leaf] += value;   
            }
        }        
    };
    
    this.$pull = function (struct, value, upsert) {
        var leaf = struct[0];
        var o    = struct[1];
        if (leaf in o && module.exports.Scule.$f.isArray(o[leaf])) {
            var a = [];            
            for (var i=0; i < o[leaf].length; i++) {
                if (o[leaf][i] !== value) {
                    a.push(o[leaf][i]);
                }
            }  
            o[leaf] = a;
        }        
    };
    
    this.$pullall = function (struct, value, upsert) {
        var leaf = struct[0];
        var o    = struct[1];
        if (leaf in o && module.exports.Scule.$f.isArray(o[leaf])) {
            if (!module.exports.Scule.$f.isArray(value)) {
                throw 'the $pullAll operator requires an associated array as an operand';
            }
            var table = module.exports.Scule.$d.getHashTable();
            value.forEach(function (val) {
                table.put(val, true); 
            });
            for (var i=0; i < o[leaf].length; i++) {
                if (table.contains(o[leaf][i])) {
                    o[leaf].splice(i, 1);
                    i--;
                }
            }  
        }        
    };
    
    this.$pop = function (struct, value, upsert) {
        var leaf = struct[0];
        var o    = struct[1];
        if (leaf in o && module.exports.Scule.$f.isArray(o[leaf])) {
            o[leaf].pop();   
        }        
    };
    
    this.$push = function (struct, value, upsert) {
        var leaf = struct[0];
        var o    = struct[1];
        if (!(leaf in o) && upsert) {
            o[leaf] = value;
        } else {
            if (module.exports.Scule.$f.isArray(o[leaf])) {
                o[leaf].push(value);   
            }
        }        
    };
    
    this.$pushall = function (struct, value, upsert) {
        var leaf = struct[0];
        var o    = struct[1];
        if (!(leaf in o) && upsert) {
            o[leaf] = value;
        } else {
            if (!module.exports.Scule.$f.isArray(value)) {
                throw 'the $pushAll operator requires an associated array as an operand';
            }            
            if (module.exports.Scule.$f.isArray(o[leaf])) {
                o[leaf] = o[leaf].concat(value);   
            }
        }        
    };
    
};

module.exports.Scule.classes.QueryCompiler = function() {

    this.cache      = module.exports.Scule.$d.getHashTable();
    this.engine     = new module.exports.Scule.classes.QueryEngine();
    this.normalizer = new module.exports.Scule.classes.QueryNormalizer();

    this.compileConditions = function(conditions) {
        var source = '';
        for (var key in conditions) {
            if (!conditions.hasOwnProperty(key)) {
                continue;
            }
            switch (key) {
                case '$limit':
                    source += '\tif (r.length > ' + conditions[key] + ') {\n';
                    source += '\t\tr.splice(' + conditions[key] + ');\n';
                    source += '\t}\n';
                    break;
                        
                case '$sort':
                    var o = conditions[key];
                    var k = module.exports.Scule.$f.objectKeys(o);
                    if (k.length == 1) {
                        source += '\tengine.$sort(' + o[k[0]] + ', r, "' + k[0] + '");\n';
                    }
                    break;
            }
        }
        return source;
    };
    
    this.compileClauseList = function(queries) {
        var __t  = this;
        var ors = [];
        if (!module.exports.Scule.$f.isArray(queries)) {
            return ors;
        }
        queries.forEach(function(query) {
            var ands = [];
            for (var key in query) {
                if (!query.hasOwnProperty(key)) {
                    continue;
                }
                ands = ands.concat(__t.compileQueryClauses(key, query[key]));
            }
            ors.push(ands.join(' && '));
        });
        return ors.join(' || ');
    };

    this.compileExpressions = function(query) {
        query = this.normalizer.normalize(query);
        var ands = [];
        for (var key in query) {
            ands = ands.concat(this.compileQueryClauses(key, query[key]));
        }
        return ands;
    };

    this.compileQueryClauses = function(key, subQuery) {
        var clauses = [];
        for (var operator in subQuery) {
            if (!this.engine.hasOwnProperty(operator)) {
                continue;
            }
            if (operator == '$elemMatch') {
                var sands = this.compileExpressions(subQuery[operator]);
                var src = 'function(o) { return (' + sands.join(' && ') + '); }';
                if (key.indexOf('.') < 0) {
                    clauses.push('engine.$elemMatch(o.' + key + ', ' + src + ')'); 
                } else {
                    clauses.push('engine.$elemMatch(engine.traverse(' + JSON.stringify(key) + ', o), ' + src + ')');                
                }                
            } else {
                if (key.indexOf('.') < 0) {
                    var v = null;
                    if (subQuery[operator] instanceof RegExp) {
                        v = subQuery[operator].toString();
                    } else {
                        v = JSON.stringify(subQuery[operator]);
                    }
                    clauses.push('engine.' + operator + '(o.' + key + ', ' + v + ')'); 
                } else {
                    clauses.push('engine.' + operator + '(engine.traverse(' + JSON.stringify(key) + ', o), ' + v + ')');                
                }
            }
        }
        return clauses;
    };    
    
    this.compileUpdateClauses = function(key, subQuery, upsert) {
        var clauses = [];
        for (var operator in subQuery) {
            if (!this.engine.hasOwnProperty(operator)) {
                continue;
            }
            clauses.push('\t\tengine.' + operator + '(engine.traverseObject(' + JSON.stringify(key) + ', o), ' + JSON.stringify(subQuery[operator]) + ', ' + JSON.stringify(upsert) + ');');                
        }
        return clauses;
    };
    
    this.compileUpdate = function(query, upsert) {

        var hash = md5.hash(JSON.stringify(query));
        if(this.cache.contains(hash)) {
            return this.cache.get(hash);
        }        

        var updates  = [];
        var closure  = 'var u = function(objects, collection, engine) {\n';
        closure     += '\tobjects.forEach(function(o) {\n';
        
        for (var key in query) {
            if (!query.hasOwnProperty(key)) {
                continue;
            }
            updates = updates.concat(this.compileUpdateClauses(key, query[key], upsert));
        }
        
        closure     += updates.join('\n');
        closure     += '\n\t\tengine.updateIndexes(o, collection);\n';
        closure     += '\t});\n'
        closure     += '\treturn objects;\n';
        closure     += '}\n';

        this.cache.put(hash, closure);        
        return closure;

    };
    
    this.compileQuery = function(query, conditions) {
        
        query      = this.normalizer.normalize(query);
        
        var hash = md5.hash(JSON.stringify(query) + JSON.stringify(conditions));
        if(this.cache.contains(hash)) {
            return this.cache.get(hash);
        }        
        
        var closure = 'var c = function(objects, engine) {\n';        
        closure    += '\tvar r = [];\n';
        if (module.exports.Scule.$f.sizeOf(query) > 0) {
            closure    += '\tfor (var k in objects) {\n';
            closure    += '\t\tif (!objects.hasOwnProperty(k)) { continue; }\n';
            closure    += '\t\tvar o = objects[k];\n';
            var ands    = [];
            var ors     = '';
            for (var key in query) {
                if (!query.hasOwnProperty(key)) {
                    continue;
                }
                if (key == '$or') {
                    ors = '(' + this.compileClauseList(query[key]) + ')';
                } else {
                    ands = ands.concat(this.compileQueryClauses(key, query[key]));
                }
            }
            if (ands.length > 0) {
                if (ors.length > 0) {
                    ors = ' && ' + ors;
                }
                closure += '\t\tif ((' + ands.join(' && ') + ')' + ors + ') {\n';
                closure += '\t\t\tr.push(o);\n'
                closure += '\t\t}\n';
            } else if (ors.length > 0) {
                closure += '\t\tif (' + ors + ') {\n';
                closure += '\t\t\tr.push(o);\n'
                closure += '\t\t}\n';            
            }
            closure += '\t};\n';
        } else {
            closure    += '\tfor (var k in objects) {\n';
            closure    += '\t\tif (!objects.hasOwnProperty(k)) { continue; }\n';
            closure    += '\t\tr.push(o[k]);\n';
            closure    += '\t}\n';
        }
        if (conditions && conditions.hasOwnProperty('$skip')) {
            closure += '\tr.splice(0, ' + conditions.$skip + ');\n';
            delete(conditions.$skip);
        }        
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

    this.explainUpdate = function(query, upsert) {
        var source = this.compileUpdate(query, upsert);
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
        var o   = this.indexer.resolveIndices(collection, query);
        var src = this.compiler.compileQuery(query, conditions);
        eval(src);
        return c(o, module.exports.Scule.objects.engine);
    };

    this.update = function(collection, query, updates, conditions, upsert, explain) {
        var o = this.interpret(collection, query, conditions, explain);
        if (explain) {
            return this.compiler.explainUpdate(updates, upsert);
        }
        var src = this.compiler.compileUpdate(updates, upsert);
        eval(src);
        return u(o, collection, module.exports.Scule.objects.engine);
    };

};

module.exports.Scule.objects.engine = new module.exports.Scule.classes.QueryEngine();

module.exports.getQueryNormalizer = function() {
    return new module.exports.Scule.classes.QueryNormalizer();
};

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