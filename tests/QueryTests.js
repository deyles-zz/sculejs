var sculedb = require('../lib/com.scule.db');
var jsunit  = require('../lib/com.scule.jsunit');
var inst    = require('../lib/com.scule.instrumentation');

function testQueries() {
    
    sculedb.dropAll();
    
    var timer = inst.getTimer();
    var collection = sculedb.factoryCollection('scule+dummy://unittest');
    
    collection.ensureBTreeIndex('loc.lat', {order:1000});
    collection.ensureBTreeIndex('i',       {order:1000});
    collection.ensureBTreeIndex('n',       {order:1000});    
    
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
                    o: {
                            a: i,
                            b: i+1,
                            c: i+2,
                            d: i+3,
                            e: i+4
                    },
                    loc: {
                            lng: sculedb.Scule.$f.randomFromTo(-130, 130),
                            lat: sculedb.Scule.$f.randomFromTo(-130, 130)
                    }
            };
            collection.save(o);
            if(k == 4) {
                k = 0;
            }
    }

    timer.startInterval("collection - {i:{$gte:5000}, n:{$lte:80}}");
    collection.count({i:{$gte:5000}, n:{$lte:80}}, {}, function(count) {
        jsunit.assertEquals(count, 5000);
    });
    timer.stopInterval();

    timer.startInterval("collection - {i:{$gte:5000}, n:{$lte:80}}");
    collection.count({i:{$gte:5000}, n:{$lte:80}}, {}, function(count) {
        jsunit.assertEquals(count, 5000);
    });
    timer.stopInterval();

    timer.startInterval("collection - {i:{$in:[1, 2, 3, 4, 5]}}");
    collection.count({i:{$in:[1, 2, 3, 4, 5]}}, {}, function(count) {
        jsunit.assertEquals(count, 5);
    });
    timer.stopInterval();

    timer.startInterval("collection - {i:{$in:[1, 2, 3, 4, 5]}}");
    collection.count({i:{$in:[1, 2, 3, 4, 5]}}, {}, function(count) {
        jsunit.assertEquals(count, 5);
    });
    timer.stopInterval();

    timer.startInterval("collection - {s:{$size:3}}");
    collection.count({s:{$size:3}}, {}, function(count) {
        jsunit.assertEquals(count, 2500);
    });
    timer.stopInterval();

    timer.startInterval("collection - {s:{$size:3}}");
    collection.count({s:{$size:3}}, {}, function(count) {
        jsunit.assertEquals(count, 2500);
    });
    timer.stopInterval();

    timer.startInterval("collection - {o:{$size:5}}");
    collection.count({o:{$size:5}}, {}, function(count) {
        jsunit.assertEquals(count, 9998);
    });
    timer.stopInterval();

    timer.startInterval("collection - {o:{$size:5}}");
    collection.count({o:{$size:5}}, {}, function(count) {
        jsunit.assertEquals(count, 9998);
    });
    timer.stopInterval();

    timer.startInterval("collection - {n:{$exists:false}}");
    collection.count({n:{$exists:false}}, {}, function(count) {
        jsunit.assertEquals(count, 9998);
    });
    timer.stopInterval();

    timer.startInterval("collection - {n:{$exists:false}}");
    collection.count({n:{$exists:false}}, {}, function(count) {
        jsunit.assertEquals(count, 9998);
    });
    timer.stopInterval();

    timer.startInterval("collection - {i:{$gte:70}}");
    collection.count({i:{$gte:70}}, {}, function(count) {
        jsunit.assertEquals(count, 9930);
    });
    timer.stopInterval();

    timer.startInterval("collection - {i:{$gte:70}}");
    collection.count({i:{$gte:70}}, {}, function(count) {
        jsunit.assertEquals(count, 9930);
    });
    timer.stopInterval();

    timer.startInterval("collection - {s:/^T/}");
    collection.count({s:/^T/}, {}, function(count) {
        jsunit.assertEquals(count, 2500);
    });
    timer.stopInterval();

    timer.startInterval("collection - {s:/^T/}");
    collection.count({s:/^T/}, {}, function(count) {
        jsunit.assertEquals(count, 2500);
    });
    timer.stopInterval();

    timer.startInterval("collection - {i:{$gt:50}, $or:{n:{$lt:40}}}");
    collection.count({i:{$gt:50}, $or:{n:{$lt:40}}}, {}, function(count) {
        jsunit.assertEquals(count, 9947);
    });
    timer.stopInterval();

    timer.startInterval("collection - {i:{$gt:50}, $or:{n:{$lt:40}}}");
    collection.count({i:{$gt:50}, $or:{n:{$lt:40}}}, {}, function(count) {
        jsunit.assertEquals(count, 9947);
    });
    timer.stopInterval();

    timer.startInterval("collection - {i:{$gt:50}, $or:{n:{$lt:40}}}, {$sort:{i:-1}, $limit:30}");
    collection.count({i:{$gt:50}, $or:{n:{$lt:40}}}, {$sort:{i:-1}, $limit:30}, function(count) {
        jsunit.assertEquals(count, 9947);
    });
    timer.stopInterval();

    timer.startInterval("collection - {i:{$gt:50}, $or:{n:{$lt:40}}}, {$sort:{i:-1}, $limit:30}");
    collection.count({i:{$gt:50}, $or:{n:{$lt:40}}}, {$sort:{i:-1}, $limit:30}, function(count) {
        jsunit.assertEquals(count, 9947);
    });
    timer.stopInterval();

    timer.startInterval("collection - {i:{$lte:90}}, {$set:{n:10, s:'Steve'}}");
    collection.update({i:{$lte:90}}, {$set:{n:10, s:'Steve'}}, {}, false, function(count) {
        jsunit.assertEquals(count.length, 91);
    });
    timer.stopInterval();

    timer.startInterval("collection - {i:10}, {$push:{foo:'bar3'}}");
    collection.update({i:10}, {$push:{foo:'bar3'}}, {}, true, function(count) {
        jsunit.assertEquals(count.length, 1);
    });
    timer.stopInterval();

    timer.startInterval("collection - {i:10}, {$pushAll:{foo:['bar3', 'bar4']}}");
    collection.update({i:10}, {$pushAll:{foo:['bar3', 'bar4']}}, {}, false, function(count) {
        jsunit.assertEquals(count.length, 1);
    });
    timer.stopInterval();

    console.log('');
    timer.logToConsole();
};

(function() {
    jsunit.resetTests(__filename);
    jsunit.addTest(testQueries);
    jsunit.runTests();
}());