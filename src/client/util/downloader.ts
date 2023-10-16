export type SpeedTestResult = {
  downloadedBytes: number;
  duration: number;
  megabitsPerSecond: number;
};

export type SpeedTestProgressResult = {
  downloadedBytes: number;
  duration: number;
  megabitsPerSecond: number;
  percentDone: number;
};

const PROGRESS_UPDATE_MS = 200;

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
  const contentLength = Number.parseInt(
    response.headers.get('content-length'),
    10
  );

  let downloadedBytes = 0;
  const reader = response.body.getReader();

  let canUpdate = false;
  const id = setInterval(() => {
    canUpdate = true;
  }, PROGRESS_UPDATE_MS);

  let megabitsPerSecond = 0;
  try {
    while (true) {
      const percentDone = (100 * (Date.now() - startTime)) / totalDuration;
      if (percentDone >= 100) {
        reader.cancel();
        break;
      }

      const { done, value } = await reader.read();

      if (value) {
        downloadedBytes += value.length;

        const duration = (Date.now() - startTime) / 1000;
        megabitsPerSecond = (downloadedBytes * 8) / (1024 * 1024) / duration;

        if (canUpdate) {
          onProgress({
            megabitsPerSecond,
            downloadedBytes,
            duration,
            percentDone
          });

          canUpdate = false;
        }
      }

      if (done) {
        break;
      }
    }

    const endTime = Date.now();

    return {
      downloadedBytes,
      duration: endTime - startTime,
      megabitsPerSecond
    };
  } finally {
    clearInterval(id);
  }
}

export { downloadFileInChunks };
