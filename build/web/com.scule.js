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
 *     * Neither the name of the <organization> nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

if (typeof Scule == 'undefined') {
    var Scule = {
        namespaces: {}
    };
}

if (typeof Scule == 'undefined') {
    var console = {
        log: function(message) {
            // noop
        }
    };
}

/**
 * Global namespace definitions
 */
(function() {

    "use strict";

    /**
     * Registers a namespace with the Scule module
     * @param namespace String
     * @param definition Object
     * @return void
     */
    Scule.registerNamespace = function(namespace, definition) {
        if (namespace in Scule) {
            throw 'namespace ' + namespace + ' is already registered';
        }
        Scule[namespace] = definition;
    };

    /**
     * Registers a component with the Scule module
     * @param namespace String
     * @param type String
     * @param name String
     * @param component Function
     * @return false
     * @throws Exception
     */
    Scule.registerComponent = function(namespace, type, name, component) {
        var ns = Scule.require(namespace);
        if (!(type in ns)) {
            throw 'type ' + type + ' is not registered inside ' + namespace + ' namespace';
        }
        ns[type][name] = component;
    };

    /**
     * Emulates a CommonJS require
     * @param namespace String
     * @return Function
     */
    Scule.require = function(namespace) {
        if (!(namespace in Scule)) {
            throw 'namespace ' + namespace + ' has not been registered, require failed';
        }
        return Scule[namespace];
    };

    Scule.registerNamespace('global', {
        constants:{
            INDEX_TYPE_BTREE: 0,
            INDEX_TYPE_RTREE: 1,
            INDEX_TYPE_HASH:  2,
            INDEX_TYPE_CLUSTERED: 3,
            ID_FIELD: '_id',
            REF_FIELD:'_ref'           
        },
        classes:{},
        functions:{},
        variables:{
            debug:false
        }
    });

    Scule.registerNamespace('datastructures', {
        constants:Scule.require('global').constants,
        classes:{},
        $f:Scule.require('global').functions
    });

    Scule.registerNamespace('instrumentation', {
        constants:Scule.require('global').constants,
        classes:{}
    });

    Scule.registerNamespace('parser', {
        constants:Scule.require('global').constants,
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
        $f:Scule.require('global').functions
    });

    Scule.registerNamespace('builder', {
        functions:{},
        classes:{},
        variables:{
            line:0
        },
        instructions:{}
    });

    Scule.registerNamespace('vm', {
        constants:Scule.require('global').constants,
        functions:{},
        classes:{},
        instructions:{
            table:{},
            mapping:{},
            index:{}
        },
        variables:{
            inst:0
        },
        $f:Scule.require('global').functions,
        $d:Scule.require('datastructures'),
        $p:Scule.require('parser')        
    });
    
    Scule.registerNamespace('db', {
        constants:Scule.require('global').constants,
        functions:{},
        classes:{},
        plugins:{},
        engines:{},
        objects:{
            core:{
                collections:{}
            }
        },
        $f:Scule.require('global').functions,
        $v:Scule.require('vm')
    });

}());

(function() {

    "use strict";

    /*
     * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
     * in FIPS 180-1
     * Version 2.2 Copyright Paul Johnston 2000 - 2009.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * Distributed under the BSD License
     * See http://pajhome.org.uk/crypt/md5 for details.
     */
    Scule.global.classes.sha1 = function() {

        this.hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
        this.b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */

        this.hex_sha1 = function(s)    {
            return this.rstr2hex(this.rstr_sha1(this.str2rstr_utf8(s)));
        };

        this.hash = function(s) {
            return this.hex_sha1(s);
        };

        this.b64_sha1 = function(s)    {
            return this.rstr2b64(this.rstr_sha1(this.str2rstr_utf8(s)));
        };

        this.any_sha1 = function(s, e) {
            return this.rstr2any(this.rstr_sha1(this.str2rstr_utf8(s)), e);
        };

        this.hex_hmac_sha1 = function(k, d) {
            return this.rstr2hex(this.rstr_hmac_sha1(this.str2rstr_utf8(k), this.str2rstr_utf8(d)));
        };

        this.b64_hmac_sha1 = function(k, d) {
            return this.rstr2b64(this.rstr_hmac_sha1(this.str2rstr_utf8(k), this.str2rstr_utf8(d)));
        };

        this.any_hmac_sha1 = function(k, d, e) {
            return this.rstr2any(this.rstr_hmac_sha1(this.str2rstr_utf8(k), this.str2rstr_utf8(d)), e);
        };

        this.sha1_vm_test = function() {
            return this.hex_sha1("abc").toLowerCase() == "a9993e364706816aba3e25717850c26c9cd0d89d";
        };

        this.rstr_sha1 = function(s) {
            return this.binb2rstr(this.binb_sha1(this.rstr2binb(s), s.length * 8));
        };

        this.rstr_hmac_sha1 = function(key, data) {
            var bkey = this.rstr2binb(key);
            if (bkey.length > 16) {
                bkey = this.binb_sha1(bkey, key.length * 8);
            }

            var ipad = new Array(16), opad = new Array(16);
            for (var i = 0; i < 16; i++) {
                ipad[i] = bkey[i] ^ 0x36363636;
                opad[i] = bkey[i] ^ 0x5C5C5C5C;
            }

            var hash = this.binb_sha1(ipad.concat(this.rstr2binb(data)), 512 + data.length * 8);
            return this.binb2rstr(this.binb_sha1(opad.concat(hash), 512 + 160));
        };

        this.rstr2hex = function(input) {
            this.hexcase = 0;
            var hex_tab = this.hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
            var output = "";
            var x;
            for (var i = 0; i < input.length; i++) {
                x = input.charCodeAt(i);
                output += hex_tab.charAt((x >>> 4) & 0x0F) + hex_tab.charAt(x & 0x0F);
            }
            return output;
        };

        this.rstr2b64 = function(input) {
            this.b64pad = '';
            var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            var output = "";
            var len = input.length;
            for (var i = 0; i < len; i += 3)
            {
                var triplet = (input.charCodeAt(i) << 16)
                | (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
                | (i + 2 < len ? input.charCodeAt(i+2)      : 0);
                for (var j = 0; j < 4; j++)
                {
                    if (i * 8 + j * 6 > input.length * 8) {
                        output += this.b64pad;
                    } else {
                        output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
                    }
                }
            }
            return output;
        };

        this.rstr2any = function(input, encoding) {
            var divisor = encoding.length;
            var remainders = [];
            var i, q, x, quotient;

            /* Convert to an array of 16-bit big-endian values, forming the dividend */
            var dividend = new Array(Math.ceil(input.length / 2));
            for (i = 0; i < dividend.length; i++)
            {
                dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
            }

            while (dividend.length > 0)
            {
                quotient = [];
                x = 0;
                for (i = 0; i < dividend.length; i++) {
                    x = (x << 16) + dividend[i];
                    q = Math.floor(x / divisor);
                    x -= q * divisor;
                    if (quotient.length > 0 || q > 0) {
                        quotient[quotient.length] = q;
                    }
                }
                remainders[remainders.length] = x;
                dividend = quotient;
            }

            /* Convert the remainders to the output string */
            var output = "";
            for (i = remainders.length - 1; i >= 0; i--) {
                output += encoding.charAt(remainders[i]);
            }

            /* Append leading zero equivalents */
            var full_length = Math.ceil(input.length * 8 / (Math.log(encoding.length) / Math.log(2)));
            for (i = output.length; i < full_length; i++) {
                output = encoding[0] + output;
            }

            return output;
        };

        this.str2rstr_utf8 = function(input) {
            var output = "";
            var i = -1;
            var x, y;

            while (++i < input.length) {
                /* Decode utf-16 surrogate pairs */
                x = input.charCodeAt(i);
                y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
                if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
                    x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
                    i++;
                }

                /* Encode output as utf-8 */
                if (x <= 0x7F) {
                    output += String.fromCharCode(x);
                } else if (x <= 0x7FF) {
                    output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
                        0x80 | ( x         & 0x3F));
                } else if (x <= 0xFFFF) {
                    output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                        0x80 | ((x >>> 6 ) & 0x3F),
                        0x80 | ( x         & 0x3F));
                } else if (x <= 0x1FFFFF) {
                    output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                        0x80 | ((x >>> 12) & 0x3F),
                        0x80 | ((x >>> 6 ) & 0x3F),
                        0x80 | ( x         & 0x3F));
                }
            }
            return output;
        };

        this.str2rstr_utf16le = function(input) {
            var output = "";
            for (var i = 0; i < input.length; i++) {
                output += String.fromCharCode( input.charCodeAt(i) & 0xFF, (input.charCodeAt(i) >>> 8) & 0xFF);
            }
            return output;
        };

        this.str2rstr_utf16be = function(input) {
            var output = "";
            for (var i = 0; i < input.length; i++) {
                output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF, input.charCodeAt(i) & 0xFF);
            }
            return output;
        };

        this.rstr2binb = function(input) {
            var output = new Array(input.length >> 2);
            var i = null;
            for (i = 0; i < output.length; i++) {
                output[i] = 0;
            }
            for (i = 0; i < input.length * 8; i += 8) {
                output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
            }
            return output;
        };

        this.binb2rstr = function(input) {
            var output = "";
            for (var i = 0; i < input.length * 32; i += 8) {
                output += String.fromCharCode((input[i>>5] >>> (24 - i % 32)) & 0xFF);
            }
            return output;
        };

        this.binb_sha1 = function(x, len) {
            /* append padding */
            x[len >> 5] |= 0x80 << (24 - len % 32);
            x[((len + 64 >> 9) << 4) + 15] = len;

            var w = new Array(80);
            var a =  1732584193;
            var b = -271733879;
            var c = -1732584194;
            var d =  271733878;
            var e = -1009589776;

            for (var i = 0; i < x.length; i += 16) {
                var olda = a;
                var oldb = b;
                var oldc = c;
                var oldd = d;
                var olde = e;

                for (var j = 0; j < 80; j++) {
                    if (j < 16) {
                        w[j] = x[i + j];
                    } else {
                        w[j] = this.bit_rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
                    }
                    var t = this.safe_add(this.safe_add(this.bit_rol(a, 5), this.sha1_ft(j, b, c, d)),
                        this.safe_add(this.safe_add(e, w[j]), this.sha1_kt(j)));
                    e = d;
                    d = c;
                    c = this.bit_rol(b, 30);
                    b = a;
                    a = t;
                }

                a = this.safe_add(a, olda);
                b = this.safe_add(b, oldb);
                c = this.safe_add(c, oldc);
                d = this.safe_add(d, oldd);
                e = this.safe_add(e, olde);
            }
            return new Array(a, b, c, d, e);

        };

        this.sha1_ft = function(t, b, c, d) {
            if (t < 20) {
                return (b & c) | ((~b) & d);
            }
            if (t < 40) {
                return b ^ c ^ d;
            }
            if (t < 60) {
                return (b & c) | (b & d) | (c & d);
            }
            return b ^ c ^ d;
        };

        this.sha1_kt = function(t) {
            return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 : (t < 60) ? -1894007588 : -899497514;
        };

        this.safe_add = function(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        };

        this.bit_rol = function(num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt));
        };

    };
    
    Scule.getSHA1 = function() {
        return new Scule.global.classes.sha1();
    };

    Scule.sha1 = Scule.getSHA1();

}());

(function(){
    
    "use strict";
    
    /*!
     * Joseph Myer's md5() algorithm wrapped in a self-invoked function to prevent
     * global namespace polution, modified to hash unicode characters as UTF-8.
     *  
     * Copyright 1999-2010, Joseph Myers, Paul Johnston, Greg Holt, Will Bond <will@wbond.net>
     * http://www.myersdaily.org/joseph/javascript/md5-text.html
     * http://pajhome.org.uk/crypt/md5
     * 
     * Released under the BSD license
     * http://www.opensource.org/licenses/bsd-license
     */
    Scule.global.classes.md5 = function() {

        this.md5cycle = function(x, k) {
            var a = x[0], b = x[1], c = x[2], d = x[3];

            a = this.ff(a, b, c, d, k[0], 7, -680876936);
            d = this.ff(d, a, b, c, k[1], 12, -389564586);
            c = this.ff(c, d, a, b, k[2], 17,  606105819);
            b = this.ff(b, c, d, a, k[3], 22, -1044525330);
            a = this.ff(a, b, c, d, k[4], 7, -176418897);
            d = this.ff(d, a, b, c, k[5], 12,  1200080426);
            c = this.ff(c, d, a, b, k[6], 17, -1473231341);
            b = this.ff(b, c, d, a, k[7], 22, -45705983);
            a = this.ff(a, b, c, d, k[8], 7,  1770035416);
            d = this.ff(d, a, b, c, k[9], 12, -1958414417);
            c = this.ff(c, d, a, b, k[10], 17, -42063);
            b = this.ff(b, c, d, a, k[11], 22, -1990404162);
            a = this.ff(a, b, c, d, k[12], 7,  1804603682);
            d = this.ff(d, a, b, c, k[13], 12, -40341101);
            c = this.ff(c, d, a, b, k[14], 17, -1502002290);
            b = this.ff(b, c, d, a, k[15], 22,  1236535329);

            a = this.gg(a, b, c, d, k[1], 5, -165796510);
            d = this.gg(d, a, b, c, k[6], 9, -1069501632);
            c = this.gg(c, d, a, b, k[11], 14,  643717713);
            b = this.gg(b, c, d, a, k[0], 20, -373897302);
            a = this.gg(a, b, c, d, k[5], 5, -701558691);
            d = this.gg(d, a, b, c, k[10], 9,  38016083);
            c = this.gg(c, d, a, b, k[15], 14, -660478335);
            b = this.gg(b, c, d, a, k[4], 20, -405537848);
            a = this.gg(a, b, c, d, k[9], 5,  568446438);
            d = this.gg(d, a, b, c, k[14], 9, -1019803690);
            c = this.gg(c, d, a, b, k[3], 14, -187363961);
            b = this.gg(b, c, d, a, k[8], 20,  1163531501);
            a = this.gg(a, b, c, d, k[13], 5, -1444681467);
            d = this.gg(d, a, b, c, k[2], 9, -51403784);
            c = this.gg(c, d, a, b, k[7], 14,  1735328473);
            b = this.gg(b, c, d, a, k[12], 20, -1926607734);

            a = this.hh(a, b, c, d, k[5], 4, -378558);
            d = this.hh(d, a, b, c, k[8], 11, -2022574463);
            c = this.hh(c, d, a, b, k[11], 16,  1839030562);
            b = this.hh(b, c, d, a, k[14], 23, -35309556);
            a = this.hh(a, b, c, d, k[1], 4, -1530992060);
            d = this.hh(d, a, b, c, k[4], 11,  1272893353);
            c = this.hh(c, d, a, b, k[7], 16, -155497632);
            b = this.hh(b, c, d, a, k[10], 23, -1094730640);
            a = this.hh(a, b, c, d, k[13], 4,  681279174);
            d = this.hh(d, a, b, c, k[0], 11, -358537222);
            c = this.hh(c, d, a, b, k[3], 16, -722521979);
            b = this.hh(b, c, d, a, k[6], 23,  76029189);
            a = this.hh(a, b, c, d, k[9], 4, -640364487);
            d = this.hh(d, a, b, c, k[12], 11, -421815835);
            c = this.hh(c, d, a, b, k[15], 16,  530742520);
            b = this.hh(b, c, d, a, k[2], 23, -995338651);

            a = this.ii(a, b, c, d, k[0], 6, -198630844);
            d = this.ii(d, a, b, c, k[7], 10,  1126891415);
            c = this.ii(c, d, a, b, k[14], 15, -1416354905);
            b = this.ii(b, c, d, a, k[5], 21, -57434055);
            a = this.ii(a, b, c, d, k[12], 6,  1700485571);
            d = this.ii(d, a, b, c, k[3], 10, -1894986606);
            c = this.ii(c, d, a, b, k[10], 15, -1051523);
            b = this.ii(b, c, d, a, k[1], 21, -2054922799);
            a = this.ii(a, b, c, d, k[8], 6,  1873313359);
            d = this.ii(d, a, b, c, k[15], 10, -30611744);
            c = this.ii(c, d, a, b, k[6], 15, -1560198380);
            b = this.ii(b, c, d, a, k[13], 21,  1309151649);
            a = this.ii(a, b, c, d, k[4], 6, -145523070);
            d = this.ii(d, a, b, c, k[11], 10, -1120210379);
            c = this.ii(c, d, a, b, k[2], 15,  718787259);
            b = this.ii(b, c, d, a, k[9], 21, -343485551);

            x[0] = this.add32(a, x[0]);
            x[1] = this.add32(b, x[1]);
            x[2] = this.add32(c, x[2]);
            x[3] = this.add32(d, x[3]);

        };

        this.cmn = function(q, a, b, x, s, t) {
            a = this.add32(this.add32(a, q), this.add32(x, t));
            return this.add32((a << s) | (a >>> (32 - s)), b);
        };

        this.ff = function(a, b, c, d, x, s, t) {
            return this.cmn((b & c) | ((~b) & d), a, b, x, s, t);
        };

        this.gg = function(a, b, c, d, x, s, t) {
            return this.cmn((b & d) | (c & (~d)), a, b, x, s, t);
        };

        this.hh = function(a, b, c, d, x, s, t) {
            return this.cmn(b ^ c ^ d, a, b, x, s, t);
        };

        this.ii = function(a, b, c, d, x, s, t) {
            return this.cmn(c ^ (b | (~d)), a, b, x, s, t);
        };

        this.md51 = function(s) {
            if (/[\x80-\xFF]/.test(s)) {
                s = unescape(encodeURI(s));
            }
            var n = s.length,
            state = [1732584193, -271733879, -1732584194, 271733878], i;
            for (i=64; i<=s.length; i+=64) {
                this.md5cycle(state, this.md5blk(s.substring(i-64, i)));
            }
            s = s.substring(i-64);
            var tail = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
            for (i=0; i<s.length; i++) {
                tail[i>>2] |= s.charCodeAt(i) << ((i%4) << 3);
            }
            tail[i>>2] |= 0x80 << ((i%4) << 3);
            if (i > 55) {
                this.md5cycle(state, tail);
                for (i=0; i<16; i++) {
                    tail[i] = 0;
                }
            }
            tail[14] = n*8;
            this.md5cycle(state, tail);
            return state;
        };

        this.md5blk = function(s) {
            var md5blks = [], i;
            for (i=0; i<64; i+=4) {
                md5blks[i>>2] = s.charCodeAt(i) + (s.charCodeAt(i+1) << 8) + (s.charCodeAt(i+2) << 16) + (s.charCodeAt(i+3) << 24);
            }
            return md5blks;
        };

        this.hex_chr = '0123456789abcdef'.split('');

        this.rhex = function(n) {
            var s='', j=0;
            for (; j<4; j++) {
                s += this.hex_chr[(n >> (j * 8 + 4)) & 0x0F] + this.hex_chr[(n >> (j * 8)) & 0x0F];
            }
            return s;
        };

        this.hex = function(x) {
            for (var i=0; i<x.length; i++) {
                x[i] = this.rhex(x[i]);
            }
            return x.join('');
        };

        this.hash = function(s) {
            return this.hex(this.md51(s));
        };

        this.add32 = function(a, b) {
            return (a + b) & 0xFFFFFFFF;
        };

    };
    
    Scule.getMD5 = function() {
        return new Scule.global.classes.md5();
    };
    
    if (Scule.getMD5().hash('hello') != '5d41402abc4b2a76b9719d911017c592') {
        Scule.global.classes.md5.add32 = function(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        };
    }    
    
    Scule.md5 = Scule.getMD5();
    
}());

/**
 * Global functions
 */
