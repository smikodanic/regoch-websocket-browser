(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * Websocket Client for Browser
 * - websocket version: 13
 * - subprotocol: jsonRWS
 */
const jsonRWS = require('./lib/subprotocol/jsonRWS');
const helper = require('./lib/helper');


class Client13jsonRWS {

  /**
   * @param {{wsURL:string, timeout:number, debug:boolean}} wcOpts - websocket client options
   */
  constructor(wcOpts) {
    this.wcOpts = wcOpts;
    this.ws;
  }


  /************* CLIENT CONNECTOR ************/
  /**
   * Connect to the websocket server.
   * @returns {void}
   */
  connect() {
    const wsURL = this.wcOpts.wsURL; // websocket URL: ws://localhost:3211/something?authkey=TRTmrt
    this.ws = new WebSocket(wsURL, ['jsonRWS']);
    this.onEvents();
    this.onMessage(msgObj => {
      if (msgObj.cmd === 'info/socket/id') { this.socketID = +msgObj.payload; } // get the client socketID
    });
  }


  /**
   * Disconnect from the websocket server.
   * @returns {void}
   */
  disconnect() {
    this.ws.close();
  }


  /**
   * Event listeners.
   * @returns {void}
   */
  onEvents() {
    this.ws.onopen = (conn) => {
      console.log('WS Connection opened');
    };

    this.ws.onclose = () => {
      console.log('WS Connection closed');
    };

    this.ws.onerror = (err) => {
      console.error(err);
    };
  }




  /************* RECEIVER ************/
  /**
   * Receive the message event and push it to msgStream.
   * @returns {void}
   */
  onMessage(cb) {
    this.ws.onmessage = (event) => {
      const msg = event.data;
      this.debug('Received: ', msg);
      const msgObj = jsonRWS.incoming(msg); // test against subprotocol rules and convert string to object
      cb(msgObj);
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
    this.carryOut(cmd, payload, to);

    // receive the answer
    return new Promise(async (resolve, reject) => {
      this.onMessage(async (msgObj) => {
        if (msgObj.cmd === cmd) { resolve(msgObj); }
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
   * @returns {void}
   */
  carryOut(cmd, payload, to) {
    const id = helper.generateID(); // the message ID
    const from = +this.socketID; // the sender ID
    if (!to) { to = 0; } // server ID is 0
    const msgObj = {id, from, to, cmd, payload};
    const msg = jsonRWS.outgoing(msgObj);

    // the message must be defined and client must be connected to the server
    if (!!msg && !!this.ws && this.ws.readyState === 1) {
      this.ws.send(msg);
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
    this.carryOut(cmd, payload, to);
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
    this.carryOut(cmd, payload, to);
  }


  /**
   * Send message (payload) to all clients except the sender.
   * @param {any} msg - message sent to the clients
   * @returns {void}
   */
  broadcast(msg) {
    const cmd = 'socket/broadcast';
    const payload = msg;
    this.carryOut(cmd, payload);
  }

  /**
   * Send message (payload) to all clients and the sender.
   * @param {any} msg - message sent to the clients
   * @returns {void}
   */
  sendAll(msg) {
    const cmd = 'socket/sendall';
    const payload = msg;
    this.carryOut(cmd, payload);
  }



  /************* ROOM ************/
  /**
   * Subscribe in the room.
   * @param {string} roomName
   * @returns {void}
   */
  roomEnter(roomName) {
    const cmd = 'room/enter';
    const payload = roomName;
    const to = 0;
    this.carryOut(cmd, payload, to);
  }

  /**
   * Unsubscribe from the room.
   * @param {string} roomName
   * @returns {void}
   */
  roomExit(roomName) {
    const cmd = 'room/exit';
    const payload = roomName;
    const to = 0;
    this.carryOut(cmd, payload, to);
  }

  /**
   * Unsubscribe from all rooms.
   * @returns {void}
   */
  roomExitAll() {
    const cmd = 'room/exitall';
    const payload = undefined;
    const to = 0;
    this.carryOut(cmd, payload, to);
  }

  /**
   * Send message to the room.
   * @param {string} roomName
   * @param {any} msg
   * @returns {void}
   */
  roomSend(roomName, msg) {
    const cmd = 'room/send';
    const payload = msg;
    const to = roomName;
    this.carryOut(cmd, payload, to);
  }




  /********* SEND MESSAGE (COMMAND) TO SERVER *********/
  /**
   * Setup a nick name.
   * @param {string} nickname - nick name
   * @returns {void}
   */
  setNick(nickname) {
    const cmd = 'socket/nick';
    const payload = nickname;
    const to = 0;
    this.carryOut(cmd, payload, to);
  }


  /**
   * Send route command.
   * @param {string} uri - route URI, for example /shop/product/55
   * @param {any} body - body
   * @returns {void}
   */
  route(uri, body) {
    const cmd = 'route';
    const payload = {uri, body};
    const to = 0;
    this.carryOut(cmd, payload, to);
  }



  /**
   * Debugger. Use it as this.debug(var1, var2, var3)
   * @returns {void}
   */
  debug(...textParts) {
    const text = textParts.join('');
    if (this.wcOpts.debug) { console.log(text); }
  }



}


window.regoch = { Client13jsonRWS };

},{"./lib/helper":2,"./lib/subprotocol/jsonRWS":3}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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
