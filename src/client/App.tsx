import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import { useSpeedTest } from './hooks/useSpeedTest';
import './App.scss';

export function App() {
  const [version, setVersion] = useState('');
  const { start, progress, isTestRunning } = useSpeedTest();

  useEffect(() => {
    async function init() {
      const response = await fetch('/version');
      if (response.ok) {
        const versionInfo = await response.json();
        setVersion(versionInfo.version);
      }
    }
    init();
  }, []);

  const formatRate = (megabytesPerSecond: number): React.ReactNode => {
    const haveValue = megabytesPerSecond > 0;
    const value = haveValue ? Math.round(megabytesPerSecond) : '----';
    return (
      <div className="flex flex-row gap-4 items-baseline">
        <div
          className={cn(
            'text-7xl font-mono',
            `${haveValue ? 'text-white' : 'text-neutral-500'}`,
            { 'font-thin': !haveValue }
          )}
        >
          {value}
        </div>
        <div className="text-4xl text-neutral-400 font-light">Mbps</div>
      </div>
    );
  };

  const renderProgressBar = () => {
    if (!isTestRunning || !progress.percentComplete) {
      return (
        <div
          className="-mt-8"
          style={{ height: '4px', background: 'transparent' }}
        >
          {' '}
        </div>
      );
    }

    const percent = Math.round(progress.percentComplete);

    return (
      <div
        className="bg-neutral-800 self-stretch flex flex-row -mt-8"
        style={{ width: '100%', height: '4px' }}
      >
        <div
          className="bg-blue-500 self-start transition-all ease-linear"
          style={{ width: `${percent}%`, height: '100%' }}
        >
          {' '}
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <div className="flex flex-col gap-10 items-center justify-center min-w-[350px]">
        <div className="text-2xl text-neutral-400 mb-4 font-thin">
          LAN speed test
        </div>
        <div>{formatRate(progress.megabitsPerSecond)}</div>
        {renderProgressBar()}
        <button
          className={cn([
            'bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-600 text-white disabled:text-neutral-400 py-2 px-4 rounded'
          ])}
          onClick={() => start()}
          disabled={isTestRunning}
        >
          {isTestRunning ? 'Running test...' : 'Start test'}
        </button>
      </div>
      <div>
        <a target="_blank" href="https://github.com/umamimolecule/speedtest">
          <img
            className="absolute bottom-8 right-8 w-12 h-12 hover:scale-110 transition-all"
            src="data:image/png;base64,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"
          />
        </a>
      </div>
      <div className="absolute bottom-8 left-8 text-neutral-500">
        v{version}
      </div>
    </div>
  );
}
