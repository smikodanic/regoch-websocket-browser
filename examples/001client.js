class TestCB extends window.wsu.ClientBrowser {

  constructor(wcOpts) {
    super(wcOpts);
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
  printInfo() {
    const msgSize = this.getMessageSize(this.msg);
    if (this.ws && this.ws.readyState === 1) { console.log(`Sent (${msgSize}): ${this.msg}`); }
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


}




const wcOpts = {
  wsURL: 'ws://localhost:3211?authkey=TRTmrt',
  timeout: 3*1000, // 3 secs
  debug: true
};

const testCB = new TestCB(wcOpts);
