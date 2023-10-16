import { Readable as ReadableStream } from 'node:stream';
import { randomBytes } from 'node:crypto';

export default function endlessRandomBytesReadableStream() {
  let producedSize = 0;

  return new ReadableStream({
    read(readSize) {
      randomBytes(readSize, (error, buffer) => {
        if (error) {
          this.emit('error', error);
          return;
        }

        producedSize += readSize;
        this.push(buffer);
      });
    }
  });
}