(function() {

    "use strict";

    /**
     * Given a map, extracts all key => value pairs where the value is true
     * and the key is not prefixed with a $
     * @param object Object
     * @return Object
     */
    Scule.global.functions.extractTrueValues = function(object) {
        var map = {};
        for (var name in object) {
            if(object.hasOwnProperty(name)) {
                if (name.match(/^\$/)) {
                    continue;
                }
                if (object[name]) {
                    map[name] = true;
                }
            }
        }
        return map;
    };

    /**
     * Pushes a value to the provided array if it's not null/false/undefined
     * @param array Array
     * @param value mixed
     */
    Scule.global.functions.pushIfNotNull = function(array, value) {
        if (value) {
            array.push(value);
        }
    };

    Scule.global.functions.pushIfExists = function(array, object, key) {
        if (key in object) {
            array.push(object[key]);
        }
    };

    Scule.global.functions.getObjectAttribute = function(object, key, def) {
        if (!(key in object)) {
            return def;
        }
        return object[key];
    };

    /**
     * Returns the ObjectId for an Object, optionally as a String representation
     * @param object Object
     * @param toString boolean
     * @return ObjectId|String
     */
    Scule.global.functions.getObjectId = function(object, toString) {
        if (toString === undefined) {
            toString = false;
        }
        return (toString) ? object[Scule.global.constants.ID_FIELD].toString() : object[Scule.global.constants.ID_FIELD];
    };

    /**
     * Performs a deep clone of an object, returning a pointer to the clone
     * @param o the object to clone
     * @return object
     */
    Scule.global.functions.cloneObject = function(o) {
        var c = {};
        if (Scule.global.functions.isArray(o)) {
            c = [];
        }
        for (var a in o) {
            if (typeof(o[a]) == "object") {
                if (o[a] instanceof RegExp) {
                    c[a] = new RegExp(o[a].source);
                } else {
                    c[a] = Scule.global.functions.cloneObject(o[a]);
                }
            } else {
                c[a] = o[a];
            }
        }
        return c;
    };  

    /**
     * Traverses a JavaScript object given a datastructure representing the path to
     * walk and returns the nested struct corresponding to the second to last path
     * element. Confused? Good.
     * @param attributes Object
     * @param object Object
     * @return Object
     */
    Scule.global.functions.traverseObject = function(attributes, object) {
        var depth = 0;
        var leaf  = null;
        var probe = function(attr) {
            for (var k in attr) {
                if(attr.hasOwnProperty(k)) {
                    if (attr[k] === true) {
                        leaf = k;
                        break;
                    } else {
                        depth++;
                        probe(attr[k]);
                    }
                }
            }
        };
        probe(attributes);
        var i = 0;
        var trvs = function(attr, o) {
            if (i == depth) {
                return o;
            }
            for (var k in attr) {
                if(attr.hasOwnProperty(k)) {
                    if (!o.hasOwnProperty(k)) {
                        return null;
                    }
                    if (attr[k] === true) {
                        return o;
                    } else {
                        i++;
                        return trvs(attr[k], o[k]);
                    }
                }
            }
        };
        return [leaf, trvs(attributes, object)];
    };

    /**
     * Sorts an object's keys alphabetically and returns a sorted, shallow copy of the object
     * @param object the object to sort and clone
     * @return object
     */
    Scule.global.functions.sortObjectKeys = function(object) {
        var o = {};
        var k = [];
        for (var key in object) {
            if(object.hasOwnProperty(key)) {
                k.push(key);
            }
        }
        k.sort(function(v1, v2){
            var v1o = false;
            if (v1.match(/^\$/)) {
                v1 = v1.substr(1);
                v1o = true;
            }
            var v2o = false;
            if (v2.match(/^\$/)) {
                v2 = v2.substr(1);
                v2o = true;
            }
            if (v1o && !v2o) {
                return 1;
            } else if (v2o && !v1o) {
                return -1;
            }
            if (v2 > v1) {
                return -1;
            } else if (v2 < v1) {
                return 1;
            } else {
                return 0;
            }
        });
        k.forEach(function(i) {
            o[i] = object[i];
        });
        return o;
    };

    /**
     * Returns a count of the number of top level attributes in an object
     * @param o the object to count
     * @return integer
     */
    Scule.global.functions.sizeOf = function(o) {
        if (o instanceof Array || typeof(o) === 'string') {
            return o.length;
        } else {
    
            var size = 0, key;
            for (key in o) {
                if (o.hasOwnProperty(key)) {
                    size++;
                }
            }
            return size;
        }
        return null;
    };

    /**
     * Randomizes the order of elements in an array
     * @param c the array to randomize
     * @return void
     */
    Scule.global.functions.shuffle = function(c) {
        var tmp, current, top = c.length;
        if (top) {
            while (--top) {
                current = Math.floor(Math.random() * (top + 1));
                tmp = c[current];
                c[current] = c[top];
                c[top] = tmp;
            }
        }
    };

    /**
     * Returns all unique values in an Array as an Array
     * @return Array
     */
    Scule.global.functions.unique = function(a) {
        var map = {};
        for (var i=0; i < a.length; i++) {
            map[a[i]] = true;
        }
        var keys = [];
        for (var key in map) {
            if(map.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    };

    Scule.global.functions.contains = function(object, key) {
        return (key in object);
    };

    /**
     * Returns a normalized, JSON encoded string representation of an object
     * @param o the object to serialize
     * @return string
     */
    Scule.global.functions.stringify = function(o) {
        var clone = {};
        for (var key in o) {
            if (typeof(o[key]) == 'function') {
                clone[key] = o[key].toString();
            } else {
                clone[key] = o[key];
            }
        }
        return JSON.stringify(clone);
    };

    /**
     * Determines whether or not a variable references an array
     * @param o mixed the variable to determine the type for
     * @return boolean
     */
    Scule.global.functions.isArray = function(o) {
        return (Object.prototype.toString.call(o) === '[object Array]');
    };

    /**
     * Determines whether or not a value represents and integer
     * @param o mixed the variable to evaluate
     * @return boolean
     */
    Scule.global.functions.isInteger = function(o) {
        return parseInt(o, 10) == o;
    };

    /**
     * Determines whether or not a value represents and double
     * @param o mixed the variable to evaluate
     * @return boolean
     */
    Scule.global.functions.isDouble = function(o) {
        return parseFloat(o) == o;
    };

    /**
     * Determines whether or not a value represents a scalar
     * @param o mixed the variable the evaluate
     * @return boolean
     */
    Scule.global.functions.isScalar = function(o) {
        return o !== null && !(o instanceof Object);
    };

    /**
     * Generates a random number between two numbers
     * @param from the lower threshold of the range
     * @param to the upper threshold of the range
     */
    Scule.global.functions.randomFromTo = function(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    };

    /**
     * Simple comparison function
     * @param a mixed
     * @param b mixed
     * @return boolean
     */
    Scule.global.functions.compare = function(a, b) {
        if (a === b) {
            return 0;
        }
        return (a > b) ? 1 : -1;
    };

    /**
     * Simple comparison function, this function is based on object key
     * @param a mixed
     * @param b mixed
     * @return boolean
     */
    Scule.global.functions.compareElementKey = function(a, b) {
        return Scule.global.functions.compare(a.key, b.key);
    };

    /**
     * Simple comparison function, this function is based on object value
     * @param a mixed
     * @param b mixed
     * @return boolean
     */
    Scule.global.functions.compareElementValue = function(a, b) {
        return Scule.global.functions.compare(a.value, b.value);
    };

    /**
     * Deep compares two arrays - seems kind of flakey, I wouldn't use this in production.
     * @param a Array
     * @param b Array
     * @return integer
     */
    Scule.global.functions.compareArray = function(a, b) {
        if (!Scule.global.functions.isArray(a) && Scule.global.functions.isArray(b)) {
            return 1;
        }
        if (Scule.global.functions.isArray(a) && !Scule.global.functions.isArray(b)) {
            return -1;
        }
        if (a.length > b.length) {
            return 1;
        }
        if (b.length > a.length) {
            return -1;
        }
        var same = true;
        var c = 0;
        var len = a.length;
        for (var i = 0; i < len; i++) {
            if (Scule.global.functions.isArray(a[i])) {
                c += Scule.global.functions.compareArray(a[i], b[i]);
            } else {
                c += Scule.global.functions.compare(a[i], b[i]);
            }
            if (c !== 0) {
                same = false; 
            }
        }
        if (c === 0 && !same) { // same elements in a different order
            c = JSON.stringify(a[0]).localeCompare(JSON.stringify(b[0]));
        }
        if (c > 0) {
            c = 1;
        } else if (c < 0) {
            c = -1;
        }    
        return c;
    };

    Scule.global.functions.sort = function(type, collection, key) {
        switch(type) {
            case -1: // descending
                collection.sort(function(v1, v2){
                    return v2[key] - v1[key];
                });
                break;

            case 0: // random
                Scule.global.functions.shuffle(collection);
                break;

            case 1: // ascending
                collection.sort(function(v1, v2){
                    return v1[key] - v2[key];
                });
                break;

            case 2: // alphabetically
                collection.sort(function(v1, v2){ 
                    if (v2[key] > v1[key]) {
                        return -1;
                    } else if (v2[key] < v1[key]) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                break;

            case 3: //  reverse
                collection.sort(function(v1, v2){
                    if (v2[key] < v1[key]) {
                        return -1;
                    } else if (v2[key] > v1[key]) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                break;
        }
    };

    /**
     * Trims a string of leading and trailing whitespace and newline characters. This function will also compress
     * adjacent \s characters to a single character. If the native String.prototype.trim function is available
     * it will be substituted rather than using the regexp based solution
     * @param value String
     * @return string
     */
    Scule.global.functions.trim = function(value) {
        if (!String.prototype.trim) {
            return value.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
        } else {
            return value.trim();
        }
    };

    /**
     * If using the Titanium framework this function returns the device MAC address, otherwise it returns a random integer per session
     * @return integer
     */
    Scule.global.functions.getMACAddress = function() {
        if (!Scule.global.variables.hasOwnProperty('SimulatedMacAddress')) {
            Scule.global.variables.SimulatedMacAddress = (new Date()).getTime().toString().substring(9, 11) + '' + Scule.global.functions.randomFromTo(100, 999);
        }
        return Scule.global.variables.SimulatedMacAddress;
    };

    /**
     * Parses a String representation (or representations) of an object attribute address, returning a 
     * map containing a nested representation
     * @param attributes String
     * @return Object
     */
    Scule.global.functions.parseAttributes = function(attributes) {
        if (!Scule.global.functions.isArray(attributes)) {
            return Scule.global.functions.parseAttributes(attributes.split(','));
        }
        var build = function(struct, elements, count) {
            var element = Scule.global.functions.trim(elements[count]);
            if (count == (elements.length - 1)) {
                struct[element] = true;
            } else {
                var o = {};
                struct[element] = o;
                build(o, elements, count+1);
            }
        };
        var a = {};
        attributes.forEach(function(attribute) {
            build(a, attribute.split('.'), 0);
        });
        return a;
    };

    /**
     * Searches the provided object for the given keys, returning an array containing the results in order of incidence
     * @param keys Object
     * @param o Object
     * @return Array
     */
    Scule.global.functions.searchObject = function(keys, o) {
        var srch = function(ks, o, composite) {
            if (!o) {
                return;
            }            
            for (var k in ks) {
                if (ks[k] === true) {
                    if (Scule.global.functions.isInteger(k) && Scule.global.functions.isArray(o)) {
                        composite.push(o[k]);
                    } else {
                        if (k in o) {
                            composite.push(o[k]);
                        }
                    }
                } else {
                    if ((k in o) && !Scule.global.functions.isScalar(o[k])) {
                        srch(ks[k], o[k], composite);
                    }
                }
            }
        };
        var composite = [];
        srch(keys, o, composite);
        return composite;
    };

    /**
     * Retrieves a single attribute from an object given a path statement (e.g 'a.b')
     * @public
     * @param {String} path
     * @param {Object} object
     * @returns {Mixed}
     */
    Scule.global.functions.traverse = function(path, object) {
        var t = function(p, o) {
            if (o === undefined) {
                return undefined;
            }
            if (p.length === 1) {
                return o[p.pop()];
            } else {
                var idx = p.shift();
                return t(p, o[idx]);
            }
        };
        return t(path.split('.'), object);
    };

}());

/**
 * Datastructures
 */
(function() {

    "use strict";

    /**
     * Represents a singly linked list. The list is terminated by a null pointer.
     * @public
     * @constructor
     * @class {LinkedList}
     * @returns {Void}
     */
    Scule.datastructures.classes.LinkedList = function() {

        /**
         * @private
         * @type {Null|LinkedListNode}
         */
        this.head     = null;

        /**
         * @private
         * @type {Null|LinkedListNode}
         */
        this.tail     = null;

        /**
         * @private
         * @type {Number}
         */
        this.length = 0;

        /**
         * Returns the head element of the list
         * @public
         * @returns {LinkedListNode|null}
         */
        this.getHead = function() {
            return this.head;
        };

        /**
         * Returns the tail element of the list
         * @public
         * @returns {LinkedListNode|null}
         */
        this.getTail = function() {
            return this.tail;
        };

        /**
         * Returns the number of elements in the list
         * @public
         * @returns {Number}
         */
        this.getLength = function() {
            return this.length;
        };

        /**
         * Returns a boolean value indicating whether or not the list is empty
         * @public
         * @returns {Boolean}
         */
        this.isEmpty = function() {
            return this.length === 0;
        };

        /**
         * Empties the list - setting head and tail to null and reseting the element count to 0
         * @public
         * @returns {Void}
         */
        this.clear = function() {
            this.head = null;
            this.tail = null;
            this.length = 0;
        };

        /**
         * Returns the element residing at the specified index. Returns null if none exists or index is out of range.
         * @public
         * @param {Number} idx the index of the node to retrieve
         * @returns {Mixed|null}
         */
        this.get = function(idx) {
            if (idx < 0 || idx > this.length) {
                return null;
            }
            if (idx === 0) {
                return this.head;
            } else {
                var curr = this.head;
                var i = 0;
                while (curr) {
                    if (idx == i) {
                        break;
                    }
                    i++;
                    curr = curr.next;
                }
                return curr;
            }
        };

        /**
         * Adds an element to the tail of the list
         * @public
         * @param {Mixed} value the value to append to the list
         * @returns {Boolean}
         */
        this.add = function(value) {
            var temp = new Scule.datastructures.classes.LinkedListNode(null, value);
            if (this.head === null) {
                this.head = temp;
            } else if (this.tail === null) {
                this.head.next = temp;
                this.tail = temp;
            } else {
                var curr = this.tail;
                curr.next = temp;
                this.tail = curr.next;
            }
            this.length++;
            return temp;
        };

        /**
         * Performs a linear scan on the list to determine if an element exists. Optionally takes a key
         * that is used to introspect elements (e.g. 'bar', foo => {foo:'bar'}. Returns null if no results are found
         * @public
         * @param {Mixed} value the value to search for
         * @param {Mixed} key an optional introspection key
         * @param cmp Function an optional comparison function, defaults to Scule.datastructures.functions.compare
         * @returns {Mixed|null}
         */
        this.search = function(value, key, cmp) {
            if (!cmp) {
                cmp = Scule.global.functions.compare;
            }        
            var curr = this.head;
            while (curr) {
                if (key) {
                    if (cmp(curr.element[key], value) === 0) {
                        break;
                    }
                } else {
                    if (cmp(curr.element, value) === 0) {
                        break;
                    }
                }
                curr = curr.next;
            }
            return curr;
        };

        /**
         * Performs a linear scan to determine if a given value exists in the list
         * @public
         * @param {Mixed} value the value to search for in the list
         * @param cmp Function an optional comparison function, defaults to Scule.datastructures.functions.compare
         * @returns {Boolean}
         */
        this.contains = function(value, cmp) {
            if (value === null) {
                return false;
            }
            if (!cmp) {
                cmp = Scule.global.functions.compare;
            }        
            var curr = this.head;
            while (curr) {
                if (cmp(curr.element, value) === 0) {
                    break;
                }
                curr = curr.next;
            }
            return (curr !== null);
        };

        /**
         * Splits the list at the given index. Returns the resulting list.
         * @public
         * @param {Number} idx the index to split the list on
         * @returns {LinkedList}
         */
        this.split = function(idx) {
            var node;
            if (idx === undefined) {
                idx = Math.floor(this.length / 2);
                node = this.middle();
                if (!node) {
                    return null;
                }
            } else {
                if (idx < 1 || idx > this.length) {
                    return null;
                }
                node = this.get(idx - 1);
            }

            var list = new Scule.datastructures.classes.LinkedList();

            // fix the lists
            list.head = node.next;
            node.next = null;
            list.tail = this.tail;
            this.tail = node;

            // fix lengths
            list.length = idx;
            this.length = this.length - idx;

            return list;
        };

        /**
         * Returns the element at the (approximate) middle of the list - should execute in O(n/2) time and O(1) space
         * @public
         * @returns {LinkedListNode|null}
         */
        this.middle = function() {
            if (!this.head) {
                return null;
            }
            var slow = this.head;
            var fast = this.head;
            while (fast.next && fast.next.next) {
                slow = slow.next;
                fast = fast.next.next;
            }
            return slow;
        };

        /**
         * Removes the element at the provided index. If the index is out of range this function returns null.
         * @public
         * @param {Number} idx the index of the node to remove
         * @returns {LinkedListNode|null}
         */
        this.remove = function(idx) {
            if (idx < 0 || idx > this.length) {
                return null;
            }
            var curr;
            if (this.length === 1) { // only one node in the list - just remove that instead
                curr = this.head;
                this.clear();
            } else {
                var prev = this.get(idx - 1);
                if (prev.next == this.tail) { // we're just shifting the tail back one position
                    curr = this.tail;
                    this.tail = prev;
                } else { // otherwise we know it's a straight up deletion
                    curr = prev.next;
                    prev.next = prev.next.next;
                }
                this.length--;
            }
            return curr;
        };

        /**
         * Reverses the list
         * @public
         * @returns {Void}
         */
        this.reverse = function() { // CS101 - pay attention kids, Amazon will ask you this question one day
            var prev = null;
            var curr = this.head;
            var temp = null;
            while (curr) {
                temp = curr.next;
                curr.next = prev;
                prev = curr;
                curr = temp;
            }
            temp = this.head;
            this.head = this.tail;
            this.tail = temp;
        };

        /**
         * Returns the contents of the list (values) as an array
         * @public
         * @returns {Array}
         */
        this.toArray = function() {
            var nodes = [];
            var curr  = this.head;
            while (curr) {
                nodes.push(curr.element);
                curr = curr.next;
            }
            return nodes;
        };

        /**
         * Emulates the Array forEach prototype function
         * @public
         * @param {Function} callback the callback to execute at each step in the loop
         * @returns {Void}
         */
        this.forEach = function(callback) {
            var curr = this.head;
            while (curr) {
                callback(curr);
                curr = curr.next;
            }
            return true;
        };

        /**
         * Performs an in place merge sort on the list, optionally taking a comparison function as a parameter
         * @public
         * @param {Function} cmp the comparison function to use during the merge step
         * @param {Mixed} key the key to use during comparisons
         * @returns {Void}
         */
        this.sort = function(cmp, key) {

            if (this.length < 2) { // empty or 1 element lists are already sorted
                return this;
            }

            if (!cmp) {
                cmp = Scule.global.functions.compare;
            }

            var middle = function(node) {
                if (!node) {
                    return node;
                }
                var slow = node;
                var fast = node;
                while (fast.next && fast.next.next) {
                    slow = slow.next;
                    fast = fast.next.next;
                }
                return slow;
            };

            var merge = function(left, right) {
                var head = {
                    next: null
                };
                var curr = head;
                var a;
                var b;
                while (left && right) {
                    if (key) {
                        a = right.element[key];
                        b = left.element[key];
                    } else {
                        a = right.element;
                        b = left.element;
                    }                
                    if (cmp(a, b) > -1) {
                        curr.next = left;
                        left = left.next;
                    } else {
                        curr.next = right;
                        right = right.next;
                    }
                    curr = curr.next;
                }
                curr.next = (!left) ? right : left;
                return head.next;
            };

            var merge_sort = function(node) {
                if (!node || !node.next) {
                    return node;
                }    
                var m = middle(node);
                var s = m.next;
                m.next = null;
                return merge(merge_sort(node), merge_sort(s));
            };

            this.head = merge_sort(this.head);

        };

    };

    /**
     * Class representing a doubly linked list
     * @public
     * @constructor
     * @class {DoublyLinkedList}
     * @returns {Void}
     */
    Scule.datastructures.classes.DoublyLinkedList = function() {

        /**
         * @private
         * @type {Null|DoublyLinkedListNode}
         */
        this.head   = null;

        /**
         * @private
         * @type {Null|DoublyLinkedListNode}
         */    
        this.tail   = null;

        /**
         * @private
         * @type {Number}
         */
        this.length = 0;

        /**
         * Returns the head elements from the list
         * @public
         * @returns {DoublyLinkedListNode}
         */
        this.getHead = function() {
            return this.head;  
        };

        /**
         * Returns the tail elements from the list
         * @public
         * @returns {DoublyLinkedListNode}
         */
        this.getTail = function() {
            return this.tail;  
        };

        /**
         * Returns a boolean value indicating whether or not the list is empty
         * @public
         * @returns {Boolean}  
         */     
        this.isEmpty = function() {
            return this.length === 0;
        };

        /**
         * Returns the number of elements in the list
         * @public
         * @returns {Number}
         */    
        this.getLength = function() {
            return this.length;
        };

        /**
         * Performs a linear scan on the list to determine if an element exists. Optionally takes a key
         * that is used to introspect elements (e.g. 'bar', foo => {foo:'bar'}. Returns null if no results are found
         * @public
         * @param {Mixed} value the value to search for
         * @param {Mixed} key an optional introspection key
         * @param {Function} cmp an optional comparison function, defaults to Scule.datastructures.functions.compare
         * @returns {Mixed}
         */
        this.search = function(value, key, cmp) {
            if (!cmp) {
                cmp = Scule.global.functions.compare;
            }        
            var curr = this.head;
            while (curr) {
                if (key) {
                    if (cmp(curr.element[key], value) === 0) {
                        break;
                    }
                } else {
                    if (cmp(curr.element, value) === 0) {
                        break;
                    }
                }
                curr = curr.next;
            }
            return curr;
        };  

        /**
         * Performs a linear scan to determine if a given value exists in the list
         * @public
         * @param {Mixed} value the value to search for in the list
         * @param cmp Function an optional comparison function, defaults to Scule.datastructures.functions.compare
         * @returns {Boolean}
         */
        this.contains = function(value, cmp) {
            if (value === null) {
                return false;
            }
            if (!cmp) {
                cmp = Scule.global.functions.compare;
            }        
            var curr = this.head;
            while (curr) {
                if (cmp(curr.element, value) === 0) {
                    break;
                }
                curr = curr.next;
            }
            return (curr !== null);
        };  

        /**
         * Returns the element residing at the specified index. Returns null if none exists or index is out of range.
         * @public
         * @param {Number} idx the index of the element to return - returns null if the provided index is out of range
         * @returns {Mixed|null}
         */
        this.get = function(idx) {
            if (idx < 0 || idx > this.length) {
                return null;
            }
            if (idx === 0) {
                return this.head;
            } else {
                var curr = this.head;
                var i = 0;
                while (curr) {
                    if (idx == i) {
                        break;
                    }
                    i++;
                    curr = curr.next;
                }
                return curr;
            }
        };

        /**
         * Adds an element to the end list
         * @public
         * @param {Mixed} value
         * @returns {DoublyLinkedListNode}
         */
        this.add = function(value) {
            var node = new Scule.datastructures.classes.DoublyLinkedListNode(null, null, value);
            if (this.isEmpty()) {
                this.head = node;
            } else if (!this.tail) {
                this.tail = node;
                this.tail.prev = this.head;
                this.head.next = node;
            } else {
                var curr = this.tail;
                curr.next = node;
                node.prev = curr;
                this.tail = node;
            }
            this.length++;
            return node;
        };

        /**
         * Removes the element at the provided index. If the index is out of range this function returns null.
         * @public
         * @param {Number} idx the index of the node to remove
         * @returns {LinkedListNode|null}
         */
        this.remove = function(idx) {
            if (idx < 0 || idx > this.length) {
                return null;
            }
            var curr;
            if (this.length === 1) { // only one node in the list - just remove that instead
                curr = this.head;
                this.clear();
            } else {
                var prev = this.get(idx - 1);
                if (prev.next == this.tail) { // we're just shifting the tail back one position
                    curr = this.tail;
                    this.tail = prev;
                    this.tail.prev = curr.prev;
                    this.tail.next = null;
                } else { // otherwise we know it's a straight up deletion
                    curr = prev.next;
                    prev.next = prev.next.next;
                    if (prev.next) {
                        prev.next.prev = prev;
                    }
                }
                this.length--;
            }
            // clean up pointers
            if (curr) {
                curr.detach();
            }
            return curr;
        };

        /**
         * Removes the last entry from the list, shortening it by one
         * @public
         * @returns {DoublyLinkedListNode}
         */
        this.trim = function() {
            if (this.isEmpty()) {
                return null;
            }
            return this.remove(this.length - 1);
        };

        /**
         * Splits the list at the given index. The resulting list is returned.
         * @public
         * @param {Number} idx the index to split the list on
         * @returns {LinkedList}
         */
        this.split = function(idx) {
            var node;
            if (idx === undefined) {
                idx = Math.floor(this.length / 2);
                node = this.middle();
                if (!node) {
                    return null;
                }
            } else {
                if (idx < 1 || idx > this.length) {
                    return null;
                }
                node = this.get(idx - 1);
            }
            var list = new Scule.datastructures.classes.DoublyLinkedList();
            list.head = node.next;
            node.next = null;
            node.prev = null;
            list.tail = this.tail;
            this.tail = node;
            list.length = idx;
            this.length = this.length - idx;
            return list;
        };

        /**
         * Returns the element at the (approximate) middle of the list - should execute in O(n/2) time and O(1) space
         * @public
         * @returns {LinkedListNode|null}
         */
        this.middle = function() {
            if (!this.head) {
                return null;
            }
            var slow = this.head;
            var fast = this.head;
            while (fast.next && fast.next.next) {
                slow = slow.next;
                fast = fast.next.next;
            }
            return slow;
        };

        /**
         * Performs an in place merge sort on the list, optionally taking a comparison function as a parameter
         * @public
         * @param {Function} cmp the comparison function to use during the merge step
         * @param {Mixed} key the key to use when making comparisons (optional)
         * @returns {Null}
         */
        this.sort = function(cmp, key) {

            if (this.length < 2) { // empty or 1 element lists are already sorted
                return this;
            }

            if (!cmp) {
                cmp = Scule.global.functions.compare;
            }

            var middle = function(node) {
                if (!node) {
                    return node;
                }
                var slow = node;
                var fast = node;
                while (fast.next && fast.next.next) {
                    slow = slow.next;
                    fast = fast.next.next;
                }
                return slow;
            };

            var merge = function(left, right) {
                var head = {
                    next: null
                };
                var curr = head;
                var a;
                var b;
                while (left && right) {
                    if (key) {
                        a = right.element[key];
                        b = left.element[key];
                    } else {
                        a = right.element;
                        b = left.element;
                    }
                    if (cmp(a, b) > -1) {
                        curr.next = left;
                        curr.prev = right;
                        left = left.next;
                    } else {
                        curr.next = right;
                        curr.prev = left;
                        right = right.next;
                    }
                    curr = curr.next;
                }
                curr.next = (!left) ? right : left;
                return head.next;
            };

            var merge_sort = function(node) {
                if (!node || !node.next) {
                    return node;
                }    
                var m = middle(node);
                var s = m.next;
                m.next = null;
                s.prev = null;
                return merge(merge_sort(node), merge_sort(s));
            };

            this.head = merge_sort(this.head);

        };

        /**
         * Reverses the list in place
         * @public
         * @returns {Void}
         */
        this.reverse = function() {
            var curr = this.head;
            var temp = null;
            while (curr) {
                temp = curr.next;
                curr.next = curr.prev;
                curr.prev = temp;
                curr = temp;
            }
            temp = this.head;
            this.head = this.tail;
            this.tail = temp;
        };

        /**
         * Adds a node to the beginning of the list, lengthening it by one
         * @public
         * @param {Mixed} value the value to prepend to the list
         * @returns {DoublyLinkedListNode}
         */
        this.prepend = function(value) {
            var node = new Scule.datastructures.classes.DoublyLinkedListNode(null, null, value);
            if (this.isEmpty()) {
                this.head = node;
            } else {
                var curr = this.head;
                this.head = node;
                curr.prev = this.head;
                this.head.next = curr;
                if (!this.tail) {
                    this.tail = curr;
                }
            }
            this.length++;
            return node;
        };

        /**
         *  Empties the list
         *  @public
         *  @returns {Void}
         */
        this.clear = function() {
            this.head = null;
            this.tail = null;
            this.length = 0;
        };

        /**
         * Returns the contents of the list (values) as an array
         * @public
         * @returns {Array}
         */
        this.toArray = function() {
            var nodes = [];
            var curr  = this.head;
            while (curr) {
                nodes.push(curr.element);
                curr = curr.next;
            }
            return nodes;
        };    

        /**
         * Emulates the Array forEach prototype function
         * @public
         * @param {Function} callback the callback to execute at each step in the loop
         * @returns {Void}
         */
        this.forEach = function(callback) {
            var curr = this.head;
            while (curr) {
                callback(curr);
                curr = curr.next;
            }
            return true;
        };

    };

    /**
     * A proxy pattern implementation wrapping a linked list, this class provides an 
     * LRU cache for various access methods on the list - most notably search. It becomes an O(1)
     * operation rather than O(n) once the cache is warmed up as long as the entry remains in the cache.
     * See the LinkedList class for function documentation.
     * @public
     * @constructor
     * @class {CachingLinkedList}
     * @param {Number} threshold  the LRU cache threshold - maximum number of entries
     * @param {String} cacheKey the object key to cache on
     * @param {LinkedList|DoublyLinkedList} list (optional) the linked list to encapsulate
     * @returns {Void}
     */
    Scule.datastructures.classes.CachingLinkedList = function(threshold, cacheKey, list) {

        if (!cacheKey) {
            throw 'A valid cache key is required to use a CachingLinkedList';
        }

        if (!threshold) {
            threshold = 100;
        }

        /**
         * @private
         * @type {String}
         */
        this.cacheKey  = cacheKey;

        /**
         * @private
         * @type {Number}
         */
        this.threshold = threshold;

        /**
         * @private
         * @type LRUCache
         */
        this.cache = new Scule.datastructures.classes.LRUCache(threshold);

        if (!list) {
            list = new Scule.datastructures.classes.LinkedList();
        }

        /**
         * @private
         * @type {LinkedList|DoublyLinkedList}
         */
        this.list = list;

        /**
         *  Empties the list
         *  @public
         *  @returns {Void}
         */
        this.clear = function() {
            this.cache.clear();
            this.list.clear();
        };

        /**
         * Removes the element at the provided index. If the index is out of range this function returns null.
         * @public
         * @param {Number} idx the index of the node to remove
         * @returns {LinkedListNode|null}
         */
        this.remove = function(idx) {  
            var node = this.list.remove(idx);
            if (node) {
                this.cache.remove(node.element[this.cacheKey]);
            }
            return node;
        };

        /**
         * Returns the element at the (approximate) middle of the list - should execute in O(n/2) time and O(1) space
         * @public
         * @returns {LinkedListNode|null}
         */    
        this.middle = function() {
            return this.list.middle();
        };

        /**
         * Splits the list at the given index
         * @public
         * @returns {LinkedList}
         */    
        this.split = function() {
            this.cache.clear();
            return this.list.split();
        };

        /**
         * Adds an element to the end list
         * @public
         * @param {Mixed} value the value to add to the list
         * @returns {LinkedListNode|DoublyLinkedListNode}
         */    
        this.add = function(value) {
            var node = this.list.add(value);
            this.cache.put(node.element[this.cacheKey], node);
            return node;
        };

        /**
         * Performs a linear scan on the list to determine if an element exists. Optionally takes a key
         * that is used to introspect elements (e.g. 'bar', foo => {foo:'bar'}. Returns null if no results are found
         * @public
         * @param {Mixed} value the value to search for in the list
         * @returns {Mixed|null}
         */    
        this.search = function(value) {
            if (this.cache.contains(value)) {
                return this.cache.get(value); 
            }
            var node = this.list.search(value, this.cacheKey);
            if (node) {
                this.cache.put(node.element[this.cacheKey], node);
            }
            return node;
        };

        /**
         * Returns the number of elements in the list
         * @public
         * @returns {Number}
         */     
        this.getLength = function() {
            return this.list.getLength();
        };

        /**
         * Returns the tail elements from the list
         * @public
         * @returns {LinkedListNode|DoublyLinkedListNode}
         */    
        this.getTail = function() {
            return this.list.getTail();
        };

        /**
         * Returns the head elements from the list
         * @public
         * @returns {LinkedListNode|DoublyLinkedListNode}
         */    
        this.getHead = function() {
            return this.list.getHead();
        };

        /**
         * Returns a boolean value indicating whether or not the list is empty
         * @public
         * @returns {Boolean}
         */    
        this.isEmpty = function() {
            return this.list.isEmpty();  
        };

        /**
         * Returns the element residing at the specified index. Returns null if none exists or index is out of range.
         * @public
         * @param {Number} idx the index of the node to return
         * @returns {Mixed|null}
         */    
        this.get = function(idx) {
            return this.list.get(idx);  
        };

        /**
         * Performs a linear scan to determine if a given value exists in the list
         * @public
         * @param {Mixed} value the value to search for in the list
         * @returns {Boolean}
         */    
        this.contains = function(value) {
            return this.list.contains(value);
        };

        /**
         * Reverses the list
         * @public
         * @returns {Void}
         */
        this.reverse = function() {
            this.list.reverse();
        };

        /**
         * Performs an in place merge sort on the list, optionally taking a comparison function as a parameter
         * @public
         * @param {Function} cmp the comparison function to use during the merge step
         * @returns {Null}
         */    
        this.sort = function(cmp) {
            this.list.sort(cmp, this.cacheKey);  
        };

        /**
         * Returns the contents of the list (values) as an array
         * @public
         * @returns {Array}
         */
        this.toArray = function() {
            return this.list.toArray();
        };

        /**
         * Emulates the Array forEach prototype function
         * @public
         * @param {Function} callback the callback to execute at each step in the loop
         * @returns {Void}
         */
        this.forEach = function(callback) {
            return this.list.forEach(callback);
        };

    };

    /**
     * Represents a linked list node
     * @public
     * @constructor
     * @class {LinkedListNode}
     * @param {LinkedListNode} next the next node in the list
     * @param {Mixed} element the element value for the node
     * @returns {Void}
     */
    Scule.datastructures.classes.LinkedListNode = function(next, element) {

        /**
         * @private
         * @type {Null|LinkedListNode}
         */
        this.next    = next;

        /**
         * @private
         * @type {Null|LinkedListNode}
         */    
        this.element = element;

        /**
         * Returns the next element in the list - returns null if the list terminates at this node
         * @public
         * @returns {LinkedListNode|null}
         */
        this.getNext = function() {
            return this.next;
        };

        /**
         * Sets the next element in the list
         * @public
         * @param {LinkedListNode} next sets the right sibling for the node
         * @returns {Void}
         */
        this.setNext = function(next) {
            this.next = next;
        };

        /**
         * Returns the element value for the list node
         * @public
         * @returns {Mixed}
         */
        this.getElement = function() {
            return this.element;
        };

        /**
         * Sets the element value for the list node
         * @public
         * @param {Mixed} element sets the element value for the node
         * @returns {Void}
         */
        this.setElement = function(element) {
            this.element = element;
        };

    };

    /**
     * Represents a doubly linked list node
     * @public
     * @constructor
     * @class {DoublyLinkedListNode}
     * @param {DoublyLinkedListNode} next the next node in the list
     * @param {DoublyLinkedListNode} prev the previous node in the list
     * @param {Mixed} element the element value for the node
     * @extends {LinkedListNode}
     * @returns {Void}
     */
    Scule.datastructures.classes.DoublyLinkedListNode = function(prev, next, element) {

        Scule.datastructures.classes.LinkedListNode.call(this, next, element);

        /**
         * @private
         * @type {Null|DoublyLinkedListNode}
         */
        this.prev = prev;

        /**
         * Returns the previous element in the list - returns null if the list terminates at this node
         * @public
         * @returns {LinkedListNode|null}
         */
        this.getPrev = function() {
            return this.prev;
        };

        /**
         * Sets the previous element in the list
         * @public
         * @param {LinkedListNode} prev sets the left sibling for the node
         * @returns {Void}
         */
        this.setPrev = function(prev) {
            this.prev = prev;
        };

        /**
         * Nulls out the prev and next pointers on the node
         * @public
         * @returns {Void}
         */
        this.detach = function() {
            this.prev = null;
            this.next = null;
        };

    };

    /**
     * Represents a last recently used cache - elements are automatically trimmed as more recent entries are created or accessed.
     * Interally the class uses a doubly linked list as a priority queue to track LRU and trim elements
     * @public
     * @constructor
     * @class {LRUCache}
     * @param {Number} threshold the threshold for cache entry removal
     * @returns {Void}
     */
    Scule.datastructures.classes.LRUCache = function(threshold) {

        /**
         * @private
         * @type {Number}
         */
        this.threshold = threshold;

        /**
         * @private
         * @type {HashTable}
         */
        this.cache = new Scule.datastructures.classes.HashTable();

        /**
         * @private
         * @type {DoublyLinkedList}
         */
        this.queue = new Scule.datastructures.classes.DoublyLinkedList();

        /**
         * Returns a boolean value indicating whether or not a key exists within the cache
         * @public
         * @param {String} key the key to use when searching for a value in the cache
         * @returns {Boolean}
         */
        this.contains = function(key) {
            return this.cache.contains(key);
        };

        /**
         * Removes an entry from the cache, returns null if the entry doesn't exist
         * @public
         * @param {String} key the key to use when removing a value from the cache
         * @returns {Null|boolean}
         */
        this.remove = function(key) {
            if (!this.cache.contains(key)) {
                return null;
            }   
            var entry = this.cache.get(key);
            this.cache.remove(key);

            var prev = entry.node.prev;
            var next = entry.node.next;
            if (prev) {
                prev.next = next;
            }
            if (next) {
                next.prev = prev;
            }
            entry.node.detach();
            this.queue.length--;
            return true;
        };

        /**
         *  Returns an entry from the cache for the given key, returns null if no entry exists
         *  @public
         *  @param {Mixed} key the key to use when retrieving a value from the cache
         *  @returns {Mixed|null}
         */
        this.get = function(key) {
            if (!this.cache.contains(key)) {
                return null;
            }
            var entry = this.cache.get(key);
            entry.requeue(this.queue);
            return entry.value;
        };

        /**
         * Adds an entry to the cache. This function will over-write existing entries for the same key.
         * @public
         * @param {Mixed} key the key to use when storing a value in the cache
         * @param {Mixed} value the value to store
         * @returns {Boolean}
         */
        this.put = function(key, value) {
            var entry;
            if (this.cache.contains(key)) {
                // if the entry exists in the cache update it and move it to the head of the priority queue
                entry = this.cache.get(key);
                entry.value = value;
                entry.node.element = {
                    key:key, 
                    value:value
                };
                entry.requeue(this.queue);
            } else { 
                // otherwise we add it to the head of the queue
                entry = new Scule.datastructures.classes.LRUCacheEntry(key, value, this.queue.prepend({
                    key:key, 
                    value:value
                }));
                this.cache.put(key, entry);
            }
            // trim stale cache entries if we've reached our threshold
            if (this.queue.length > this.threshold) {
                var o = this.queue.trim();
                if (!this.cache.remove(o.getElement().key)) {
                    throw 'LRU cache is corrupt';
                }
                o = null;
            }
            return true;
        };

        /**
         * Returns the number of elements in the cache
         * @public
         * @returns {Number}
         */
        this.getLength = function() {
            return this.cache.getLength();
        };

        /**
         * Clears the LRU cache
         * @public
         * @returns {Void}
         */
        this.clear = function() {
            this.cache.clear();
            this.queue.clear();
        };

    };

    /**
     * Represents an entry in a LRU cache - contains some helper functions to perform re-queue operations
     * @public
     * @constructor
     * @class {LRUCacheEntry}
     * @param {String} key the key for the cache entry
     * @param {Mixed} value the value for the cache entry
     * @param {DoublyLinkedListNode} node the linked list node for the cache entry - forms part of the priority queue
     * @returns {Void}
     */
    Scule.datastructures.classes.LRUCacheEntry = function(key, value, node) {

        /**
         * @private
         * @type {String}
         */
        this.key   = key;

        /**
         * @private
         * @type {Mixed}
         */
        this.value = value;

        /**
         * @private
         * @type {DoublyLinkedListNode}
         */
        this.node  = node;

        /**
         * Returns the key for the cache entry
         * @public
         * @returns {String}
         */
        this.getKey = function() {
            return this.key;  
        };

        /**
         * Returns the value for the cache entry
         * @public
         * @returns {Mixed}
         */
        this.getValue = function() {
            return this.value;
        };

        /**
         * Return the linked list node for the entry
         * @public
         * @returns {LinkedListNode}
         */
        this.getNode = function() {
            return this.node;
        };

        /**
         * Re-queues the node for the list entry (moving it to the head of the priority queue)
         * @public
         * @param {DoublyLinkedList} queue the node to re-queue
         * @returns {Void}
         */
        this.requeue = function(queue) {
            if (!this.node.prev) { // already at the head of the queue
                return;
            }
            // no some magic pointer switching
            var prev = this.node.prev;
            var next = this.node.next;
            prev.next = next;
            if (next) {
                next.prev = prev;
            }
            // clean up the pointers for the current node
            this.node.detach();
            queue.length--;
            // requeue the cache entry
            this.node = queue.prepend({
                key:this.key, 
                value:this.value
            });
        };

    };

    /**
     * Represents a LIFO stack
     * @public
     * @constructor
     * @class {LIFOStack}
     * @extends {LinkedList}
     * @returns {Void}
     */
    Scule.datastructures.classes.LIFOStack = function() {

        Scule.datastructures.classes.LinkedList.call(this);

        /**
         * Pushes a new node to the head of the stack
         * @public
         * @param {Mixed} value the element value for the new node
         * @returns {Void}
         */
        this.push = function(value) {
            var curr = this.head;
            this.head = new Scule.datastructures.classes.LinkedListNode(curr, value);
            this.length++;
        };

        /**
         * Pops the head element value off the stack, returns null if the stack is empty
         * @public
         * @returns {Mixed|null}
         */
        this.pop = function() {
            if (this.isEmpty()) {
                return null;
            }        
            var curr = this.head;
            this.head = curr.next;
            this.length--;
            curr.next = null;
            return curr.getElement();
        };

        /**
         * Returns the head element value without mutating the stack, returns null of the stack is empty
         * @public
         * @returns {Mixed|null}
         */
        this.peek = function() {
            if (this.isEmpty()) {
                return null;
            }
            return this.head.getElement();   
        };

    };

    /**
     * Represents a FIFO stack
     * @public
     * @constructor
     * @class {FIFOStack}
     * @extends {LIFOStack}
     * @returns {Void}
     */
    Scule.datastructures.classes.FIFOStack = function() {

        Scule.datastructures.classes.LIFOStack.call(this);

        /**
         * Appends a new LinkedListNode to the tail of the stack
         * @public
         * @param {Value} mixed the element value to append to the stack
         * @returns {Void}
         */
        this.push = this.add;

        /**
         * Pops the head element value off the stack, returns null if the stack is empty
         * @public
         * @returns {Mixed|null}
         */
        this.pop = function() {
            if (this.isEmpty()) {
                return null;
            }
            var curr = this.head;
            this.head = curr.next;
            this.length--;
            return curr.getElement();    
        };

    };

    /**
     * Represents a queue
     * @public
     * @constructor
     * @class {Queue}
     * @extends {LIFOStack}
     * @returns {Void}
     */
    Scule.datastructures.classes.Queue = function() {

        Scule.datastructures.classes.FIFOStack.call(this);

        /**
         * Appends a new LinkedListNode to the tail of the queue
         * @public
         * @param {Value} mixed the element value to append to the queue
         * @returns {Void}
         */
        this.enqueue = this.push;

        /**
         * Pops the head element value off the queue, returns null if the queue is empty
         * @public
         * @returns {Mixed|null}
         */    
        this.dequeue = this.pop;

    };

    /**
     * A simple Hash Table implementation in JavaScript - internally uses the joaat hashing algorithm.
     * The data structure resizes itself geometrically (size = size * 2) once the load factor surpases 0.7.
     * Bucketing is handled using open addressing and self balancing binary search trees, so search time 
     * should be O(n) + O(log n).
     * 
     * It's kind of slow. Stick with using the HashTable class.
     * 
     * @public
     * @constructor
     * @class HashMap
     * @param {Number} size the initial size of the hash table
     * @returns {Void}
     */
    Scule.datastructures.classes.HashMap = function(size) {

        /**
         * @private
         * @type {Number}
         */
        this.size    = size;

        /**
         * @private
         * @type {Number}
         */
        this.buckets = 0;

        /**
         * @private
         * @type {Number}
         */    
        this.length  = 0;

        /**
         * @private
         * @type {Array}
         */    
        this.table   = [];

        /**
         * Hashes the provided string key to an integer value in the table range (djb2)
         * @private
         * @param {String} key the key to hash
         * @returns {Number}
         */
        this.djb2_hash = function(key) {
            var hash = 5381;
            var len  = key.length;
            var i    = 0;
            for (; i < len; i++) {
                hash = ((hash << 5) + hash) + key.charCodeAt(i);
            }
            if (hash < 0) {
                hash = hash * -1;
            }
            return hash%this.size;            
        };

        /**
         * Hashes the provided string key to an integer value in the table range (jooat)
         * @private
         * @param {String} key the key to hash
         * @returns {Number}
         */
        this.joaat_hash = function(key) {
            var hash = 0;
            var len  = key.length;
            var i    = 0;
            for (; i < len; i++)
            {
                hash += key.charCodeAt(i);
                hash += (hash << 10);
                hash ^= (hash >> 6);
            }
            hash += (hash << 3);
            hash ^= (hash >> 11);
            hash += (hash << 15);
            if (hash < 0) {
                hash = hash * -1;
            }
            return hash%this.size;        
        };

        this.hash = this.joaat_hash;

        /**
         * Rebuilds the table
         * @private
         * @returns {Void}
         */
        this.retable = function() {
            var factor = this.length/this.size;
            if (this.length >= this.buckets && factor < 0.7) {
                return;
            }
            var elements = this.toArray();
            this.clear();
            this.size = this.size * 2;
            for (var i=0; i < elements.length; i++) {
                this.put(elements[i][0], elements[i][1]);
            }
        };

        /**
         * Returns the bucket corresponding to the provided key, if no bucket exists
         * one is created and placed in the table
         * @private
         * @param {Number} key the key to return the bucket for
         * @returns {BinarySearchTree}
         */
        this.bucket = function(key) {
            if (!this.table[key]) {
                this.buckets++;
                this.table[key] = new Scule.datastructures.classes.BinarySearchTree();
            }
            return this.table[key];
        };

        /**
         * Adds a key/value pair to the table
         * @public
         * @param {String} key
         * @param {Mixed} value
         * @returns {Boolean}
         */
        this.put = function(key, value) {
            var k = this.hash(key);
            var b = this.bucket(k);
            var r = b.insert(key, value);
            if (r) {
                this.length++;
                if (b.getLength()%10 === 0) {
                    b.balance();
                }            
            }
            this.retable();
            return r;
        };

        /**
         * Returns a boolean value indicating whether or not the key exists in the table
         * @public
         * @param {String} key
         * @returns {Boolean}
         */
        this.contains = function(key) {
            var k = this.hash(key);
            var b = this.bucket(k);
            return (b.search(key) !== null);        
        };

        /**
         * Returns the value corresponding to the provided key, returns null if the 
         * key does not exist in the table
         * @public
         * @param {String} key
         * @returns {Mixed}
         */
        this.get = function(key) {
            var k = this.hash(key);
            var b = this.bucket(k);
            var v = b.search(key);
            if (v === null) {
                return null;
            }   
            return v.getData();
        };

        /**
         * Returns the value corresponding to the provided key, returns null if the 
         * key does not exist in the table
         * @public
         * @param {String} key
         * @returns {Mixed}
         */
        this.search = function(key) {
            return this.get(key);
        };

        /**
         * Removes a key/value pair from the table
         * @public
         * @returns {Boolean}
         */
        this.remove = function(key) {
            var k = this.hash(key);
            var b = this.bucket(k);
            if (b.remove(key)) {
                this.length--;
                this.retable();
                return true;
            } else {
                return false;
            }
        };

        /**
         * Empties the table
         * @public
         * @returns {Void}
         */
        this.clear = function() {
            this.table   = [];
            this.length  = 0;
            this.buckets = 0;
        };

        /**
         * Returns the length of the table as an integer
         * @public
         * @returns {Number}
         */
        this.getLength = function() {
            return this.length;
        };

        /**
         * Returns an {Array} containing all keys in the table
         * @public
         * @returns {Array}
         */
        this.getKeys = function() {
            var keys = [];
            var getKeys = function(node) {
                if (node === null) {
                    return;
                }
                keys.push(node.getKey());
                getKeys(node.getLeft());
                getKeys(node.getRight());
            };
            this.table.forEach(function(bucket) {
                if (!bucket) {
                    return;
                }
                getKeys(bucket.getRoot());
            });
            return keys;
        };

        /**
         * Returns an {Array} containing all values in the table
         * @public
         * @returns {Array}
         */
        this.getValues = function() {
            var values = [];
            var getValues = function(node) {
                if (node === null) {
                    return;
                }
                values.push(node.getData());
                getValues(node.getLeft());
                getValues(node.getRight());
            };
            this.table.forEach(function(bucket) {
                if (!bucket) {
                    return;
                }
                getValues(bucket.getRoot());
            });
            return values;        
        };

        /**
         * Returns all key/value pairs in the table as an {Array}
         * @public
         * @returns {Array}
         */
        this.toArray = function() {
            var array = [];
            this.table.forEach(function(bucket) {
                if (!bucket) {
                    return;
                }
                array = array.concat(bucket.toArray());
            });
            return array;
        };

    };

    /**
     * Represents a Hash Table - really just a thin wrapper around a JavaScript associative array.
     * It depends on the implementation but I believe most JS engines use b-trees under the hood for this.
     * @public
     * @constructor
     * @class {HashTable}
     * @returns {Void}
     */
    Scule.datastructures.classes.HashTable = function() {

        /**
         * @private
         * @type {Object}
         */
        this.table  = {};

        /**
         * @private
         * @type {Number}
         */
        this.length = 0;

        /**
         * Adds a key, value pair to the table
         * @public
         * @param {Mixed} key the key to use when storing the value in the table
         * @param {Mixed} value the value to store
         * @returns {Void}
         */
        this.put = function(key, value) {
            if (!this.contains(key)) {
                this.length++;
            }
            this.table[key] = value;
        };

        /**
         * Returns the value for a given key, returns null if no matching key exists
         * @public
         * @param {Mixed} key the key to use when searching the table
         * @returns {Mixed|null}
         */
        this.get = function(key) {
            if (this.contains(key)) {
                return this.table[key];
            }
            return null;
        };

        /**
         * Alias for the get function
         * @public
         * @see {HashTable.get}
         * @param {Mixed} key the key to use when searching the table
         * @returns {Mixed|null}
         */
        this.search = function(key) {
            return this.get(key);
        };

        /**
         * Removes a key, value mapping from the table, returns a boolean signfiying success or failure
         * @public
         * @param {Mixed} key the key to use when removing a value from the table
         * @returns {Boolean}
         */
        this.remove = function(key) {
            if (this.contains(key)) {
                delete this.table[key];
                this.length--;
                return true;
            }
            return false;
        };

        /**
         * Returns a boolean value indicating whether or not the given key exists in the table
         * @public
         * @param {Mixed} key the key to test with
         * @returns {Boolean}
         */
        this.contains = function(key) {
            return key in this.table;
        };

        /**
         * Empties the table
         * @public
         * @returns {Void}
         */
        this.clear = function() {
            this.table = {};
            this.length = 0;
        };

        /**
         * Returns the number of elements in the table as an integer
         * @public
         * @returns {Number}
         */
        this.getLength = function() {
            return this.length;
        };

        /**
         * Returns an array containing all keys in the table
         * @public
         * @returns {Array}
         */
        this.getKeys = function() {
            var keys = [];
            for (var ky in this.table) {
                if(this.table.hasOwnProperty(ky)) {
                    keys.push(ky);
                }
            }
            return keys;
        };

        /**
         * Returns an array containing all values in the table
         * @public
         * @returns {Array}
         */
        this.getValues = function() {
            var values = [];
            for (var ky in this.table) {
                if(this.table.hasOwnProperty(ky)) {
                    values.push(this.table[ky]);
                }
            }
            return values;
        };

        /**
         * Returns the contents of the HashTable as an associative array
         * @returns {Array}
         */
        this.toArray = function() {
            var a = [];
            for (var ky in this.table) {
                if(this.table.hasOwnProperty(ky)) {
                    a[ky] = this.table[ky];
                }
            }        
            return a;
        };

    };

    /**
     * Represents the base class for a B+Tree node
     * @public
     * @constructor
     * @class {BPlusTreeNode}
     * @returns {Void}
     */
    Scule.datastructures.classes.BPlusTreeNode = function() {

        /**
         * @private
         * @type {Boolean}
         */
        this.leaf      = false;

        /**
         * @private
         * @type {Number}
         */
        this.order     = 100;

        /**
         * @private
         * @type {Number}
         */   
        this.threshold = 40;

        /**
         * @private
         * @type {Array}
         */    
        this.data      = [];

        /**
         * Returns the order (block size) for the node
         * @public
         * @returns {Number}
         */
        this.getOrder = function() {
            return this.order;
        };

        /**
         * Sets the order (block size) for the node
         * @public
         * @param {Number} order the order for the node
         * @returns {Void}
         */
        this.setOrder = function(order) {
            this.order = order;
        };

        /**
         * Returns the merge threshold for the node
         * @public
         * @returns {Number}
         */  
        this.getMergeThreshold = function() {
            return this.threshold;
        };

        /**
         * Sets the merge threshold for the node
         * @public
         * @param {Number} threshold the merge threshold for the node
         * @returns {Void}
         */  
        this.setMergeThreshold = function(threshold) {
            this.threshold = threshold;
        };

        /**
         * Returns a boolean value indicating whether or not the node is a leaf node
         * @returns {Boolean}
         */
        this.isLeaf = function() {
            return this.leaf;
        };

    };

    /**
     * Represents a leaf node in the B+Tree
     * @public
     * @constructor
     * @class {BPlusTreeLeafNode}
     * @extends {BPlusTreeNode}
     * @param {Null|BPlusTreeNode} left the left sibling for the node
     * @param {Null|BPlusTreeNode} right the right sibling for the node
     * @returns {Void}
     */
    Scule.datastructures.classes.BPlusTreeLeafNode = function(left, right) {

        Scule.datastructures.classes.BPlusTreeNode.call(this);

        /**
         * @private
         * @type {Boolean}
         */
        this.leaf  = true;

        /**
         * @private
         * @type {Null|BPlusTreeLeadNode}
         */
        this.left  = left;

        /**
         * @private
         * @type {Null|BPlusTreeLeadNode}
         */    
        this.right = right;

        /**
         * Returns the right sibling for the node
         * @public
         * @returns {Null|BPlusTreeLeafNode}
         */
        this.getRight = function() {
            return this.right;
        };

        /**
         * Sets the right sibling for the node
         * @public
         * @param {BPlusTreeLeafNode} right the right sibling for the node
         * @returns {Void}
         */
        this.setRight = function(right) {
            this.right = right;
        };

        /**
         * Returns the left sibling for the node
         * @public
         * @returns {Null|BPlusTreeLeafNode}
         */
        this.getLeft = function() {
            return this.left;
        };

        /**
         * Sets the left sibling for the node
         * @public
         * @param {BPlusTreeLeafNode} left the left sibling for the node
         * @returns {Void}
         */
        this.setLeft = function(left) {
            this.left = left;
        };

        /**
         * Use for lookups to avoid a sequential search
         * @private
         * @type {LRUCache}
         */
        this.lookup = new Scule.datastructures.classes.LRUCache(Math.floor(this.threshold / 2));    

        /**
         * Searches for a key in the node data
         * @public
         * @param {Mixed} key
         * @returns {Null|mixed}
         */
        this.search = function(key) {
            var element = this.lookup.get(key);
            if (!element) {
                element = this.sequentialSearch(key);
                if (element) {
                    this.lookup.put(element.key, element);
                } else {
                    return null;
                }
            }
            return element.value;
        };    

        /**
         * Performs a sequential search on the node's data to locate the the node matching the provided key
         * @public
         * @param {Mixed} key the key to search for
         * @returns {Object|null}
         */
        this.sequentialSearch = function(key) {
            var index = this.indexSearch(key);
            var element = this.data[index];
            if (index < this.data.length && element.key == key) {
                return element;
            }
            return null;
        };

        /**
         * Performs a binary search on the data for the node
         * @private
         * @param {Mixed} key the key to search for
         * @returns {The} integer integer index of the data in the array, if not found returns the array length
         */
        this.indexSearch = function(key) {
            var data   = this.data;
            if (data.length === 0) {
                return 0;
            }
            var left   = 0;
            var right  = this.data.length - 1;
            var middle = left + Math.floor((right - left) / 2);
            var found  = false;    
            do {
                middle = left + Math.floor((right - left) / 2);
                if (data[middle].key < key) {
                    left = middle + 1;
                } else if (data[middle].key > key) {
                    right = middle;
                } else {
                    found = true;
                }
            } while (left < right && !found);
            if (found) {
                return middle;
            } else {
                return right;
            }
        };

        /**
         * Identifies the siblings for the current node - i.e. adjacent nodes with the same parent
         * @private
         * @param {BPlusTreeInteriorNode} parent the parent node to use when identifying siblings
         * @returns {Mixed}
         */
        this.identifySiblings = function(parent) {
            var siblings = {
                index:null,
                left:null,
                key:null,
                right:null
            };
            var right = this.getRight();
            var left  = this.getLeft();
            var i=0;
            for (; i < parent.data.length; i = i+2) {
                var node = parent.data[i];
                if (node == right) {
                    siblings.right = right;
                    siblings.index = i-2;
                    siblings.right_key = parent.data[i-1];
                    siblings.right_key_index = i-1;
                }
                if (node == left) {
                    siblings.left = left;
                    siblings.index = i+2;
                    siblings.left_key = parent.data[i+1];
                    siblings.left_key_index = i+1;
                }
            }
            if (siblings.index === null) {
                siblings.index = (i >= 2) ? i-2 : 0;
            }
            return siblings;
        };

        /**
         * Returns the keys for this node as an array
         * @public
         * @returns {Array}
         */
        this.getKeys = function() {
            var keys = [];
            this.data.forEach(function(element) {
                keys.push(element.key);
            });
            return keys;
        };    

        /**
         * Inserts a key/value pair into the data for the node
         * @public
         * @param {Mixed} key the key to insert
         * @param {Mixed} value the value to insert
         * @returns {Null|object}
         */
        this.insert = function(key, value) {
            var index = this.indexSearch(key);
            if (index == this.data.length) {
                this.data.push({
                    key:key, 
                    value:value
                });
            } else {
                var element = this.data[index];
                if (element.key == key) {
                    element.value = value;
                } else if (element.key < key) {
                    this.data.splice(index + 1, 0, {
                        key:key, 
                        value:value
                    });
                } else {
                    this.data.splice(index, 0, {
                        key:key, 
                        value:value
                    });
                }
            }
            this.lookup.put(key, {
                key:key, 
                value:value
            });
            return this.split();
        };


        /**
         * Removes a key from the node data
         * @public
         * @param {Mixed} key the key to remove
         * @param {BPlusTreeNode} parent the parent node
         * @returns {Null|object}
         */
        this.remove = function(key, parent) {
            var index   = this.indexSearch(key);
            var element = this.data[index];        
            if (index < this.data.length && element.key == key) {
                this.data.splice(index, 1);
                this.lookup.remove(key);
                if (!parent) {
                    return null;
                }
                return this.redistribute(key, parent);
            } else {
                return null;
            } 
        };

        /**
         * Attempts to redistribute values between siblings of the node - first checking left then right.
         * If redistribute fails, the node merges with the selected sibling
         * @public
         * @param {Mixed} oldkey the key for the node prior to redistribution
         * @param {BPlusTreeInteriorNode} parent the parent for the node
         * @returns {Object}
         */
        this.redistribute = function(oldkey, parent) {
            if (this.data.length > this.threshold) {
                return {
                    operation:2,
                    oldkey:oldkey,
                    key:this.data[0].key
                };
            }
            var siblings = this.identifySiblings(parent);
            var deficit = this.threshold - this.data.length;
            var sibling, key;
            var left = false; 
            if (siblings.left) {
                sibling = siblings.left;
                key = siblings.left_key;
                left = true;
                if (sibling.data.length - deficit >= this.threshold) {
                    this.data = sibling.data.splice(deficit * -1, deficit).concat(this.data);
                    this.lookup.clear();
                    return {
                        key:this.data[0].key, 
                        oldkey:siblings.left_key,
                        index:siblings.left_key_index,
                        operation:0
                    };
                }          
            }        
            if (siblings.right) {
                sibling = siblings.right;
                key = siblings.right_key;
                left = false;
                if (sibling.data.length - deficit >= this.threshold) {           
                    this.data = this.data.concat(sibling.data.splice(0, deficit));
                    this.lookup.clear();
                    return {
                        key:sibling.data[0].key,  
                        oldkey:siblings.right_key,
                        index:siblings.right_key_index,
                        operation:0
                    };
                }  
            }
            return this.merge(sibling, siblings.index, key, left);
        };

        /**
         * Performs a merge with the selected sibling
         * @public
         * @param {BPlusTreeLeafNode} sibling the sibling to merge with
         * @param {Number} index
         * @param {String} oldkey
         * @param {Boolean} isLeft
         * @returns {Mixed}
         */
        this.merge = function(sibling, index, oldkey, isleft)  {
            if (this.data.length > this.threshold) {
                return null;
            }  
            if (!sibling) { // PANIC! this condition should never be met
                throw 'Unable to merge - no siblings';
            }        
            if (isleft) {
                sibling.data = sibling.data.concat(this.data.splice(0, this.data.length));
                sibling.setRight(this.getRight());
                if (sibling.getRight()) {
                    sibling.getRight().setLeft(sibling);
                }
                sibling.lookup.clear();
                this.setLeft(null);
                this.setRight(null);
                return {
                    left: true,
                    index: index,
                    node: sibling, 
                    key: sibling.data[0].key,
                    oldkey: oldkey,
                    operation: 1
                };            
            } else {            
                var d = this.data.splice(0, this.data.length);
                sibling.data = d.concat(sibling.data.splice(0, sibling.data.length));
                sibling.setLeft(this.getLeft());
                if (sibling.getLeft()) {
                    sibling.getLeft().setRight(sibling);
                }
                sibling.lookup.clear();
                this.setLeft(null);
                this.setRight(null);            
                return {
                    left: false,
                    index: index,
                    key: sibling.data[0].key,
                    node: sibling,
                    oldkey: oldkey,
                    operation: 1
                };            
            }
        };    

        /**
         * Returns a range of values from the node (and siblints) between min and max
         * @public
         * @param {Mixed} min
         * @param {Mixed} max
         * @param {Boolean} includeMin
         * @param {Boolean} includeMax
         * @returns {Array}
         */
        this.range = function(min, max, includeMin, includeMax) {
            if (includeMax === undefined) {
                includeMax = false;
            }
            if (includeMin === undefined) {
                includeMin = false;
            }
            if (min === undefined) {
                min = null;
            }
            if (max === undefined) {
                max = null;
            }            
            var curr  = this;
            var rng   = null;
            if (includeMin && includeMax) {
                rng = function(min, max, key, range, value) {
                    if (min === null) {
                        if (key <= max) {
                            range = range.concat(value);
                        }
                    } else if (max === null) {
                        if (key >= min) {
                            range = range.concat(value);
                        }
                    } else {
                        if (key >= min && key <= max) {
                            range = range.concat(value);
                        }
                    }
                    return range;
                };
            } else if (includeMin) {
                rng = function(min, max, key, range, value) {
                    if (min === null) {
                        if (key < max) {
                            range = range.concat(value);
                        }
                    } else if (max === null) {
                        if (key >= min) {
                            range = range.concat(value);
                        }
                    } else {
                        if (key >= min && key < max) {
                            range = range.concat(value);
                        }
                    }
                    return range;
                };
            } else { // includeMax
                rng = function(min, max, key, range, value) {
                    if (min === null) {
                        if (key <= max) {
                            range = range.concat(value);
                        }
                    } else if (max === null) {
                        if (key > min) {
                            range = range.concat(value);
                        }
                    } else {
                        if (key > min && key <= max) {
                            range = range.concat(value);
                        }
                    }
                    return range;
                };            
            }
            var range = [];
                outer:
                while (curr) {
                    var data  = curr.data;
                    var left  = curr.indexSearch(min);
                    var right = (max === null || max === undefined) ? (data.length - 1) : curr.indexSearch(max);
                    if (right >= data.length) {
                        right = data.length - 1;
                    }
                    if (left <= data.length) {
                        for (var i=left; i <= right; i++) {
                            if (max !== null && data[i].key > max) {
                                break outer;
                            }
                            range = rng(min, max, data[i].key, range, data[i].value);
                        }
                    }
                    curr = curr.getRight();
                }
            return range;
        };    

        /**
         * If the node data length has exceeded the block size this function will divide it into two new nodes
         * connected by a junction and identified by a key
         * @public
         * @returns {Null|object}
         */
        this.split = function() {
            if (this.data.length <= this.order) {
                return null;
            }
            var middle = Math.floor(this.data.length / 2);

            var left = new Scule.datastructures.classes.BPlusTreeLeafNode(this.getLeft());
            left.setOrder(this.getOrder());
            left.setMergeThreshold(this.getMergeThreshold());
            left.data = this.data.splice(0, middle);

            var right = new Scule.datastructures.classes.BPlusTreeLeafNode(null, this.getRight());
            right.setOrder(this.getOrder());
            right.setMergeThreshold(this.getMergeThreshold());
            right.data = this.data.splice(0, middle + 1);

            left.setRight(right);
            if (this.getLeft()) {
                this.getLeft().setRight(left);
            }

            right.setLeft(left);
            if (this.getRight()) {
                this.getRight().setLeft(right);
            }

            return {
                left:left, 
                key:right.data[0].key, 
                right:right
            };
        };

        /**
         * Returns a string representation of the node object
         * @public
         * @returns {String}
         */
        this.toString = function() {
            return JSON.stringify(this.toArray(), null, "\t");
        };    

        /**
         * Returns an array based representation of the node object
         * @public
         * @returns {Array}
         */
        this.toArray = function() {
            var o = {
                type:'leaf'
            };
            for (var i=0; i < this.data.length; i++) {
                o[i + ':' + this.data[i].key] = this.data[i];
            }
            return o;
        };

    };

    /**
     * Represents a B+tree interior node
     * @public
     * @constructor
     * @extends {BPlusTreeNode}
     * @returns {Void}
     */
    Scule.datastructures.classes.BPlusTreeInteriorNode = function() {

        Scule.datastructures.classes.BPlusTreeNode.call(this);

        /**
         * Returns the index of the nearest node for a given key
         * @private
         * @param {Mixed} key the key to search for
         * @returns {Number}
         */
        this.nodeSearch = function(key) {
            var len = this.data.length;
            for (var i=1; i < len; i = i + 2) {
                var ky = this.data[i];
                if (ky == key) {
                    return i + 1;
                } else if (ky >= key) {
                    return i - 1;
                }
            }
            return len - 1;
        };

        /**
         * Returns the index of the given key - this function does left/right switching based on key value
         * @private
         * @param {Mixed} key the key to search for
         * @returns {Number}
         */
        this.indexSearch = function(key) {
            var len = this.data.length;
            for (var i=1; i < len; i = i + 2) {
                var ky = this.data[i];
                if (ky == key) {
                    return i;
                } else if (ky >= key) {
                    return i;
                }
            }
            return len - 2;
        };

        /**
         * Searches for a child node
         * @private
         * @param {Mixed} key the key to search for
         * @returns {BPlusTreeNode}
         */
        this.childSearch = function(key) {
            if (this.data.length === 0) {
                return null;
            }
            return this.data[this.nodeSearch(key)];
        };

        /**
         * Searches the tree for a key, returns the value if it exists - otherwise returns null
         * @public
         * @param {Mixed} key the key to search for
         * @returns {Null|Mixed}
         */
        this.search = function(key) {
            return this.childSearch(key).search(key);
        };

        /**
          * Returns a range of values from the tree, bounding values inclusive
          * @public
          * @param {Mixed} min the lower bound of the range
          * @param {Mixed} max the upper bound of the range
          * @param {Boolean} includeMin
          * @param {Boolean} includeMax
          * @returns {Array}
          */
        this.range = function(min, max, includeMin, includeMax) {
            return this.childSearch(min).range(min, max, includeMin, includeMax);
        };

        /**
         * Inserts a key/value pair into the data for the node
         * @public
         * @param {Mixed} key the key to insert
         * @param {Mixed} value the value to insert
         * @returns {Null|Object}
         */    
        this.insert = function(key, value) {
            var index = this.indexSearch(key);
            if (this.data[index] > key) {
                index--;
            } else {
                index++;
            }
            var node  = this.data[index];
            var split = node.insert(key, value);
            if (split) {
                this.data.splice(index, 1, split.left, split.key, split.right);
            }
            return this.split();
        };

        /**
         * If the node data length has exceeded the block size this function will divide it into two new nodes
         * connected by a junction and identified by a key
         * @public
         * @returns {Null|object}
         */    
        this.split = function() {
            var len = Math.floor((this.data.length - 1) / 2);
            if (len < this.order) {
                return null;
            }

            var middle = Math.floor((this.data.length - 1) / 2);

            var left = new Scule.datastructures.classes.BPlusTreeInteriorNode(this.left, null);
            left.setOrder(this.order);
            left.setMergeThreshold(this.threshold);
            left.data = this.data.splice(0, middle);

            var right = new Scule.datastructures.classes.BPlusTreeInteriorNode(null, this.right);
            right.setOrder(this.order);
            right.setMergeThreshold(this.threshold);
            right.data = this.data.splice(1, middle);

            return {
                left:left, 
                key:this.data[0], 
                right:right
            };
        };

        /**
         * Removes a key from the node data
         * @public
         * @param {Mixed} key the key to remove
         * @param {BPlusTreeInteriorNode} parent the parent for the node
         * @returns {Null|object}
         */    
        this.remove = function(key, parent) {
            var index = this.indexSearch(key);
            var eindex = index;

            if (this.data[index] > key) {
                eindex = index - 1;
            } else {
                eindex = index + 1;
            }

            var node  = this.data[eindex];        
            var result = node.remove(key, this);
            if (!result) {
                return null;
            }
            switch(result.operation) {
                case 0: // redistribution
                    break;

                case 1: // merge
                    if (this.data.length == 3) {
                        return result.node;
                    }
                    var collapseIndex = result.index;
                    if (result.left) {
                        collapseIndex = result.index - 2;
                    }
                    this.data.splice(collapseIndex, 3, result.node);
                    break;

                case 2: // bubbling a new key up the tree to replace the removed one
                    var replaced = false;
                    for (var i=1; i < this.data.length; i=i+2) {
                        if (this.data[i] == result.oldkey) {
                            this.data[i] = result.key;
                            replaced = true;
                        }
                    }
                    if (!replaced) {
                        if (!parent) {
                            return null;
                        }
                        return result;
                    }
                    break;
            }
            this.reassignKeys();
            return this.merge(parent, result.key, key);
        };

        /**
         * Re-assigns the keys within the data array for the node to ensure correct ordering
         * @public
         * @returns {Void}
         */
        this.reassignKeys = function() {
            for (var i=2; i < this.data.length; i=i+2) {
                if (this.data[i].isLeaf()) {
                    this.data[i-1] = this.data[i].data[0].key;
                }
            }
        };

        /**
         * Forces the node to merge with one of the adjacent sibling nodes in the tree.
         * This function will destroy both nodes after the merge.
         * @public
         * @param {BPlusTreeInteriorNode} parent the node parent
         * @param {Mixed} key
         * @param {Mixed} oldkey
         * @returns {Mixed}
         */
        this.merge = function(parent, key, oldkey) {
            if (!parent) {
                return null;
            }
            var len = Math.floor((this.data.length - 1) / 2);
            if (len >= (this.threshold - 1)) {
                return {
                    key: key,
                    oldkey: oldkey,
                    operation: 2
                };
            }        
            var index, pkey, sibling;
            var left = false;
            var i = 0;
            for (; i < parent.data.length; i = i+2) {
                if (parent.data[i] == this) {
                    if (i === 0 || i < parent.data.length - 1) {
                        sibling = parent.data[i+2];
                        index = i+1;
                    } else {
                        left = true;
                        sibling = parent.data[i-2];
                        index = i-1;
                    }
                    break;
                }
            }
            pkey = parent.data[index];

            var node = new Scule.datastructures.classes.BPlusTreeInteriorNode();
            node.setOrder(this.getOrder());
            node.setMergeThreshold(this.getMergeThreshold());

            if (left) {
                node.data = sibling.data.splice(0, sibling.data.length);
                node.data = node.data.concat(pkey);
                node.data = node.data.concat(this.data.splice(0, this.data.length));
            }
            else {
                node.data = this.data.splice(0, this.data.length);
                node.data = node.data.concat(pkey);
                node.data = node.data.concat(sibling.data.splice(0, sibling.data.length));
            }

            return {
                left: left,
                node: node,
                index: i,
                oldkey: pkey,
                operation: 1
            };

        };

        /**
         * Returns a string representation of the node
         * @public
         * @returns {String}
         */
        this.toString = function() {
            return JSON.stringify(this.toArray(), null, "\t");
        };

        /**
         * Returns an array representation of the node
         * @public
         * @returns {Array}
         */
        this.toArray = function() {  
            var o = {
                type:'interior'
            };
            var i=0;
            var j=1;
            while (j < this.data.length) {
                o[j + ':' + this.data[j]] = {
                    left: this.data[i].toArray(),
                    right: this.data[i+2].toArray()
                };
                i=i+2;
                j=j+2;
            }
            return o;
        };

    };

    /**
     * An implementation of a B+tree
     * @public
     * @constructor
     * @param {Number} order the order for the tree
     * @param {Number} threshold the merge threshold for the tree
     * @returns {Void}
     */
    Scule.datastructures.classes.BPlusTree = function(order, threshold) {

        if (!order) {
            order = 100;  
        }

        if (!threshold) {
            threshold = Math.ceil(order/2);
        }

        /**
         * @private
         * @type {Number}
         */
        this.order = order;

        /**
         * @private
         * @type {Number}
         */    
        this.threshold = threshold;

        /**
         * @private
         * @type {BPlusTreeLeafNode|BPlusTreeNode}
         */  
        this.root = new Scule.datastructures.classes.BPlusTreeLeafNode();
        this.root.setOrder(this.order);
        this.root.setMergeThreshold(this.threshold);

        /**
         * Inserts a key, value pair into the b+tree
         * @public
         * @param {Mixed} key the key to insert
         * @param {Mixed} value the value to insert
         * @returns {Boolean}
         */
        this.insert = function(key, value) {
            var split = this.root.insert(key, value);
            if (split) {
                this.root = new Scule.datastructures.classes.BPlusTreeInteriorNode();
                this.root.setOrder(this.order);
                this.root.setMergeThreshold(this.threshold);
                this.root.data.push(split.left);
                this.root.data.push(split.key);
                this.root.data.push(split.right);
            }
            return true;
        };

        /**
         * Searches the tree for a key, returns the value if it exists - otherwise returns null
         * @public
         * @param {Mixed} key the key to search for
         * @returns {Null|mixed}
         */
        this.search = function(key) {
            return this.root.search(key);
        };

        /**
         * Returns a range of values from the tree, bounding values inclusive
         * @public
         * @param {Mixed} min the lower bound of the range
         * @param {Mixed} max the upper bound of the range
         * @param {Boolean} includeMin
         * @param {Boolean} includeMax
         * @returns {Array}
         */
        this.range = function(min, max, includeMin, includeMax) {
            return this.root.range(min, max, includeMin, includeMax);
        };

        /**
         * Removes a key (and all associated values) from the tree
         * @public
         * @param {Mixed} key the key to remove
         * @returns {Boolean}
         */
        this.remove = function(key) {
            var node = this.root.remove(key);
            if (node) {
                this.root = node;
            }
            return true;
        };

        /**
         * Resets the root node for the tree to a new instance of BPlusTreeLeadNode
         * @public
         * @returns {Void}
         */
        this.clear = function() {
            this.root = new Scule.datastructures.classes.BPlusTreeLeafNode();
            this.root.setOrder(this.order);
            this.root.setMergeThreshold(this.threshold);        
        };

        /**
         * Returns a string representation of the tree
         * @public
         * @returns {String}
         */
        this.toString = function() {
            return this.root.toString();
        };

        /**
         * Returns an Array representation of the tree
         * @public
         * @returns {Array}
         */
        this.toArray = function() {
            return this.root.toArray();  
        };

    };

    /**
     * Represents a node in a binary search tree
     * @public
     * @constructor
     * @class {BinarySearchTreeNode}
     * @param {String} key the key for the node
     * @param {Mixed} data the data for the node
     * @returns {Void}
     */
    Scule.datastructures.classes.BinarySearchTreeNode = function(key, data) {

        /**
         * @private
         * @type {Null|BinarySearchTreeNode}
         */
        this.parent = null;

        /**
         * @private
         * @type {Null|BinarySearchTreeNode}
         */    
        this.left   = null;

        /**
         * @private
         * @type {Null|BinarySearchTreeNode}
         */    
        this.right  = null;

        /**
         * @private
         * @type {String}
         */
        this.key    = key;

        /**
         * @private
         * @type {Mixed}
         */
        this.data   = data;

        /**
         * Sets the parent for the node
         * @public
         * @param {BinarySearchTreeNode} parent the new parent for the node
         * @returns {Void}
         */
        this.setParent = function(parent) {
            this.parent = parent;
        };

        /**
         * Returns the parent for the node
         * @public
         * @returns {BinarySearchTreeNode|null}
         */
        this.getParent = function() {
            return this.parent;
        };

        /**
         * Sets the left child for the node
         * @public
         * @param {BinarySearchTreeNode} left the new left sibling for the node
         * @returns {Void}
         */
        this.setLeft = function(left) {
            if (!left) {
                return;
            }
            this.left = left;
            this.left.setParent(this);
        };

        /**
         * Returns the left child for the node
         * @public
         * @returns {BinarySearchTreeNode|null}
         */
        this.getLeft = function() {
            return this.left;
        };

        /**
         * Sets the right child for the node
         * @public
         * @param {BinarySearchTreeNode} right the new right sibling for the node
         * @returns {Void}
         */
        this.setRight = function(right) {
            if (!right) {
                return;
            }
            this.right = right;
            this.right.setParent(this);
        };

        /**
         * Returns the right child for the node
         * @public
         * @returns {Void}
         */ 
        this.getRight = function() {
            return this.right;
        };

        /**
         * Returns the key for the node
         * @public
         * @returns {Mixed}
         */
        this.getKey = function() {
            return this.key;
        };

        /**
         * Sets the data for the node
         * @public
         * @param {Mixed} data the new data for the node
         * @returns {Void}
         */
        this.setData = function(data) {
            this.data = data;
        };

        /**
         * Returns the data for the node
         * @public
         * @returns {Mixed}
         */
        this.getData = function() {
            return this.data;
        };

        /**
         * Sets the data for the node to null
         * @public
         * @returns {Void}
         */
        this.clear = function() {
            this.data = null;
        };

        /**
         * Removes the provided child from the node - shifting node to rebalance the tree
         * @public
         * @param {BinarySearchTreeNode} child the child to remove from the node
         * @returns {Boolean}
         */
        this.remove = function(child) {
            if (!child) {
                return false;
            }
            if (child == this.right) {
                this.setRight(child.getRight());
                this.getRight().setLeft(child.getLeft());
                child.parent = null;
                child.left   = null;
                child.right  = null;
                return true;
            } else if (child == this.left) {
                this.setLeft(child.getRight());
                this.getLeft().setLeft(child.getLeft());
                child.parent = null;
                child.left   = null;
                child.right  = null;            
                return true;
            }
            return false;
        };

    };

    /**
     * Represents a binary search tree
     * @public
     * @constructor
     * @class {BinarySearchTree}
     * @returns {Void}
     */
    Scule.datastructures.classes.BinarySearchTree = function() {

        /**
         * @private
         * @type {BinarySearchTreeNode}
         */
        this.root = null;

        /**
         * @private
         * @type {Number}
         */
        this.length = 0;

        /**
         * Inserts a key, value pair into the tree
         * @public
         * @param {Mixed} key the key to insert
         * @param {Mixed} data the data to insert
         * @returns {Boolean}
         */
        this.insert = function(key, data) {
            var self = this;
            var node = new Scule.datastructures.classes.BinarySearchTreeNode(key, data);
            if (this.root === null) {
                this.length++;
                this.root = node;
                return true;
            }
            var insrt = function(node, parent) {
                if (node.getKey() == parent.getKey()) {
                    parent.setData(node.getData());
                    return false;
                }
                if (node.getKey() <= parent.getKey()) {
                    if (!parent.getLeft()) {
                        self.length++;
                        parent.setLeft(node);
                    } else {
                        insrt(node, parent.getLeft());
                    }
                } else {
                    if (!parent.getRight()) {
                        self.length++;
                        parent.setRight(node);
                    } else {
                        insrt(node, parent.getRight());
                    }
                }
                return true;
            };
            return insrt(node, this.root);
        };

        /**
         * Recursively searches the tree for the provided key, returning the corresponding node if found
         * @public
         * @param {Mixed} key the key to search for
         * @returns {BinarySearchTreeNode|null}
         */
        this.search = function(key) {
            var srch = function(key, node) {
                if (!node) {
                    return null;
                }
                if (node.getKey() == key) {
                    return node;
                } else if (node.getKey() > key) {
                    return srch(key, node.getLeft());
                } else {
                    return srch(key, node.getRight());
                }           
            };
            return srch(key, this.root);
        };

        /**
         * Removes the first instance of a key from the tree
         * @public
         * @param {Mixed} key the key to remove
         * @returns {Boolean}
         */
        this.remove = function(key) {
            var node = this.search(key);
            if (!node) {
                return false;
            }
            if (!node.getParent()) {
                if (node.getRight()) {
                    this.root = node.getRight();
                    this.root.setLeft(node.getLeft());
                } else if (node.getLeft()) {
                    this.root = node.getRight();
                    this.root.setLeft(node.getLeft());
                } else {
                    this.root = null;
                }
                this.length--;
                return true;
            }
            var r = node.getParent().remove(node);
            if (r) {
                this.length--;
            }
            return r;
        };

        /**
         * Balances the tree in place
         * @public
         * @returns {Void}
         */
        this.balance = function() {
            var self    = this;
            var list    = this.toArray();
            var rebuild = function(list) {
                var left   = list;
                var right  = list.splice(Math.ceil(list.length/2), list.length);
                var middle = left.pop();
                self.insert(middle[0], middle[1]);
                if (left.length > 0) {
                    rebuild(left);
                }
                if (right.length > 0) {
                    rebuild(right);
                }
            };
            this.length = 0;
            this.root   = null;
            rebuild(list);
        };

        /**
         * @public
         * @returns {Number}
         */
        this.getLength = function() {
            return this.length;
        };

        /**
         * Returns the nodes of the tree as an array of arrays containing key at index 0 and data at index 1.
         * Due to the nature of binary trees the returned list is intrinsically sorted in ascending order by key.
         * @public
         * @returns {Array}
         */
        this.toArray = function() {
            var flatten = function(node) {
                if (!node) {
                    return [];
                }
                return flatten(node.getLeft()).concat([[node.getKey(), node.getData()]]).concat(flatten(node.getRight()));
            };
            return flatten(this.root);
        };

        /**
         * Returns the root node of the tree
         * @public
         * @returns {BinarySearchTreeNode|null}
         */
        this.getRoot = function() {
            return this.root;
        };

    };

    /**
     * Returns an instance of the {LinkedList} class
     * @returns {LinkedList}
     */
    Scule.getLinkedList = function() {
        return new Scule.datastructures.classes.LinkedList();
    };

    /**
     * Returns an instance of the {CachingLinkedList} class
     * @see {LinkedList}
     * @param {Number} threshold
     * @param {String} cacheKey
     * @returns {CachingLinkedList}
     */
    Scule.getCachingLinkedList = function(threshold, cacheKey) {
        return new Scule.datastructures.classes.CachingLinkedList(threshold, cacheKey);
    };

    /**
     * Returns an instance of the {DoublyLinkedList} class
     * @returns {DoublyLinkedList}
     */
    Scule.getDoublyLinkedList = function() {
        return new Scule.datastructures.classes.DoublyLinkedList();
    };

    /**
     * Returns an instance of the {HashTable} class
     * @returns {HashTable}
     */
    Scule.getHashTable = function() {
        return new Scule.datastructures.classes.HashTable();
    };

    /**
     * Returns an instance of the {HashMap} class
     * @param {Number} size the table size
     * @returns {HashMap}
     */
    Scule.getHashMap = function(size) {
        return new Scule.datastructures.classes.HashMap(size);
    };

    /**
     * Returns an instance of the {LIFOStack} class
     * @returns {LIFOStack}
     */
    Scule.getLIFOStack = function() {
        return new Scule.datastructures.classes.LIFOStack();
    };

    /**
     * Returns an instance of the {FIFOStack} class
     * @returns {FIFOStack}
     */
    Scule.getFIFOStack = function() {
        return new Scule.datastructures.classes.FIFOStack();
    };

    /**
     * Returns an instance of the {Queue} class
     * @returns {Queue}
     */
    Scule.getQueue = function() {
        return new Scule.datastructures.classes.Queue();
    };

    /**
     * Returns an instance of the {LRUCache} class
     * @param {Number} threshold
     * @returns {LRUCache}
     */
    Scule.getLRUCache = function(threshold) {
        return new Scule.datastructures.classes.LRUCache(threshold);
    };

    /**
     * Returns an instance of the {BPlusTree} class
     * @param {Number} order
     * @param {Number} threshold
     * @returns {BPlusTree}
     */
    Scule.getBPlusTree = function(order, threshold) {
        return new Scule.datastructures.classes.BPlusTree(order, threshold);
    };

    /**
     * Returns an instance of the {BPlusTreeNode} class
     * @returns {BPlusTreeNode}
     */
    Scule.getBPlusTreeNode = function() {
        return new Scule.datastructures.classes.BPlusTreeNode();
    };

    /**
     * Returns an instance of the {BPlusTreeLeafNode} class
     * @param {Null|BPlusTreeLeafNode} left
     * @param {Null|BPlusTreeLeafNode} right
     * @returns {BPlusTreeLeafNode}
     */
    Scule.getBPlusTreeLeafNode = function(left, right) {
        return new Scule.datastructures.classes.BPlusTreeLeafNode(left, right);
    };

    /**
     * Returns an instance of the {BPlusTreeInteriorNode} class
     * @returns {BPlusTreeInteriorNode}
     */
    Scule.getBPlusTreeInteriorNode = function() {
        return new Scule.datastructures.classes.BPlusTreeInteriorNode();
    };

    /**
     * Returns an instance of the {BinarySearchTreeNode} class
     * @param {String} key
     * @param {Mixed} data
     * @returns {BinarySearchTreeNode}
     */
    Scule.getBinarySearchTreeNode = function(key, data) {
        return new Scule.datastructures.classes.BinarySearchTreeNode(key, data);
    };

    /**
     * Returns an instance of the {BinarySearchTree} class
     * @returns {BinarySearchTree}
     */
    Scule.getBinarySearchTree = function() {
        return new Scule.datastructures.classes.BinarySearchTree();
    };

}());

/**
 * Instrumentation
 */
(function() {

    "use strict";

    /**
     * A simple timer for instrumenting intervals during program execution
     * @public
     * @constructor
     * @class {Timer}
     * @returns {Void}
     */
    Scule.instrumentation.classes.Timer = function() {

        /**
         * @private
         * @type {Number}
         */
        this.intervalCounter = 0;

        /**
         * @private
         * @type {Array}
         */
        this.intervalArray   = [];

        /**
         * @private
         * @type {LIFOStack}
         */
        this.intervals = Scule.getLIFOStack();

        /**
         * Resets all intervals in the timer
         * @public
         * @returns {Void}
         */
        this.resetTimer = function() {
            this.intervalCounter = 0;
            this.intervalArray   = [];
            this.intervals.clear();
        };

        /**
         * Starts an interval
         * @public
         * @param {String} tag the unique string used to identify the started interval
         * @returns {Void}
         */
        this.startInterval = function(tag) {
            this.intervalCounter++;
            if (tag === undefined) {
                tag = this.intervalCounter;
            }
            this.intervals.push(new Scule.instrumentation.classes.TimerInterval(tag));
            this.intervalArray.push(this.intervals.peek());
        };

        /**
         * Stops the last interval started
         * @public
         * @returns {Void}
         */
        this.stopInterval = function() {
            if (this.intervals.isEmpty()) {
                return false;
            }
            this.intervals.peek().stop();
            return this.intervals.pop();
        };

        /**
         * Stops all intervals encapsulated by the timer
         * @public
         * @returns {Void}
         */
        this.stopAllIntervals = function() {
            while (!this.intervals.isEmpty()) {
                this.intervals.pop().stop();
            }
        };

        /**
         * Logs all timers to the console
         * @public
         * @returns {Void}
         */
        this.logToConsole = function() {
            this.intervalArray.forEach(function(interval) {
                interval.logToConsole();
            });
        };

    };

    /**
     * Represents an interval within an instrumentation timer
     * @public
     * @constructor
     * @class {TimerInterval}
     * @param {String} tag the unique string identifier for the interval
     * @returns {Void}
     */
    Scule.instrumentation.classes.TimerInterval = function(tag) {

        /**
         * @private
         * @type Number
         */
        this.startTimestamp = (new Date()).getTime();
        this.endTimestamp   = null;
        this.tag            = tag;

        /**
         * Returns a boolean value indicating whether or not the interval is stopped
         * @public
         * @returns {Void}
         */
        this.stopped = function() {
            return this.endTimestamp !== null;
        };

        /**
         * Stops the interval
         * @public
         * @returns {Void}
         */
        this.stop = function() {
            this.endTimestamp = (new Date()).getTime();
        };

        /**
         * Returns the difference between the start and end timestamps for the interval as milliseconds
         * @public
         * @returns {Number}
         */
        this.getDifference = function() {
            if (this.endTimestamp === null) {
                return false;
            }
            return this.endTimestamp - this.startTimestamp;
        };

        /**
         * Logs the interval to the console
         * @public
         * @returns {Void}
         */
        this.logToConsole = function() {
            var diff = this.getDifference();
            if (diff === false) {
                console.log('interval ' + this.tag + ' is still in progress');
            }
            console.log('interval ' + this.tag + ' lasted ' + diff + 'ms');
        };   

    };

    /**
     * Returns an instrumentation timer instance
     * @returns {Timer}
     */
    Scule.getTimer = function() {
        return new Scule.instrumentation.classes.Timer();
    };

}());

/**
 * Query parser
 */
(function() {
    
    "use strict";
    
    /**
     * All valid symbols for Scule queries
     * @private
     * @type {Object}
     */
    Scule.parser.symbols.table = {
        $and:     Scule.parser.arities.selective,
        $or:      Scule.parser.arities.selective,
        $nor:     Scule.parser.arities.negative,
        $not:     Scule.parser.arities.negative,
        $lt:      Scule.parser.arities.range,
        $lte:     Scule.parser.arities.range,
        $gt:      Scule.parser.arities.range,
        $gte:     Scule.parser.arities.range,
        $all:     Scule.parser.arities.array,
        $in:      Scule.parser.arities.array,
        $nin:     Scule.parser.arities.array,
        $eq:      Scule.parser.arities.binary,
        $ne:      Scule.parser.arities.binary,
        $size:    Scule.parser.arities.binary,
        $exists:  Scule.parser.arities.binary,
        $within:  Scule.parser.arities.geospatial,
        $near:    Scule.parser.arities.geospatial,
        $set:     Scule.parser.arities.mutate,
        $inc:     Scule.parser.arities.mutate,
        $unset:   Scule.parser.arities.mutate,
        $pull:    Scule.parser.arities.mutate,
        $pullAll: Scule.parser.arities.mutate,
        $pop:     Scule.parser.arities.mutate,
        $push:    Scule.parser.arities.mutate,
        $pushAll: Scule.parser.arities.mutate,
        $rename:  Scule.parser.arities.mutate
    };

    /**
     * Represents a query parse tree
     * @public
     * @constructor
     * @class {QueryTree}
     * @returns {Void}
     */
    Scule.parser.classes.QueryTree = function() {

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
            if (ors.length === 0) {
                return false;
            }
            var token = new Scule.parser.classes.QueryOperand('$and', Scule.parser.arities.selective);
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
    Scule.parser.classes.QuerySymbol = function(symbol, type) {

        this.children = [];
        this.symbol   = symbol;
        this.type     = type;

        /**
         * Sets the symbol for the node
         * @public
         * @param {String} symbol the symbol value to set
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
                    if (child.getType() == Scule.parser.arities.operand) {
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
            if (index > this.children.length || !this.children[index]) {
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
            for (; i < this.children.length; i++) {
                if (this.children.length === 0) {
                    break;
                }
                child = this.children[i];
                if (child.getType() == Scule.parser.arities.selective) {
                    if (!child.hasChildren()) {
                        this.children.splice(i, 1);
                        i--;                    
                    } else {
                        child.normalize();
                        if (!child.hasChildren()) {
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
    Scule.parser.classes.QueryExpression = function() {

        Scule.parser.classes.QuerySymbol.call(this);

        this.type = Scule.parser.arities.expression;

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
    Scule.parser.classes.QueryOperator = function(symbol, type) {

        Scule.parser.classes.QuerySymbol.call(this, symbol, type);

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
    Scule.parser.classes.QueryOperand = function(symbol, type) {

        Scule.parser.classes.QuerySymbol.call(this, symbol, type);

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
    Scule.parser.classes.QueryVariable = function(symbol) {

        Scule.parser.classes.QuerySymbol.call(this, symbol);

        this.type = Scule.parser.arities.variable;

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
    Scule.parser.classes.QueryIndex = function(symbol) {

        Scule.parser.classes.QuerySymbol.call(this, symbol);

        this.type  = Scule.parser.arities.index;
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
    Scule.parser.classes.QueryParser = function() {

        /**
         * Parses the provided query into a QueryTree
         * @public
         * @param {Object} query the query expression object to parse
         * @returns {QueryTree}
         */
        this.parseQuery = function(query) {

            var tree  = new Scule.parser.classes.QueryTree();
            var scope = Scule.getLIFOStack();
            var ands  = Scule.getHashTable();
            var ors   = [];
            var inOr  = false;

            var root = new Scule.parser.classes.QueryExpression();
            tree.setRoot(root);
            scope.push(root);        

            var parse = function(query, level) {            
                var token;
                var type = scope.peek().getType();
                /**
                 * Handle a scalar value - this is for implicit AND-s
                 */
                if (Scule.global.functions.isScalar(query) || query instanceof RegExp) {
                    if (type == Scule.parser.arities.variable || type == Scule.parser.arities.selective) {
                        token = new Scule.parser.classes.QueryOperator('$eq', Scule.parser.arities.binary);
                        scope.peek().addChild(token);
                        token.addChild(new Scule.parser.classes.QueryOperand(query, Scule.parser.arities.operand));
                    } else {
                        scope.peek().addChild(new Scule.parser.classes.QueryOperand(query, Scule.parser.arities.operand));
                    }
                    return;
                }
                /**
                 * Handle an array of clauses - this is for literal AND-s and OR-s
                 */
                if (Scule.global.functions.isArray(query)) {
                    if (scope.peek().getType() == Scule.parser.arities.selective) {
                        var len = query.length;
                        if (query.length < 2) {
                            throw 'operator ' + scope.peek().getSymbol() + ' requires two or more sub-expression';
                        }
                        var i = 0;
                        var s = scope.peek().getSymbol();
                        for (; i < len; i++) {
                            if (s in query[i]) {
                                throw 'operator ' + scope.peek().getSymbol() + ' cannot be nested';
                            }
                            parse(query[i], level++);
                        }
                    } else {
                        var table = Scule.getHashTable();
                        query.forEach(function(element) {
                            table.put(element, true);
                        });
                        scope.peek().addChild(new Scule.parser.classes.QueryOperand(table, Scule.parser.arities.operand));
                    }
                    return;
                } else {
                    var operator = scope.peek().getSymbol();
                    if (operator == '$near' || operator == '$within') {
                        if (!('lat' in query) || !('lon' in query) || !('distance' in query)) {
                            throw operator + ' operator requires lat, lon, and distance attributes - e.g. {lat:30, lon:-30, distance:10}';
                        }
                        scope.peek().addChild(new Scule.parser.classes.QueryOperand(query, Scule.parser.arities.operand));
                        return;
                    }
                }
                /**
                 * Handle a general case query clause Object
                 */
                if (!scope.isEmpty() && scope.peek().getSymbol() !== '$and') {
                    token = new Scule.parser.classes.QueryOperand('$and', Scule.parser.arities.selective);
                    scope.peek().addChild(token);
                    scope.push(token);
                }
                for (var t in query) {
                    if (t in Scule.parser.symbols.table) {
                        token = new Scule.parser.classes.QueryOperator(t, Scule.parser.symbols.table[t]);
                        if (t == '$or') {
                            inOr = true;
                            ors.push(token);
                        } else {
                            scope.peek().addChild(token);
                        }
                        scope.push(token);
                        parse(query[t], level++);
                        if (!scope.isEmpty() && scope.pop().getSymbol() == '$or') {
                            inOr = false;
                        }
                    } else {
                        token = new Scule.parser.classes.QueryVariable(t);
                        /**
                         * Un-nesting ANDs
                         */
                        if (!inOr) {
                            if (ands.contains(t)) {
                                var top = ands.get(t);
                                if (top.getType() !== Scule.parser.arities.selective) {
                                    if (top.getFirstChild().getType() !== Scule.parser.arities.selective) {
                                        var and = new Scule.parser.classes.QueryOperand('$and', Scule.parser.arities.selective);
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
    Scule.getQueryTree = function() {
        return new Scule.parser.classes.QueryTree();
    };

    /**
     * Returns an instance of the {QuerySymbol} class
     * @see {QuerySymbol}
     * @param {String} symbol the symbol to encapsulate
     * @param {Number} type the type code for the symbol node
     * @returns {QuerySymbol}
     */
    Scule.getQuerySymbol = function(symbol, type) {
        return new Scule.parser.classes.QuerySymbol(symbol, type);
    };

    /**
     * Returns an instance of the {QueryParser} class
     * @returns {QueryParser}
     */
    Scule.getQueryParser = function() {
        return new Scule.parser.classes.QueryParser();
    };    
    
}());

(function() {
  
    "use strict";
  
    /**
     * @private
     * @type {Object}
     */
    Scule.builder.instructions.table = {
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
    Scule.builder.instructions.lookup = {
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
    Scule.builder.instructions.mapping = {
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
    Scule.builder.instructions.index = {
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
    Scule.builder.classes.QueryTreeIndexSelectionVisitor = function(collection) {

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
            var newRoot = Scule.global.functions.cloneObject(tree.getRoot());
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
            var range = Scule.getHashTable();
            var exact = Scule.getHashTable();
            this.populateAttributes(node, range, exact);
            range = range.getKeys().sort();
            exact = exact.getKeys().sort();

            if (range.length === 0 && exact.length === 0) {
                return;
            }

            var matches  = null;
            var indices  = this.collection.indices;

            for (var i=0; i < indices.length; i++) {
                var index = indices[i];
                matches = index.applies(exact, false);
                if (matches) {
                    self.selectExactIndexes(node, matches);
                }
                matches = index.applies(range, true);
                if (matches) {
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
                    case Scule.parser.arities.variable:
                        if (child.getFirstChild().getType() == Scule.parser.arities.selective) {
                            child.children.forEach(function(clause) {
                                self.processClauses(child.getSymbol(), clause, range, exact);
                            });                        
                        } else {
                            self.processClauses(child.getSymbol(), child, range, exact);
                        }
                        break;

                    case Scule.parser.arities.selective:
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
                    case Scule.parser.arities.range:
                        range.put(symbol, true);
                        break;

                    case Scule.parser.arities.operand:    
                    case Scule.parser.arities.binary:
                        exact.put(symbol, true);
                        break;                   
                }
            });
        };

        /**
         * @private
         */
        this.selectExactIndexes = function(node, matches) {

            var index = new Scule.parser.classes.QueryIndex(matches.$index.getName());
            index.index = matches.$index;
            index.range = false;

            var values    = [];
            var backtrack = [];
            for (var i=0; i < node.children.length; i++) {
                var child  = node.children[i];
                var symbol = child.getSymbol();
                if (symbol in matches.$attr && matches.$attr[symbol]) {
                    var clauses = child.children;
                    if (child.getFirstChild().getType() == Scule.parser.arities.selective) {
                        clauses = child.getFirstChild().children;
                    }
                    for (var j=0; j < clauses.length; j++) {
                        if (clauses[j].getSymbol() == '$eq') {
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

            if (backtrack.length !== matches.$index.astrings.length) {
                return;
            } else {
                backtrack = backtrack.reverse();
                backtrack.forEach(function(tuple) {
                    tuple.carray.splice(tuple.j_index, 1);
                    if (tuple.carray.length === 0) {
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

            if (matches.$index.astrings.length > 1) {
                return;
            }

            var index = new Scule.parser.classes.QueryIndex(matches.$index.getName());
            index.index = matches.$index;
            index.range = true;

            var backtrack = [];
            var count = 0;
            var values = [null, null];
            var flags  = [null, null];
            for (var i=0; i < node.children.length; i++) {
                var child  = node.children[i];
                var symbol = child.getSymbol();
                if (symbol in matches.$attr && matches.$attr[symbol]) {  
                    if (!child.getFirstChild()) {
                        continue;
                    }
                    count++;
                    var clauses = child.getFirstChild().children;
                    for (var j=0; j < clauses.length; j++) {
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
                        if (match) {
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

            if (backtrack.length === 0 || count < matches.$index.astrings.length) {
                return;
            } else {
                backtrack = backtrack.reverse();
                backtrack.forEach(function(tuple) {
                    tuple.carray.splice(tuple.j_index, 1);
                    if (tuple.carray.length === 0) {
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
    Scule.builder.classes.ProgramInstruction = function(opcode, args) {

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
            Scule.builder.variables.line++;
            return [Scule.builder.instructions.table[this.opcode], args];
        };

        /**
         * Prints a human readable version of the block to the console
         * @public
         * @returns {Void}
         */
        this.explain = function() {
            var a = [];
            this.args.forEach(function(arg) {
                if (!arg) {
                    return;
                }
                if (Scule.global.functions.isScalar(arg)) {
                    a.push(arg);
                } else {
                    if ('getName' in arg) {
                        a.push(arg.getName()); 
                    } else {
                        a.push(arg); 
                    }
                }
            });
            var encoded = '';
            if (a.length > 0) {
                try {
                    encoded = JSON.stringify(a);
                } catch (e) {
                    encoded = a[0].getName();
                }
            }
            console.log((Scule.builder.variables.line++) + ' ' + this.opcode + ' ' + encoded);
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
    Scule.builder.classes.ProgramBlock = function(operand) {

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
        this.scope = Scule.getLIFOStack();
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
            this.scope.peek().instructions.push(new Scule.builder.classes.ProgramInstruction(opcode, args));
        };

        this.startBlock = function() {
            var block = new Scule.builder.classes.ProgramBlock();
            this.scope.peek().addSubBlock(block);
            this.scope.push(block);        
        };

        /**
         * Starts a header block
         * @public
         * @returns {Void}
         */
        this.startHeadBlock = function() {
            var block = new Scule.builder.classes.ProgramBlock('head');
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
            var block = new Scule.builder.classes.ProgramAndBlock();
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
            var block = new Scule.builder.classes.ProgramOrBlock();
            this.scope.peek().addSubBlock(block);
            this.scope.push(block);        
        };

        /**
         * Starts a GOTO based block of looped logical expressions
         * @public
         * @returns {Void}
         */
        this.startLoopBlock = function() {
            var block = new Scule.builder.classes.ProgramLoopBlock();
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
            if (this.children.length > 0) {
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
            if (this.children.length > 0) {
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
    Scule.builder.classes.ProgramOrBlock = function () {

        Scule.builder.classes.ProgramBlock.call(this, 'or');

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
            if (this.children.length > 1) {
                code.push([0x02, [this.children.length]]);
                Scule.builder.variables.line++;
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
            if (this.children.length > 1) {
                console.log((Scule.builder.variables.line++) + ' or [' + this.children.length + ']');
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
    Scule.builder.classes.ProgramAndBlock = function () {

        Scule.builder.classes.ProgramBlock.call(this, 'and');

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
            if (count > 1) {
                code.push([0x01, [count]]);
                Scule.builder.variables.line++;
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
            if (count > 1) {
                console.log((Scule.builder.variables.line++) + ' and [' + count + ']');       
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
    Scule.builder.classes.ProgramLoopBlock = function () {

        Scule.builder.classes.ProgramBlock.call(this, 'loop');

        /**
         * Returns a bytecode representation of the block as an array of instructions
         * @public
         * @returns {Array}
         */
        this.toByteCode = function() {
            var code = [];
            var read = Scule.builder.variables.line;
            code.push([0x27, []]);
            Scule.builder.variables.line++;
            this.children.forEach(function(block) {
                code = code.concat(block.toByteCode());
            });  
            code.push([0x20, []]);
            Scule.builder.variables.line++;
            code.push([0x25, [(Scule.builder.variables.line + 2)]]);  
            Scule.builder.variables.line++;            
            code.push([0x26, [read]]);
            Scule.builder.variables.line++;
            return code;
        };

        /**
         * Prints a human readable version of the block to the console
         * @public
         * @returns {Void}
         */
        this.explain = function() {
            var read = Scule.builder.variables.line;
            console.log((Scule.builder.variables.line++) + ' read');
            this.children.forEach(function(block) {
                block.explain();
            });    
            console.log((Scule.builder.variables.line++) + ' shift');
            console.log((Scule.builder.variables.line++) + ' jump [' + (Scule.builder.variables.line + 1) + ']');                    
            console.log((Scule.builder.variables.line++) + ' goto [' + read + ']');
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
    Scule.builder.classes.Program = function() {

        this.bytecode = [];

        Scule.builder.classes.ProgramBlock.call(this);

        /**
         * clears the generated bytecode instructions for the program
         * @public
         * @returns {Void}
         */
        this.clearByteCode = function() {
            Scule.builder.variables.line = 0;
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
    Scule.builder.classes.ProgramBuilder = function() {

        /**
         * @private
         * @type {Program}
         */
        this.program = new Scule.builder.classes.Program();

        /**
         * Builds the header of the program
         * @public
         * @returns {Void}
         */
        this.buildHead = function() {
            var children = this.program.getChildren();
            var block;
            for (var i=0; i < children.length; i++) {
                block = children[i];
                if (block.getOperand() == 'head') {
                    this.program.bytecode = this.program.bytecode.concat(block.toByteCode());
                    break;
                }
            }
            this.program.bytecode.push([0x23, []]);
            Scule.builder.variables.line++;
            this.program.bytecode.push([0x21, []]);
            Scule.builder.variables.line++;
        };

        /**
         * Prints a human readable version of the program to the console
         * @public
         * @returns {Void}
         */
        this.explainHead = function() {
            var children = this.program.getChildren();
            var block;
            for (var i=0; i < children.length; i++) {
                block = children[i];
                if (block.getOperand() == 'head') {
                    block.explain();
                    break;
                }
            }
            console.log((Scule.builder.variables.line++) + ' intersect');
            console.log((Scule.builder.variables.line++) + ' store');
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
            for (var i=0; i < children.length; i++) {
                block = children[i];
                if (block.getOperand() != 'head') {
                    count++;
                    this.program.bytecode = this.program.bytecode.concat(block.toByteCode());
                }
            }
            if (count === 0) {
                this.program.bytecode.push([0x28, []]);
                Scule.builder.variables.line++;
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
            for (var i=0; i < children.length; i++) {
                block = children[i];
                if (block.getOperand() != 'head') {
                    count++;
                    block.explain();
                }
            }  
            if (count === 0) {
                console.log((Scule.builder.variables.line++) + ' transpose');
            }
        };

        /**
         * Builds the tail of the program
         * @public
         * @returns {Void}
         */
        this.buildTail = function() {
            this.program.bytecode.push([0x00, []]);
            Scule.builder.variables.line++;
        };

        /**
         * Prints a human readable version of the program tail to the console
         * @public
         * @returns {Void}
         */
        this.explainTail = function() {
            console.log((Scule.builder.variables.line++) + ' halt');
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
            Scule.builder.variables.line = 0;
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
            Scule.builder.variables.line = 0;
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
    Scule.builder.classes.ProgramDirector = function() {

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
    Scule.builder.classes.AbstractSyntaxTreeCompiler = function() {

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

            if (!conditions) {
                conditions = {};
            }

            var loop     = false;
            var node     = tree.getRoot();

            var director = new Scule.builder.classes.ProgramDirector();
            director.setProgramBuilder(new Scule.builder.classes.ProgramBuilder());

            var program  = director.getProgram();

            program.startHeadBlock();
            if (!node.hasChildren() || node.getFirstChild().getType() !== Scule.parser.arities.index) {
                program.addInstruction('scan', [collection]);
                program.stopBlock();
                loop = (node.children.length > 0);
            } else {
                var i=0;
                for (; i < node.children.length; i++) {
                    var child = node.children[i];
                    if (child.getType() !== Scule.parser.arities.index) {
                        break;
                    } else {
                        if (child.range) {
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
                        case Scule.parser.arities.selective:
                            operator.children.forEach(function(op) {
                                compileOperator(variable, op);
                            });
                            break;

                        case Scule.parser.arities.array:
                        case Scule.parser.arities.range:
                        case Scule.parser.arities.binary:
                        case Scule.parser.arities.negative:
                            compileOperator(variable, operator);
                            break;
                    }
                });
            };

            var compileOperator = function(variable, operator) {
                var args = [operator.children[0].getSymbol()];
                args.unshift(variable.getSymbol());
                program.addInstruction(Scule.builder.instructions.mapping[operator.getSymbol()], args);
            };        

            var compile = function(node) {
                node.children.forEach(function(child) {
                    switch(child.getType()) {
                        case Scule.parser.arities.selective:
                            if (child.getSymbol() == '$or') {
                                program.startOrBlock();
                            } else {
                                program.startAndBlock();
                            }
                            compile(child);
                            program.stopBlock();
                            break;

                        case Scule.parser.arities.variable:
                            compileVariable(child);
                            break;

                        case Scule.parser.arities.expression:
                            program.startAndBlock();
                            compile(child);
                            program.stopBlock();
                            break;
                    }
                });
            };

            if (loop) {
                program.startLoopBlock();
            }

            program.startAndBlock();
            compile(node);
            program.stopBlock();

            if (loop) {
                program.stopBlock();
            }

            program.startBlock();
            if ('$sort' in conditions) {
                for (var k in conditions.$sort) {
                    if(conditions.$sort.hasOwnProperty(k)) {
                        program.addInstruction('sort', [k, conditions.$sort[k]]);
                        break;
                    }
                }
            }
            if ('$limit' in conditions) {
                program.addInstruction('limit', [conditions.$limit]);
            }
            program.stopBlock();

            if (!loop) {
                program.startBlock();
                program.addInstruction('transpose', []);
                program.stopBlock();
            }

            if (explain) {
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
    Scule.builder.classes.QueryCompiler = function() {

        /**
         * @private
         * @type {LRUCache}
         */
        this.cache    = Scule.getLRUCache(30);

        /**
         * @private
         * @type {QueryParser}
         */
        this.parser   = Scule.getQueryParser();

        /**
         * @private
         * @type {QueryTreeIndexSelectionVisitor}
         */
        this.visitor  = new Scule.builder.classes.QueryTreeIndexSelectionVisitor();

        /**
         * @private
         * @type {AbstractSyntaxTreeCompiler}
         */
        this.compiler = new Scule.builder.classes.AbstractSyntaxTreeCompiler();

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

            instructions.push([Scule.builder.instructions.table.rread, []]);
            for (var operator in query) {
                if(query.hasOwnProperty(operator)) {
                    if (!(Scule.builder.instructions.mapping[operator] in Scule.builder.instructions.table)) {
                        throw operator + ' is an unrecognized operator';
                    }            
                    for (var variable in query[operator]) {
                        if(query[operator].hasOwnProperty(variable)) {
                            var opcode  = Scule.builder.instructions.table[Scule.builder.instructions.mapping[operator]];
                            instructions.push([opcode, [Scule.global.functions.parseAttributes(variable), query[operator][variable]]]);
                        }
                    }
                }
            }
            instructions.push([Scule.builder.instructions.table.rindex, [collection]]);
            instructions.push([Scule.builder.instructions.table['goto'], [0]]);

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
            for (var operator in query) {
                if(query.hasOwnProperty(operator)) {
                    if (!(Scule.builder.instructions.mapping[operator] in Scule.builder.instructions.table)) {
                        throw operator + ' is an unrecognized operator';
                    }             
                    for (var variable in query[operator]) {
                        if  (query[operator].hasOwnProperty(variable)) {
                            console.log((line++) + ' ' + Scule.builder.instructions.mapping[operator] + ' ' + variable + ', ' + JSON.stringify(query[operator][variable]));
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

            var hash = Scule.md5.hash(JSON.stringify(query));
            if (this.cache.contains(hash)) {
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

            this.visitor.setCollection(collection);        
            var tree = this.parser.parseQuery(query);
            tree.accept(this.visitor);
            var program = this.compiler.compile(tree, conditions, collection, true);

        };

    };

    /**
     * Returns a new instance of the {QueryTreeIndexSelectionVisitor} class
     * @param {Collection} collection the collection to visit
     * @returns {QueryTreeIndexSelectionVisitor}
     */
    Scule.getQueryTreeIndexSelectionVisitor = function(collection) {
        return new Scule.builder.classes.QueryTreeIndexSelectionVisitor(collection);
    };

    /**
     * Returns a new instance of the {AbstractSyntaxTreeCompiler} class
     * @returns {AbstractSyntaxTreeCompiler}
     */
    Scule.getAbstractSyntaxTreeCompiler = function() {
        return new Scule.builder.classes.AbstractSyntaxTreeCompiler();
    };

    /**
     * Returns a new instance of the {ProgramDirector} class
     * @returns {ProgramDirector}
     */
    Scule.getProgramDirector = function() {
        return new Scule.builder.classes.ProgramDirector();
    };

    /**
     * Returns a new instance of the {ProgramBuilder} class
     * @returns {ProgramBuilder}
     */
    Scule.getProgramBuilder = function() {
        return new Scule.builder.classes.ProgramBuilder();
    };

    /**
     * Returns an instance of the {QueryCompiler} class
     * @returns {QueryCompiler}
     */
    Scule.getQueryCompiler = function() {
        return new Scule.builder.classes.QueryCompiler();
    };    
    
}());

/**
 * Virtual Machine
 */
(function() {

    "use strict";

    /**
     * A hybrid (stack + registers) virtual machine that executes programs 
     * written in Scule bytecode. The generated bytecode is subroutine threaded
     * @see http://en.wikipedia.org/wiki/Threaded_code#Subroutine_threading
     * @public
     * @constructor
     * @class {VirtualMachine}
     * @returns {Void}
     */
    Scule.vm.classes.VirtualMachine = function() {

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
        this.stack        = Scule.getLIFOStack();

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
            if (!program) {
                program = this.registers[3];
            } else {
                this.registers[3] = program;
            }

            this.running = true;
            while (this.running) {
                this.executeInstruction(program[this.ipointer]);
            }
            this.running = false;

            if (mutate) {
                this.dpointer = 0;
                this.ipointer = 0;
                this.running  = true;
                this.upsert   = upsert;
                while (this.running) {
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
            if (o.length === 0) {
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
            vm.registers[1] = vm.registers[0][vm.dpointer];
            vm.dpointer++;
            vm.ipointer++;
        });

        /**
         * shift
         */
        this.registerInstruction(0x20, function(vm, instruction) {
            if (vm.stack.pop() === true) {
                vm.result.push(vm.registers[1]);
            }
            vm.ipointer++;
        });

        /**
         * intersect
         */
        this.registerInstruction(0x23, function(vm, instruction) {
            if (vm.stack.getLength() === 1) {
                vm.ipointer++;
                return;
            }
            var arrays = [];
            while (!vm.stack.isEmpty()) {
                arrays.push(vm.stack.pop());
            }
            var result = Scule.vm.functions.intersection(arrays);
            if (result.length === 0) {
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
                if (and === null) {
                    and = vm.stack.pop();
                } else {
                    and = and && vm.stack.pop();
                }
                count--;
            } while (count > 0);
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
                if (or === null) {
                    or = vm.stack.pop();
                } else {
                    or = or || vm.stack.pop();
                }
                count--;
            } while (count > 0);
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
            if (vm.dpointer >= vm.registers[0].length) {
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
            var value  = Scule.global.functions.traverse(instruction[1][0], object);
            if (instruction[1][1] instanceof RegExp) {
                vm.stack.push(instruction[1][1].test(value));
            } else {
                vm.stack.push(value == instruction[1][1]);
            }
            vm.ipointer++;
        });

        /**
         * ne
         */
        this.registerInstruction(0xD, function(vm, instruction) {
            var object = vm.registers[1];
            var value  = Scule.global.functions.traverse(instruction[1][0], object);
            vm.stack.push(value !== instruction[1][1]);
            vm.ipointer++;        
        });

        /**
         * gt
         */
        this.registerInstruction(0x07, function(vm, instruction) {
            var object = vm.registers[1];
            var value  = Scule.global.functions.traverse(instruction[1][0], object);
            vm.stack.push(value > instruction[1][1]);
            vm.ipointer++;        
        });

        /**
         * gte
         */
        this.registerInstruction(0x08, function(vm, instruction) {
            var object = vm.registers[1];
            var value  = Scule.global.functions.traverse(instruction[1][0], object);
            vm.stack.push(value >= instruction[1][1]);
            vm.ipointer++;        
        });

        /**
         * lt
         */
        this.registerInstruction(0x05, function(vm, instruction) {
            var object = vm.registers[1];
            var value  = Scule.global.functions.traverse(instruction[1][0], object);
            vm.stack.push(value < instruction[1][1]);
            vm.ipointer++;        
        });

        /**
         * lte
         */
        this.registerInstruction(0x06, function(vm, instruction) {
            var object = vm.registers[1];
            var value  = Scule.global.functions.traverse(instruction[1][0], object);
            vm.stack.push(value <= instruction[1][1]);
            vm.ipointer++;        
        });

        /**
         * in
         */
        this.registerInstruction(0xA, function(vm, instruction) {
            var object = vm.registers[1];
            var value  = Scule.global.functions.traverse(instruction[1][0], object);
            if (value === undefined) {
                vm.stack.push(false);
            } else {
                vm.stack.push(instruction[1][1].contains(value));
            }
            vm.ipointer++;
        });

        /**
         * nin
         */
        this.registerInstruction(0xB, function(vm, instruction) {
            var object = vm.registers[1];
            var value  = Scule.global.functions.traverse(instruction[1][0], object);
            if (value === undefined) {
                vm.stack.push(true);
            } else {
                vm.stack.push(!instruction[1][1].contains(value));
            }
            vm.ipointer++;
        });

        /**
         * size
         */
        this.registerInstruction(0xE, function(vm, instruction) {
            var object = vm.registers[1];
            var value  = Scule.global.functions.traverse(instruction[1][0], object);
            vm.stack.push(Scule.global.functions.sizeOf(value) == instruction[1][1]);
            vm.ipointer++;
        });

        /**
         * exists
         */
        this.registerInstruction(0xF, function(vm, instruction) {
            var object = vm.registers[1];
            var value  = Scule.global.functions.traverse(instruction[1][0], object);
            if (instruction[1][1]) {
                vm.stack.push(value !== undefined);
            } else {
                vm.stack.push(value === undefined);
            }
            vm.ipointer++;
        });

        /**
         * all
         */
        this.registerInstruction(0x09, function(vm, instruction) {
            var object = vm.registers[1];
            var value  = Scule.global.functions.traverse(instruction[1][0], object);
            if (!Scule.global.functions.isArray(value)) {
                vm.stack.push(false);
            } else {
                var table = instruction[1][1];
                if (value.length < table.getLength()) {
                    vm.stack.push(false);
                } else {
                    var tmp  = Scule.getHashTable();
                    var keys = table.getKeys();
                    keys.forEach(function(key) {
                        tmp.put(key, false);
                    });
                    for (var i=0; i < value.length; i++) {
                        if (tmp.contains(value[i])) {
                            tmp.remove(value[i]);
                        }
                    }
                    vm.stack.push(tmp.getLength() === 0);
                }
            }
            vm.ipointer++;
        });

        /**
         * limit
         */
        this.registerInstruction(0x29, function(vm, instruction) {
            if (instruction[1][0] < vm.result.length) {
                vm.result = vm.result.splice(0, instruction[1][0]);
            }
            vm.ipointer++;
        });

        /**
         * sort
         */
        this.registerInstruction(0x2A, function(vm, instruction) {
            Scule.global.functions.sort(instruction[1][1], vm.result, instruction[1][0]);
            vm.ipointer++;
        });

        /**
         * rread
         */
        this.registerInstruction(0x2B, function(vm, instruction) {
            if (vm.dpointer >= vm.result.length) {
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
            var struct   = Scule.global.functions.traverseObject(instruction[1][0], document);
            var leaf     = struct[0];
            var o        = struct[1];
            if (!(leaf in o)) {
                if (vm.upsert === true) {
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
            var struct   = Scule.global.functions.traverseObject(instruction[1][0], document);
            var leaf     = struct[0];
            var o        = struct[1];
            if (leaf in o) {
                delete o[leaf];
            }
            vm.ipointer++;        
        });

        /**
         * inc
         */
        this.registerInstruction(0x14, function(vm, instruction) {
            var document = vm.registers[1];
            var struct   = Scule.global.functions.traverseObject(instruction[1][0], document);
            var leaf     = struct[0];
            var o        = struct[1];
            if (!(leaf in o)) {
                if (vm.upsert) {
                    o[leaf] = instruction[1][1];
                }
            } else {
                if (Scule.global.functions.isInteger(o[leaf]) || Scule.global.functions.isDouble(o[leaf])) {
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
            var struct   = Scule.global.functions.traverseObject(instruction[1][0], document);
            var leaf     = struct[0];
            var o        = struct[1];
            if (leaf in o && Scule.global.functions.isArray(o[leaf])) {
                var val = instruction[1][1];
                for (var i=0; i < o[leaf].length; i++) {
                    if (o[leaf][i] == val) {
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
            var struct   = Scule.global.functions.traverseObject(instruction[1][0], document);
            var leaf     = struct[0];
            var o        = struct[1];
            if (leaf in o && Scule.global.functions.isArray(o[leaf])) {
                var value = instruction[1][1];
                if (!Scule.global.functions.isArray(value)) {
                    throw 'the $pullAll operator requires an associated array as an operand';
                }
                var table = Scule.getHashTable();
                value.forEach(function(val) {
                    table.put(val, true); 
                });
                for (var i=0; i < o[leaf].length; i++) {
                    if (table.contains(o[leaf][i])) {
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
            var struct   = Scule.global.functions.traverseObject(instruction[1][0], document);
            var leaf     = struct[0];
            var o        = struct[1];
            if (leaf in o && Scule.global.functions.isArray(o[leaf])) {
                o[leaf].pop();   
            }
            vm.ipointer++;        
        });

        /**
         * opush
         */
        this.registerInstruction(0x18, function(vm, instruction) {
            var document = vm.registers[1];
            var struct   = Scule.global.functions.traverseObject(instruction[1][0], document);
            var leaf     = struct[0];
            var o        = struct[1];
            if (!(leaf in o) && vm.upsert) {
                o[leaf] = instruction[1][1];
            } else {
                if (Scule.global.functions.isArray(o[leaf])) {
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
            var struct   = Scule.global.functions.traverseObject(instruction[1][0], document);
            var leaf     = struct[0];
            var o        = struct[1];
            if (!(leaf in o) && vm.upsert) {
                o[leaf] = instruction[1][1];
            } else {
                var value = instruction[1][1];
                if (!Scule.global.functions.isArray(value)) {
                    throw 'the $pushAll operator requires an associated array as an operand';
                }            
                if (Scule.global.functions.isArray(o[leaf])) {
                    o[leaf] = o[leaf].concat(value);   
                }
            }
            vm.ipointer++;         
        });

        /**
         * rindex
         */
        this.registerInstruction(0x2C, function(vm, instruction) {
            Scule.vm.functions.updateIndexes(vm.registers[1], instruction[1][0]);
            vm.ipointer++;
        });

        /**
         * within
         */
        this.registerInstruction(0x10, function(vm, instruction) {
            var document = vm.registers[1];
            var loc1     = Scule.global.functions.traverseObject(Scule.global.functions.parseAttributes(instruction[1][0]), document);
            if (loc1.length < 2 || !('loc' in loc1[1])) {
                vm.stack.push(false);
            } else {        
                loc1 = loc1[1].loc;
                if (!('lat' in loc1) || !('lon' in loc1)) {
                    vm.stack.push(false);
                } else {
                    var loc2 = instruction[1][1];
                    var d    = Math.sqrt(Math.pow(loc2.lat - loc1.lat, 2) + Math.pow(loc2.lon - loc1.lon, 2));
                    if (d <= loc2.distance) {
                        document = Scule.global.functions.cloneObject(document);
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
            var loc1     = Scule.global.functions.traverseObject(Scule.global.functions.parseAttributes(instruction[1][0]), document);
            if (loc1.length < 2 || !('loc' in loc1[1])) {
                vm.stack.push(false);
            } else {
                loc1         = loc1[1].loc;
                var loc2     = instruction[1][1];
                var distance = loc2.distance;
                if (!('lat' in loc1) || !('lon' in loc1)) {
                    vm.stack.push(false);
                } else {
                    var d = Math.acos(Math.sin(loc1.lat) * Math.sin(loc2.lat) + Math.cos(loc1.lat) * Math.cos(loc2.lat) * Math.cos(loc2.lon - loc1.lon)) * 6371;
                    if (d <= distance) {
                        document = Scule.global.functions.cloneObject(document);
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
    Scule.vm.functions.updateIndexes = function(document, collection) {
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
    Scule.vm.functions.intersection = function(lists) {
        if (lists.length === 1) {
            return lists[0];
        }
        var table = Scule.getHashTable();
        var list  = null;
        lists.forEach(function(o) {
            if (!list || o.length < list.length) {
                list = o;
            }
        });
        if (!list) {
            return [];
        }
        list.forEach(function(o) {
            table.put(Scule.global.functions.getObjectId(o), {
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
            lists[i].forEach(function(o) {
                var o2 = table.get(Scule.global.functions.getObjectId(o));
                if (o2) {
                    o2.c++;
                    if (o2.c == len) {
                        intersection.push(o);
                    }
                }
            });
        }
        return intersection;
    };

    /**
     * Returns an instance of the {VirtualMachine} class
     * @returns {VirtualMachine}
     */
    Scule.getVirtualMachine = function() {
        return new Scule.vm.classes.VirtualMachine();
    };

}());

(function() {
    
    "use strict";
    
    /**
     * Represents a "bucketed" hash table, entries are added to the bucket corresponding to the provided key.
     * Buckets are keyed by ObjectId.
     * @public
     * @extends {HashTable}
     * @class {HashBucketTable}
     * @constructor
     */
    Scule.db.classes.HashBucketTable = function() {

        Scule.datastructures.classes.HashTable.call(this);

        /**
         * Adds a new entry corresponding to the bucket corresponding to the provided key
         * @public
         * @param {Mixed} key the key to insert
         * @param {Mixed} value the value corresponding to the provided key
         * @returns {Boolean}
         */
        this.insert = function(key, value) {
            var table;
            if (!this.contains(key)) {
                table = Scule.getHashTable();
                table.put(Scule.global.functions.getObjectId(value), value);
                this.put(key, table);
            } else {
                table = this.get(key);
                table.put(Scule.global.functions.getObjectId(value), value);
            }
            return true;
        };

    };

    /**
     * A B+plus tree leaf node that hashes entries by their ObjectId value
     * @public
     * @constructor
     * @param {BPlusTreeHashingLeafNode|Null} left the left sibling of the node
     * @param {BPlusTreeHashingLeafNode|Null} right the right sibling of the node
     * @returns {Void}
     * @extends {BPlusTreeLeafNode}
     */
    Scule.db.classes.BPlusTreeHashingLeafNode = function(left, right) {

        Scule.datastructures.classes.BPlusTreeLeafNode.call(this, left, right);

        /**
         * Inserts a key/value pair into the data for the node
         * @public
         * @param {Mixed} key the key to insert
         * @param {Mixed} value the value corresponding to the provided key
         * @returns {null|Object}
         */
        this.insert = function(key, value) {
            var table;
            var index = this.indexSearch(key);
            if (index == this.data.length) {
                table = Scule.getHashTable();
                table.put(Scule.global.functions.getObjectId(value, true), value);
                this.data.push({
                    key:key, 
                    value:table
                });
            } else {
                var element = this.data[index];
                if (element.key == key) {
                    element.value.put(Scule.global.functions.getObjectId(value, true), value);
                } else if (element.key < key) {
                    table = Scule.getHashTable();
                    table.put(Scule.global.functions.getObjectId(value, true), value);                
                    this.data.splice(index + 1, 0, {
                        key:key, 
                        value:table
                    });
                } else {
                    table = Scule.getHashTable();
                    table.put(Scule.global.functions.getObjectId(value, true), value);
                    this.data.splice(index, 0, {
                        key:key, 
                        value:table
                    });               
                }
            }
            if (table) {
                this.lookup.put(key, {
                    key:key, 
                    value:table
                });           
            }
            return this.split();
        };

        /**
         * If the node data length has exceeded the block size this function will divide it into two new nodes
         * connected by a junction and identified by a key
         * @public
         * @returns {Null|Object}
         */
        this.split = function() {
            if (this.data.length <= this.order) {
                return null;
            }
            var middle = Math.floor(this.data.length / 2);

            var left = new Scule.db.classes.BPlusTreeHashingLeafNode(this.getLeft());
            left.setOrder(this.getOrder());
            left.setMergeThreshold(this.getMergeThreshold());
            left.data = this.data.splice(0, middle);

            var right = new Scule.db.classes.BPlusTreeHashingLeafNode(null, this.getRight());
            right.setOrder(this.getOrder());
            right.setMergeThreshold(this.getMergeThreshold());
            right.data = this.data.splice(0, middle + 1);

            left.setRight(right);
            if (this.getLeft()) {
                this.getLeft().setRight(left);
            }

            right.setLeft(left);
            if (this.getRight()) {
                this.getRight().setLeft(right);
            }

            return {
                left:left, 
                key:right.data[0].key, 
                right:right
            };
        };

        /**
         * Returns a range of values from the node (and siblints) between min and max
         * @public
         * @param {Mixed} min the minimum value for the range
         * @param {Mixed} max the maxmium value for the range
         * @param {Boolean} includeMin a boolean indicating whether or not to include the minimum bound in the range result
         * @param {Boolean} includeMax a boolean indicating whether or not to include the maximum bound in the range result
         * @returns {Array}
         */
        this.range = function(min, max, includeMin, includeMax) {
            if (includeMax === undefined) {
                includeMax = false;
            }
            if (includeMin === undefined) {
                includeMin = false;
            }
            if (min === undefined) {
                min = null;
            }
            if (max === undefined) {
                max = null;
            }
            var curr  = this;
            var rng = null;
            if (includeMin && includeMax) {
                rng = function(min, max, key, range, value) {
                    if (min === null) {
                        if (key <= max) {
                            range = range.concat(value);
                        }
                    } else if (max === null) {
                        if (key >= min) {
                            range = range.concat(value);
                        }
                    } else {
                        if (key >= min && key <= max) {
                            range = range.concat(value);
                        }
                    }
                    return range;
                };
            } else if (includeMin) {
                rng = function(min, max, key, range, value) {
                    if (min === null) {
                        if (key < max) {
                            range = range.concat(value);
                        }
                    } else if (max === null) {
                        if (key >= min) {
                            range = range.concat(value);
                        }
                    } else {
                        if (key >= min && key < max) {
                            range = range.concat(value);
                        }
                    }
                    return range;
                };
            } else { // includeMax
                rng = function(min, max, key, range, value) {
                    if (min === null) {
                        if (key <= max) {
                            range = range.concat(value);
                        }
                    } else if (max === null) {
                        if (key > min) {
                            range = range.concat(value);
                        }
                    } else {
                        if (key > min && key <= max) {
                            range = range.concat(value);
                        }
                    }
                    return range;
                };            
            }

            var range = [];
                outer:
                while (curr) {
                    var data  = curr.data;
                    var left  = curr.indexSearch(min);
                    var right = (max === null || max === undefined) ? (data.length - 1) : curr.indexSearch(max);
                    if (right >= data.length) {
                        right = data.length - 1;
                    }
                    if (left <= data.length) {
                        for (var i=left; i <= right; i++) {
                            if (max !== null && data[i].key > max) {
                                break outer;
                            }
                            range = rng(min, max, data[i].key, range, data[i].value.getValues());
                        }
                    }
                    curr = curr.getRight();
                }
            return range;
        };

        /**
         * Returns an array based representation of the node object
         * @public
         * @returns {Array}
         */
        this.toArray = function() {
            var o = {
                type:'hashing-leaf'
            };
            for (var i=0; i < this.data.length; i++) {
                o[i + ':' + this.data[i].key] = this.data[i].value;
            }
            return o;
        };

    };

    /**
     * A B+tree with leaf nodes that hash added entries by their ObjectId value
     * @see http://en.wikipedia.org/wiki/B+Tree
     * @public
     * @constructor
     * @param {Number} order the branching factor for the tree
     * @param {Number} threshold the merge threshold for the tree
     * @returns {Void}
     * @extends {BPlusTree}
     */
    Scule.db.classes.BPlusHashingTree = function(order, threshold) {

        Scule.datastructures.classes.BPlusTree.call(this, order, threshold);

        /**
         * @type {BPlusTreeHashingLeafNode}
         * @private
         */
        this.root = new Scule.db.classes.BPlusTreeHashingLeafNode();
        this.root.setOrder(this.order);
        this.root.setMergeThreshold(this.threshold);    

        /**
         * Resets the root node for the tree to a new instance of {BPlusTreeHashingLeafNode}
         * @public
         * @returns {Void}
         */
        this.clear = function() {
            this.root = new Scule.db.classes.BPlusTreeHashingLeafNode();
            this.root.setOrder(this.order);
            this.root.setMergeThreshold(this.threshold);        
        };    

    };

    /**
     * Abstract index implementation - all other index types should descend from this class
     * @see http://en.wikipedia.org/wiki/Database_index
     * @public
     * @abstract
     * @constructor
     * @class {Index}
     * @returns {Void}
     */
    Scule.db.classes.Index = function() {

        /**
         * @type {Object}
         * @private
         */
        this.attributes = {};

        /**
         * @type {HashTable}
         * @private
         */
        this.astrings   = Scule.getHashTable();

        /**
         * @type {HashTable}
         * @private
         */    
        this.leaves     = Scule.getHashTable();

        /**
         * @type {Mixed}
         * @private
         */
        this.structure  = null;

        /**
         * @type {Mixed}
         * @private
         */    
        this.type       = null;

        /**
         * Sets the attributes to be indexed on Objects within this index. Attributes should be provided
         * as an object with keys mapping to the Object keys to index.
         * @public
         * @param {Object} attributes the attributes to set on the index
         * @returns {Void}
         */
        this.setAttribtues = function(attributes) {
            this.attributes = attributes;
            this.attributes = Scule.global.functions.sortObjectKeys(this.attributes);
        };

        /**
         * Parses an index attribute descriptor string or array of descriptor strings to build the index attributes
         * @public
         * @param {Mixed} attributes the attribute string(s) to parse
         * @returns {Void}
         */
        this.parseAttributes = function(attributes) {
            this.populateAttributeStrings(attributes);
            this.attributes = Scule.global.functions.parseAttributes(attributes);
            this.attributes = Scule.global.functions.sortObjectKeys(this.attributes);
        };

        /**
         * Populates the attribute strings
         * @public
         * @param {Mixed} attributes populates the attribute strings for the given attributes
         * @returns {Void}
         */
        this.populateAttributeStrings = function(attributes) {
            var self = this;
            if (!Scule.global.functions.isArray(attributes)) {
                attributes = attributes.split(',');
            }
            attributes.forEach(function(attr) {
                self.astrings.put(attr, true);
            });        
        };

        /**
         * Resets the attributes for the index, this also clears the index
         * @public
         * @returns {Void}
         */
        this.resetAttributes = function() {
            this.attributes = {};
            this.clear();
        };

        /**
         * Returns the type for the index - type values are defined in the constants for Scule
         * @public
         * @returns {Number}
         */
        this.getType = function() {
            return this.type;
        };

        /**
         * Returns the name of the index
         * @public
         * @returns {String}
         */
        this.getName = function() {
            return this.astrings.getKeys().sort().join(',');
        };

        /**
         * Determines whether or not the provided attributes applies to this index
         * @public
         * @param {Array} attributes the attributes to validate
         * @param {Boolean} range whether or not the attributes are part of a range query
         * @returns {boolean|Object}
         */
        this.applies = function(attributes, range) {
            if (range && this.getType() == Scule.global.constants.INDEX_TYPE_HASH) {
                return false;
            }
            if (attributes.length < this.astrings.getLength()) {
                return false;
            }
            var matches = {
                $partial:false, 
                $none:true,
                $range:range,
                $attr:{},
                $index:this
            };
            var self = this;
            attributes.forEach(function(attr) {
                if (self.astrings.contains(attr)) {
                    matches.$attr[attr] = true;
                    matches.$none = false;
                } else {
                    if (!matches.$partial) {
                        matches.$partial = true;
                    }
                    matches.$attr[attr] = false;
                }
            });
            if (matches.$none) {
                return false;
            }
            return matches;
        };

        /**
         * Generates a key for the index using the provided document and index attributes
         * @public
         * @param {Object} document the document to generate an index key for
         * @returns {String}
         */
        this.generateIndexKey = function(document) {
            var composite = Scule.global.functions.searchObject(this.attributes, document);
            if (composite.length === 1) {
                return composite[0];
            }
            return composite.join(',');
        };

        /**
         * Add a document to the index
         * @public
         * @param {Object} document the document to index
         * @returns {Boolean}
         */
        this.index = function(document) {
            if (!this.structure) {
                return false;
            }
            var id  = Scule.global.functions.getObjectId(document, true);
            var key = this.generateIndexKey(document);
            this.structure.insert(key, document);
            var table = this.structure.search(key);
            this.leaves.put(id, {
                table: table,
                key:   key
            });
            return true;
        };

        /**
         * Removes a document from the index
         * @public
         * @param {Object} document the document to remove
         * @returns {Boolean}
         */
        this.remove = function(document) {
            if (!this.structure) {
                return false;
            }
            var id = Scule.global.functions.getObjectId(document, true);
            if (!this.leaves.contains(id)) {
                return false;
            }
            var node = this.leaves.get(id);
            node.table.remove(id);
            if (node.table.getLength() === 0) {
                this.structure.remove(node.key);
            }
            return true;
        };

        /**
         * Prunes an entire keyspace from the index
         * @public
         * @param {Mixed} key the key to remove
         * @returns {Boolean}
         */
        this.removeKey = function(key) {
            if (!this.structure) {
                return false;
            }  
            var table = this.structure.search(key);
            if (table && table.length > 0) {
                this.structure.remove(key);
                for (var k in table.table) {
                    if(table.table.hasOwnProperty(k)) {
                        this.leaves.remove(Scule.global.functions.getObjectId(table.get(k), true));
                    }
                }
            }
            return true;
        };

        /**
         * Searches the index using the provided key
         * @public
         * @param {Object} key the key to search for within the index
         * @returns {Array}
         */
        this.search = function(key) {
            if (this.structure) {
                var table = this.structure.search(key);
                if (table) {
                    return table.getValues();
                }
            }
            return [];
        };

        /**
         * Searches the index for a range of values bounded by min and max values
         * @public
         * @param {Mixed} min the minimum boundary of the range
         * @param {Mixed} max the maximum boundary of the range
         * @param {Boolean} includeMin a boolean flag indicating whether or not to include the minimum bound in the range
         * @param {Boolean} includeMax a boolean flag indicating whether or not to include the maximum bound in the range
         * @returns {Array}
         */
        this.range = function(min, max, includeMin, includeMax) {
            if (this.structure) {
                return this.structure.range(min, max, includeMin, includeMax);
            }
            return false;
        };

        /**
         * Removes all values from the index
         * @public
         * @returns {Void}
         */
        this.clear = function() {
            if (this.structure) {
                this.structure.clear();
                return true;
            }
            return false;
        };

        /**
         * Returns the length of the index as an integer value
         * @public
         * @returns {Number}
         */
        this.getLength = function() {
            return this.leaves.length;
        };

    };

    /**
     * Represents a B+tree index extending the Index class interface contract
     * @see http://en.wikipedia.org/wiki/B+Tree
     * @public
     * @constructor
     * @class {BPlusTreeIndex}
     * @param {Number} order the branching factor for the encapsulated b+tree datastructure
     * @extends {Index}
     * @returns {Void}
     */
    Scule.db.classes.BPlusTreeIndex = function(order) {

        Scule.db.classes.Index.call(this);

        if (!order) {
            order = 100;
        }

        /**
         * @private
         * @type {BPlusHashingTree}
         */
        this.structure = new Scule.db.classes.BPlusHashingTree(order);

        /**
         * @private
         * @type {Number}
         */
        this.type      = Scule.global.constants.INDEX_TYPE_BTREE;

    };

    /**
     * Represents a HashTable index extending the Index class interface contract.
     * This index type does not support the range operation.
     * @see http://en.wikipedia.org/wiki/Hashtable
     * @public
     * @constructor
     * @extends {Index}
     * @returns {Void}
     */
    Scule.db.classes.HashTableIndex = function() {

        Scule.db.classes.Index.call(this);

        /**
         * @private
         * @type {HashBucketTable}
         */
        this.structure = new Scule.db.classes.HashBucketTable();

        /**
         * @private
         * @type {Number}
         */
        this.type      = Scule.global.constants.INDEX_TYPE_HASH;

        /**
         * This is actually a no-op, hash indices cannot support range queries. Calling
         * this function throws an {Exception}
         * @public
         * @param {Mixed} min the minimum boundary of the range
         * @param {Mixed} max the maximum boundary of the range
         * @param {Boolean} includeMin a boolean flag indicating whether or not to include the minimum bound in the range
         * @param {Boolean} includeMax a boolean flag indicating whether or not to include the maximum bound in the range
         * @throws {Exception}
         */
        this.range = function(min, max, includeMin, includeMax) {
            throw 'HashTable type indices to not support range query operations';
        };    

    };

    /**
     * A simple cryptography provider with convenience functions to allow the signing of data
     * @public
     * @constructor
     * @class {SimpleCryptographyProvider}
     * @returns {Void}
     */
    Scule.db.classes.SimpleCryptographyProvider = function() {

        /**
         * Returns an SHA-1 signature for the provided data using a secret and salt
         * @public
         * @param {String} data the data to sign
         * @param {String} secret the secret to use when signing
         * @param {String} salt the salt to use when signing
         * @returns {String}
         */
        this.signString = function(data, secret, salt) {
            return Scule.sha1.hash(Scule.sha1.hash(data + secret) + salt);
        };

        /**
         * Returns an SHA-1 signature for the provided object using a secret and salt
         * @public
         * @param {Object} object the object to sign
         * @param {String} secret the secret to use when signing
         * @param {String} salt the salt to use when signing
         * @returns {String}
         */
        this.signObject = function(object, secret, salt) {
            object._sig = salt;
            return this.signString(JSON.stringify(object), secret, salt);
        };

        /**
         * Returns an SHA-1 signature on the JSON serialized version of an object using a secret and salt
         * @public
         * @param {Object} object the object to sign the JSON string for
         * @param {String} secret the secret to use when signing
         * @param {String} salt the salt to use when signing
         * @returns {String}
         */
        this.signJSONString = function(object, secret, salt) {
            return this.signString(JSON.stringify(object), secret, salt);
        };

        /**
         * Verifies the signature on an object
         * @public
         * @param {Object} object the object to verify the signature for
         * @param {String} secret the secret to use when verifying the signature
         * @param {String} salt the salt to use when verifying the signature
         * @returns {Boolean}
         */
        this.verifyObjectSignature = function(object, secret, salt) {
            var oldSig = object._sig;
            var newSig = this.signObject(object, secret, salt);
            return oldSig == newSig;      
        };

    };

    /**
     * An abstract storage engine interface contract - all storage engines should descend from this class
     * @public
     * @constructor
     * @param {Object} configuration the configuration parameters for the storage engine instance
     * @class {StorageEngine}
     * @returns {Void}
     */
    Scule.db.classes.StorageEngine = function(configuration) {

        /**
         * @private
         * @type {Object}
         */
        this.configuration = configuration;

        /**
         * @private
         * @type {SimpleCryptographyProvider}
         */
        this.crypto        = null;

        /**
         * Sets the configuration for the storage engine
         * @public
         * @param {Object} configuration the configuration parameters to set
         * @returns {Void}
         */
        this.setConfiguration = function(configuration) {
            this.configuration = configuration;
        };

        /**
         * Returns the configuration for the storage engine
         * @public
         * @returns {Object}
         */
        this.getConfiguration = function() {
            return this.configuration;
        };

        /**
         * Sets the cryptography provider for the storage engine
         * @public
         * @param {SimpleCryptographyProvider} provider the cryptography provider instance to set
         * @returns {Void}
         */
        this.setCryptographyProvider = function(provider) {
            this.crypto = provider;
        };

        /**
         * Returns the cryptography provider for the storage engine
         * @public
         * @returns {SimpleCryptographyProvider}
         */
        this.getCryptographyProvider = function() {
            return this.crypto;
        };

        /**
         * Writes data to storage
         * @public
         * @param {String} name the name of the file to write data to
         * @param {Object} object the data to write
         * @param {Function} callback the callback to execute once writing to storage is complete
         * @returns {Void}
         */
        this.write = function(name, object, callback) {
            throw 'function not implemented in abstract class';
        };

        /**
         * Reads data from storage
         * @public
         * @param {String} name the name of the file to read data from
         * @param {Function} callback the callback to execute one reading from storage is complete
         * @returns {Object}
         */
        this.read  = function(name, callback) {
            throw 'function not implemented in abstract class';
        };

    };

    /**
     * A dummy storage engine - does nothing but execute callbacks
     * @public
     * @constructor
     * @param {Object} configuration
     * @extends {StorageEngine}
     * @returns {Void}
     */
    Scule.db.classes.DummyStorageEngine = function(configuration) {

        Scule.db.classes.StorageEngine.call(this, configuration);

        /**
         * Writes data to storage
         * @public
         * @param {String} name the name of the file to write data to
         * @param {Object} object the data to write
         * @param {Function} callback the callback to execute once writing to storage is complete
         * @returns {Void}
         */  
        this.write = function(name, object, callback) {
            if (callback) {
                callback(object);
            }
        };

        /**
         * Reads data from storage
         * @public
         * @param {String} name the name of the file to read data from
         * @param {Function} callback the callback to execute one reading from storage is complete
         * @returns {Object}
         */ 
        this.read = function(name, callback) {
            if (callback) {
                callback();
            }
        };

    };

    /**
     * A memory based storage engine - used for testing
     * @public
     * @constructor
     * @param {Object} configuration the configuration parameters for the storage engine instance
     * @extends {StorageEngine}
     * @returns {Void}
     */
    Scule.db.classes.MemoryStorageEngine = function(configuration) {

        Scule.db.classes.StorageEngine.call(this, configuration);

        this.setCryptographyProvider(new Scule.db.classes.SimpleCryptographyProvider());
        this.storage = {};

        /**
         * Writes data to storage
         * @public
         * @param {String} name the name of the file to write data to 
         * @param {Object} object the data to write
         * @param {Function} callback the callback to execute once writing to storage is complete
         * @returns {Void}
         */  
        this.write = function(name, object, callback) {
            if (!object._salt) {
                object._salt = Scule.sha1.hash((new Date()).getTime() + '');
            }
            object._sig = this.crypto.signObject(object, this.configuration.secret, object._salt);
            this.storage['__scule_collection__' + name] = JSON.stringify(object);
            if (callback) {
                callback(object);
            }
        };

        /**
         * Reads data from storage
         * @public
         * @param {String} name the name of the file to read data from
         * @param {Function} callback the callback to execute one reading from storage is complete
         * @returns {Object}
         */  
        this.read  = function(name, callback) {
            if (!('__scule_collection__' + name in this.storage)) {
                var object = {
                    _sig: null,
                    _salt: Scule.sha1.hash((new Date()).getTime() + ''),
                    _version: 2.0,
                    _name: name,
                    _objects: {}
                };
                object._sig = this.crypto.signObject(object, this.configuration.secret, object._salt);
                this.storage['__scule_collection__' + name] = JSON.stringify(object);
            }
            var data = this.storage['__scule_collection__' + name];
            var o = JSON.parse(data);
            if (this.crypto.verifyObjectSignature(o, this.configuration.secret, o._salt) === false) {
                throw JSON.stringify({
                    event:'SculeDataTampered', 
                    filename:this.configuration.collection
                });
            }
            delete o._sig;
            if (callback) {
                callback(o);  
            }
        };

    };

    /**
     * A disk based storage engine for web broswers that support the LocalStorage standard
     * @public
     * @constructor
     * @class {LocalStorageStorageEngine}
     * @param {Object} configuration the configuration parameters for the storage engine instance
     * @extends {StorageEngine}
     * @returns {Void}
     */
    Scule.db.classes.LocalStorageStorageEngine = function(configuration) {

        Scule.db.classes.StorageEngine.call(this, configuration);

        this.setCryptographyProvider(new Scule.db.classes.SimpleCryptographyProvider());

        if (!window || (!window.hasOwnProperty('localStorage') && (window.localStorage !== null))) {
            throw JSON.stringify({
                event:'SculeLocalStorageError',
                message:'Local storage is not available on this device'
            });
        }

        /**
         * Writes data to storage
         * @public
         * @param {String} name the name of the file to write data to
         * @param {Object} object the data to write
         * @param {Function} callback the callback to execute once writing to storage is complete
         * @returns {Void}
         */ 
        this.write = function(name, object, callback) {
            if (!object._salt) {
                object._salt = Scule.sha1.hash((new Date()).getTime() + '');
            }
            try {
                object._sig = this.crypto.signObject(object, this.configuration.secret, object._salt);
                localStorage.setItem('__scule_collection__' + name, JSON.stringify(object));
                if (callback) {
                    callback(object);
                }
            } catch (e) {
                throw JSON.stringify({
                    event:'SculeLocalStorageError',
                    message:'Storage quota exceeded for origin',
                    collection:this.configuration.collection
                });           
            }
        };

        /**
         * Reads data from storage
         * @public
         * @param {String} name the name of the file to read data from
         * @param {Function} callback the callback to execute one reading from storage is complete
         * @returns {Object}
         */
        this.read = function(name, callback) {
            var data = localStorage.getItem('__scule_collection__' + name);
            if (!data) {
                throw JSON.stringify({
                    event:'SculeLocalStorageError',
                    message:'Unable to load collection from local storage',
                    collection:this.configuration.collection
                });
            }
            var o = JSON.parse(data);
            if (this.crypto.verifyObjectSignature(o, this.configuration.secret, o._salt) === false) {
                throw JSON.stringify({
                    event:'SculeDataTampered', 
                    filename:this.configuration.collection
                });
            }
            delete o._sig;
            if (callback) {
                callback(o);  
            }
        };

    };

    /**
     * Represents a BSON Object Identifier
     * @public
     * @constructor
     * @class {ObjectId}
     * @param {String} id the identifier to initialize the object with
     * @returns {Void}
     */
    Scule.db.classes.ObjectId = function(id) {

        if (id === undefined) {
            var ts = Math.floor((new Date()).getTime()/1000).toString(16);
            var hs = Scule.md5.hash(Scule.global.functions.getMACAddress()).substring(0, 6);
            var pid = Scule.global.functions.randomFromTo(1000, 9999).toString(16);
            while (pid.length < 4) {
                pid = '0' + pid;
            }
            var inc = Scule.global.functions.randomFromTo(100000, 999999).toString(16);
            while (inc.length < 6) {
                inc = '0' + inc;
            }
            id = ts + hs + pid + inc;        
        }

        /**
         * @private
         * @type {String}
         */
        this.id = id;

        /**
         * @private
         * @type {String}
         */
        this.$type = 'id';

        /**
         * Returns a String representation of the ObjectId
         * @public
         * @returns {String}
         */
        this.toString = function() {
            return this.id.toString();
        };

    };

    /**
     * Represents a MongoDate object with microtime precision
     * @public
     * @constructor
     * @class {ObjectDate}
     * @param {Number} sec the number of seconds
     * @param {Number} usec the number of microseconds
     * @returns {Void}
     */
    Scule.db.classes.ObjectDate = function(sec, usec) {

        if (sec === undefined && usec === undefined) {
            var ts = (new Date()).getTime().toString();
            sec  = parseInt(ts.substring(0, 10), 10);
            usec = parseInt(ts.substring(10), 10);
        }

        /**
         * @private
         * @type {Number}
         */
        this.ts    = parseInt(sec + usec, 10);

        /**
         * @private
         * @type {Number}
         */    
        this.sec   = sec;

        /**
         * @private
         * @type {Number}
         */    
        this.usec  = usec;

        /**
         * @private
         * @type {String}
         */    
        this.$type = 'date';

        /**
         * Returns the unix timestamp for the object without microsecond precision
         * @returns {Number}
         */
        this.getTimestamp = function() {
            return this.ts;
        };

        /**
         * Returns the seconds value of the timestamp
         * @returns {Number}
         */
        this.getSeconds = function() {
            return this.sec;
        };

        /**
         * Returns the microseconds value of the timestamp
         * @returns {Number}
         */
        this.getMicroSeconds = function() {
            return this.usec;
        };

    };

    /**
     * Represents a DBRef object
     * @public
     * @constructor
     * @class {DBRef}
     * @param {String} ref the collection name the referenced object resides in
     * @param {String} id the identifier for the referenced object
     * @returns {Void}
     * @throws {Exception}
     */
    Scule.db.classes.DBRef = function(ref, id) {

        if (ref === undefined || id === undefined) {
            throw "illegal object reference";
        }

        /**
         * @private
         * @type {String}
         */
        this.ref = ref;

        /**
         * @private
         * @type {ObjectId}
         */    
        this.id  = new Scule.db.classes.ObjectId(id);

        /**
         * @private
         * @type {String}
         */    
        this.$type = 'dbref';

        /**
         * Returns the collection name for the reference
         * @public
         * @returns {String}
         */
        this.getRef = function() {
            return this.ref;
        };

        /**
         * Returns the ObjectId instance for the reference
         * @public
         * @returns {Object}Id
         */
        this.getId = function() {
            return this.id;
        };

        /**
         * Resolves the reference, this function is an alias of DBRef::resolveReference
         * @public
         * @returns {Null|Object}
         */
        this.resolve = function() {
            return this.resolveReference();
        };

        /**
         * Resolves the reference
         * @public
         * @returns {Null|Object}
         */
        this.resolveReference = function() {
            var collection = Scule.factoryCollection(this.ref);
            return collection.findOne(this.id);
        };

    };

    /**
     * Core Scule data types and pattern implementations
     * @public
     * @constructor
     * @class Collection
     * @param {String} name the name of the collection
     * @returns {Void}
     */
    Scule.db.classes.Collection = function(name) {

        /**
         * @private
         * @type {HashTable}
         */    
        this.documents  = Scule.getHashTable();

        /**
         * @private
         * @type {QueryCompiler}
         */    
        this.compiler   = Scule.getQueryCompiler();

        /**
         * @private
         * @type {VirtualMachine}
         */    
        this.vm         = Scule.getVirtualMachine();

        /**
         * @private
         * @type {Number}
         */    
        this.version    = 2.0;

        /**
         * @private
         * @type {ObjectId}
         */    
        this.lastId     = null;

        /**
         * @private
         * @type {String}
         */    
        this.name       = name;

        /**
         * @private
         * @type {Boolean}
         */    
        this.autoCommit = false;

        /**
         * @private
         * @type {Boolean}
         */    
        this.isOpen     = false;

        /**
         * @private
         * @see {StorageEngine}
         * @type {StorageEngine}
         */    
        this.storage    = null;

        /**
         * @private
         * @type {Array}
         */    
        this.indices    = [];

        /**
         * Sets the storage engine for the collection
         * @public
         * @param {StorageEngine} storage the storage engine to set on the collection
         * @returns {Void}
         */
        this.setStorageEngine = function(storage) {
            this.storage = storage;
        };

        /**
         * Ensures that an index exists on the collection with the provided attributes
         * @public
         * @param {Number} type the type of index
         * @param {String} definition the attributes to use when building the index
         * @param {Object} options the index type specific options to use
         * @returns {Void}
         */
        this.ensureIndex = function(type, definition, options) {
            var index;
            switch(type) {
                case Scule.global.constants.INDEX_TYPE_BTREE:
                    if (!options) {
                        options = {
                            order:100
                        };
                    }
                    index = new Scule.db.classes.BPlusTreeIndex(options.order);
                    index.parseAttributes(definition);
                    break;

                case Scule.global.constants.INDEX_TYPE_HASH:
                    index = new Scule.db.classes.HashTableIndex();
                    index.parseAttributes(definition);
                    break;
            }
            if (index) {
                var inserted = false;
                var alen     = index.astrings.length;
                for (var i=0; i < this.indices.length; i++) {
                    if (alen > this.indices[i].astrings.length) {
                        this.indices.splice(i, 0, index);
                        inserted = true;
                        break;
                    }
                }
                if (!inserted) {
                    var o = this.findAll();
                    o.forEach(function(document) {
                        index.index(document);
                    });
                    this.indices.push(index);
                }
            }
        };

        /**
         * Ensures a b+tree index exists using the provided definition and options
         * @public
         * @param {String} definition the index definition (e.g. a,b,c.d)
         * @param {Object} options the options for the index implementation
         * @returns {Void}
         */
        this.ensureBTreeIndex = function(definition, options) {
            this.ensureIndex(Scule.global.constants.INDEX_TYPE_BTREE, definition, options);
        };


        /**
         * Ensures a hash index exists using the provided definition and options
         * @public
         * @param {String} definition the index definition (e.g. a,b,c.d)
         * @param {Object} options the options for the index implementation
         * @returns {Void}
         */
        this.ensureHashIndex = function(definition, options) {
            this.ensureIndex(Scule.global.constants.INDEX_TYPE_HASH, definition, options);
        };

        /**
         * Sets whether or not the collection should auto-commit changes to storage
         * @public
         * @param {Boolean} semaphor the boolean indicating whether or not auto-commit is enabled (default is FALSE)
         * @returns {Void}
         */
        this.setAutoCommit = function(semaphor) {
            this.autoCommit = semaphor;
        };

        /**
         * Returns the name for the collection as a string
         * @public
         * @returns {String}
         */
        this.getName = function() {
            return this.name;
        };

        /**
         * Returns the number of objects in the collection as an integer
         * @public
         * @returns {Number}
         */
        this.getLength = function() {
            return this.documents.getLength();
        };

        /**
         * Returns the ObjectId created by the last insertion operation on the collection
         * @public
         * @returns {Null|ObjectId}
         */
        this.getLastInsertId = function() {
            return this.lastId;
        };

        /**
         * Loads the collection from storage and initializes all encapsulated objects
         * @public
         * @param {Function} callback the callback to execute once the collection is 
         * opened, the collection is passed as the only argument for the callback closure
         * @returns {Void}
         */
        this.open = function(callback) {
            if (this.isOpen) {
                return;
            }
            var self = this;
            this.storage.read(this.name, function(o) {
                if (!o) {
                    return;
                }
                for (var ky in o._objects) {
                    if(o._objects.hasOwnProperty(ky)) {
                        var document = o._objects[ky];
                        Scule.db.functions.unflattenObject(o._objects[ky]);
                        self.documents.put(Scule.global.functions.getObjectId(document, true), document);
                        for (var i=0; i < self.indices.length; i++) {
                            self.indices[i].index(document);
                        }
                    }
                }
                self.isOpen = true;
                if (callback) {
                    callback(this);
                }
            });
        };

        /**
         * Commits the collection to storage
         * @public
         * @param {Function} callback the callback executed when the collection is successfully commited
         * @returns {Void}
         */
        this.commit = function(callback) {
            var collection = {
                _sig: null,
                _salt: null,
                _name: this.name,
                _version: this.version,
                _objects: this.documents.table            
            };
            this.storage.write(this.name, collection, callback);
        };

        /**
         * Performs a query on the collection, returning the results as an array
         * @public
         * @param {Object} query the query expression(s) to execute against the collection
         * @param {Object} conditions the limit and sort conditions for the query
         * @param {Function} callback the callback to be executed once the query is complete. The only
         * argument for the callback closure is the result set for the query. If no callback is provided
         * the results are returned directly.
         * @returns {Array}
         */
        this.find = function(query, conditions, callback) {
            if (Scule.global.constants.ID_FIELD in query) {
                return [this.findOne(query[Scule.global.constants.ID_FIELD])];
            }
            this.vm.reset();
            var result = this.vm.execute(this.compiler.compileQuery(query, conditions, this));
            if (callback) {
                callback(result);
            }
            return result;
        };

        /**
         * Prints a human readable version of the Scule virtual machine program
         * generated to service the provided query and conditions
         * @public
         * @param {Object} query the query expression(s) to execute against the collection
         * @param {Object} conditions the limit and sort conditions for the query
         * @param {Function} callback callback the callback to be executed once the query is complete.
         * The callback has no arguments.
         * @returns {Void}
         */
        this.explain = function(query, conditions, callback) {
            this.compiler.explainQuery(query, conditions, this);
            if (callback) {
                callback();
            }
        };

        /**
         * Clears the collection - removing all objects
         * @public
         * @param {Function} callback the callback to be executed once the collection has been cleared.
         * The only argument for the callback closure is a reference to the collection itself.
         * @returns {Void}
         */
        this.clear = function(callback) {
            this.documents.clear();
            for (var i=0; i < this.indices.length; i++) {
                this.indices[i].clear();
            }
            if (callback) {
                callback(this);
            }
        };

        /**
         * Returns all objects in the collection as an Array
         * @public
         * @param {Function} callback the callback to be executed once the query is complete. The only
         * argument for the callback closure is the result set for the query. If no callback is provided
         * the results are returned directly.
         * @returns {Array}
         */
        this.findAll = function(callback) {
            var result = [];
            for (var ky in this.documents.table) {
                if(this.documents.table.hasOwnProperty(ky)) {
                    result.push(this.documents.get(ky));
                }
            }
            if (callback) {
                callback(result);
            }
            return result;
        };

        /**
         * Returns the object identified by the provided ObjectId, returns null if no entry
         * exists in the documents index
         * @public
         * @param {ObjectId} id the {ObjectId} to query with
         * @param {Function} callback the callback to be executed once the query is complete. The only
         * argument for the callback closure is the result set for the query. If no callback is provided
         * the results are returned directly.
         * @returns {Object|null}
         */
        this.findOne = function(id, callback) {
            if (!Scule.global.functions.isScalar(id)) {
                id = id.toString();
            }
            var document = null;
            if (this.documents.contains(id)) {
                document = this.documents.get(id);
            }
            if (callback) {
                callback(document);
            }
            return document;
        };

        /**
         * Saves an object to the collection, adding an ObjectId using the attribute name _id
         * if none exists.
         * @public
         * @param {Object} document the document object to save to the collection
         * @param {Function} callback the callback to be executed once the query is complete. The only
         * argument for the callback closure is the {ObjectId} for the last inserted document. If no
         * callback is provided the last inserted id is returned directly.
         * @returns {Void}
         */
        this.save = function(document, callback) {
            Scule.db.functions.unflattenObject(document);
            this.documents.put(Scule.global.functions.getObjectId(document, true), document);
            for (var i=0; i < this.indices.length; i++) {
                this.indices[i].remove(document);
                this.indices[i].index(document);
            }
            if (this.autoCommit) {
                this.commit();
            }
            this.lastId = Scule.global.functions.getObjectId(document);
            if (callback) {
                callback(this.lastId);
            }
            return this.lastId;
        };

        /**
         * Performs an update on documents in the collection
         * @public
         * @param {Object} query the query expression(s) to execute against the collection
         * @param {Object} updates the update query expression(s) to execute against the collection
         * @param {Object} conditions the limit and sort conditions for the query
         * @param {Boolean} upsert a boolean flag indicating whether or not to upsert
         * @param {Function} callback the callback to be executed once the query is complete. The only
         * argument for the callback closure is the result set for the query. If no callback is provided
         * the results are returned directly.
         * @returns {Array}
         */
        this.update = function(query, updates, conditions, upsert, callback) {
            this.vm.reset();
            var result = this.vm.execute(this.compiler.compileQuery(query, conditions, this), this.compiler.compileMutate(updates, this), upsert);
            if (callback) {
                callback(result);
            }
            return result;
        };

        /**
         * Returns a count of the number of documents matching the query criteria
         * @public
         * @param {Object} query the query expression(s) to execute against the collection
         * @param {Object} conditions the limit and sort conditions for the query
         * @param {Function} callback the callback to be executed once the query is complete. The only
         * argument for the callback closure is the result set for the query. If no callback is provided
         * the results are returned directly.
         * @returns {Number}
         */
        this.count = function(query, conditions, callback) {
            var count = this.find(query, conditions).length;
            if (callback) {
                callback(count);
            }
            return count;
        };

        /**
         * Removes the documents matching the query criteria and sort/limit conditions
         * from the collection and associated indices
         * @public
         * @param {Object} query the query expression(s) to execute against the collection. Documents
         * matching the query criteria will be removed from the collection
         * @param {Object} conditions the limit and sort conditions for the query
         * @param {Function} callback the callback to be executed once the query is complete. The only
         * argument for the callback closure is the result set for the query. If no callback is provided
         * the results are returned directly.
         * @returns {Number}
         */
        this.remove = function(query, conditions, callback) {
            var self   = this;
            var results = this.find(query, conditions);
            results.forEach(function(o) {
                self.documents.remove(Scule.global.functions.getObjectId(o));
                self.indices.forEach(function(index) {
                    index.remove(o);
                });
            });
            callback(results);
            return results;
        };

        /**
         * Returns an object containing key, value pairs representing the distinct values for the provided key (and query if provided)
         * @public
         * @param {String} key the key to find distinct values for
         * @param {Object} query the query to use when aggregating results
         * @param {Function} callback the callback to be executed once the query is complete. The only
         * argument for the callback closure is the result set for the query. If no callback is provided
         * the results are returned directly.
         * @returns {Object}
         */    
        this.distinct = function(key, query, callback) {
            var o = this.find(query);
            var t = {};
            o.forEach(function(d) {
                if (!(d[key] in t)) {
                    t[d[key]] = 0;
                }
                t[d[key]]++;
            });
            if (callback) {
                callback(t);
            }
            return t;
        };

        /**
         * Merges the current collection with the provided collection
         * @public
         * @param {Collection} collection the collection to merge with
         * @param {Function} callback the callback to be executed once the merge is complete. The only
         * argument for the callback closure is a reference to the collection (this).
         * @returns {Boolean}
         */
        this.merge = function(collection, callback) {
            if (!collection) {
                throw 'the merge function requires a valid collection as a parameter';
            }
            var self = this;
            var o    = collection.findAll();
            o.forEach(function(document) {
                if (!self.documents.contains(document._id)) {
                    self.documents.put(document._id, document);
                }
            });
            if (callback) {
                callback(this);
            }
            return true;
        };

        /**
         * Performs a map/reduce operation against the collection
         * @see http://docs.mongodb.org/manual/applications/map-reduce/
         * @public
         * @param {Function} map the map function - it has two arguments: a reference to the document to map
         * and a reference to a function called "emit"
         * @param {Function} reduce the reduce function - should return the result of the reduce operation
         * @param {Object} options the options for the map/reduce operation - it can optionally contain:
         * 
         * - an "out" value containing a collection connection url as either a "merge" or "reduce" sub-argument. If 
         * provided as a merge the provided collection will be merged with the results of the map/reduce operation.
         * 
         * - a query expression object
         * 
         * - a limit/sort expression object
         * 
         * - a "finalize" value containing a reference to a function. Finalize functions should accept two arguments;
         * a reference to the key being operated on and a reference to results of the reduce function. The finalize function
         * should return a reference to the modified "reduced" value once it has completed execution.
         * 
         * And example options object might look like:
         * {
         *      out:{
         *          merge:'scule+dummy://map-reduce'
         *      },
         *      query:{a:10},
         *      conditions:{$limit:100, $sort:{a:-1}},
         *      finalize:function(key, reduced) {
         *          reduced.finalized = key;
         *          return reduced;
         *      }
         * }
         * @param {Function} callback the callback to be executed once the map/reduce operation is complete. The only
         * argument for this function is the "out" collection.
         * @returns {Void}
         */
        this.mapReduce = function(map, reduce, options, callback) {
            (new Scule.db.classes.MapReduceHandler(map, reduce, options)).run(this, callback);
        };

    };

    /**
     * A simple map/reduce implementation
     * @public
     * @constructor
     * @param {Function} map
     * @param {Function} reduce
     * @param {Object} options
     * @class {MapReduceHandler}
     * @returns {Void}
     */
    Scule.db.classes.MapReduceHandler = function(map, reduce, options) {

        this.options = options;

        if (!map) {
            throw 'A valid function is requires as the `map` parameter of the map/reduce operation';
        }

        if (!reduce) {
            throw 'A valid function is requires as the `reduce` parameter of the map/reduce operation';
        }

        if (!('out' in options)) {
            throw 'A valid output collection connection url is required as the `out` parameter of the map/reduce options object';
        } else {
            if (!('merge' in options.out) && !('reduce' in options.out)) {
                throw 'A valid output collection connection url is required as either the `merge` or `reduce` out parameter of the map/reduce options object';
            }
        }

        if (!('query' in options)) {
            options.query = {};
        }

        if (!('conditions' in options)) {
            options.conditions = {};
        }

        this.map = map;

        this.reduce = reduce;

        this.finalize = ('finalize' in options) ? options.finalize : null;

        /**
         * Runs the map reduce operation against the provided collection
         * @public
         * @param {Collection} collection
         * @param {Function} callback called once the map/reduce is complete, providing the out collection as the only parameter
         * @returns {Boolean}
         */
        this.run = function(collection, callback) {

            var self  = this;
            var merge = ('merge' in this.options.out); 
            var out   = Scule.factoryCollection(merge ? this.options.out.merge : this.options.out.reduce);
            var table = Scule.getHashTable();

            var emit  = function(key, value) {
                if (!table.contains(key)) {
                    table.put(key, []);
                }
                table.get(key).push(value);
            };

            var o = collection.find(this.options.query, this.options.conditions);
            o.forEach(function(document) {
                self.map(document, emit);
            });

            var temp = null;
            if (merge) {
                temp = Scule.factoryCollection('scule+dummy://__mr' + (new Date()).getTime());
            }

            var result = Scule.getHashTable();
            var keys   = table.getKeys();
            keys.forEach(function(key) {
                result.put(key, self.reduce(key, table.get(key)));
                if (self.finalize) {
                    result.put(key, self.finalize(key, result.get(key)));
                }
                if (!merge) {
                    out.save(result.get(key));
                } else {
                    temp.save(result.get(key));
                }
            });

            if (merge) {
                out.merge(temp);
            }

            if (callback) {
                callback(out);
            }

            return true;
        };

    };

    /**
     * A factory pattern implementation for Collection objects
     * @public
     * @constructor
     * @class {CollectionFactory}
     * @returns {Void}
     */
    Scule.db.classes.CollectionFactory = function() {

        /**
         * @private
         * @type {HashTable}
         */
        this.collections = Scule.getHashTable();

        /**
         * Instantiates and returns a collection corresponding to the provided name and reading from the provided storage engine.
         * If no storage engine is provided the MemoryStorageEngine is selected by default.
         * @public
         * @param {String} url the name of the collection to instantiate
         * @param {Object} configuration a configuration object
         * @returns {Collection}
         */
        this.getCollection = function(url, configuration) {
            if (this.collections.contains(url)) {
                return this.collections.get(url).c;
            }

            if (!configuration) {
                configuration = {
                    secret:'dummy'
                };
            }

            var parts = Scule.db.functions.parseCollectionURL(url);
            if (!(parts.plugin in Scule.db.plugins)) {
                throw parts.plugin + ' is not a registered Scule plugin';
            }

            if (!(parts.engine in Scule.db.engines)) {
                throw parts.engine + ' is nto a registered Scule storage engine';
            }

            var storage    = new Scule.db.engines[parts.engine](configuration);
            var collection = new Scule.db.plugins[parts.plugin](parts.name);
            collection.setStorageEngine(storage);
            collection.open();

            this.collections.put(url, {
                c: collection,
                t: (new Date()).getTime()
            });

            return this.collections.get(url).c;
        };

    };

    /**
     * Prints a debug message to the console, conditionally based on the debug settings for the module
     * @public
     * @param {String} message the message to log to the console
     * @returns {Void}
     */
    Scule.db.functions.debug = function(message) {
        if (Scule.db.variables.debug === true) {
            console.log(message);
        }
    };

    /**
     * "Unflattens" an object - that is, when invoked on a Scule Object, this function will
     * inject the required object instances to represent embedded types such as ObjectId, ObjectDate, and DBRef
     * @public
     * @param {Object} object the object to unflatten
     * @returns {Void}
     */
    Scule.db.functions.unflattenObject = function(object) {
        var u = function(object) {
            if (Scule.global.functions.isScalar(object)) {
                return;
            }
            for (var key in object) {
                if(object.hasOwnProperty(key)) {
                    var o = object[key];
                    if (!Scule.global.functions.isScalar(o) && ('$type' in object[key])) {
                        switch(o.$type) {
                            case 'date':
                                object[key] = new Scule.db.classes.ObjectDate(o.sec, o.usec);
                                object[key].ts = o.ts;
                                break;

                            case 'id':
                                object[key] = new Scule.db.classes.ObjectId(o.id);
                                break;

                            case 'dbref':
                                object[key] = new Scule.db.classes.DBRef(o.ref, o.id);
                                break;
                        }
                    } else {
                        u(o);
                    }
                }
            }
        };
        u(object);
        if (!(Scule.global.constants.ID_FIELD in object)) {
            object[Scule.global.constants.ID_FIELD] = new Scule.db.classes.ObjectId();
        }
    };

    /**
     * Parses a collection connect url and returns the required pieces
     * @public
     * @param {String} url the url to parse, should be in the format collection_engine+storage_engine://collection_name (e.g. scule+dummy://test)
     * @returns {Object}
     * @throws {Exception}
     */
    Scule.db.functions.parseCollectionURL = function(url) {
        var matches = url.match(/^([^\+]*)\+([^\/]*)\:\/\/(.*)/);
        if (!matches || matches.length != 4) {
            throw url + ' is an invalid collection url';
        }
        return {
            plugin:matches[1],
            engine:matches[2],
            name:  matches[3]
        };    
    };

    /**
     * @public
     * @type Function
     */
    Scule.db.objects.core.collections.factory = new Scule.db.classes.CollectionFactory();

    /**
     * Sets a flag signifying whether or not to log console debug output
     * @param {Boolean} semaphor the flag signifying whether or not to log console debug output
     * @returns {Void}
     */
    Scule.debug = function(semaphor) {
        Scule.db.variables.debug = semaphor;
    };

    /**
     * Registers a storage engine with Scule - throws an exception if an engine with the same name
     * is already registered
     * @param {String} name a unique string name identifying the storage engine class
     * @param {StorageEngine} engine the storage engine class to register
     * @returns {Void}
     */
    Scule.registerStorageEngine = function(name, engine) {
        if (name in Scule.db.engines) {
            throw name + ' storage engine is already registered';
        }
        Scule.db.engines[name] = engine;
    };

    /**
     * Registers a collection plugin with Scule - throws an exception if a plugin with
     * the same name is already registered
     * @param {String} name a unique string name identifying the collection plugin class
     * @param {Collection} plugin the collection class to register
     * @returns {Void}
     */
    Scule.registerCollectionPlugin = function(name, plugin) {
        if (name in Scule.db.plugins) {
            throw name + ' collection plugin is already registered';
        }
        Scule.db.plugins[name] = plugin;
    };

    /**
     * Register default collection plugin and storage engines
     */
    (function() {
        Scule.registerStorageEngine('memory', Scule.db.classes.MemoryStorageEngine);
        Scule.registerStorageEngine('dummy', Scule.db.classes.DummyStorageEngine);
        Scule.registerStorageEngine('local', Scule.db.classes.LocalStorageStorageEngine);
        Scule.registerCollectionPlugin('scule', Scule.db.classes.Collection);    
    }());

    /**
     * Creates a new Collection instance corresponding to the provided name and using the provided storage engine
     * @param {String} name the name of the collection to load
     * @returns {Collection}
     * @throws {Exception}
     */
    Scule.factoryCollection = function(name) {
        return Scule.db.objects.core.collections.factory.getCollection(name);
    };

    /**
     * Clears all collections
     * @returns {Void}
     */
    Scule.dropAll = function() {
        Scule.db.objects.core.collections.factory.collections.clear();
    };

    /**
     * Returns an instance of the {Index} class
     * @returns {Index}
     */
    Scule.getIndex = function() {
        return new Scule.db.classes.Index();
    };

    /**
     * Returns an instance of the {HashTableIndex} class
     * @param {Number} threshold
     * @returns {HashTableIndex}
     */
    Scule.getHashTableIndex = function(threshold) {
        return new Scule.db.classes.HashTableIndex(threshold);
    };

    /**
     * Returns an instance of the {BPlusTreeIndex} class
     * @param {Number} threshold
     * @returns {BPlusTreeIndex}
     */
    Scule.getBPlusTreeIndex = function(threshold) {
        return new Scule.db.classes.BPlusTreeIndex(threshold);
    };

    /**
     * Returns an instance of the {ObjectId} class
     * @param {String} id
     * @returns {ObjectId}
     */
    Scule.getObjectId = function(id) {
        return new Scule.db.classes.ObjectId(id);
    };

    /**
     * Returns an instance of the {ObjectDate} class
     * @param {Number} sec
     * @param {Number} usec
     * @returns {ObjectDate}
     */
    Scule.getObjectDate = function(sec, usec) {
        return new Scule.db.classes.ObjectDate(sec, usec);
    };

    /**
     * Returns an instance of the {DBRef} class
     * @param {String} ref the collection connector string for the referenced collection
     * @param {String|ObjectId} id the identifier of the object to reference
     * @returns {DBRef}
     */
    Scule.getDBRef = function(ref, id) {
        return new Scule.db.classes.DBRef(ref, id);
    };

    /**
     * Returns an instance of the {MemoryStorageEngine} class
     * @param {Object} configuration
     * @returns {MemoryStorageEngine}
     */
    Scule.getMemoryStorageEngine = function(configuration) {
        return new Scule.db.classes.MemoryStorageEngine(configuration);
    };

    /**
     * Returns an instance of the {LocalStorageDiskStorageEngine} class
     * @param {Object} configuration
     * @returns {LocalStorageDiskStorageEngine}
     */
    Scule.getLocalStorageDiskStorageEngine = function(configuration) {
        return new Scule.db.classes.LocalStorageDiskStorageEngine(configuration);    
    };

    /**
     * Returns an instance of the {SimpleCryptographyProvider} class
     * @return {SimpleCryptographyProvider}
     */
    Scule.getSimpleCryptographyProvider = function() {
        return new Scule.db.classes.SimpleCryptographyProvider();
    };

    /**
     * Returns an instance of the {BPlusHashingTree} class
     * @param {Number} order
     * @param {Number} threshold
     * @returns {BPlusHashingTree}
     */
    Scule.getBPlusHashingTree = function(order, threshold) {
        return new Scule.db.classes.BPlusHashingTree(order, threshold);
    };

    /**
     * Returns an instance of the {HashBucketTable} class
     * @returns {HashBucketTable}
     */
    Scule.getHashBucketTable = function() {
        return new Scule.db.classes.HashBucketTable();
    };   
    
}());