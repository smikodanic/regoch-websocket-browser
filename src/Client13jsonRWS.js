/**
 * Websocket Client for Browser
 * - websocket version: 13
 * - subprotocol: jsonRWS
 */
const jsonRWS = require('./lib/subprotocol/jsonRWS');
const Router = require('./lib/Router');
const helper = require('./lib/helper');


class Client13jsonRWS {

  /**
   * @param {{wsURL:string, timeout:number, recconectAttempts:number, reconnectDelay:number, subprotocols:string[], debug:boolean}} wcOpts - websocket client options
   */
  constructor(wcOpts) {
    this.wcOpts = wcOpts; // websocket client options
    this.wsocket; // Websocket instance https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
    this.socketID; // socket ID number, for example: 210214082949459100
    this.attempt = 1; // reconnect attempt counter
  }


  /************* CLIENT CONNECTOR ************/
  /**
   * Connect to the websocket server.
   * @returns {void}
   */
  connect() {
    const wsURL = this.wcOpts.wsURL; // websocket URL: ws://localhost:3211/something?authkey=TRTmrt
    this.wsocket = new WebSocket(wsURL, this.wcOpts.subprotocols);
    this.onEvents();

    this.router = new Router(this.wcOpts.debug);
  }


  /**
   * Disconnect from the websocket server.
   * @returns {void}
   */
  disconnect() {
    this.wsocket.close();
  }


  /**
   * Try to reconnect the client when the socket is closed.
   * This method is fired on every 'close' socket's event.
   */
  async reconnect() {
    const attempts = this.wcOpts.recconectAttempts;
    const delay = this.wcOpts.recconectDelay;
    if (this.attempt <= attempts) {
      await helper.sleep(delay);
      this.connect();
      console.log(`Reconnect attempt #${this.attempt} of ${attempts} in ${delay}ms`);
      this.attempt++;
    }
  }


  /**
   * Reset the properties.
   */
  reset() {
    delete this.clientRequest;
    if (!!this.socket) { this.socket.unref(); }
    delete this.socket;
  }


  /**
   * Event listeners.
   * @returns {void}
   */
  onEvents() {
    this.wsocket.onopen = async (conn) => {
      this.socketID = await this.infoSocketId();
      console.log('WS Connection opened');
    };

    this.wsocket.onclose = () => {
      console.log('WS Connection closed');
      this.reset();
      this.reconnect();
    };

    this.wsocket.onerror = (errorEvent) => {
      // console.error(errorEvent);
    };
  }




  /************* RECEIVER ************/
  /**
   * Receive the message event and push it to msgStream.
   * @param {Function} - callback function
   * @returns {void}
   */
  onMessage(cb) {
    this.wsocket.onmessage = (event) => {
      const msgSTR = event.data;
      this.debugger('Received: ', msgSTR);
      const msg = jsonRWS.incoming(msgSTR); // test against subprotocol rules and convert string to object
      cb(msg, msgSTR);
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



  /**
   * Debugger. Use it as this.debug(var1, var2, var3)
   * @returns {void}
   */
  debugger(...textParts) {
    const text = textParts.join('');
    if (this.wcOpts.debug) { console.log(text); }
  }



}


window.regoch = { Client13jsonRWS, Router };
