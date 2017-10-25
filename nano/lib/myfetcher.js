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
 * Remote Fetch Module based on Http Protocol. 
 * 
 * Author : DU Jung <coolxeni@gmail.com>
 */
// root instance.
var _root = (typeof global != 'undefined' ? global : window);		// global for node, window for browser.

////////////////////////////////////////////////////////////////////////////////////
// initialize this module.
(function(root){
	// configuration
	var _CONF_DBG_COOKIE = 0;				// debug config for cookie-handler.
	
	// global instance.
	var $ = typeof root.$ != 'undefined' ? root.$ : (root.$=function(){});
	var _ = typeof $._ != 'undefined' ? $._ : ($._ = (typeof root._ != 'undefined' ? root._ : function(){}));		// node use '_' as special purpose of saving last-result.
	
	// initialize the required function.
	if (typeof $.toJSON == 'undefined'){
        $.toJSON = typeof JSON != 'undefined' ? JSON.stringify : function(){console.log("ERR! - no JSON!")};
	}
	if (typeof $.extend == 'undefined'){
        $.extend = function(a, b){for(i in b){a[i] = b[i]}; return a;};
	}
	if (typeof $.each == 'undefined'){
        $.each = function(o, cb){for(i in o){cb(i, o[i]);}};
	}
	if (typeof $.ajax == 'undefined'){
        $.ajax = function(a, b){console.log('WARN! - NO IMPLEMENTED AJAX!')};
	}

	// root location.
	var location = typeof root.location != 'undefined' ? root.location : (root.location={host:'robin', search:'auto-run=true', href:'', hash:'', reload:function(){}});
	var url_root = 'http://'+location.host+'';

	// format next number. (DDD)
	var _FN = function(n){
		return typeof n != 'number' ? ' '+n+' ' : (n < 0 ? ' ' : n < 10 ? '  ' : n < 100 ? ' ' : '') + n;
	}

	/**
	* Instance: MyDbg
	* Description: logging debug/info/error message into server.
	*/
	var MyDbg = (function(){
		function _MyDbg(){};
		var mydbg = MyDbg||new _MyDbg();
		mydbg.id = "dbg";
		mydbg.version = "2.0.0";
		
		var dummy_log = function(args,t){
			if(typeof console != 'undefined') {
				if(true) {
					if(!Array.isArray(args)){
						args = Array.prototype.slice.call(args);
					}
					if(t) args.unshift(t);
					args.unshift(_ts());
				}
				if(t == 'E'){
					console.error.apply(console, args);
				} else {
					console.log.apply(console, args);
				}
			}
			return true;
		};
		var _log = {'debug':dummy_log, 'info': dummy_log, 'error': dummy_log};

		//! logging into server.
		var _log_push = function(level, args, ns){
			args = args||[];
			args = args.map(function(a){return typeof a == 'object' ? JSON.stringify(a) : a});
			var m = 1 ? args.join(' ') : args&&args[0]||'N/A';
			return $.ajax({
				type:'POST', async:true, dataType:"json", gzip:true,
				url: url_root+'/ajax_rb-log4j.php?db=off&call=log4js',
				data:{ns:ns||'main', message:m, level:level}
			});
		};

		// log initializer.
		var log_inited = (function(ns){
			if(log_inited) return true;
			var my_conv_args = function(args){return !Array.isArray(args) ? Array.prototype.slice.call(args) : args};
			_log.info  = function(args){_log_push('INFO'  ,1 ? args : my_conv_args(arguments));};
			_log.error = function(args){_log_push('ERROR' ,1 ? args : my_conv_args(arguments));};
			return true;
		})();
		
		// timestamp value.
		var _ts = function(){
			var dt = new Date();
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

		var log_data = function(data, addToRes){
			data = data ? data : "";
			addToRes = typeof addToRes != 'undefined' ? addToRes : true;
			$("#txtRes").val(data);
			if (addToRes){
				var html = "<div>"+MyDbg.ts()+" - "+data.replace(/</ig,'&lt;')+"</div>";
				var $div = $("#divRes");
				$div.append(html);
				var height = $div[0].scrollHeight;
				$div.scrollTop(height);
			}
		};
		
		var log_res = function(data, is_html){
			if (true){
				var html = "<div>"+MyDbg.ts()+" - "+(is_html ? data : data.replace(/</ig,'&lt;'))+"</div>";
				var $div = $("#divRes");
				$div.append(html);
				var height = $div[0].scrollHeight;
				$div.scrollTop(height);
			}
		};
		
		//! plug-in log handler..
		mydbg.log   = function(){dummy_log(arguments); return this;};
		//mydbg.debug = function(m){dummy_log('D:'+m)&&_log.debug(m); return this;};
		mydbg.debug = function(){dummy_log(arguments); return this;};
		mydbg.info  = function(){dummy_log(arguments,'I') && _log.info(arguments); return this;};
		mydbg.error = function(){dummy_log(arguments,'E') && _log.error(arguments); return this;};
		mydbg.set_log_push = function(fx){_log_push = fx;};         // override log-push handler.
		mydbg.ts	= _ts;
		
		//! extends _ with logging feature.
		if (typeof $ != 'undefined'
			&& typeof _ != 'undefined'
			&& typeof $.extend != 'undefined'){
			//dummy_log('> extend _');
			$.extend(_, mydbg);
		}
		
		//! return instance.
		return mydbg;
	})();
	
	function crc32(s /*, polynomial = 0x04C11DB7, initialValue = 0xFFFFFFFF, finalXORValue = 0xFFFFFFFF*/ ) {
		s = String(s);
		var polynomial = arguments.length < 2 ? 0x04C11DB7 : arguments[1],
			initialValue = arguments.length < 3 ? 0xFFFFFFFF : arguments[2],
			finalXORValue = arguments.length < 4 ? 0xFFFFFFFF : arguments[3],
			crc = initialValue,
			table = [],
			i, j, c;
	
		function reverse(x, n) {
			var b = 0;
			while (n) {
				b = b * 2 + x % 2;
				x /= 2;
				x -= x % 1;
				n--;
			}
			return b;
		}
	
		for (i = 255; i >= 0; i--) {
			c = reverse(i, 32);
	
			for (j = 0; j < 8; j++) {
				c = ((c * 2) ^ (((c >>> 31) % 2) * polynomial)) >>> 0;
			}
	
			table[i] = reverse(c, 32);
		}
	
		for (i = 0; i < s.length; i++) {
			c = s.charCodeAt(i);
			if (c > 255) {
				throw new RangeError();
			}
			j = (crc % 256) ^ c;
			crc = ((crc / 256) ^ table[j]) >>> 0;
		}
	
		return (crc ^ finalXORValue) >>> 0;
	}
	
	/**
	* Object: MyFetcher
	*/
	var MyFetcher = (function($){
		function _MyFetcher(){};
		var myfet = new _MyFetcher();
		//////////////////////////////////////////////
		// Member Variables.
		me = $.extend(myfet, {
			id : "F",
			name : "fetch",
			version : "2.1.1",
			count : 0,
			tasks : [],
			run_1st : 0			// 1st fun point.
		});
		
		// some helper functions.
		var ajax_url = url_root+'/ajax_rb.php?debug=off&call=';
		var _log = function(m,e){
			// var args = !Array.isArray(arguments) ? Array.prototype.slice.call(arguments) : arguments;
			// args.unshift(me.id+":");
			// MyDbg.debug.apply(MyDbg, args);
			if(e === undefined) MyDbg.debug(m)
			else MyDbg.debug(m, e);
		};
		var _err = function(m, e){
			//var args = !Array.isArray(arguments) ? Array.prototype.slice.call(arguments) : arguments;
			//args.unshift(me.id+":");
			//console.log('_err:', args);
			//MyDbg.error.apply(MyDbg, args);
			//MyDbg.error.apply(MyDbg, args);
			if(e === undefined) MyDbg.error(m)
			else MyDbg.error(m, e);
		};

		// member functions...
		var get_param = function(name, defval){
			var re = (new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search);
			if(re)
				return decodeURIComponent(re[1]);
			return defval;
		};
		me.get_param = get_param;
		
		var is_auto = function(){
			var isAutoRun = get_param("auto-run");
			isAutoRun = isAutoRun == "true" ? true : false;
			return isAutoRun;
		};
		me.is_auto = is_auto;
		
		var on_load = function(){
			if (is_auto()) {
				$('#txtRes').css('display','none');
				myfet.run();
			}
		};
		me.on_load = on_load;
		
		var reload = function(isAutoRun){		// reload the current page with auto-run parameter option.
			_log("> reload(isAutoRun="+isAutoRun+") : "+location);
			var param = isAutoRun ? "auto-run=true" : "";
			var is_reload = true;
			if(("?"+param) != location.search){
				is_reload = false;
			}
			var hash = location.hash;
			if(hash != '' && hash != '#') param = param + hash;
			location.href = '?' + param;
			if(is_reload){
				location.reload();
			}
		};
		me.reload = reload;
		
		var restart = function(){
			_err("WARN! - will reload in 5 sec");
			var thiz = me;
			setTimeout(function(){
				thiz.reload(true);	// reload whole page
			}, 5000);
		};
		me.restart = restart;

		//////////////////////////////////////////////
		// NEXT TASK.
		var _next_task = [];		// if shift next-task, then run it later..
		var push_next_task = function(next, curr_task){
			//_log('push_next_task('+next+')...');
			if (typeof next != 'number') {
                throw ('number is required - next='+next);
            }
			var next_task = get_task(next);
			if (next_task) {
				// register curr_task as prev_task of next_task.
				next_task.prev_task = curr_task ? curr_task : null;
				next_task.prev   	= curr_task ? curr_task.id : -1;
				_next_task.push(next);
            } else {
				_err('WARN! - no task for next-id='+next);
			}
		};
		var run_next_task = function(){
			var tid = _next_task.shift();
			if (typeof tid != 'undefined') {
				//_log('run_next_task() -> '+tid);
                main(tid);
            }
		};
		me.run_next_task = run_next_task;
		
		//////////////////////////////////////////////
		// TASK manager.
		var _inited = false;
		var pull_tasks = function(){return (typeof MyTask !='undefined' ? MyTask : T||me.tasks);};
		var init_task = function(force){
			if (!force && _inited) return true;
			me.tasks = pull_tasks();
			_next_task = [];		// clear old.
			return (_inited=true);
		};
		var get_task = function(i){
			if(typeof i == 'undefined') throw 'task-id is required!';
			//var t = me.tasks[i < 0 ? 0 : i];
			var t = me.tasks[i];
			if(t == null){
				t = {id:i, name:'dummy', enter:function(){}, finish:function(){}, next:-1};
			}
			return t;
		};
		me.get_task = get_task;
		
		var get_next_id = function(t){
			if (typeof t.next == 'function'){
				return t.next();
			} else {
				return t.next;
			}
		};
		
		//////////////////////////////////////////////
		// Fectch Functions with callback support....
		var fetch_new = function(t){
			//_log('fetch_new(task:'+t.name+')...');
			var fx = function run(a,b){
				a = a||function(data, res){fx.on_fetch(data, res)};
				return fetch_remote.apply(fx, [a,b]);
			};
			fx._task = t;				// fetch target-task.
			fx._fetch_url = '';			// fetch target url
			fx._fetch_method = 'GET';	// fetch method
			fx._fetch_param = '';		// fetch request parameter {method:GET|POST, headers:[], cookies:{}}.
			fx._fetch_data = '';		// fetch request data {''}.
			fx._fetch_json = null;		// fetch request data {''}.
			fx._fetch_result = {};		// fetch result including response headers {result:'', headers:[], body:{}}.
			fx.on_fetch = function(data, res){
				_log("> WARN! on_fetch()!! OVERRIDE THIS!!! ");
			};
			fx.set_url = function(url){
				//$(".fetch_url").text(url);
				fx._fetch_url = url;
			};
			fx.set_method = function(method){
				//$(".fetch_method").text(method);
				fx._fetch_method = method;
			};
			fx.set_param = function(param){		// json request parameters (headers + cookies)
				fx._fetch_param = param;
			};
			fx.set_data = function(data){		// the payload to send.
				fx._fetch_data = data;
			};
			fx.set_json = function(json){		// the payload to send.
				fx._fetch_json = json;
			};
			return fx;
		};
		
		//! fetch remote url data.
		var fetch_remote = function(_callback, async){
			//_log("fetch_remote(cb, async)...");
			async=typeof async != 'undefined'?async:true;
			var thiz = this;
			// pack request param.
			var param = thiz._fetch_param;
			var data = {
				url: thiz._fetch_url,
				method: thiz._fetch_method,
				param: (typeof param == "object" ? $.toJSON(param) : ""+param)
			};
			//console.log("param="+data.param);
			$.ajax({
				type: 'POST', url: ajax_url+"fetch_url2",
				async: async, dataType: "json", data: data,
				error: function(jqXHR, textStatus, errorThrown) {
					var msg = '';
					if (jqXHR && typeof jqXHR.status != 'undefined') {
                        msg = jqXHR.status + ":" + jqXHR.statusText;
                    } else {
						msg = jqXHR;
					}
					_err(">ERR! " + msg +", url:"+data.url+", " + textStatus + ", " + errorThrown);
					thiz._fetch_result = {result:'ERROR', xhr:jqXHR, status:textStatus, error:errorThrown};
					if(_callback) _callback(false);
				},
				success: function (data ,status) {
					var body = data.text||data.body||"";
					//_log("> status:"+ status+", runtime:"+ data.runtime+", body.len:"+ body.length);
					thiz._fetch_result = {result:'OK', headers:[], body:body};
					if(_callback) _callback(body, data);
				}
			});
		};
		me.fetch = {					// register fetch function.
			set_call : function(f){
				fetch_remote = f;		// override fetch_remote function.
			},
			call : function(task, cb){
				_log('> fetch.call:'+task.name+', cb:'+cb);
				return fetch_remote.apply(task, cb);
			},
			user_agent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:50.0) Gecko/20100101 Firefox/50.0'
		};
		
		//! safe_call to prevent exception.
		var safe_call = function(t, nm, data, res){
			t = t||{};
			var ret = false;
			try{
				// save execute time.
				if (nm == 'enter') t.t0 = new Date();			// entry time.
				if (nm == 'finish') t.t1 = new Date();			// finished time.
				ret = t[nm] ? t[nm](data, res) : true;
				if (nm == 'finish') t.td = t.t1 - t.t0;			// time delta
			}catch(e){
				var vDebug = ""; 
				if(typeof e.lineNumber != 'undefined') vDebug += " line:"+e.lineNumber + "\n";
				if(typeof e.stack != 'undefined') vDebug += " stack:\n"+e.stack + "\n";
				//WARN! clear stack information.
				//e.stack = '';
				e = e.toString();

				// pack task into json.
				var tt = {};
				for(var k in t){
					var v = t[k];
					// if(k =='id' || k =='name') continue;
					if(k =='prev_task' || k =='nodes') continue;
					if(k =='t0' || k =='t1') continue;
					if(k =='next') continue;
					if(typeof v == 'function') continue;
					tt[k] = v;
				}
				var _TAG = "TASK["+(t.id||'')+":"+(t.name||'')+"]";
				_err("ERROR@ "+_TAG+" - " + e.toString() + (vDebug ? ':' + vDebug+'\n':'') + 'Task:', tt);
				//_err("ERROR@ "+_TAG+" - " + e.toString() + " =", tt);
				if(t.on_error !== undefined) ret = t.on_error(e, tt);
				//_err(e);
			}
			return ret;
		};
		
		// default watchdog 
		me.watchdog = {start:function(){_err("ERR! no body watchdog.start()")}, stop:function(){_err("ERR! no body watchdog.stop()")}};
		me.wait_count = -1;
		
		
		// event handler.
		var _event_handler = {'start':null, 'end':null};
		me.on = function(name, fx){
			_event_handler[name] = fx;
		};
		var fire_event = function(name){
			var fx = _event_handler[name];
			try {
                fx && fx();
            } catch(e) {
                _err(e);
            }
		};
		
		
		var run = function(next){
			//_log("run("+(next||0)+")...");
			var thiz = me;
			init_task();
			next = typeof next == 'undefined' ? thiz.run_1st : next;
			
			//var t0 = thiz.tasks[next];
			var t0 = get_task(next);
			var nm = t0.name;
			_log("#["+nm+"] Run! ("+location.search+") tasks.len=" + thiz.tasks.length, true);
						
			// event-fire.
			fire_event('start');
			
			thiz.watchdog.start();
			thiz.main(next);
		};
		me.run = run;
		
		var stop = function(){
			_log("stop()...");
			var thiz = me;
			thiz.watchdog.stop();
			// event-fire.
			fire_event('end');
		};
		me.stop = stop;
		
		// parse wait-count from url.
		var parse_wait_count = function(url){
			var aa = url.split(":");
			var sec = aa.length > 1 ? parseFloat(aa[1]) : 1;		// in second.
			var msec = (sec < 0.1 ? 0.1 : sec)*1000;
			
			var interval = typeof me.watchdog != 'undefined' ? me.watchdog.INTERVAL : 200;		// interval in mses.
			interval = interval < 1 ? 1 : interval;		// prevent zero-div.
			
			var wait_count = parseInt(msec/interval);
			return wait_count;
		}
		//me.parse_wait_count = parse_wait_count;
		
		//! main task jobs..
		var main = function(next){
			var thiz = me;
			var t = get_task(next);
			var prev = t&&t.prev||0;
			var nm = t&&t.name||'';
			var _TAG = "["+_FN(next)+"]:";
			if (next != prev) _log(_TAG + "TASK("+_FN(next)+" <- "+_FN(prev)+") ====== "+nm);

			var is_eof = false;

			// check next-id.
			if (next < 0){
				_log("["+next+"]:!!EOF - ERR NEXT ="+next);
				is_eof = true;
			}
			// check next-task is null
			else if (!t){
				_err("["+next+"]:!!EOF - NO TASK!!", true);
				is_eof = true;
			}
			// check next-task is invalid.
			else if (t && t.name == 'dummy'){
				_err("["+next+"]:!!EOF - DUMMY TASK ", true);
				is_eof = true;
			}

			// finish main if EOF
			if(is_eof){
				thiz.stop();
				return;
			}

			// clear watchdog timeout.
			thiz.watchdog();

			// call 'enter'
			var ok = safe_call(t, 'enter');
			//ok = typeof ok == 'undefined' ? true : ok;
			if(ok !== undefined && ok !== true) {   // there must be error.
				var fn = typeof ok == 'number' ? parseInt(ok) : get_next_id(t);
				//_err(_TAG + "> enter:"+t.name+" <"+(typeof ok)+">:"+ok+" "+(ok ? 'Y' : 'N'));
				//! do the next-task based on result.
				return thiz.main(fn, t);
			}

			// get url information.
			var url = t.url;
			var method = t.method||(t.data||t.json?'POST':'GET');     // 명시적으로 할거냐, 아니면 data에 따라서 method설정.
			var t_param = t.param||{};
			var t_data = t.data;
			var t_json = t.json;
			var protocol = "";
			if(t){
				url = url == null ? "" : url;
				var a = url.indexOf(":");
				a = a < 1 ? 4 : a;
				protocol = url.substring(0, a);
				if(protocol == 'wait') method = '-';
			}
			
			//! make new fetch worker for this task.
			var F = fetch_new(t);
			
			// update fetch handler.
			F.on_fetch = function(data, res){
				//_log('f.on_fetch('+data+', '+(res||'')+')...');
				var t = this._task;
				var ok = safe_call(t, 'finish', data, res);
				ok = typeof ok == 'undefined' ? true : ok;
				var fn = typeof ok == 'number' ? parseInt(ok) : get_next_id(t);
				if(typeof ok != 'number' && !ok) {
					_err(_TAG + "> finish-error-fetch:"+t.name+" <"+(typeof ok)+">:"+ok+" "+(ok ? 'Y' : 'N')+', time:'+t.td);
					if (is_auto()) {
                        thiz.restart();
                    }
                } else {
                	//! execute next-task.
					thiz.main(fn, t);
				}
			};

			//if (next != prev) _log(_TAG + "> url=" + url + ", protocol="+ protocol);
			if (next != prev) _log(_TAG + method + ' ' + url);

			//_log("> " + url);
			if (false && protocol == ""){
			//!PROTOCOL - WAIT 
			} else if (protocol == 'wait'){
				//! wait until timeout.
				var wait_watchdog = (function(thiz, f, wait_count){
					//_log('wait_watchdog('+f+', '+wait_count+')...');
					var $livewait = null;
					var t = f._task;
					// process wait function.
					var _fx_wait = function(){
						$livewait = $livewait || ($ ? $(".livewait") : {text:function(){}});		// reduce search time
						var sec = parseFloat(wait_count * thiz.watchdog.INTERVAL/1000);
						$livewait.text('wait:'+sec.toFixed(1));
						
						if (typeof t.wait_check != 'undefined'){
							if(!t.wait_check()){	// if got false, then exit wait.
								wait_count = 0;
							}
						}
						//- decrement wait-count until zero
						if(wait_count > 0){
							thiz.watchdog();		// watchdog clear.
							wait_count--;
						} else if(wait_count == 0){
							wait_count = -1;
							if(typeof f.on_fetch != 'undefined'){
								f.on_fetch("wait-timeout");
							}
						}
						
						if (wait_count >=0 ) {
							setTimeout(_fx_wait, thiz.watchdog.INTERVAL);
						}
					};
					_fx_wait();
					return true;
				})(thiz, F, parse_wait_count(url));
			
			//!PROTOCOL - HTTP
			} else if (protocol == 'http' || protocol == 'https') {
				F.set_method(method);
				F.set_url(url);
				F.set_param(t_param);
				F.set_data(t_data);          // data to send out in string or object(will be serialized).
				F.set_json(t_json);          // data to send out in object (will be JSON).
				F();
			
			//!PROTOCOL - ELSE
			} else {						// no real fetch job. so go directly next job.
				F.on_fetch();
			}
		};

		me.main = function(next, curr_task){		// just push into task-list.
			//_log('F.main('+next+')...');
			next = next == null ? 0 : next;
			push_next_task(next, curr_task);
		};
		
		//! run only the given task one-time.
		var run_task = function(next){
			var thiz = me;
			init_task();
			main(next);
		};
		me.run_task = run_task;

		//! returns self.
		return me;
	})($);
	
	//////////////////////////////////////////////
	// plugin : Watchdog..
	(function(thiz){
		// register self information.
		var id = 'W', name = 'watchdog';
		
		var TT = 50;	// time-tick in msec.
		
		// locals.
		var CONF_MAX_TTL = (60*1000/TT)		// max: 60 sec.
			,ttl = 1
			,INTERVAL = TT;					// watchdog - interval
			
		var _log = function(m){MyDbg.debug(name+":"+m);};
		var _err = function(m){MyDbg.error(name+":"+m);};
		
		var $livewait = null;
		var $watchdog = null;
		
		var watchdog_timer = -1;
		var watchdog_start = function(is_stop){
			// _log("watchdog_start("+(is_stop  ? "STOP" : "")+")...");
			$("#btnRun").text(!is_stop ? "Stop" : "Run");
			if (watchdog_timer != -1){
				// _log("> clearWatchdog: id="+watchdog_timer);
				clearInterval(watchdog_timer);
				watchdog_timer = -1;
			}
			if(!is_stop){
				ttl = CONF_MAX_TTL;	// reset-watchdog count.
				watchdog_timer = setInterval(function(){watchdog(true)}, INTERVAL);
				// _log("> watchdog started: id="+watchdog_timer+", INTERVAL="+INTERVAL);
			}
		};
		var watchdog_stop = function(){
			// _log("> watchdog_stop()...");
			watchdog_start(true);
		};
		
		// default: on_timeout handler.
		var watchdog_on_timeout = function(){
			_err("WARN! - watchdog_on_timeout()...");
			thiz.restart();	// reload whole page
		};
		
		// should call if to refresh watch-dog counter.
		var watchdog = function(is_from_timer){
			//_log("watchdog("+(is_from_timer ? "Y" : "")+")....");
			var is_dec = true;
			if (!is_from_timer) {		// reset-watchdog count.
				ttl = CONF_MAX_TTL;
			}
			
			// trigger next-task run.
			if (is_from_timer) thiz.run_next_task();
	
			var t = is_dec ? ttl-- : ttl;
			var watchdog_cnt =  (watchdog_cnt + 1) % 8;
			var c = "-\\|/-\\|/".charAt(watchdog_cnt);
			$watchdog = $watchdog || ($ ? $(".watchdog") : {text:function(){}});		// reduce search time
			$watchdog.text("[] " + c + " : " + t);
			if(t <= 0){
				watchdog.stop();
				watchdog.timeout();
			}
			// stop signal.
			return watchdog_timer != -1 ? true : false;
		};
		
		// exports
		watchdog.start = watchdog_start;
		watchdog.stop = watchdog_stop;
		watchdog.timeout = watchdog_on_timeout;
		watchdog.INTERVAL = INTERVAL;
		watchdog.MAX_TTL  = CONF_MAX_TTL;
		
		thiz['watchdog'] = watchdog;
		return watchdog;
	})(MyFetcher);
	
	//////////////////////////////////////////////
	// plugin : node http broker for fetch_remote()
	(function(F){
		// register self information.
		var id = '_NH', name = 'node-http';
		var _log = function(){
			var args = Array.prototype.slice.call(arguments);
			args.unshift(name+": ");
			return MyDbg.info.apply(MyDbg, args);
		};
		var _err = function(){
			var args = Array.prototype.slice.call(arguments);
			args.unshift(name+": ");
			return MyDbg.error.apply(MyDbg, args);
		};
		
		//! if not in node run mode, then do not register this.
		if (typeof require != 'function') {
			//_log('INFO - NO NODE FUNCTION - require()');
            return;
        }
		// load reqruied-modules.
        var http = require('http'), https = require('https'), cookie=null, URL = require('url');
		
		// safe-load for cookie module from node-modules.
		try {
            cookie = require('cookie');
        } catch(e) {
            cookie = require('../node/node_modules/cookie');
        }
		
        // parse set-cookie header
        var cookie_parse = function(setcookie) {
            if (!setcookie) return {};
            var ret = {};
            //var setcookies = ["page_uid=SXqS3soRR08sss0+Qrlssssssu4-141703; path=/; domain=.naver.com","_naver_usersession_=1cDqzpW/UUIh/07GzJpHZQ==; path=/; expires=Thu, 17-Mar-16 11:37:44 GMT; domain=.naver.com","nx_ssl=2; Domain=.naver.com; Path=/; Expires=Sat, 16-Apr-2016 11:32:44 GMT;"];
            for(var i in setcookie){
                var $c = cookie.parse(setcookie[i]);
                for (var K in $c) {
                    var V = $c[K];
                    var k = K.toLowerCase();
                    if(['domain', 'expires', 'path', 'secure', 'comment', 'max-age', 'version'].indexOf(k) >= 0) {
                    } else {
                        ret[K] = V;
                    }
                }
            }
            return ret;
        };

		/////////////////////////////////////////////////////////////////////////////////////////////
        // remote fetch function via http nodejs
		var my_fetch_remote = function(_callback){
			// _log("my_fetch_remote(cb)...");
            var thiz = this;
            
			// pack request param.
            var url = thiz._fetch_url;
			var param = thiz._fetch_param;
            var method = thiz._fetch_method;
            var data = thiz._fetch_json ? thiz._fetch_json : thiz._fetch_data;
			var data_type = thiz._fetch_json ? 'json' : '';

			// default parameters
			url = url || thiz.url;
			param = param || thiz.param;
			method = method || thiz.method || 'GET';

			if(url === undefined || !url)               throw new Error('url is required!');
			if(param === undefined || param == null)    throw new Error('param is required!');
			if(method === undefined || !method)         throw new Error('method is required!');

            // print
            // _log(`URL=${url} METHOD=${method} PARAM=${JSON.stringify(param)} TYPE:${data_type} DATA=`, data);
            
            // parse url
            var $url=URL.parse(url);
            var is_https = $url.protocol=='https:';
            $url.port = $url.port || (is_https ? 443 : 80);
            //_log('url=', $url);
			var is_encoding = false;

            // Headers. build-up header information.
            var $headers = {'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:49.0) Gecko/20100101 Firefox/49.0'};
            if(F.fetch && F.fetch.user_agent) $headers['User-Agent'] = F.fetch.user_agent;      // WARN! override default user-agent by param.
			// $headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:50.0) Gecko/20100101 Firefox/50.0';
            for (var k in param) {
                var v = param[k];
                if (k == 'cookies') {
	                var cookies = [];
	                for (var ck in v) {
		                var cv = v[ck] || '';
		                // replace ; character.
		                if (cv.indexOf(';')) cv = cv.replace(/;/ig, '%3B');
		                if (cv.indexOf(' ') > 0) cv = '"' + cv + '"';
		                cookies.push(ck + '=' + cv);
	                }
	                $headers['Cookie'] = cookies.join('; ');
                } else if (k == 'user_agent' || k == 'user-agent') {
	                $headers['User-Agent'] = v;
                } else if (k == 'encoding') {
	                is_encoding = v;
                } else {
                    var nm = k.charAt(0).toUpperCase() + k.substr(1);
                    $headers[nm] = v;
                }
            }
            //! delete Cookie header if empty.
			if(!$headers['Cookie']) delete $headers['Cookie'];
			_CONF_DBG_COOKIE && _log('#header.before =', $.toJSON($headers));
			if(data_type == 'json' && !($headers['content-type']||$headers['Content-Type'])) $headers['Content-Type'] = 'application/json';
			_CONF_DBG_COOKIE && _log('#header.after =', $.toJSON($headers));

            ///////////////////////////////////////////
            // HTTP REQUEST PATTERN
			//! http options.
            var options = {
                    hostname : $url.hostname,
                    port: $url.port,
                    path: $url.path,
                    method: method||'GET',
                    headers: $headers
            };
			var MAX_RETRY = 3;          // retry count if on error.
			if(data) options.data = data;
			if(is_encoding) options.encoding = null;         // see http://stackoverflow.com/questions/14855015/getting-binary-content-in-node-js-using-request
			_CONF_DBG_COOKIE && _log('#request.options=', options);

			function serialize(obj) {
				obj = obj||'';
				if(typeof obj != 'object') return ''+obj;
				var str = [];
				for(var p in obj)
					if (obj.hasOwnProperty(p)) {
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					}
				return str.join("&");
			}

			//! execute request.
			function _request(options, retried){
				options = options||{};
				retried = retried||1;

				//! clear default error.
				delete options.error;

				//! prepare request.
				var postData = options.data||'';
				delete options.data;            // remove data.
				var agent = (is_https ? https : http);
				var req = agent.request(options, function(res){
					// no log if success..
					var is_log = (res.statusCode != 200 && res.statusCode != 302 );
					is_log && _log("URL: " + options.method + ' ' + options.hostname+':'+options.port + ' ' + options.path);
					is_log && _log("STATUS: " + res.statusCode);
					is_log && _log("HEADERS: " + JSON.stringify(res.headers));
					if(!is_encoding) res.setEncoding('utf8');

					// compartible with RobinRobot.class.php
					var headers = res.headers;
					var cookies = {};
					var encoding = '';      //TODO - encoding
					var charset = '';       //TODO - charset
					var content = '';       //TODO - content
					var info = {'http_code':res.statusCode, 'redirect_url':'', 'url':url};

					// parse res-headers.
					is_log && _log('<res.header>');
					for(hn in res.headers){
						var hv = res.headers[hn];
						hn = hn.toLowerCase();
						if (hn == 'set-cookie') {
							cookies = cookie_parse(hv);
						} else if (hn == 'content-length' || hn == 'content-language') {
							//} else if (hn == 'content-type') {
							//	//TODO:XENI - do parse content-type.
							// is_log && _log(' <'+(typeof hv)+'>'+hn+' : '+hv);
						} else if (hn == 'connection' || hn == 'server'  || hn == 'pragma' || hn == 'transfer-encoding') {
							// is_log && _log(' <'+(typeof hv)+'>'+hn+' : '+hv);
						} else if (hn == 'expires') {
						} else if (hn == 'date' || hn == 'age' || hn == 'last-modified') {
						} else if (hn == 'cache-control' || hn == 'vary') {
						} else if (hn == 'location') {
							info['redirect_url'] = hv;
						} else {
							is_log && _log(' <'+(typeof hv)+'>'+hn+' : '+hv);
						}
					}
					is_log && _log('</res.header>');

					var body = '';
					res.on('data', function(d) {
						//_log('>> data: d.len='+d.length);
						body += !is_encoding ? d : $.encoding.convert(d);;
					});
					res.on('end', function() {
						//_log('>> end: body.len='+body.length);
						var fetch_result = {result:'OK', headers:[], body:body, cookies:cookies, info:info};
						if(options.error){
							fetch_result.result = 'ERROR';
							fetch_result.error = options.error;
							_err('ERR! Header['+retried+'/'+MAX_RETRY+'] - ' + JSON.stringify(res.headers));
							_log(body);         // body is so big.
							//! retry again.
							if(retried < MAX_RETRY){
								_err('ERR! retry request :'+(retried+1)+'/'+MAX_RETRY);
								setTimeout(function(){
									_request(options, retried+1);
								}, 800);
								return;
							}
						}
						thiz._fetch_result = fetch_result;
						if(_callback) {
							_callback(body, fetch_result);
						} else {
							_err('ERROR! - no callback!');
						}
					});
				});
				req.on('error', function(e){
					//! debug print.
					_err("ERR! - problem with request: options=" + JSON.stringify(options), e);
					var vDebug = "";
					if(typeof e.lineNumber != 'undefined') vDebug += " line:"+e.lineNumber + "\n";
					if(typeof e.stack != 'undefined') vDebug += " stack:\n"+e.stack + "\n";
					_err("ERR! Exception - " + e.toString() + "\n" + vDebug);
					options.error = e;

					//! retry again.
					if(options.error){
						if(retried < MAX_RETRY){
							_err('ERR! retry request :'+(retried+1)+'/'+MAX_RETRY);
							setTimeout(function(){
								_request(options, retried+1);
							}, 1200);
							return;
						}
					}
				});
				req.on('connect',function(req,socket,head){
					_log('req.connect.head=', head);
				});
				// _log('req.headers=', req.getHeader());
				if(postData) {
					var payload = data_type == 'json' ? JSON.stringify(postData) : serialize(postData);
					// _log('> write payload=', payload);
					req.write(payload);
				}
				req.end();
				return req;
			}

			//! returns request.
            return _request(options);
		};
		F.fetch.set_call(my_fetch_remote);
		//_log('REGISTERED NODE-HTTP BROKER!');
	})(MyFetcher);
	
	/**
	 * Object: MyTool
	 */
	var MyTool = (function($, _){
		var dummy_log = function(m){if(typeof console != 'undefined') console.log(m); return true;};
		var id = 'T', name='mytool';
		function MyTool(id, name){this.id=id; this.name=name;};
		var tool = new MyTool(id, name);
		
		// logging plugin.
		var _log = function(m,e){ if(typeof MyDbg != 'undefined') {e===undefined?MyDbg.log(m):MyDbg.log(m,e);}else if(typeof console != 'undefined') {e===undefined?console.log(id+':'+m):console.log(id+":"+m,e);} return true;};
		var _log_res = function(m,e){ if(typeof MyDbg != 'undefined') {e===undefined?MyDbg.log_res(m):MyDbg.log_res(m,e);} else if(typeof console != 'undefined') {e===undefined?console.log(id+':'+m):console.log(id+":"+m,e);} return true;};
		var _err = function(m,e){ if(typeof MyDbg != 'undefined') {e===undefined?MyDbg.error(m):MyDbg.error(m,e);}else if(typeof console != 'undefined') {e===undefined?console.log(id+':'+m):console.log(id+":"+m,e);} return true;};
		var _log_push = function(m,e){ if(typeof MyDbg != 'undefined') {e===undefined?MyDbg.info(m):MyDbg.info(m,e);} else if(typeof console != 'undefined') {e===undefined?console.log(id+':'+m):console.log(id+":"+m,e);} return true;};
		
		// general functions.
		var test = function(){_log('---------------- test ------------------');};
		var info = function(txt){ $("#divRes").append("<div>"+txt+"</div>");};
		var _catch_val = function(data, txt1, txt2){
			data = data||'';
			var a = data.indexOf(txt1);
			var b = a >= 0 ? data.indexOf(txt2, a + txt1.length) : a;
			var c = b > a ? data.substring(a+txt1.length, b) : "";
			return c;
		};
		var _exclude_val = function(data, txt1, txt2){
			var a = data.indexOf(txt1);
			var b = a >= 0 ? data.indexOf(txt2, a + txt1.length) : a;
			var c = b > a ? (data.substring(0, a) + data.substring(b+txt2.length)) : "";
			return c;
		};
		// replace the catched value to data2: 
		var _replace_val = function(data, txt1, txt2, data2){
			var a = data ? data.indexOf(txt1) : 0;
			var b = a >= 0 ? data.indexOf(txt2, a + txt1.length) : a;
			var c = b > a ? data.substring(a+txt1.length, b) : "";
			if(a>=0 && b > a){
				c = data.substr(0, a+txt1.length);
				c+= data2;
				c+= data.substr(b);
			} else {
				c = data;
			}
			return c;
		};
		var _eval = function(){
			var data = this.data;
			while(data.indexOf(";var ") > 0){
				data = data.replace(";var ", ";");
			}
			eval(data);
		};
		var _clean_script = function(data){
			data = data||"";
			data = data.replace(/<script/ig,'<!--script');			// clean script
			data = data.replace(/<\/script>/ig,'</script-->');
			data = data.replace(/onerror=/ig,'onerror_=');			// error handler.
			return data;
		};
		
		var _content = '';
		var _set_content = function(html){			// set content into winWorker.
			html = html||'';
			_content = html;
			if (typeof winWorker != 'undefined' && typeof winWorker.document != 'undefined') {
				winWorker.document.body.innerHTML = html;
            }
		};
		var _get_content$ = function(){				// get root $ of content.
			var ret;
			if (typeof root.cheerio != 'undefined') {
                ret = root.cheerio.load(_content);
				//ret.find = ret;
            } else if (typeof winWorker != 'undefined' && typeof winWorker.document != 'undefined') {
				ret = $(winWorker.document);
            } else{
				ret = $(_content);
			}
			return ret;
		};
		var _get_content_fx = function(body, reset /*= true*/){          // get function for jquery-finder.
			if(reset === undefined) reset = true;
            if(body !== undefined) _set_content(body);
			var xx = _get_content$();
			var fx = function(p){return typeof xx.find != 'undefined' ? xx.find(p) : xx(p);};
			if(reset) _set_content();
			return fx;
		};

		var is_auto = function(){
			return MyFetcher.is_auto();
		};
		
		//TODO:XENI - optimize for url parsing.
		var parse_url = function(url){
			var parser = document.createElement('a');
			parser.href = url; //"http://example.com:3000/pathname/?search=test#hash";
			//parser.protocol; // => "http:"
			//parser.hostname; // => "example.com"
			//parser.port;     // => "3000"
			//parser.pathname; // => "/pathname/"
			//parser.search;   // => "?search=test"
			//parser.hash;     // => "#hash"
			//parser.host;     // => "example.com:3000"	
			return parser;	
		};
		
		// normalize url
		// @inc include list.
		// @exc exclude list.
		var normalize_url = function(url, inc, exc){
			var p = parse_url(url);
			inc = inc && inc.length ? inc : null;
			exc = exc && exc.length ? exc : null;
			if (p.search && /^\?/i.test(p.search)) {
				var q = p.search.substring(1);
				var arr = [];
				$.each(q.split('&'), function(i,s){
					var j = s.indexOf('=');
					var k = j > 0 ? s.substring(0, j) : s;
					var v = j > 0 ? s.substring(j+1) : '';
					if (inc && inc.indexOf(k) < 0) {	// not found in include.
						return;
					}
					if (exc && exc.indexOf(k) >= 0) {	// found in exclude
						return;
					}
					arr.push(k+(v&&'=')+v);
				});
				p.search = p.search.substring(0,1) + arr.join('&');
			}
			return p.protocol + '//' + p.host + p.pathname + p.search + p.hash;
		};
		
		// getting host
		var get_host = function(url){
			if("undefined"==typeof(url)||null==url) return "";
			url = url.trim(); if(""==url) return "";
			var _host,_arr;
			if(-1<url.indexOf("://")){
				_arr = url.split('://');
				if(-1<_arr[0].indexOf("/")||-1<_arr[0].indexOf(".")||-1<_arr[0].indexOf("\?")||-1<_arr[0].indexOf("\&")){
					_arr[0] = _arr[0].trim();
					if(0==_arr[0].indexOf("//")) _host = _arr[0].split("//")[1].split("/")[0].trim().split("\?")[0].split("\&")[0];
					else return "";
				}
				else{
					_arr[1] = _arr[1].trim();
					_host = _arr[1].split("/")[0].trim().split("\?")[0].split("\&")[0];
				}
			}
			else{
				if(0==url.indexOf("//")) _host = url.split("//")[1].split("/")[0].trim().split("\?")[0].split("\&")[0];
				else if (url.indexOf('/') < 0 && url.indexOf('\/') < 0 ) _host = url;
				else return "";
			}
			return _host;
		};
		
		// extract domain from host-name.
		var get_domain = function(host){
			host = host || location.host;
			var name = get_host(host);
			var parts = name.split('.').reverse();
			var cnt = parts.length;
			if (cnt >= 3) {
				if (parts[1].match(/^(com|edu|gov|net|mil|org|nom|co|name|info|biz)$/i)) {
					return parts[2] + '.' + parts[1] + '.' + parts[0];
				}
			}
			return cnt > 1 ? (parts[1] + '.' + parts[0]) : host;
		};
		
		var get_domain_test = function(){
			var list = ["shopping.naver.com", "www.11st.co.kr", "emart.ssg.com", "item2.gmarket.co.kr", "itempage3.auction.co.kr", "www.bandinlunis.com"];
			for(var i in list){
				_log("> "+i+' : ' + list[i] + ' -> ' + this.get_domain(list[i]));
			}
		};

		var _set_get_param = function(url, name, value){
			var k1 = '?'+name+'=', k2 = '&'+name+'=';
			var a1 = url.indexOf(k1), a2 = url.indexOf(k2);
			var a = a1 >= 0 ? a1 : a2 >= 0 ? a2 : -1;
			if (a >= 0) {       // key-found
				var len = url.length;
				var b = url.indexOf('&', a+name.length+2);
				b = b > 0 ? b : url.length;
				var oldval = url.substring(a+name.length+2, b);
				url = url.substring(0, a+1) + name + '=' + value + url.substring(b, len);
			} else {
				if(!value){
					// ignore
				} else if (url.indexOf('?') >= 0){
					url = url + '&' + name+'='+value;
				} else {
					url = url + '?' + name+'='+value;
				}
			}
			return url;
		};

		var _get_get_param = function(url, name){
			url = url||'';
			name = name||'';
			var k1 = '?'+name+'=', k2 = '&'+name+'=';
			var a1 = url.indexOf(k1), a2 = url.indexOf(k2);
			var a = a1 >= 0 ? a1 : a2 >= 0 ? a2 : -1;
			if (a >= 0) {
				var len = url.length;
				var b = url.indexOf('&', a+name.length+2);
				b = b > 0 ? b : url.length;
				var oldval = url.substring(a+name.length+2, b);
				return oldval;
			}
			return '';
		};

		var _gc_warning = false;
		var _gc = function(){
			if (typeof _root.gc != 'undefined') {
				global.gc();
			} else if(!_gc_warning){
				_err('WARN! - Garbage collection unavailable.  Pass --expose-gc '
					+ 'when launching node to enable forced garbage collection.');
				_gc_warning = true;
			} else {
				// NOP
			}
		};

		//! plug-in public
		tool['test'] = test;
		tool['_log'] = _log;
		tool['_err'] = _err;
		tool['_inf'] = _log_push;
		tool['is_auto'] = is_auto;
		tool['get_host'] = get_host;
		tool['get_domain'] = get_domain;
		tool['catch_val'] = _catch_val;
		tool['replace_val'] = _replace_val;
		tool['set_content'] = _set_content;
		tool['get_content$'] = _get_content$;
		tool['get_content_fx'] = _get_content_fx;
		tool['normalize_url'] = normalize_url;
		tool['set_get_param'] = _set_get_param;     // @param url, name, value
		tool['get_get_param'] = _get_get_param;
		tool['gc'] = _gc;
		
		//////////////////////////////////////////
		// Cookies
		var _coockies = {};
		
        var enable_dbg = function(opt){
            _CONF_DBG_COOKIE = opt ? true : false;
        }
        
		//- set cookies for specific domain.
		var set_cookie = function(domain, k, v){
			if (!domain ) return;
			if ((/^\./i).test(domain))			// remove 1st '.' char.
				domain = domain.substring(1);
			if (k == null) {
				delete _coockies[domain];
				return;
			}
			var map = _coockies[domain] || {};
			if (!k) {
                //ignored!
				_CONF_DBG_COOKIE&&_log("> Cookie["+k+"]["+domain+"]@1 := ", (v||'!ignored'));
            } else if(typeof v == 'undefined' || v == 'deleted'){
				_CONF_DBG_COOKIE&&_log("> Cookie["+k+"]["+domain+"]@2 := ", (v||'!del'));
				delete map[k];
			} else {
				_CONF_DBG_COOKIE&&_log("> Cookie["+k+"]["+domain+"]@3 := ", v);
				map[k] = v;
			}
			_coockies[domain] = map;
		};
		
		//- set cookies for specific domain.
		//@domain  - based domain address (or current domain)
		//@cookies - cookie map by key & value(or object)
		var set_cookies = function(domain, cookies){
			cookies = cookies||[];
			$.each(cookies, function(k, v){
				var v2 = (typeof v.val != 'undefined' ? v.val : v);
				var d2 = v.domain||domain;
				set_cookie(d2, k, v2);
			});
		};
		
		//- get cookies for specific domain.
		var get_cookies = function(domain){
			var ret = {};
			// cookie first from parent domain.
			var domain2 = get_domain(domain);
			_CONF_DBG_COOKIE && _log('> get_domain('+domain+')@1 => ',domain2);
            if(!domain2) throw new Error('domain2 must be valid! domain:'+domain)
			if (domain2 != domain) {
				var map2 = _coockies[domain2] || {};
				$.each(map2, function(k,v){
					_CONF_DBG_COOKIE&&_log("> Cookie["+k+"]["+domain+"]@1 <= ",v);
					ret[k] = v;
				});
			}
			// cookie from self.
			if (domain) {
				var map = _coockies[domain] || {};
				$.each(map, function(k,v){
					_CONF_DBG_COOKIE&&_log("> Cookie["+k+"]["+domain+"]@2 <= ", v+(ret[k] ? (" <- "+ret[k]):""));
					ret[k] = v;
				});
			}
			return ret;
		};
		
		//- check cookie for specific domain.
		var is_cookie = function(domain, name){
			var ret = false;
			// cookie first from parent domain.
			var domain2 = get_domain(domain);
			_CONF_DBG_COOKIE && _log("> IsCookie: domain="+domain+", domain2=", domain2);
			if (domain2 != domain) {
				var map2 = _coockies[domain2] || {};
				$.each(map2, function(k,v){
					if (k == name) {
						_CONF_DBG_COOKIE && _log("> IsCookie["+k+"]["+domain2+"] = ", v+" : FOUND");
						ret = true;
                    }
				});
			}
			// cookie from self.
			if (!ret && domain) {
				var map = _coockies[domain] || {};
				$.each(map, function(k,v){
					if (k == name) {
						_CONF_DBG_COOKIE && _log("> IsCookie["+k+"]["+domain+"] = ", v+" : FOUND");
						ret = true;
                    }
				});
			}
			return ret;
		};
		
		var handle_enter = function(task, data){
			if (!task) return;
			var url = task.url;
			var domain = get_domain(url);
			_CONF_DBG_COOKIE && _log('> get_domain(url:'+domain+')@2 => ', domain);
			task.param = task.param || {};
			task.param['cookies'] = get_cookies(domain);
		};
		
		var handle_finish = function(task, data){
			if (!task || !data) return;
			var url = data.info&&data.info.url||task.url;
			var domain = url ? get_domain(url) : '';
			set_cookies(domain, data.cookies);
		};
		
		tool['enable_dbg']= enable_dbg;
		tool['set_cookie']= set_cookie;
		tool['set_cookies']= set_cookies;
		tool['get_cookies']= get_cookies;
		tool['is_cookie']= is_cookie;
		tool['handle_enter']= handle_enter;
		tool['handle_finish']= handle_finish;
		// Cookies
		//////////////////////////////////////////
		
		//! extends _ with logging feature.
		if (typeof $ != 'undefined'
			&& typeof _ != 'undefined'
			&& typeof $.extend != 'undefined'){
			//dummy_log(tool.id+':> extend _');
			$.extend(_, tool);
		}
		return tool;
	})($, _);
	
	/**
	* Object: T object & function
	* Usage : T({task-object}) - register task.
	* 		  T[id] - get taget task by id.
	* 		  T(id, url) - run task[id], and set url (optional)
	*/
	var T = function (t, url){
		if (typeof t == 'number') {
			var id = t; t = T[id];
			if (t && typeof url == 'string') {
				t.url = url;
			} else if (t && typeof url == 'function') {
				url.apply(t);
			}
			MyFetcher.run_task(id);
			return T;
		}
		var id = t && t.id;
		if (typeof id == 'undefined' || id < 0){
			throw new Error('invalid-argument: id='+id)
		}

		var nm = t.name || '';
		//MyDbg.log('Register T['+id+'] := '+nm);
		T[id] = t;		// register.
		
		// plugin module : log
		if (typeof t._log == 'undefined') {
			t._log = function(m,e){
				var msg = typeof m == 'object' ? {id:this.id, msg:m} : ('T['+this.id+'] '+m);
				return e ? MyDbg.debug(msg,e) : MyDbg.debug(msg);
			}
			t._inf = function(m,e){
				var msg = typeof m == 'object' ? {id:this.id, msg:m} : ('T['+this.id+'] '+m);
				return e ? MyDbg.info(msg,e) : MyDbg.info(msg);
			}
			t._err = function(m,e){
				var msg = typeof m == 'object' ? {id:this.id, msg:m} : ('T['+this.id+'] '+m);
				return e ? MyDbg.error(msg,e) : MyDbg.error(msg);
			}
			t._log_res = function(m,e){
				var msg = typeof m == 'object' ? {id:this.id, msg:m} : ('T['+this.id+'] '+m);
				return e ? MyDbg.log_res(msg,e) : MyDbg.log_res(msg);
			}
		}
	
		// plugin module : _pack_node
		// - cascaded call to end-node if not defined.
		// @param next(optional)
		if(typeof t._pack_node == 'undefined'){
			t._pack_node = function(next){
				var thiz = this;
				next = next||thiz.next;
				thiz._log('_pack_node('+next+')...')
				var N = next >= 0 ? T[next] : null;
				if (typeof thiz.pack_node != 'undefined') {
                    return thiz.pack_node();
                } else if (typeof thiz.node != 'undefined') {
                    return thiz.node;
                } else if (typeof thiz.nodes != 'undefined') {		// must be array type.
                    return {id:thiz.id, text:thiz.name, nodes:thiz.nodes};
                }
				return N ? N._pack_node() : null;
			}
		}
		// plogin module : _pack_nodes
		if(typeof t._pack_nodes == 'undefined'){
			// only catch nodes from this.
			t._pack_nodes = function(next){
				var thiz = this;
				thiz._log('_pack_nodes('+next+')...')
				var n = thiz._pack_node(next);
				if (!n) {
					return null;
				} else if (typeof n.nodes != 'undefined') {
					return n.nodes;			// all nodes.
				} else {
					return [];				// empty
				}
			}
		}
		
		// plugin module : on_final
		if(typeof t.on_final == 'undefined'){
			t.on_final = function(){
				var thiz = this;
				//this._log("on_final()...");
				var next = thiz.next;
				var err = arguments[0]||null;
				if(thiz.callback !== undefined){
					//this._log("> final:callback()...");
					// return this.callback(err,a,b,c,d,e,f);
					return thiz.callback.apply(thiz, arguments);
				} else if(err){
					thiz._log('ERROR!', err);
					//this._log("> no! final:callback()");
					//console.log(this);
					throw err;
				}
				return next;
			}
		}

		// plugin module : on_error
		if(typeof t.on_error == 'undefined'){
			t.on_error = function(err, data){
				var thiz = this;
				return thiz.on_final(err, data);
			}
		}

		// plugin module : on_final
		if(typeof t.get_node == 'undefined'){
			t.get_node = function(){
				//var thiz = this;
				//this._log("get_node()...");
				var node = [];
				if(typeof this.node != 'undefined'){
					node = this.node;
				} else if(typeof this.nodes != 'undefined'){
					node = {nodes: this.nodes};
				} else {
					// NOP
				}
				return node;
			}
		}

		// plugin module : on_final
		if(typeof t.assert == 'undefined'){
			t.assert = function(cond, msg, data){
				var thiz = this;
				if(!cond){
					if(data === undefined)
						thiz._err('FAIL! '+msg);
					else
						thiz._err('FAIL! '+msg, data);
				} else {
					if(data === undefined)
						thiz._log('PASS! '+msg);
					else
						thiz._log('PASS! '+msg, data);
				}
				return cond;
			}
		}
	};
	
	// register functions into global.
	root['D'] = root['MyDbg'] = MyDbg;
	root['F'] = root['MyFetcher'] = MyFetcher;
	root['X'] = root['MyTool'] = MyTool;			// or '_' underscore.
	root['T'] = root['MyTask'] = T;	
	
})(_root);

