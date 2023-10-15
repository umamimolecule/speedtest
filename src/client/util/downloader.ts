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
  chunkSize: number,
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

  console.log({ contentLength, chunkSize });
  const totalChunks = Math.ceil(contentLength / chunkSize);
  let downloadedBytes = 0;

  const reader = response.body.getReader();

  let done = false;
  while (!done) {
    const { done, value } = await reader.read();

    if (done) {
      console.log('done');
      break;
    }

    downloadedBytes += value.length;

    const duration = (Date.now() - startTime) / 1000;
    const megabytesPerSecond = downloadedBytes / (1024 * 1024) / duration;
    onProgress({
      contentLength,
      megabytesPerSecond,
      duration
    });
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
