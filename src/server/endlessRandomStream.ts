import { Readable as ReadableStream } from 'node:stream';

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

const chunkSize = 1024 * 32; // 32KB chunks

export default function endlessRandomBytesReadableStream() {
  return new ReadableStream({
    read(readSize) {
      randomBytes(readSize, (error, buffer) => {
        if (error) {
          this.emit('error', error);
          return;
        }

        this.push(buffer);
      });
    },
    highWaterMark: chunkSize
  });
}
