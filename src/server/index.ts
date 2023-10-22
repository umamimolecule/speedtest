import express, { Application } from 'express';
import { WebSocket, Server as WebsocketServer } from 'ws';
import path from 'path';

const args: Record<string, string> = {};
let argKey: string;
process.argv.slice(2).forEach((x, i) => {
  if (i % 2 === 0) {
    argKey = x;
  } else {
    args[argKey] = x;
  }
});

const PUBLIC_URL: string = process.env.PUBLIC_URL || '';
const PORT: number = Number.parseInt(
  args['-p'] || process.env.PORT || '3000',
  10
);
const WS_PORT: number = Number.parseInt(
  args['-w'] || process.env.WS_PORT || '3002',
  10
);
const CHUNK_SIZE = 2 * 1024 * 1024;

const app: Application = express();
const wss = new WebsocketServer({ host: '0.0.0.0', port: WS_PORT });

console.log(
  '\x1b[34m',
  `${String.fromCodePoint(
    0x1f680
  )} Websocket server has started running at http://localhost:${WS_PORT}/ ${String.fromCodePoint(
    0x1f680
  )}`
);

const buffer = Buffer.alloc(CHUNK_SIZE);
for (let i = 0; i < CHUNK_SIZE; i++) {
  buffer[i] = Math.floor(Math.random() * 256);
}

const sendData = (ws: WebSocket) => {
  chunks++;
  ws.send(buffer);
};

let chunks = 0;

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    switch (message.toString()) {
      case 'START':
        chunks = 0;
        sendData(ws);
        break;

      case 'MORE':
        sendData(ws);
        break;

      case 'STOP':
        console.log(
          `${chunks} chunks sent (total of ${
            (chunks * CHUNK_SIZE) / (1024 * 1024)
          }MB)`
        );
        break;
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/appinfo', (req, res) => {
  var pjson = require('../../package.json');
  res.send({ version: pjson.version, port: PORT, webSocketPort: WS_PORT });
});

app.use(
  PUBLIC_URL,
  express.static(path.resolve(__dirname, '../../build'), { maxAge: Infinity })
);

app.get('*', (_, res) => {
  res.sendFile(path.resolve(__dirname, '../../build/index.html'));
});

app.listen(PORT, () => {
  console.log(
    '\x1b[34m',
    `${String.fromCodePoint(
      0x1f680
    )} HTTP server has started running at http://localhost:${PORT}/ ${String.fromCodePoint(
      0x1f680
    )}`
  );
});

module.exports = app;
