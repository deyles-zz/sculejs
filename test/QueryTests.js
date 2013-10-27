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

describe('Queries', function() {    
    it('should test various query expressions', function() {
        Scule.dropAll();

        var timer = Scule.getTimer();
        var collection = Scule.factoryCollection('scule+dummy://unittest');    
        collection.clear();    

        var k = 0;
        var names = ['Tom', 'Dick', 'Harry', 'John'];
        for(var i=0; i < 10000; i++) {
                var a = [];
                var n = i%10;
                for(var j=0; j < n; j++) {
                        a.push(j);
                }
                var o = {
                        i:i,
                        n:n,
                        s:names[k++],
                        a:a,
                        as:a.length,
                        term: Math.random().toString(36).substring(7),
                        ts:(new Date()).getTime(),
                        foo:['bar','bar2'],
                        bar:[{a:i, b:(i+1)}, {a:(i+1), b:(i+2)}, {a:(i+2), b:(i+3)}],
                        o: {
                                a: i,
                                b: i+1,
                                c: i+2,
                                d: i+3,
                                e: i+4
                        },
                        loc: {
                                lng: Scule.global.functions.randomFromTo(-130, 130),
                                lat: Scule.global.functions.randomFromTo(-130, 130)
                        }
                };
                collection.save(o);
                if(k == 4) {
                    k = 0;
                }
        }

        timer.startInterval("{bar:{$elemMatch:{a:{$gt:100}, b:{$lt:300}}}}");
        collection.count({bar:{$elemMatch:{a:{$gt:100}, b:{$lt:300}}}}, {}, function(count) {
            timer.stopInterval();
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                var doCount = false;
                d.bar.forEach(function(od) {
                    if (od.a > 100 && od.b < 300) {
                        doCount = true;
                    }
                });
                if (doCount) {
                    c++;
                }
            });
            assert.equal(c, count);
        });

        timer.startInterval("{i:{$gt:100}, $or:[{i:300}, {i:400}, {'o.a':{$gt:100, $lt:300}}]}");
        collection.count({i:{$gt:100}, $or:[{i:300}, {i:400}, {'o.a':{$gt:100, $lt:300}}]}, {}, function(count) {
            timer.stopInterval();
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(d.i > 100 && (d.i === 300 || d.i === 400 || (d.o.a > 100 && d.o.a < 300))) {
                    c++;
                }
            });            
            assert.equal(c, count);            
        });

        timer.startInterval("collection - {$or:[{i:100}, {'o.a':101}]}");
        collection.count({$or:[{i:100}, {'o.a':101}]}, {}, function(count) {
            assert.equal(2, count);
        });
        timer.stopInterval();

        timer.startInterval("{i:100, $or:[{i:300}, {i:400}]}");
        collection.count({i:100, $or:[{i:300}, {i:400}]}, {}, function(count) {
            assert.equal(0, count);
        });
        timer.stopInterval();

        timer.startInterval("collection - {$or:[{i:100}, {o.a:{$gte:1000, $lte:2000}}]}");
        collection.count({$or:[{i:100}, {'o.a':{$gte:1000, $lte:2000}}]}, {}, function(count) {
            timer.stopInterval();
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(d.i == 100 || (d.o.a >= 1000 && d.o.a <= 2000)) {
                    c++;
                }
            });            
            assert.equal(c, count);
        });

        timer.startInterval("collection - {i:{$gte:5000}, n:{$lte:80}}");
        collection.count({i:{$gte:5000}, n:{$lte:80}}, {}, function(count) {
            timer.stopInterval();
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(d.i >= 5000 && d.n <= 80) {
                    c++;
                }
            });
            assert.equal(count, c);
            assert.equal(count, 5000);
        });

        timer.startInterval("collection - {i:{$gte:5000}, n:{$lte:80}}");
        collection.count({i:{$gte:5000}, n:{$lte:80}}, {}, function(count) {
            assert.equal(count, 5000);
        });
        timer.stopInterval();

        timer.startInterval("collection - {i:{$in:[1, 2, 3, 4, 5]}}");
        collection.count({i:{$in:[1, 2, 3, 4, 5]}}, {}, function(count) {
            timer.stopInterval();
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(d.i >= 1 && d.i <= 5) {
                    c++;
                }
            });
            assert.equal(count, c);        
            assert.equal(count, 5);
        });

        timer.startInterval("collection - {i:{$in:[1, 2, 3, 4, 5]}}");
        collection.count({i:{$in:[1, 2, 3, 4, 5]}}, {}, function(count) {
            assert.equal(count, 5);
        });
        timer.stopInterval();

        timer.startInterval("collection - {s:{$size:3}}");
        collection.count({s:{$size:3}}, {}, function(count) {
            timer.stopInterval();
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(d.s.length == 3) {
                    c++;
                }
            });
            assert.equal(count, c);         
            assert.equal(count, 2500);
        });

        timer.startInterval("collection - {s:{$size:3}}");
        collection.count({s:{$size:3}}, {}, function(count) {
            assert.equal(count, 2500);
        });
        timer.stopInterval();

        timer.startInterval("collection - {o:{$size:5}}");
        collection.count({o:{$size:5}}, {}, function(count) {
            timer.stopInterval();
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(Scule.global.functions.sizeOf(d.o) == 5) {
                    c++;
                }
            });
            assert.equal(count, c);        
            assert.equal(count, 10000);
        });

        timer.startInterval("collection - {o:{$size:5}}");
        collection.count({o:{$size:5}}, {}, function(count) {
            assert.equal(count, 10000);
        });
        timer.stopInterval();

        timer.startInterval("collection - {n:{$exists:false}}");
        collection.count({n:{$exists:false}}, {}, function(count) {
            timer.stopInterval();
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(!('n' in d)) {
                    c++;
                }
            });
            assert.equal(count, c);        
            assert.equal(count, 0);
        });

        timer.startInterval("collection - {n:{$exists:false}}");
        collection.count({n:{$exists:false}}, {}, function(count) {
            assert.equal(count, 0);
        });
        timer.stopInterval();

        timer.startInterval("collection - {n:{$exists:true}}");
        collection.count({n:{$exists:true}}, {}, function(count) {
            timer.stopInterval();
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if('n' in d) {
                    c++;
                }
            });
            assert.equal(count, c);         
            assert.equal(count, 10000);
        });

        timer.startInterval("collection - {n:{$exists:true}}");
        collection.count({n:{$exists:true}}, {}, function(count) {
            assert.equal(count, 10000);
        });
        timer.stopInterval();

        timer.startInterval("collection - {i:{$gte:70}}");
        collection.count({i:{$gte:70}}, {}, function(count) {
            timer.stopInterval();
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(d.i >= 70) {
                    c++;
                }
            });
            assert.equal(count, c);         
            assert.equal(count, 9930);
        });

        timer.startInterval("collection - {i:{$gte:70}}");
        collection.count({i:{$gte:70}}, {}, function(count) {
            assert.equal(count, 9930);
        });
        timer.stopInterval();

        timer.startInterval("collection - {s:/^T/}");
        collection.count({s:/^T/}, {}, function(count) {
            timer.stopInterval();
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(/^T/.test(d.s)) {
                    c++;
                }
            });
            assert.equal(count, c);         
            assert.equal(count, 2500);
        });

        timer.startInterval("collection - {s:/^T/}");
        collection.count({s:/^T/}, {}, function(count) {
            assert.equal(count, 2500);
        });
        timer.stopInterval();

        timer.startInterval("collection - {$or:[{n:{$lt:40}}, {i:{$gt:50}}]}");
        collection.count({$or:[{n:{$lt:40}}, {i:{$gt:50}}]}, {}, function(count) {
            timer.stopInterval();
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(d.i > 50 || d.n < 40) {
                    c++;
                }
            });
            assert.equal(count, c);        
            assert.equal(count, 10000);
        });

        timer.startInterval("collection - {$or:[{n:{$lt:40}}, {i:{$gt:50}}]}");
        collection.count({$or:[{n:{$lt:40}}, {i:{$gt:50}}]}, {}, function(count) {
            assert.equal(count, 10000);
        });
        timer.stopInterval();

        timer.startInterval("collection - {$or:[{n:{$lt:40}}, {i:{$gt:50}}]}, {$sort:{i:-1}, $limit:30}");
        collection.count({$or:[{n:{$lt:40}}, {i:{$gt:50}}]}, {$sort:{i:-1}, $limit:30}, function(count) {
            timer.stopInterval();
            var o = collection.findAll();
            var c = 0;
            for (var i=0; i < o.length; i++) {
                var d = o[i];
                if (d.i > 50 || d.n < 40) {
                    c++;
                }
                if (c == 30) {
                    break;
                }
            }
            assert.equal(count, c);        
            assert.equal(count, 30);
        });

        timer.startInterval("collection - {$or:[{n:{$lt:40}}, {i:{$gt:50}}]}, {$sort:{i:-1}, $limit:30}");
        collection.count({$or:[{n:{$lt:40}}, {i:{$gt:50}}]}, {$sort:{i:-1}, $limit:30}, function(count) {
            assert.equal(count, 30);
        });
        timer.stopInterval();

        timer.startInterval("collection - {i:{$lte:90}}, {$set:{n:10, s:'Steve'}}");
        collection.update({i:{$lte:90}}, {$set:{n:10, s:'Steve'}}, {}, false, function(count) {
            timer.stopInterval();
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(d.i <= 90) {
                    c++;
                }
            });
            assert.equal(count.length, c);        
            assert.equal(count.length, 91);
            o = collection.find({n:10, s:'Steve'});
            o.forEach(function(d) {
                assert.equal(d.n, 10);
                assert.equal(d.s, 'Steve');
            });
        });

        timer.startInterval("collection - {i:10}, {$push:{foo:'bar3'}}");
        collection.update({i:10}, {$push:{foo:'bar3'}}, {}, true, function(count) {
            timer.stopInterval();
            var o = collection.findAll();
            var c = 0;
            o.forEach(function(d) {
                if(d.i == 10) {
                    c++;
                }
            });
            assert.equal(count.length, c);         
            assert.equal(count.length, 1);
            o = collection.find({i:10});
            o.forEach(function(d) {
                assert.equal(d.foo[d.foo.length - 1], 'bar3');
            });
        });

        timer.startInterval("collection - {i:10}, {$pushAll:{foo:['bar3', 'bar4']}}");
        collection.update({i:10}, {$pushAll:{foo:['bar3', 'bar4']}}, {}, false, function(count) {
            timer.stopInterval();
            assert.equal(count.length, 1);
            o = collection.find({i:10});
            o.forEach(function(d) {
                assert.equal(d.foo[d.foo.length - 1], 'bar4');
                assert.equal(d.foo[d.foo.length - 2], 'bar3');
            });        
        });

        timer.logToConsole();        
    });
});