export type SpeedTestResult = {
  contentLength: number;
  duration: number;
  megabitsPerSecond: number;
};

export type SpeedTestProgressResult = {
  downloadedBytes: number;
  contentLength: number;
  duration: number;
  megabitsPerSecond: number;
};

const PROGRESS_UPDATE_MS = 200;

async function downloadFileInChunks(
  url: string,
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

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (value) {
        downloadedBytes += value.length;

        const duration = (Date.now() - startTime) / 1000;
        const megabitsPerSecond =
          (downloadedBytes * 8) / (1024 * 1024) / duration;

        if (canUpdate) {
          onProgress({
            contentLength,
            megabitsPerSecond,
            downloadedBytes,
            duration
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
      contentLength,
      duration: endTime - startTime,
      megabitsPerSecond:
        (contentLength * 8) / (1024 * 1024) / ((endTime - startTime) / 1000)
    };
  } finally {
    clearInterval(id);
  }
}

export { downloadFileInChunks };
