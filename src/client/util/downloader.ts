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

  while (true) {
    const { done, value } = await reader.read();

    console.log(Date.now());

    // TODO: Add debouncing to progress update calls

    if (value) {
      downloadedBytes += value.length;

      const duration = (Date.now() - startTime) / 1000;
      const megabitsPerSecond =
        (downloadedBytes * 8) / (1024 * 1024) / duration;
      onProgress({
        contentLength,
        megabitsPerSecond: megabitsPerSecond,
        downloadedBytes,
        duration
      });
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
}

export { downloadFileInChunks };
