import SparkMD5 from 'spark-md5';

self.onmessage = (e: MessageEvent<{ file: File; chunkSize: number }>) => {
  const { file, chunkSize } = e.data;
  const spark = new SparkMD5.ArrayBuffer();
  const reader = new FileReader();
  let start = 0;

  reader.onload = e => {
    spark.append(e.target?.result as ArrayBuffer);
    start += chunkSize;

    if (start < file.size) {
      reader.readAsArrayBuffer(file.slice(start, start + chunkSize));
    } else {
      self.postMessage({ hash: spark.end() });
    }
  };

  const end = Math.min(start + chunkSize, file.size);
  reader.readAsArrayBuffer(file.slice(start, end));
};
