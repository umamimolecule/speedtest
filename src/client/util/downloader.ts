export type SpeedTestResult = {
  downloadedBytes: number;
  duration: number;
  megabitsPerSecond: number;
};

export type SpeedTestProgressResult = {
  megabitsPerSecond: number;
  percentDone: number;
};

const PROGRESS_UPDATE_MS = 200;

function calculateMBps(byteCount: number, durationMs: number): number {
  return (byteCount * 8) / (1024 * 1024) / (durationMs / 1000);
}

async function downloadFileInChunks(
  url: string,
  totalDuration: number,
  onProgress: (result: SpeedTestProgressResult) => void
): Promise<SpeedTestResult> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to download file: ${response.status} - ${response.statusText}`
    );
  }

  const startTime = Date.now();

  let totalDownloadedBytes = 0;
  let downloadedBytesSinceLastUpdate = 0;
  let lastUpdateTime = Date.now();

  const reader = response.body.getReader();

  let canUpdate = false;
  const id = setInterval(() => {
    canUpdate = true;
  }, PROGRESS_UPDATE_MS);

  const sampleCount = 20;
  let samples: number[] = [];

  let megabitsPerSecond = 0;
  let result;

  try {
    while (true) {
      const percentDone = (100 * (Date.now() - startTime)) / totalDuration;
      if (percentDone >= 100) {
        reader.cancel();
        break;
      }

      result = await reader.read();
      const { value, done } = result;

      if (value) {
        totalDownloadedBytes += value.length;
        downloadedBytesSinceLastUpdate += value.length;

        if (canUpdate) {
          const sample = calculateMBps(
            downloadedBytesSinceLastUpdate,
            Date.now() - lastUpdateTime
          );

          if (
            sample !== Number.POSITIVE_INFINITY &&
            sample !== Number.NEGATIVE_INFINITY
          ) {
            const newSamples = samples.slice(0, sampleCount - 1);
            samples = [sample, ...newSamples];
          }

          if (samples.length) {
            megabitsPerSecond =
              samples.reduce((sum, curr) => {
                return sum + curr;
              }, 0) / samples.length;

            onProgress({
              megabitsPerSecond,
              percentDone
            });
          }

          lastUpdateTime = Date.now();
          downloadedBytesSinceLastUpdate = 0;
          canUpdate = false;
        }
      }

      if (done) {
        break;
      }
    }

    const endTime = Date.now();

    return {
      downloadedBytes: totalDownloadedBytes,
      duration: endTime - startTime,
      megabitsPerSecond
    };
  } finally {
    clearInterval(id);
  }
}

export { downloadFileInChunks };
