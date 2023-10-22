import { useRef, useState } from 'react';
import { Event, MessageEvent } from 'ws';
import { connectToWebSocketServer } from '../util/socket';
import CircularBuffer from '../util/circularBuffer';

export type ProgressUpdate = {
  percentComplete: number;
  megabitsPerSecond: number;
};

const MAX_SAMPLE_COUNT = 20;
const PROGRESS_UPDATE_FREQUENCY_MS = 200;
const TEST_DURATION_MS = 10000;

const noop = (...args: any[]): any => undefined;

const useSpeedTest = (webSocketPort?: number) => {
  const [progress, setProgress] = useState<ProgressUpdate>({
    megabitsPerSecond: 0,
    percentComplete: 0
  });
  const [isTestRunning, setIsTestRunning] = useState(false);
  const socket = useRef<WebSocket | null>();
  const samples = useRef<CircularBuffer<number>>(
    new CircularBuffer<number>(MAX_SAMPLE_COUNT)
  );
  const lastSampleTime = useRef<number>(0);
  const bytesReadSinceLastSample = useRef<number>(0);
  const updateTimerId = useRef<number>(0);
  const startTime = useRef<number>(0);

  const onMessage = (event: MessageEvent) => {
    if (event.type === 'message') {
      if (event.data instanceof Blob) {
        bytesReadSinceLastSample.current += event.data.size;
      }

      socket.current.send('MORE');
    }
  };

  const updateProgress = () => {
    const sample =
      bytesReadSinceLastSample.current /
      (Date.now() - lastSampleTime.current) /
      125;

    samples.current.write(sample);

    const filteredSamples = samples.current.toArray().filter((x) => x > 0);
    const megabitsPerSecond =
      filteredSamples.reduce((sum, curr) => sum + curr, 0) /
      filteredSamples.length;

    const percentComplete = Math.min(
      100,
      (100 * (Date.now() - startTime.current)) / TEST_DURATION_MS
    );

    setProgress({ percentComplete, megabitsPerSecond });

    bytesReadSinceLastSample.current = 0;
    lastSampleTime.current = Date.now();

    if (percentComplete < 100) {
      updateTimerId.current = window.setTimeout(
        updateProgress,
        PROGRESS_UPDATE_FREQUENCY_MS
      );
    }
  };

  const start = async (): Promise<void> => {
    if (isTestRunning) {
      return;
    }

    if (updateTimerId.current) {
      clearTimeout(updateTimerId.current);
      updateTimerId.current = 0;
    }

    socket.current?.close();
    socket.current = await connectToWebSocketServer(
      `ws://${window.location.hostname}:${webSocketPort || 3001}`,
      noop,
      onMessage,
      noop,
      noop
    );

    socket.current.send('START');
    window.setTimeout(stop, TEST_DURATION_MS);
    startTime.current = Date.now();
    bytesReadSinceLastSample.current = 0;
    lastSampleTime.current = Date.now();

    setIsTestRunning(true);

    updateTimerId.current = window.setTimeout(
      updateProgress,
      PROGRESS_UPDATE_FREQUENCY_MS
    );
  };

  const stop = async (): Promise<void> => {
    if (updateTimerId.current) {
      clearTimeout(updateTimerId.current);
      updateTimerId.current = 0;
    }

    socket.current?.send('STOP');
    socket.current?.close();
    socket.current = null;

    setProgress({ ...progress, percentComplete: 0 });
    setIsTestRunning(false);
  };

  return {
    start,
    stop,
    isTestRunning,
    progress
  };
};

export { useSpeedTest };
