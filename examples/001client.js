class TestClient extends window.regoch.Client13jsonRWS {

  constructor(wcOpts) {
    super(wcOpts);
  }


  async connectMe() {
    const wsocket = await this.connect();
    console.log('+++Connected', wsocket);
    this.messageReceiver();
  }


  /*** Questions Tests */
  async infoSocketId_test() {
    try {
      const socketID = await this.infoSocketId();
      $('[data-text="socketID"]').text(socketID);
    } catch (err) {
      console.error(err);
    }
  }

  async infoSocketList_test() {
    try {
      const socketIDs = await this.infoSocketList();
      $('[data-text="socketIDs"]').text(JSON.stringify(socketIDs));
    } catch (err) {
      console.error(err);
    }
  }

  async infoRoomList_test() {
    try {
      const rooms = await this.infoRoomList(); // [{name, socketIDs}]
      if (!!rooms) {
        const roomNames = rooms.map(room => room.name);
        $('[data-text="roomNames"]').text(roomNames);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async infoRoomListmy_test() {
    try {
      const rooms = await this.infoRoomListmy(); // [{name, socketIDs}]
      if (!!rooms) {
        const roomNames = rooms.map(room => room.name);
        $('[data-text="myRoomNames"]').text(roomNames);
      }
    } catch (err) {
      console.error(err);
    }
  }



  /*** Send Tests */
  sendOne_test() {
    const to = +document.getElementById('to1').value;
    const payload = document.getElementById('payload1').value;
    this.sendOne(to, payload);
  }

  send_test() {
    const tos = document.getElementById('to2').value; // string 210205081923171300, 210205082042463230
    const to = tos.split(',').map(to => +to); // array of numbers [210205081923171300, 210205082042463230]
    const payload = document.getElementById('payload2').value;
    this.send(to, payload);
  }

  broadcast_test() {
    const payload = document.getElementById('payload3').value;
    this.broadcast(payload);
  }

  sendAll_test() {
    const payload = document.getElementById('payload4').value;
    this.sendAll(payload);
  }




  // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
  printInfo(msg) {
    const msgSize = window.regoch.helper.getMessageSize(msg);
    if (this.wsocket && this.wsocket.readyState === 1) { console.log(`Sent (${msgSize}): ${msg}`); }
  }



  /*** ROOM ***/
  roomEnter_test() {
    const roomName = document.getElementById('roomName').value;
    this.roomEnter(roomName);
  }

  roomExit_test() {
    const roomName = document.getElementById('roomName').value;
    this.roomExit(roomName);
  }

  roomExitAll_test() {
    this.roomExitAll();
  }

  roomSend_test() {
    const roomName = document.getElementById('roomName').value;
    const roomMessage = document.getElementById('roomMessage').value;
    this.roomSend(roomName, roomMessage);
  }



  /*** SERVER COMMANDS ***/
  setNick_test() {
    const nickname = document.getElementById('nickname').value;
    this.setNick(nickname);
  }

  route_test() {
    const uri = document.getElementById('routeUri').value;
    const bodyStr = document.getElementById('routeBody').value;
    const body = JSON.parse(bodyStr);
    this.route(uri, body);
  }


  route_test2() {
    const uri = document.getElementById('routeUri2').value;
    this.route(uri);

    // receive route
    this.once('route', (msg, msgSTR) => {
      console.log('route msg::', msg);
      // router transitional variable
      const router = this.router;
      const payload = msg.payload; // {uri:string, body?:any}

      // router transitional varaible
      router.trx = {
        uri: payload.uri,
        body: payload.body,
        client: this
      };

      // route definitions
      router.def('/returned/back/:n', (trx) => { console.log('trx.params::', trx.params); });
      router.notfound((trx) => { console.log(`The URI not found: ${trx.uri}`); });

      // execute the router
      router.exe().catch(err => {
        console.log(err);
      });

    });
  }


  messageReceiver() {
    this.on('message', (msg, msgSTR) => {
      console.log('msg (message after subprotocol)::', msg); // message after subprotocol
      console.log('msgSTR (message string)::', msgSTR); // received message
      $('#incomingMessage').text(msg.payload);
    });
  }


}




const wcOpts = {
  wsURL: 'ws://localhost:3211?authkey=TRTmrt',
  timeout: 3*1000, // wait 3secs for answer
  reconnectAttempts: 5, // try to reconnect 5 times
  reconnectDelay: 3000, // delay between reconnections is 3 seconds
  subprotocols: ['jsonRWS'],
  debug: true
};

const testCB = new TestClient(wcOpts);
