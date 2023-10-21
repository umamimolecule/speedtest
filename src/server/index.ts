import express, { Application } from 'express';
import path from 'path';
import endlessRandomBytesReadableStream, {
  clearCache
} from './endlessRandomStream';

const PUBLIC_URL: string = process.env.PUBLIC_URL || '';
const PORT: string = process.env.PORT || '3000';

const app: Application = express();

app.get('/stream', (req, res) => {
  const stream = endlessRandomBytesReadableStream();

  // Set response headers
  res.setHeader('Content-Type', 'application/octet-stream');
  // res.setHeader('Content-Length', '999999999999');

  // Pipe the Readable Stream to the Response
  stream.pipe(res);

  // Optional: Handle errors
  stream.on('error', (err: Error | unknown) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
  });

  stream.on('close', () => {
    clearCache();
  });

  stream.on('end', () => {
    clearCache();
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/version', (req, res) => {
  var pjson = require('../../package.json');
  res.send({ version: pjson.version });
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
    )} Server has started running at http://localhost:${PORT}/ ${String.fromCodePoint(
      0x1f680
    )}`
  );
});

module.exports = app;
