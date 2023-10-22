export default class CircularBuffer<T> {
  private buffer: T[];
  private readPointer = 0;
  private writePointer = 0;

  constructor(private size: number) {
    this.buffer = new Array(size);
  }

  write(item: T): void {
    this.buffer[this.writePointer] = item;
    this.writePointer = (this.writePointer + 1) % this.size;
    if (this.writePointer === this.readPointer) {
      this.readPointer = (this.readPointer + 1) % this.size;
    }
  }

  read(): T | undefined {
    const item = this.buffer[this.readPointer];
    if (item !== undefined) {
      this.buffer[this.readPointer] = undefined;
      this.readPointer = (this.readPointer + 1) % this.size;
    }
    return item;
  }

  toArray(): T[] {
    return this.buffer;
  }
}
