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
 * Common modules required.
 * 
 * Author : DU Jung <coolxeni@gmail.com>
 */
if (0)
{   //! Use Full Function of jQuery w/ jsdom.
    global.jsdom = require('jsdom').jsdom,      // v4
        global.window = jsdom().defaultView,    // default window for jquery
        global.$ = require('jquery'),           // register jquery to global.
        $._ = require('underscore')._,          // WARN! do not register '_' to global due to node's _
        '';
}
else
{   //! Light Version of jQuery by cheerio.
    global.cheerio = require('cheerio'),        // cheerio for light html-parser
        global.$ = cheerio.load(''),            // register jquery to global.
        $._ = require('underscore')._,          // WARN! do not register '_' to global due to node's _
        '';
    
    // ajax implementation handler.
    //var request = require('ajax-request');
    var request = require('request');
    var querystring = require('querystring');

    //TODO:XENI - Check JSON request to server.
    $.ajax = function(param){
	    var _log = $._._log;
	    var _err = $._._err;

	    //! prepare request's option.
        var opt = {
	        headers: {},
            url: param.url,
            method: param.type||'GET',
            form: param.data                        //XENI - same encoding format with $.ajax(data).
        };

        //! json data.
        if((param.dataType||'').indexOf('json') >= 0)
        {
            delete opt.form;
            opt.headers["content-type"] = param.dataType||"application/json";

            //! 요건 이상하게 안됨.
            //opt.body = JSON.stringify(o.data);
            //opt.json = true;
            //! 요건 잘됨. 서버쪽에서 꼭  app.use(bodyParser.json()) 호출해줌.
            opt.json = 1 ? param.data : JSON.stringify(param.data);     //WARN! do not stringify in here.
        }

	    // _log('$.ajax() called...', param);
        function callback_request(err, res, body) {
		    //console.log(o.type+': url='+o.url+', body='+body);
		    if(err) _err(err, param);
		    if(err && typeof param.error != 'undefined'){
			    param.error(err, err);
		    } else if(typeof param.success != 'undefined'){
			    param.success(body, res.statusCode);
		    }
	    };

        //! gzip (to send the compressed content)
        if(param.gzip)
        {
	        // _log('INFO! gzip activated....');
	        var zlib = require('zlib');
	        // var gunzip = zlib.createGunzip();
	        var gzip = zlib.createGzip();

	        //WARN! need to setup proper encoding type.
	        opt.headers['Content-Encoding'] = 'gzip';
	        opt.headers['Accept-Encoding'] = 'gzip,deflate';

	        var json = JSON.stringify(opt.json);
	        delete opt.json;
	        // _log('>> json string.len=', json.length);

            if(1){
	            var Readable = require('stream').Readable;
	            var s = new Readable;
	            s.push(json);
	            s.push(null);           // EOF.
	            //! prepare request.
	            var req = request(opt, callback_request);
	            s.pipe(gzip).pipe(req);
	            return req;
            } else if(0){       //WARN - 잘 안됨..
            	//!
	            return zlib.gzip(json, function(err, buffer){
	            	//INFO! - 요개 이상한게 여러번 호출됨.
					_log('buffer.len=', buffer.length);
					// var req = request(opt, callback_request);
					// req.on('error', function(e){
					//     _err(e);
					// })
					// req.write(buffer);
					// req.end();
	            })
            }
        }

        //console.log('opt=', opt);
        //! start request.
        return request(opt, callback_request);
    };
    //! encoding module.
	$.encoding = (function(){
        var _encoding = {};
        //WARN! - need to build binary. so do not use iconv.
		// var _init = function(){
		//     if(_encoding.iconv !== undefined) return;
		// 	var Iconv = require('iconv').Iconv;
		// 	// var iconv = new Iconv('EUC-KR', 'UTF-8//TRANSLIT//IGNORE');
		// 	var iconv = new Iconv('euc-kr', 'utf-8//translit//ignore');
		// 	// var iconv = new Iconv('EUC-KR', 'UTF-8');
		// 	// var iconv = new Iconv('UTF-8', 'EUC-KR');
		// 	_encoding.iconv = iconv;
		// }
        // _encoding.convert = function(txt){
		 //    _init();
			// return _encoding.iconv.convert(txt);
        // }
		// require("encoding");
		_encoding.convert = function(txt){
			return require("encoding").convert(txt, 'UTF-8', 'EUC-KR');
        }
        return _encoding;
	})();
    $.parseJSON = function(t){
        return JSON.parse(t);
    };
    
    if(!$.toJSON)
    {
        $.toJSON = function(d){
            return JSON.stringify(d);
        };
    }
    
    console.log('INFO - cheerio activated!');
}

// get module name.
global.get_mod_name = function(){
    var nm = process.argv[1]||'';
    var an = nm.split('/');
    return an.pop();
}

// get running parameter like -h api.
global.get_run_param = function(o, defval){
    defval = defval||'';
    var nm = '-'+o;
    var i = process.argv.indexOf(nm);
    var ret;
    if (i >= 0) {
        ret = process.argv[i+1];
    } else {
        ret = defval;
    }
    return ret;
}

// get node module by loading.
global.get_node_module = function(name){
    var mod = null;
    try{
        mod = require(name)
    } catch(e){
        // console.error('error: module='+name, e);
        mod =require('../../node_modules/'+name);
    }
    return mod;
}
