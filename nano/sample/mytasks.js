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
 * Common Task Description
 * 
 * Author : DU Jung <coolxeni@gmail.com>
 */
// root instance.
var _root = typeof global != 'undefined' ? global : window;		// global for node, window for browser.

////////////////////////////////////////////////////////////////////////////////////
// TASK DEFINITIONS
(function(root){
	////////////////////////////////////////////////
	// global objects
	var $ = root && root.$;
	var _ = $ && $._;
	var R = _ && _.R;

	if (!$) throw new Error('$ is required!');
	if (!_) throw new Error('_ is required!');
	if (!R) throw new Error('R is required!');

	var _log = R.log;           // print only in console.
	var _err = R.err;           // post to remote server with ERROR
	var _inf = R.inf;           // post to remote server with INFO

	/**
	 * the 1st task as initial state.
	 */
	T({
		id : 0,	name : 'robin.1st',
		url : "wait:1",
		enter : function(data){
			var thiz = this;
			_.handle_enter(thiz);
			return true;
		},
		finish : function(body, data){
			var thiz = this;
			_.handle_finish(thiz, data);
			thiz._log('HELLO ROBIN!')
			
			// next task state
			var next = 1;
			if (next)
			{
				//! on callback from previous state.
				T[next].callback = function(err, title){

					thiz._log('title found =', title);
					return true;
				}
			}
			return next ? next : true;
		},
		next : -1
	})

	/**
	 * crawling remote webpage.
	 */
	T({
		id : 1,	name : 'robin.github',
		url : "https://github.com/robincloud/robinbot",
		enter : function(data){
			var thiz = this;
			_.handle_enter(thiz);
			return true;
		},
		finish : function(body, data){
			var thiz = this;
			_.handle_finish(thiz, data);
			//thiz._log('body1 = ', body);
			_.set_content(body);
			var fx = _.get_content_fx();					// DOM navigatore.
			var title = fx('#readme h1').text();
			thiz._log('readme title = ', title);
			return thiz.on_final(null, title);				// go back to previous state with 'on_final()'	
		},
		next : -1
	})


})(_root);
