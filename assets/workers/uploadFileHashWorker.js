import SparkMD5 from 'spark-md5';

self.onmessage = e => {
  const { file, chunkSize } = e.data;
  const spark = new SparkMD5.ArrayBuffer();
  const reader = new FileReader();
  let start = 0;
  let end = Math.min(chunkSize, file.size);

  reader.onload = e => {
    spark.append(e.target?.result);
    start = end;
    end = Math.min(start + chunkSize, file.size);

    if (start < file.size) {
      reader.readAsArrayBuffer(file.slice(start, start + chunkSize));
    } else {
      self.postMessage({ hash: spark.end() });
    }
  };

  reader.readAsArrayBuffer(file.slice(start, end));
};
