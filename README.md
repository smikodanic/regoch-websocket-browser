# regoch-websocket-browser
> Websocket Client for browser which works best with the [Regoch Websocket Server](https://github.com/smikodanic/regoch-websocket-server).

Very small but very powerful library made according to [RFC6455 Standard](https://www.iana.org/assignments/websocket/websocket.xml) for websocket version 13.

## Installation
```
npm install --save regoch-websocket-browser
```

## Website
[www.regoch.org](http://www.regoch.org/websocket-client-browser)


## Websocket Server Features
- websocket version: **13**
- subprotocol: **[jsonRWS](http://www.regoch.org/websocket-protocol-jsonRWS)**
- chat in the rooms
- small file size (*~4kB only*)
- powerful API
- possible RxJS integration
- [browserify](http://browserify.org/)


## Development
```bash
npm run dev
```

## How to use
```javascript
class TestClient extends window.wsu.ClientBrowser {
  constructor(wcOpts) {
    super(wcOpts);
  }
}

const wcOpts = {
  wsURL: 'ws://localhost:3211?authkey=TRTmrt',
  timeout: 3*1000, // 3 secs
  debug: true
};

const tc = new TestClient(wcOpts);
```

```html
<button onclick="testCB.connect()">Connect</button>
<button onclick="testCB.disconnect()">Disconnect</button>
```


## API
- **connect()** - connect to the websocket server
- **disconnect()** - disconnect from the websocket server
- **sendOne(to:number, msg:any)** - send message to one websocket socket/client (parameter *to* is the socket ID)
- **send(to:number[], msg:any)** - send message to one or more clients
- **broadcast(msg:any)** - send message to all clients except the sender
- **sendAll(msg:any)** - send message to all clients and the sender
- **roomEnter(roomName:string)** - enter the room and start to listen the room's messages
- **roomExit(roomName:string)** - exit from the room and stop to listen the room's messages
- **roomExitAll()** - exit from the all rooms
- **setNick(nickname:string)** - set the client's nickname
- **route(uri:string, body?:any)** - send route to the server, for example: *{uri: '/login', body: {username: 'john', password: 'trtmrt'}}*


### Licence
“Freely you received, freely you give”, Matthew 10:5-8

Copyright (c) 2020 Saša Mikodanić licensed under [AGPL-3.0](./LICENSE) .
