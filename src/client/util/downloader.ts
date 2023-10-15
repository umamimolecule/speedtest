export type SpeedTestResult = {
  contentLength: number;
  duration: number;
  megabytesPerSecond: number;
};

export type SpeedTestProgressResult = {
  downloadedBytes: number;
  contentLength: number;
  duration: number;
  megabytesPerSecond: number;
};

async function downloadFileInChunks(
  url: string,
  onProgress: (result: SpeedTestResult) => void
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

    if (value) {
      downloadedBytes += value.length;

      const duration = (Date.now() - startTime) / 1000;
      const megabytesPerSecond = downloadedBytes / (1024 * 1024) / duration;
      onProgress({
        contentLength,
        megabytesPerSecond,
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
    megabytesPerSecond:
      contentLength / (1024 * 1024) / ((endTime - startTime) / 1000)
  };
}

export { downloadFileInChunks };
