import { Readable as ReadableStream } from 'node:stream';
// import { randomBytes } from 'node:crypto';

let cachedRandomBytes: Record<string, Buffer> = {};

setInterval(() => {
  clearCache();
}, 60000);

export function clearCache() {
  cachedRandomBytes = {};
}

function randomBytes(
  size: number,
  callback: (error: Error | null, buf: Buffer) => void
): void {
  const key = size.toString();
  const cachedValue = cachedRandomBytes[key];
  if (cachedValue) {
    callback(null, cachedValue);
    return;
  }

  const buffer = Buffer.alloc(size);
  for (let i = 0; i < size; i++) {
    buffer[i] = Math.floor(Math.random() * 256);
  }
  cachedRandomBytes[key] = buffer;
  callback(null, buffer);
}

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
