import express, { Application } from 'express';
import path from 'path';
import randomBytesReadableStream from './randomStream';

const PUBLIC_URL: string = process.env.PUBLIC_URL || '';
const PORT: string = process.env.PORT || '3000';

const app: Application = express();

app.get('/stream', (req, res) => {
  // Create a Readable Stream (in this case, reading from a file)
  const contentLength = 1024 * 1024 * 1024;
  const stream = randomBytesReadableStream({ size: contentLength });

  // Set response headers
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', contentLength.toString());

  // Pipe the Readable Stream to the Response
  stream.pipe(res);

  // Optional: Handle errors
  stream.on('error', (err: Error | unknown) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
