/**
 * Copyright (c) 2015-2017, DU Jung <coolxeni@gmail.com>
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * The names of any contributors may not be used to endorse or promote
 *       products derived from this software without specific prior written
 *       permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDERS AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 *                                   *   *   *
 *
 * Common Functions and Packing Utilities.
 * 
 * Author : DU Jung <coolxeni@gmail.com>
 */
// root instance.
var _root = typeof global != 'undefined' ? global : window;		// global for node, window for browser.

////////////////////////////////////////////////////////////////////////////////////
// Simple Util Function Extension.
(function(root){
	// search global instance.
	var $ = root && root.$;
	var _ = $ && $._;

	if (!$) throw new Error('$ is required!');
	if (!_) throw new Error('_ is required!');

	//////////////////////////////////////////////////
	// Basic Log Function.
	var _log = function(){_.debug.apply(console, arguments);};
	var _err = function(){_.error.apply(console, arguments);};
	var _inf = function(){_.info.apply(console, arguments);};

	//////////////////////////////////////////////////
	// Function Definitions.
	var thiz = this;

	//////////////////////////////////////////////////
	// define public exports.
	thiz.name = 'robin-utils';
	thiz.log = _log;
	thiz.err = _err;
	thiz.inf = _inf;
	thiz.ts = _ts;
	thiz.dt = _dt;
	thiz.now = _dt;
	thiz.escape = _escape;
	thiz.N = _N;
	thiz.parse_price = _parse_price;

	thiz.isset = function(x){return x === undefined ? false : true;}
	thiz.empty = function(x){return x ? false : true;}
	thiz.min = function(a,b){return a<b ? a : b;}
	thiz.max = function(a,b){return a>b ? a : b;}
	thiz.round = function(a){return Math.round(a)}

	//////////////////////////////////////////////////
	// Function Definitions.

	// timestamp value.
	function _ts(d){
		var dt = d || new Date();
		var y = dt.getFullYear();
		var m = dt.getMonth() + 1; //Months are zero based
		var d = dt.getDate();

		var h = dt.getHours();
		var i = dt.getMinutes();
		var s = dt.getSeconds();

		var ret = (y < 10 ? "0" : "") + y + "-" + (m < 10 ? "0" : "") + m + "-" + (d < 10 ? "0" : "") + d + " "
			+ (h < 10 ? "0" : "") + h + ":" + (i < 10 ? "0" : "") + i + ":" + (s < 10 ? "0" : "") + s;
		return ret;
	};

	// parse timestamp to date.
	function _dt(ts){
		ts = ts || _ts();
		var aa = ts.split(' ');
		var dd = aa[0].split('-');
		var hh = aa[1].split(':');
		var y = parseInt(dd[0]), m = parseInt(dd[1]) - 1, d = parseInt(dd[2]);
		var h = parseInt(hh[0]), i = parseInt(hh[1]), s = parseInt(hh[2]);
		//! additional function: add_seconds()
		if(!Date.prototype.add_seconds){
			Date.prototype.add_seconds = function(dx){
				this.setSeconds(this.getSeconds() + dx);
			}
		}
		//! format to time-stamp.
		if(!Date.prototype.ts){
			Date.prototype.ts = function(){
				return _ts(this);
			}
		}
		var dt = new Date(y, m, d, h, i, s, 0);
		return dt;
	}

	// convert to integer.
	function isInteger(x) {return (typeof x === 'number') && (x % 1 === 0);}

	// escape string for mysql.
	function _escape (str, urldecode){
		if(str === undefined) return 'NULL';
		if(isInteger(str)) return str;
		str = ''+str;
		str = str.replace(/\\/g, "\\\\")
			.replace(/\$/g, "\\$")
			.replace(/'/g, "\\'")
			.replace(/"/g, "\\\"");

		if(urldecode){
			// url-decode
			str = decodeURI(str);
		}
		return "'"+str+"'";
	}

	// parse integer.
	function _N (x, def){try{
		if(x === '' || x === undefined || x === null) return def;
		if((typeof x === 'number') && (x % 1 === 0)) return x;
		if(typeof x == 'number') return parseInt(x);
		return parseInt((''+x).replace(/,/ig, '').trim())
	} catch(e){
		_err('err at _N: x='+x+';'+(typeof x)+';'+(e.message||''), e);
		//console.error(e);
		return def;
	}}

	// price parsing.
	function _parse_price(cv){
        if((typeof cv === 'number') && (cv % 1 === 0)) return cv;
		cv = String(cv).replace(/ /g, '');
		var a = cv.substr(0,1), b = cv.substr(-1,1);
		if(a == '₩' || a == '$') cv = cv.substr(1, cv.length);
		if(a == '(' && b == ')') cv = cv.substr(1, cv.length-2);
		if(a == '[' && b == ']') cv = cv.substr(1, cv.length-2);
		if(cv.substr(-1) == "원") cv = cv.substr(0, cv.length-1);
		if(cv.substr(-1) == "개") cv = cv.substr(0, cv.length-1);
		if(cv.substr(0,2) == '무료') cv = '0';
		if(cv.substr(0,2) == '착불') cv = '3,000';
		return cv;
	}

	// register self as 'R'
	if(_) _.R = thiz;

	return thiz;
})(_root);

