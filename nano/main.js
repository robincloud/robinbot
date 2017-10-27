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
 * Main Node Application
 * 
 * Author : DU Jung <coolxeni@gmail.com>
 * 
 * - usage: node main.js -h <api-host-type>
 * @api-host-type : r - real server api., q - qa server, d - dev server.
 *
 * ex) node main.js -h r   => running for real server.
 * 
 **/
////////////////////////////
// Global Config
////////////////////////////

//! load common file
var c = require("./common.js");

//! Load main script.
var f = require('./core/myfetcher.js'),
    r = require('./core/myutils.js'),
    t = require('./sample/mytask.js');


/////////////////////////////////////////////////////////////
// MAIN WORK.............
(function(_){
	//! Helper functions.
	var _log = _._log;        // log into console
	var _inf = _._inf;        // log info into log-server

	//! configurations.
	var debug   = get_run_param('d', false);               // debug mode.
	var host    = get_run_param('h', 'h');
	var simul   = get_run_param('s', false);
	var level   = get_run_param('l');
	var next    = get_run_param('n', 1 ? 0 : 54);           // 시작 위치를 0으로 한다.

	// configuration.
	if(1)
	{
		//! parse boolean parameters. true/false, or 0/1
		function parse_boolean(val){
			if(typeof val == 'string'){
				val = val.toLowerCase();
				if(val == 'true' || val == 'y') return true;
				if(val == 'false' || val == 'n') return false;
				val = parseInt(val);
				return val ? true : false;
			} else {
				return val ? true : false;
			}
		}
		// parse boolean.
		debug = parse_boolean(debug);
		simul = parse_boolean(simul);

		// configure API
		// _.API.set_debug(debug);
		// _.API.set_host(host);
		// _.API.set_simul(simul);
		// _.API.set_level(level);
	}

	// headers.
	var version = '0.1.0';
	var _MOD = 'version:'+version+', module:'+get_mod_name();
	// _log(_MOD +', host:'+(_.API.host())+', level='+level + (_.API.is_simul()?', simul=true':'') + ', next='+next);

	// handler for events.
	MyFetcher.on('start',   function(){_log('>>> node started >>> '+_MOD)});
	MyFetcher.on('end',     function(){_log('<<< node finished <<< '+_MOD)});

	if(1){
		//! next task to run.
		next = next ? parseInt(next) : 0;

		//! get running parameter.
		if(next)
		{
			var mid     = get_run_param('mid',     '');
			if(mid && typeof T[next]._mid != 'undefined'){
				_log('mid := '+mid);
				T[next]._mid  = mid;
			}
			var cat_id  = get_run_param('cat_id',  '');
			if(cat_id && typeof T[next]._cat_id != 'undefined'){
				_log('cat_id := '+cat_id);
				T[next]._cat_id = cat_id;
			}
			var pkey    = get_run_param('pkey',     '');
			if(pkey && typeof T[next]._pkey != 'undefined'){
				_log('pkey := '+pkey);
				T[next]._pkey = pkey;
			}
		}

		//! 이건 디버깅 목적으로 사용할때..
		var is_use_debug_mode = false;

		//! loading initial cookie setting.
		if (is_use_debug_mode && next) {
			//! pre-condition..
			//var cookies = "NNB=QRZREIAAMJZFO; npic=XEP5e/gRFOF4JLQUAGu69CJhzVOSTl/ZqQghyeY2bDB1IZDFUUAX7sQ1XZS61cm3CA==; page_uid=S35ABwpl8hKss57gG6ZsssssstZ-285570; sus_val=K5Xro/mGrXxXZS8EnS8o+Q==; JSESSIONID=66FE017FFDD8EDC811991323FD2A1FB6; spsch_vt=list";
			var cookies = 'npic=kF8YolkmgX7GqSNCXpJw0XgstoNW8kfQwLLzkARHsf/FTllXK30PKMAlfXXfBaWtCA==; NNB=OUDM6GJN3WIVO; page_uid=SH8E7dpl8UKssK1hMGZssssssss-397422; sus_val=ZmWhL64ZI73iXsjnnQsPxw==; JSESSIONID=9BE2FEA98F3F65BDE9D50F38D0EA3CB6; spsch_vt=list';
			cookies = cookies.split("; ");
			for (i in cookies) {
				var c = cookies[i];
				var x = c.indexOf('=');
				var k = c.substr(0, x), v = c.substr(x + 1);
				_.set_cookie('naver.com', k, v);
			}
		}

		//! override reload for nodejs.
		MyFetcher.reload = function(){
			_log("================== reload() handler...");
            setTimeout(function(){
                process.exit();
            }, 1000);
		};

		// only for debug situation. run directly.
		if(is_use_debug_mode && (host == 'd' || host == 'l')) {
			T[next].callback = function () {
				return -1;      // EOF
			};
			// setup 1st task.
			if (next) MyFetcher.run_1st = next;
		} else {
			T[0].callback = function () {
				return -1;      // EOF
			};
			if(next) T[0].set_next(next);
		}

		//! start tasks.
		MyFetcher.run();
	}
})($._);
