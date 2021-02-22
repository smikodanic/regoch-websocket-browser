!function(){return function t(e,r,n){function s(i,c){if(!r[i]){if(!e[i]){var u="function"==typeof require&&require;if(!c&&u)return u(i,!0);if(o)return o(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var h=r[i]={exports:{}};e[i][0].call(h.exports,function(t){return s(e[i][1][t]||t)},h,h.exports,t,e,r,n)}return r[i].exports}for(var o="function"==typeof require&&require,i=0;i<n.length;i++)s(n[i]);return s}}()({1:[function(t,e,r){"use strict";var n,s="object"==typeof Reflect?Reflect:null,o=s&&"function"==typeof s.apply?s.apply:function(t,e,r){return Function.prototype.apply.call(t,e,r)};n=s&&"function"==typeof s.ownKeys?s.ownKeys:Object.getOwnPropertySymbols?function(t){return Object.getOwnPropertyNames(t).concat(Object.getOwnPropertySymbols(t))}:function(t){return Object.getOwnPropertyNames(t)};var i=Number.isNaN||function(t){return t!=t};function c(){c.init.call(this)}e.exports=c,e.exports.once=function(t,e){return new Promise(function(r,n){function s(){void 0!==o&&t.removeListener("error",o),r([].slice.call(arguments))}var o;"error"!==e&&(o=function(r){t.removeListener(e,s),n(r)},t.once("error",o)),t.once(e,s)})},c.EventEmitter=c,c.prototype._events=void 0,c.prototype._eventsCount=0,c.prototype._maxListeners=void 0;var u=10;function a(t){if("function"!=typeof t)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof t)}function h(t){return void 0===t._maxListeners?c.defaultMaxListeners:t._maxListeners}function f(t,e,r,n){var s,o,i,c;if(a(r),void 0===(o=t._events)?(o=t._events=Object.create(null),t._eventsCount=0):(void 0!==o.newListener&&(t.emit("newListener",e,r.listener?r.listener:r),o=t._events),i=o[e]),void 0===i)i=o[e]=r,++t._eventsCount;else if("function"==typeof i?i=o[e]=n?[r,i]:[i,r]:n?i.unshift(r):i.push(r),(s=h(t))>0&&i.length>s&&!i.warned){i.warned=!0;var u=new Error("Possible EventEmitter memory leak detected. "+i.length+" "+String(e)+" listeners added. Use emitter.setMaxListeners() to increase limit");u.name="MaxListenersExceededWarning",u.emitter=t,u.type=e,u.count=i.length,c=u,console&&console.warn&&console.warn(c)}return t}function l(t,e,r){var n={fired:!1,wrapFn:void 0,target:t,type:e,listener:r},s=function(){if(!this.fired)return this.target.removeListener(this.type,this.wrapFn),this.fired=!0,0===arguments.length?this.listener.call(this.target):this.listener.apply(this.target,arguments)}.bind(n);return s.listener=r,n.wrapFn=s,s}function p(t,e,r){var n=t._events;if(void 0===n)return[];var s=n[e];return void 0===s?[]:"function"==typeof s?r?[s.listener||s]:[s]:r?function(t){for(var e=new Array(t.length),r=0;r<e.length;++r)e[r]=t[r].listener||t[r];return e}(s):v(s,s.length)}function d(t){var e=this._events;if(void 0!==e){var r=e[t];if("function"==typeof r)return 1;if(void 0!==r)return r.length}return 0}function v(t,e){for(var r=new Array(e),n=0;n<e;++n)r[n]=t[n];return r}Object.defineProperty(c,"defaultMaxListeners",{enumerable:!0,get:function(){return u},set:function(t){if("number"!=typeof t||t<0||i(t))throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received '+t+".");u=t}}),c.init=function(){void 0!==this._events&&this._events!==Object.getPrototypeOf(this)._events||(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0},c.prototype.setMaxListeners=function(t){if("number"!=typeof t||t<0||i(t))throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received '+t+".");return this._maxListeners=t,this},c.prototype.getMaxListeners=function(){return h(this)},c.prototype.emit=function(t){for(var e=[],r=1;r<arguments.length;r++)e.push(arguments[r]);var n="error"===t,s=this._events;if(void 0!==s)n=n&&void 0===s.error;else if(!n)return!1;if(n){var i;if(e.length>0&&(i=e[0]),i instanceof Error)throw i;var c=new Error("Unhandled error."+(i?" ("+i.message+")":""));throw c.context=i,c}var u=s[t];if(void 0===u)return!1;if("function"==typeof u)o(u,this,e);else{var a=u.length,h=v(u,a);for(r=0;r<a;++r)o(h[r],this,e)}return!0},c.prototype.addListener=function(t,e){return f(this,t,e,!1)},c.prototype.on=c.prototype.addListener,c.prototype.prependListener=function(t,e){return f(this,t,e,!0)},c.prototype.once=function(t,e){return a(e),this.on(t,l(this,t,e)),this},c.prototype.prependOnceListener=function(t,e){return a(e),this.prependListener(t,l(this,t,e)),this},c.prototype.removeListener=function(t,e){var r,n,s,o,i;if(a(e),void 0===(n=this._events))return this;if(void 0===(r=n[t]))return this;if(r===e||r.listener===e)0==--this._eventsCount?this._events=Object.create(null):(delete n[t],n.removeListener&&this.emit("removeListener",t,r.listener||e));else if("function"!=typeof r){for(s=-1,o=r.length-1;o>=0;o--)if(r[o]===e||r[o].listener===e){i=r[o].listener,s=o;break}if(s<0)return this;0===s?r.shift():function(t,e){for(;e+1<t.length;e++)t[e]=t[e+1];t.pop()}(r,s),1===r.length&&(n[t]=r[0]),void 0!==n.removeListener&&this.emit("removeListener",t,i||e)}return this},c.prototype.off=c.prototype.removeListener,c.prototype.removeAllListeners=function(t){var e,r,n;if(void 0===(r=this._events))return this;if(void 0===r.removeListener)return 0===arguments.length?(this._events=Object.create(null),this._eventsCount=0):void 0!==r[t]&&(0==--this._eventsCount?this._events=Object.create(null):delete r[t]),this;if(0===arguments.length){var s,o=Object.keys(r);for(n=0;n<o.length;++n)"removeListener"!==(s=o[n])&&this.removeAllListeners(s);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if("function"==typeof(e=r[t]))this.removeListener(t,e);else if(void 0!==e)for(n=e.length-1;n>=0;n--)this.removeListener(t,e[n]);return this},c.prototype.listeners=function(t){return p(this,t,!0)},c.prototype.rawListeners=function(t){return p(this,t,!1)},c.listenerCount=function(t,e){return"function"==typeof t.listenerCount?t.listenerCount(e):d.call(t,e)},c.prototype.listenerCount=d,c.prototype.eventNames=function(){return this._eventsCount>0?n(this._events):[]}},{}],2:[function(t,e,r){const{EventEmitter:n}=t("events"),s=t("./lib/subprotocol/jsonRWS"),o=t("./lib/Router"),i=t("./lib/helper");window.regoch={Client13jsonRWS:class{constructor(t){this.wcOpts=t,this.wsocket,this.socketID,this.attempt=1,this.eventEmitter=new n,this.eventEmitter.setMaxListeners(8),this.router=new o(this.wcOpts.debug)}connect(){const t=this.wcOpts.wsURL;return this.wsocket=new WebSocket(t,this.wcOpts.subprotocols),this.onEvents(),new Promise(t=>{this.eventEmitter.once("connected",()=>{t(this.wsocket)})})}disconnect(){this.wsocket.close()}async reconnect(){const t=this.wcOpts.reconnectAttempts,e=this.wcOpts.reconnectDelay;this.attempt<=t&&(await i.sleep(e),this.connect(),console.log(`Reconnect attempt #${this.attempt} of ${t} in ${e}ms`),this.attempt++)}onEvents(){this.wsocket.onopen=(async t=>{console.log("WS Connection opened"),this.attempt=1,this.socketID=await this.infoSocketId(),console.log(`socketID: ${this.socketID}`),this.eventEmitter.emit("connected"),this.onMessage(!1,!0)}),this.wsocket.onclose=(t=>{console.log("WS Connection closed"),delete this.wsocket,delete this.socketID,this.reconnect()}),this.wsocket.onerror=(t=>{})}onMessage(t,e){this.wsocket.onmessage=(r=>{try{const n=r.data;this.debugger("Received::",n);const o=s.incoming(n);t&&t(o,n),e&&("route"===o.cmd?this.eventEmitter.emit("route",o,n):this.eventEmitter.emit("message",o,n))}catch(t){console.error(t)}})}question(t){const e=this.socketID;return this.carryOut(e,t,void 0),new Promise(async(e,r)=>{this.onMessage(async r=>{r.cmd===t&&e(r)},!1),await i.sleep(this.wcOpts.timeout),r(new Error(`No answer for the question: ${t}`))})}async infoSocketId(){const t=await this.question("info/socket/id");return this.socketID=+t.payload,this.socketID}async infoSocketList(){return(await this.question("info/socket/list")).payload}async infoRoomList(){return(await this.question("info/room/list")).payload}async infoRoomListmy(){return(await this.question("info/room/listmy")).payload}carryOut(t,e,r){t||(t=0);const n={id:i.generateID(),from:+this.socketID,to:t,cmd:e,payload:r},o=s.outgoing(n);if(this.debugger("Sent::",o),!o||!this.wsocket||1!==this.wsocket.readyState)throw new Error("The message is not defined or the client is disconnected.");this.wsocket.send(o)}sendOne(t,e){const r=e;this.carryOut(t,"socket/sendone",r)}send(t,e){const r=e;this.carryOut(t,"socket/send",r)}broadcast(t){const e=t;this.carryOut(0,"socket/broadcast",e)}sendAll(t){const e=t;this.carryOut(0,"socket/sendall",e)}roomEnter(t){const e=t;this.carryOut(0,"room/enter",e)}roomExit(t){const e=t;this.carryOut(0,"room/exit",e)}roomExitAll(){this.carryOut(0,"room/exitall",void 0)}roomSend(t,e){const r=t,n=e;this.carryOut(r,"room/send",n)}setNick(t){const e=t;this.carryOut(0,"socket/nick",e)}route(t,e){const r={uri:t,body:e};this.carryOut(0,"route",r)}on(t,e){return this.eventEmitter.on(t,e)}once(t,e){return this.eventEmitter.once(t,e)}debugger(...t){const e=t.join("");this.wcOpts.debug&&console.log(e)}},Router:o}},{"./lib/Router":3,"./lib/helper":4,"./lib/subprotocol/jsonRWS":5,events:1}],3:[function(t,e,r){e.exports=class{constructor(t){this.routerOpts=t||{},this.trx,this.routeDefs=[]}set trx(t){if(!t.uri)throw new Error('The "uri" property is required.');Object.defineProperty(t,"uri",{value:t.uri,writable:!1}),Object.defineProperty(t,"body",{value:t.body,writable:!1}),t.uriParsed=this._uriParser(t.uri),this._trx=t}get trx(){return this._trx}def(t,...e){return this.routeDefs.push({route:t,routeParsed:this._routeParser(t),funcs:e}),this}redirect(t,e){const r=this.routeDefs.find(t=>t.route===e),n=r?r.funcs:[];return this.def(t,...n),this}notfound(...t){return this.def("<notfound>",...t),this}do(...t){return this.def("<do>",...t),this}async exe(){const t=this.trx.uriParsed,e=this.routeDefs.find(e=>{const r=e.routeParsed;return this._routeRegexMatchNoParams(r,t)||this._routeWithParamsMatch(r,t)}),r=this.routeDefs.find(t=>"<notfound>"===t.route),n=this.routeDefs.find(t=>"<do>"===t.route);if(e){this.trx.routeParsed=e.routeParsed,this.trx.query=t.queryObject,this.trx.params=this.trx.routeParsed?this._getParams(e.routeParsed.full,t.path):{};for(const t of e.funcs)await t(this.trx)}else if(r)for(const t of r.funcs)await t(this.trx);if(n&&n.funcs&&n.funcs.length)for(const t of n.funcs)await t(this.trx);return this.trx}_routeRegexMatchNoParams(t,e){const r=new RegExp(`^${t.full}$`,"i").test(e.path),n=t.segments===e.segments,s=r&&n;return this.routerOpts.debug&&console.log(`\n_routeRegexMatchNoParams:: (route) ${t.full} - (uri) ${e.path} -> ${s}`),s}_routeWithParamsMatch(t,e){const r=new RegExp(`^${t.base}/`,"i").test(e.path),n=t.segments===e.segments,s=/\/\:/.test(t.full),o=r&&n&&s;return this.routerOpts.debug&&console.log(`_routeWithParamsMatch:: (route) ${t.full} - (uri) ${e.path} -> ${o}`),o}_removeSlashes(t){return t.trim().replace(/^\/+/,"").replace(/\/+$/,"")}_typeConvertor(t){return t&&!isNaN(t)&&-1===t.indexOf(".")?t=parseInt(t,10):t&&!isNaN(t)&&-1!==t.indexOf(".")?t=parseFloat(t):"true"===t||"false"===t?t=JSON.parse(t):function(t){try{JSON.parse(t)}catch(t){return!1}return!0}(t)&&(t=JSON.parse(t)),t}_toQueryObject(t){const e=t.split("&"),r={};let n,s,o;return e.forEach(t=>{n=t.split("="),s=n[0],o=n[1],o=this._typeConvertor(o),r[s]=o}),r}_uriParser(t){const e=t.split("?"),r=this._removeSlashes(e[0]),n=r.split("/").length,s=e[1];return{path:r,segments:n,queryString:s,queryObject:s?this._toQueryObject(s):{}}}_routeParser(t){const e=this._removeSlashes(t),r=e.split("/").length,n=e.replace(/\/\:.+/,"");return{full:e,segments:r,base:n}}_getParams(t,e){const r=t.split("/"),n=e.split("/"),s={};return r.forEach((t,e)=>{if(/\:/.test(t)){const r=t.replace(/^\:/,"");let o=n[e];o=this._typeConvertor(o),s[r]=o}}),s}}},{}],4:[function(t,e,r){const n=new class{getMessageSize(t){return+new Blob([t]).size}async sleep(t){await new Promise(e=>setTimeout(e,t))}generateID(){const t=1e3*Math.random(),e=Math.floor(t);return+((new Date).toISOString().replace(/^20/,"").replace(/\-/g,"").replace(/\:/g,"").replace("T","").replace("Z","").replace(".","")+e)}};e.exports=n},{}],5:[function(t,e,r){e.exports=new class{incoming(t){let e,r=!1;try{e=JSON.parse(t);const n=Object.keys(e);r=this._testFields(n)}catch(t){r=!1}if(r)return e;throw new Error(`Incoming message "${t}" doesn't have valid "jsonRWS" subprotocol format.`)}outgoing(t){const e=Object.keys(t);if(this._testFields(e))return JSON.stringify(t);throw new Error(`Outgoing message ${JSON.stringify(t)} doesn't have valid "jsonRWS" subprotocol format.`)}_testFields(t){const e=["id","from","to","cmd","payload"],r=["id","from","to","cmd"];let n=!0;for(const r of t)if(-1===e.indexOf(r)){n=!1;break}for(const e of r)if(-1===t.indexOf(e)){n=!1;break}return n}}},{}]},{},[2]);
//# sourceMappingURL=client13jsonRWS-min.js.map
