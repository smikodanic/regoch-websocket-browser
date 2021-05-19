(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * Websocket Client for Browser
 * - websocket version: 13
 * - subprotocol: jsonRWS
 */
const eventEmitter = require('./lib/eventEmitter');
const jsonRWS = require('./lib/subprotocol/jsonRWS');
const Router = require('./lib/Router');
const helper = require('./lib/helper');


class Client13jsonRWS {

  /**
   * @param {{wsURL:string, timeout:number, reconnectAttempts:number, reconnectDelay:number, subprotocols:string[], debug:boolean}} wcOpts - websocket client options
   */
  constructor(wcOpts) {
    this.wcOpts = wcOpts; // websocket client options
    this.wsocket; // Websocket instance https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
    this.socketID; // socket ID number, for example: 210214082949459100

    this.attempt = 1; // reconnect attempt counter
    this.router = new Router({debug: wcOpts.debug});
  }


  /************* CLIENT CONNECTOR ************/
  /**
   * Connect to the websocket server.
   * @returns {Promise<Socket>}
   */
  connect() {
    const wsURL = this.wcOpts.wsURL; // websocket URL: ws://localhost:3211/something?authkey=TRTmrt
    this.wsocket = new WebSocket(wsURL, this.wcOpts.subprotocols);

    this.onEvents();

    // return socket as promise
    return new Promise(resolve => {
      // eventEmitter.removeAllListeners(); // not needed if once() is used
      eventEmitter.once('connected', () => { resolve(this.wsocket); });
      // console.log(`"connected" listeners: ${eventEmitter.listenerCount('connected')}`.cliBoja('yellow'));
    });
  }


  /**
   * Disconnect from the websocket server.
   * @returns {void}
   */
  disconnect() {
    if (!!this.wsocket) { this.wsocket.close(); }
    this.blockReconnect();
  }


  /**
   * Try to reconnect the client when the socket is closed.
   * This method is fired on every 'close' socket's event.
   */
  async reconnect() {
    const attempts = this.wcOpts.reconnectAttempts;
    const delay = this.wcOpts.reconnectDelay;
    if (this.attempt <= attempts) {
      await helper.sleep(delay);
      this.connect();
      console.log(`Reconnect attempt #${this.attempt} of ${attempts} in ${delay}ms`);
      this.attempt++;
    }
  }


  /**
   * Block reconnect usually after disconnect() method is used.
   */
  blockReconnect() {
    this.attempt = this.wcOpts.reconnectAttempts + 1;
  }



  /**
   * Event listeners.
   * @returns {void}
   */
  onEvents() {
    this.wsocket.onopen = async (openEvt) => {
      this.onMessage();
      console.log('WS Connection opened');
      this.attempt = 1;
      this.socketID = await this.infoSocketId();
      console.log(`socketID: ${this.socketID}`);
      eventEmitter.emit('connected');
    };

    this.wsocket.onclose = (closeEvt) => {
      console.log('WS Connection closed');
      delete this.wsocket; // Websocket instance https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
      delete this.socketID;
      this.reconnect();
    };

    this.wsocket.onerror = (errorEvt) => {
      // console.error(errorEvt);
    };
  }



  /************* RECEIVER ************/
  /**
   * Receive the message event and push it to msgStream.
   * @returns {void}
   */
  onMessage() {
    this.wsocket.onmessage = event => {
      try {
        const msgSTR = event.data;
        this.debugger('Received::', msgSTR);
        const msg = jsonRWS.incoming(msgSTR); // test against subprotocol rules and convert string to object);

        const detail = {msg, msgSTR};
        if (msg.cmd === 'route') { eventEmitter.emit('route', detail); }
        else if (msg.cmd === 'info/socket/id') { eventEmitter.emit('question', detail); }
        else if (msg.cmd === 'info/socket/list') { eventEmitter.emit('question', detail); }
        else if (msg.cmd === 'info/room/list') { eventEmitter.emit('question', detail); }
        else if (msg.cmd === 'info/room/listmy') { eventEmitter.emit('question', detail); }
        else { eventEmitter.emit('message', detail); }

      } catch (err) {
        console.error(err);
      }
    };
  }



  /************* QUESTIONS ************/
  /*** Send a question to the websocket server and wait for the answer. */
  /**
   * Send question and expect the answer.
   * @param {string} cmd - command
   * @returns {Promise<object>}
   */
  question(cmd) {
    // send the question
    const payload = undefined;
    const to = this.socketID;
    this.carryOut(to, cmd, payload);

    // receive the answer
    return new Promise(async (resolve, reject) => {
      this.once('question', async (msg, msgSTR) => {
        if (msg.cmd === cmd) { resolve(msg); }
        else { reject(new Error('Recived cmd is not same as sent cmd.')); }
      });
      await helper.sleep(this.wcOpts.timeout);
      reject(new Error(`No answer for the question: ${cmd}`));
    });
  }

  /**
   * Send question about my socket ID.
   * @returns {Promise<number>}
   */
  async infoSocketId() {
    const answer = await this.question('info/socket/id');
    this.socketID = +answer.payload;
    return this.socketID;
  }

  /**
   * Send question about all socket IDs connected to the server.
   * @returns {Promise<number[]>}
   */
  async infoSocketList() {
    const answer = await this.question('info/socket/list');
    return answer.payload;
  }

  /**
   * Send question about all rooms in the server.
   * @returns {Promise<{name:string, socketIds:number[]}[]>}
   */
  async infoRoomList() {
    const answer = await this.question('info/room/list');
    return answer.payload;
  }

  /**
   * Send question about all rooms where the client was entered.
   * @returns {Promise<{name:string, socketIds:number[]}[]>}
   */
  async infoRoomListmy() {
    const answer = await this.question(`info/room/listmy`);
    return answer.payload;
  }






  /************* SEND MESSAGE TO OTHER CLIENTS ************/
  /**
   * Send message to the websocket server if the connection is not closed (https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState).
   * @param {number} to - final destination: 210201164339351900
   * @param {string} cmd - command
   * @param {any} payload - message payload
   * @returns {void}
   */
  carryOut(to, cmd, payload) {
    const id = helper.generateID(); // the message ID
    const from = +this.socketID; // the sender ID
    if (!to) { to = 0; } // server ID is 0
    const msgObj = {id, from, to, cmd, payload};
    const msg = jsonRWS.outgoing(msgObj);
    this.debugger('Sent::', msg);

    // the message must be defined and client must be connected to the server
    if (!!msg && !!this.wsocket && this.wsocket.readyState === 1) {
      this.wsocket.send(msg);
    } else {
      throw new Error('The message is not defined or the client is disconnected.');
    }
  }


  /**
   * Send message (payload) to one client.
   * @param {number} to - 210201164339351900
   * @param {any} msg - message sent to the client
   * @returns {void}
   */
  sendOne(to, msg) {
    const cmd = 'socket/sendone';
    const payload = msg;
    this.carryOut(to, cmd, payload);
  }


  /**
   * Send message (payload) to one or more clients.
   * @param {number[]} to - [210205081923171300, 210205082042463230]
   * @param {any} msg - message sent to the clients
   * @returns {void}
   */
  send(to, msg) {
    const cmd = 'socket/send';
    const payload = msg;
    this.carryOut(to, cmd, payload);
  }


  /**
   * Send message (payload) to all clients except the sender.
   * @param {any} msg - message sent to the clients
   * @returns {void}
   */
  broadcast(msg) {
    const to = 0;
    const cmd = 'socket/broadcast';
    const payload = msg;
    this.carryOut(to, cmd, payload);
  }

  /**
   * Send message (payload) to all clients and the sender.
   * @param {any} msg - message sent to the clients
   * @returns {void}
   */
  sendAll(msg) {
    const to = 0;
    const cmd = 'socket/sendall';
    const payload = msg;
    this.carryOut(to, cmd, payload);
  }



  /************* ROOM ************/
  /**
   * Subscribe in the room.
   * @param {string} roomName
   * @returns {void}
   */
  roomEnter(roomName) {
    const to = 0;
    const cmd = 'room/enter';
    const payload = roomName;
    this.carryOut(to, cmd, payload);
  }

  /**
   * Unsubscribe from the room.
   * @param {string} roomName
   * @returns {void}
   */
  roomExit(roomName) {
    const to = 0;
    const cmd = 'room/exit';
    const payload = roomName;
    this.carryOut(to, cmd, payload);
  }

  /**
   * Unsubscribe from all rooms.
   * @returns {void}
   */
  roomExitAll() {
    const to = 0;
    const cmd = 'room/exitall';
    const payload = undefined;
    this.carryOut(to, cmd, payload);
  }

  /**
   * Send message to the room.
   * @param {string} roomName
   * @param {any} msg
   * @returns {void}
   */
  roomSend(roomName, msg) {
    const to = roomName;
    const cmd = 'room/send';
    const payload = msg;
    this.carryOut(to, cmd, payload);
  }




  /********* SEND MESSAGE (COMMAND) TO SERVER *********/
  /**
   * Setup a nick name.
   * @param {string} nickname - nick name
   * @returns {void}
   */
  setNick(nickname) {
    const to = 0;
    const cmd = 'socket/nick';
    const payload = nickname;
    this.carryOut(to, cmd, payload);
  }


  /**
   * Send route command.
   * @param {string} uri - route URI, for example /shop/product/55
   * @param {any} body - body
   * @returns {void}
   */
  route(uri, body) {
    const to = 0;
    const cmd = 'route';
    const payload = {uri, body};
    this.carryOut(to, cmd, payload);
  }




  /*********** LISTENERS ************/
  /**
   * Wrapper around the eventEmitter
   * @param {string} eventName - event name: 'connected', 'message', 'route', 'question
   * @param {Function} listener - callback function, for example: (msg, msgSTR) => { console.log(msgSTR); }
   */
  on(eventName, listener) {
    return eventEmitter.on(eventName, event => {
      listener.call(null, event.detail.msg, event.detail.msgSTR);
    });
  }

  /**
   * Wrapper around the eventEmitter
   * @param {string} eventName - event name: 'connected', 'message', 'route', 'question
   * @param {Function} listener - callback function, for example: (msg, msgSTR) => { console.log(msgSTR); }
   */
  once(eventName, listener) {
    return eventEmitter.on(eventName, event => {
      listener.call(null, event.detail.msg, event.detail.msgSTR);
    });
  }

  /**
   * Wrapper around the eventEmitter
   * @param {string} eventName - event name: 'connected', 'message', 'route', 'question
   */
  off(eventName) {
    return eventEmitter.off(eventName);
  }



  /*********** MISC ************/
  /**
   * Debugger. Use it as this.debug(var1, var2, var3)
   * @returns {void}
   */
  debugger(...textParts) {
    const text = textParts.join('');
    if (this.wcOpts.debug) { console.log(text); }
  }




}


window.regoch = { Client13jsonRWS, Router, helper };
module.exports = { Client13jsonRWS, Router, helper };

},{"./lib/Router":2,"./lib/eventEmitter":3,"./lib/helper":4,"./lib/subprotocol/jsonRWS":5}],2:[function(require,module,exports){
/**
 * Terminology
 * =================================
 * route :string - defined route in the def() method - /room/subscribe/:room_name/:id
 * routeParsed.full :string - full route (start and end slashes removed) - 'room/subscribe/:room_name/:id'
 * routeParsed.segments :number - number the full route segments (with param parts) - 4
 * routeParsed.base :number - route part without params segments (start and end slashes removed) - 'room/subscribe'
 *
 * uri :string - current URI - /room/subscribe/sasa/123?x=123&y=abc&z=false
 * uriParsed.path :string - complete uri (start and end slashes removed) - '/room/subscribe/sasa/123'
 * uriParsed.segments :number - number of the uri segments - 4
 * uriParsed.queryString :string - uri part after question mark as string - 'x=123&y=abc&z=false'
 * uriParsed.queryObject :object - uri part parsed as object - {x: 123, y: 'abc', z: false}
 *
 * body :any - data sent along with uri as the transitional object - trx: {uri, body}
 *
 * func :Function - route function - a function which is executed when certain route is matched against the uri
 * trx :object - transitional object which can be changed in the route functions, required field is "uri" - {uri, body, uriParsed, routeParsed, params, query}
 *
 * Notice
 *-----------
 * Variables "uri" and "body" are analogous to HTTP POST request, for example:  POST /room/subscribe/sasa/123?key=999  {a: 'something})
 */



class Router {

  /**
   * @param {object} routerOpts - router initial options {debug:boolean}
   */
  constructor(routerOpts) {
    this.routerOpts = routerOpts || {};
    this.trx; // transitional object {uri:string, body:any, ...}
    this.routeDefs = []; // route definitions [{route:string, routeParsed:object, funcs:Function[] }]
  }


  /**
   * Set transitional object.
   * @param {object} obj - {uri, body, ...}
   * @returns {void}
   */
  set trx(obj) {
    // required properties
    if (!obj.uri) { throw new Error('The "uri" property is required.'); }

    // "uri" and "body" as properties with constant value (can not be modified)
    Object.defineProperty(obj, 'uri', {
      value: obj.uri,
      writable: false
    });

    Object.defineProperty(obj, 'body', {
      value: obj.body,
      writable: false
    });

    // parse uri
    obj.uriParsed = this._uriParser(obj.uri);

    this._trx = obj;
  }


  /**
   * Get transitional object.
   * @returns {object} - {uri, body, ...}
   */
  get trx() {
    return this._trx;
  }



  /**
   * Define route, routeParsed and corresponding functions.
   * @param {string} route - /room/subscribe/:room_name
   * @param {Function[]} funcs - route functions
   * @returns {Router}
   */
  def(route, ...funcs) {
    this.routeDefs.push({
      route,
      routeParsed: this._routeParser(route),
      funcs
    });
    return this;
  }


  /**
   * Redirect from one route to another route.
   * @param {string} fromRoute - new route
   * @param {string} toRoute - destination route (where to redirect)
   * @returns {Router}
   */
  redirect(fromRoute, toRoute) {
    const toRouteDef = this.routeDefs.find(routeDef => routeDef.route === toRoute); // {route, routeParsed, funcs}
    const toFuncs = !!toRouteDef ? toRouteDef.funcs : [];
    this.def(fromRoute, ...toFuncs); // assign destination functions to the new route
    return this;
  }


  /**
   * Define special route <notfound>
   * @param {Function[]} funcs - function which will be executed when route is not matched aginst URI
   * @returns {Router}
   */
  notfound(...funcs) {
    this.def('<notfound>', ...funcs);
    return this;
  }



  /**
   * Define special route <do>
   * @param {Function[]} funcs - function which will be executed on every request, e.g. every exe()
   * @returns {Router}
   */
  do(...funcs) {
    this.def('<do>', ...funcs);
    return this;
  }




  /**
   * Execute the router functions.
   * @returns {Promise<object>}
   */
  async exe() {
    const uriParsed = this.trx.uriParsed; // shop/register/john/23

    /*** FIND ROUTE ***/
    // found route definition
    const routeDef_found = this.routeDefs.find(routeDef => { // {route, routeParsed, funcs}
      const routeParsed = routeDef.routeParsed; // {full, segments, base}
      return this._routeRegexMatchNoParams(routeParsed, uriParsed) || this._routeWithParamsMatch(routeParsed, uriParsed);
    });

    // not found route definition
    const routeDef_notfound = this.routeDefs.find(routeDef => routeDef.route === '<notfound>');

    // do route definition
    const routeDef_do = this.routeDefs.find(routeDef => routeDef.route === '<do>');

    /*** EXECUTE FOUND ROUTE FUNCTIONS */
    if (!!routeDef_found) {
      this.trx.routeParsed = routeDef_found.routeParsed;
      this.trx.query = uriParsed.queryObject;
      this.trx.params = !!this.trx.routeParsed ? this._getParams(routeDef_found.routeParsed.full, uriParsed.path) : {};

      for (const func of routeDef_found.funcs) { await func(this.trx); }
    } else if (!!routeDef_notfound) {
      for (const func of routeDef_notfound.funcs) { await func(this.trx); }
    }


    if (!!routeDef_do && !!routeDef_do.funcs && !!routeDef_do.funcs.length) {
      for (const func of routeDef_do.funcs) { await func(this.trx); }
    }


    return this.trx;
  }





  /*********** ROUTE MATCHES  ***********/

  /**
   * Route regular expression match against the uri. Parameters are not defined in the route e.g. there is no /: chars.
   * For example:
   *       (route) /ads/autos/bmw - (uri) /ads/autos/bmw -> true
   *       (route) /ads/a.+s/bmw  - (uri) /ads/autos/bmw -> true
   * @param {object} routeParsed - {full, segments, base}
   * @param {object} uriParsed - {path, segments, queryString, queryObject}
   * @returns {boolean}
   */
  _routeRegexMatchNoParams(routeParsed, uriParsed) {
    const routeReg = new RegExp(`^${routeParsed.full}$`, 'i');
    const tf1 = routeReg.test(uriParsed.path); // route must match uri
    const tf2 = routeParsed.segments === uriParsed.segments; // route and uri must have same number of segments
    const tf = tf1 && tf2;
    if (this.routerOpts.debug) { console.log(`\n_routeRegexMatchNoParams:: (route) ${routeParsed.full} - (uri) ${uriParsed.path} -> ${tf}`); }
    return tf;
  }


  /**
   * Route with parameters match against the uri.
   * (route) /shop/register/:name/:age - (uri) /shop/register/john/23
   * @param {object} routeParsed - {full, segments, base}
   * @param {object} uriParsed - {path, segments, queryString, queryObject}
   * @returns {boolean}
   */
  _routeWithParamsMatch(routeParsed, uriParsed) {
    const routeReg = new RegExp(`^${routeParsed.base}\/`, 'i');
    const tf1 = routeReg.test(uriParsed.path); // route base must match uri
    const tf2 = routeParsed.segments === uriParsed.segments; // route and uri must have same number of segments
    const tf3 = /\/\:/.test(routeParsed.full); // route must have at least one /:
    const tf = tf1 && tf2 && tf3;
    if (this.routerOpts.debug) { console.log(`_routeWithParamsMatch:: (route) ${routeParsed.full} - (uri) ${uriParsed.path} -> ${tf}`); }
    return tf;
  }




  /*********** HELPERS  ***********/

  /**
   * Removing slashes from the beginning and the end.
   * /ads/autos/bmw/ --> ads/autos/bmw
   * //ads/autos/bmw/// --> ads/autos/bmw
   * @param {string} path - uri path or route
   * @returns {string}
   */
  _removeSlashes(path) {
    return path.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  }


  /**
   * Convert string into integer, float or boolean.
   * @param {string} value
   * @returns {string | number | boolean | object}
   */
  _typeConvertor(value) {
    function isJSON(str) {
      try { JSON.parse(str); }
      catch(err) { return false; }
      return true;
    }

    if (!!value && !isNaN(value) && value.indexOf('.') === -1) { // convert string into integer (12)
      value = parseInt(value, 10);
    } else if (!!value && !isNaN(value) && value.indexOf('.') !== -1) { // convert string into float (12.35)
      value = parseFloat(value);
    } else if (value === 'true' || value === 'false') { // convert string into boolean (true)
      value = JSON.parse(value);
    } else if (isJSON(value)) {
      value = JSON.parse(value);
    }

    return value;
  }



  /**
   * Create query object from query string.
   * @param  {string} queryString - x=abc&y=123&z=true
   * @return {object}             - {x: 'abc', y: 123, z: true}
   */
  _toQueryObject(queryString) {
    const queryArr = queryString.split('&');
    const queryObject = {};

    let eqParts, property, value;
    queryArr.forEach(elem => {
      eqParts = elem.split('='); // equotion parts
      property = eqParts[0];
      value = eqParts[1];

      value = this._typeConvertor(value); // t y p e   c o n v e r s i o n

      queryObject[property] = value;
    });

    return queryObject;
  }



  /**
   * URI parser
   * @param  {string} uri - /shop/register/john/23?x=abc&y=123&z=true  (uri === trx.uri)
   * @returns {path:string, queryString:string, queryObject:object} - {path: 'shop/register/john/23', queryString: 'x=abc&y=123&z=true', queryObject: {x: 'abc', y: 123, z: true}}
   */
  _uriParser(uri) {
    const uriDivided = uri.split('?');

    const path = this._removeSlashes(uriDivided[0]); // /shop/register/john/23 -> shop/register/john/23
    const segments = path.split('/').length;
    const queryString = uriDivided[1];
    const queryObject = !!queryString ? this._toQueryObject(queryString) : {};

    const uriParsed = {path, segments, queryString, queryObject};
    return uriParsed;
  }


  /**
   * Route parser.
   * Converts route string into the parsed object {full, segments, parser} which is used for matching against the URI.
   * @param  {string} route - /shop/register/:name/:age/
   * @returns {full:string, segments:number, base:string} - {full: 'shop/register/:name/:age', segments: 4, base: 'shop/register'}
   */
  _routeParser(route) {
    const full = this._removeSlashes(route);
    const segments = full.split('/').length;
    const base = full.replace(/\/\:.+/, ''); // shop/register/:name/:age --> shop/register

    const routeParsed = {full, segments, base};
    return routeParsed;
  }



  /**
   * Create parameters object.
   * For example if route is /register/:name/:age AND uri is /register/john/23 then params is {name: 'john', age: 23}
   * @param  {string} routeParsedFull - routeParsed.full -- shop/register/:name/:age
   * @param  {string} uriParsedPath  - uriParsed.path -- shop/register/john/23
   * @returns {object}
   */
  _getParams(routeParsedFull, uriParsedPath) {
    const routeParts = routeParsedFull.split('/'); // ['shop', 'register', ':name', ':age']
    const uriParts = uriParsedPath.split('/'); // ['shop', 'register', 'john', 23]

    const params = {};

    routeParts.forEach((routePart, index) => {
      if (/\:/.test(routePart)) {
        const property = routePart.replace(/^\:/, ''); // remove :

        let value = uriParts[index];
        value = this._typeConvertor(value); // t y p e   c o n v e r s i o n

        params[property] = value;
      }
    });

    return params;
  }





}





module.exports = Router;

},{}],3:[function(require,module,exports){
class EventEmitter {

  /**
   * Create and emit the event
   * @param {string} eventName - event name, for example: 'pushstate'
   * @param {any} detail - event argument
   * @returns {void}
   */
  emit(eventName, detail) {
    const evt = new CustomEvent(eventName, {detail});
    window.dispatchEvent(evt);
  }


  /**
   * Listen for the event
   * @param {string} eventName - event name, for example: 'pushstate'
   * @param {Function} listener - callback function with event parameter
   * @returns {void}
   */
  on(eventName, listener) {
    window.addEventListener(eventName, event => {
      listener(event);
    });
  }


  /**
   * Listen for the event only once
   * @param {string} eventName - event name, for example: 'pushstate'
   * @param {Function} listener - callback function with event parameter
   * @returns {void}
   */
  once(eventName, listener) {
    window.addEventListener(eventName, event => {
      listener(event);
      window.removeEventListener(eventName, () => {});
    }, {once: true});
  }


  /**
   * Stop listening the event
   * @param {string} eventName - event name, for example: 'pushstate'
   * @returns {void}
   */
  off(eventName) {
    window.removeEventListener(eventName, event => {});
  }



}


module.exports = new EventEmitter();

},{}],4:[function(require,module,exports){
class Helper {

  /**
   * Get message size in bytes.
   * For example: A -> 1 , Š -> 2 , ABC -> 3
   * @param {string} msg - message sent to server
   * @returns {number}
   */
  getMessageSize(msg) {
    const bytes = new Blob([msg]).size;
    return +bytes;
  }


  /**
   * Pause the code execution
   * @param {number} ms - miliseconds
   * @returns {void}
   */
  async sleep(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }


  /**
   * Create unique id. It's combination of wsOpts and random number 'r'
   * in format: YYMMDDHHmmssSSSrrr ---> YY year, MM month, DD day, HH hour, mm min, ss sec, SSS ms, rrr 3 random digits
   * 18 digits in total, for example: 210129163129492100
   * @returns {number}
   */
  generateID() {
    const rnd = Math.random() * 1000;
    const rrr = Math.floor(rnd);

    const timestamp = new Date();
    const tsp = timestamp.toISOString()
      .replace(/^20/, '')
      .replace(/\-/g, '')
      .replace(/\:/g, '')
      .replace('T', '')
      .replace('Z', '')
      .replace('.', '');

    const id = +(tsp + rrr);
    return id;
  }



}

const helper = new Helper();
module.exports = helper;

},{}],5:[function(require,module,exports){
/**
 * Subprotocol name: jsonRWS
 * HTTP header: "Sec-WebSocket-Protocol": "jsonRWS"
 *
 * Subprotocol description:
 *  This subprotocol is created for communication between websocket server and client.
 *
 * Subprotocol definitons:
 *  a) Client have to send message in valid JSON format. Allowed fields: id, from, to, cmd, payload.
 *  b) Server have to send message in valid JSON format. Allowed fields: id, from, to, cmd, payload.
 *  c) The message is converted from string to object.
 */


class JsonRWS {

  /*********** INCOMING MESSAGES ***********/
  /**
   * Execute the jsonRWS subprotocol for incoming messages. Filter and map incoming messages.
   * 1. Test if the message has valid "jsonRWS" format {id:number, from:number, to:number|number[]|string, cmd:string, payload?:any}.
   * 2. Convert the message from string to object.
   * @param {string} msgSTR -incoming message
   * @returns {{id:number, from:number, to:number|number[]|string, cmd:string, payload?:any}}
   */
  incoming(msgSTR) {
    let tf = false;
    let msg;
    try {
      msg = JSON.parse(msgSTR);
      const msgObjProperties = Object.keys(msg);
      tf = this._testFields(msgObjProperties);
    } catch (err) {
      tf = false;
    }

    if (tf) { return msg; }
    else { throw new Error(`Incoming message "${msgSTR}" doesn\'t have valid "jsonRWS" subprotocol format.`); }
  }



  /*********** OUTGOING MESSAGES ***********/
  /**
   * Execute the jsonRWS subprotocol for outgoing messages. Filter and map outgoing messages.
   * 1. Test if the message has valid "jsonRWS" format {id:number, from:number, to:number|number[]|string, cmd:string, payload:any}.
   * 2. Convert the message from object to string.
   * @param {{id:number, from:number, to:number|number[]|string, cmd:string, payload?:any}} msg - outgoing message
   * @returns {string}
   */
  outgoing(msg) {
    const msgObjProperties = Object.keys(msg);
    const tf = this._testFields(msgObjProperties);

    if (tf) {
      const msgSTR = JSON.stringify(msg);
      return msgSTR;
    } else {
      throw new Error(`Outgoing message ${JSON.stringify(msg)} doesn\'t have valid "jsonRWS" subprotocol format.`);
    }
  }


  /**
   * Helper to test msg properties.
   * @param {string[]} msgObjProperties - propewrties of the "msg" object
   */
  _testFields(msgObjProperties) {
    const allowedFields = ['id', 'from', 'to', 'cmd', 'payload'];
    const requiredFields = ['id', 'from', 'to', 'cmd'];
    let tf = true;

    // check if every of the msg properties are in allowed fields
    for (const prop of msgObjProperties) {
      if (allowedFields.indexOf(prop) === -1) { tf = false; break; }
    }

    // check if every of required fields is present
    for (const requiredField of requiredFields) {
      if(msgObjProperties.indexOf(requiredField) === -1) { tf = false; break; }
    }

    return tf;
  }




}


module.exports = new JsonRWS();

},{}]},{},[1]);

//# sourceMappingURL=client13jsonRWS.js.map
