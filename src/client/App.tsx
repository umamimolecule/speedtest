import React, { useState } from 'react';
import './App.scss';
import {
  SpeedTestProgressResult,
  SpeedTestResult,
  downloadFileInChunks
} from './util/downloader';

export function App() {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [progressResult, setProgressResult] =
    useState<SpeedTestProgressResult>(null);
  const [result, setResult] = useState<SpeedTestResult>(null);
  const [runningTest, setRunningTest] = useState(false);

  const onProgress = (result: SpeedTestProgressResult) => {
    setProgressResult(result);
  };

  const startDownload = async () => {
    setRunningTest(true);
    try {
      const now = Date.now();
      const result = await downloadFileInChunks(
        `/stream?ts=${now}`,
        1024 * 1024,
        onProgress
      );
      setResult(result);
    } finally {
      setRunningTest(false);
    }
  };

  const formatRate = (megabytesPerSecond?: number): string => {
    if (megabytesPerSecond === null || megabytesPerSecond === undefined) {
      return '';
    }

    return `${Math.round(megabytesPerSecond)} MB/s`;
  };

  return (
    <div className="app">
      {runningTest ? (
        <div>{formatRate(progressResult?.megabytesPerSecond)}</div>
      ) : (
        <div>{formatRate(result?.megabytesPerSecond)}</div>
      )}
      <button onClick={() => startDownload()} disabled={runningTest}>
        {runningTest ? 'Running test...' : 'Start test'}
      </button>
    </div>
  );
}
