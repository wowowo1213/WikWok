import type { AxiosProgressEvent } from 'axios';
import Worker from '~/assets/workers/uploadFileHashWorker.js?worker';

const generalStore = useGeneralStore();
const { $axios } = useNuxtApp();

async function getFileChunks(file: File) {
  const chunkSize = 10 * 1024 * 1024;
  const chunks = [];
  let start = 0;
  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    chunks.push(file.slice(start, end));
    start = end;
  }
  return chunks;
}

async function calculateFileHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = new Worker();
    const chunkSize = 10 * 1024 * 1024;

    worker.postMessage({ file, chunkSize });

    worker.onmessage = (e: MessageEvent<{ hash: string }>) => {
      resolve(e.data.hash);
      worker.terminate();
    };

    worker.onerror = error => {
      reject(error);
      worker.terminate();
    };
  });
}

async function submitVideoMeta(data: {
  fileHash: string;
  filename: string;
  caption: string;
  views?: number;
  likes?: number;
}) {
  return await generalStore.submitVideoMeta(data);
}

function calculateProgress(
  chunks: Blob[],
  currentChunkIndex: number,
  progressEvent: AxiosProgressEvent
) {
  const loadedSize =
    chunks.slice(0, currentChunkIndex).reduce((sum, chunk) => sum + chunk.size, 0) +
    progressEvent.loaded;

  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  const percent = Math.round((loadedSize / totalSize) * 100);

  return { loadedSize, totalSize, percent };
}

export async function uploadVideoUtil(file: File, caption: string) {
  try {
    const fileHash = await calculateFileHash(file);
    const res = await $axios.get('/upload/upload-check', { params: { hash: fileHash } });
    const { exist, uploadedChunks = [] } = res.data.data;

    if (exist) return submitVideoMeta({ fileHash, filename: file.name, caption });

    const chunks = await getFileChunks(file);
    const MAX_CONCURRENCY = 4;
    let promises: Promise<void>[] = [];

    const uploadChunk = async (chunk: Blob, index: number) => {
      const formData = new FormData();
      formData.append('hash', `${fileHash}-${index}`);
      formData.append('filename', file.name);
      formData.append('chunkCount', chunks.length.toString());
      formData.append('chunk', chunk);
      formData.append('chunkIndex', index.toString());

      await $axios.post('/upload/upload-chunk', formData, {
        onUploadProgress: progressEvent => {
          const progress = calculateProgress(chunks, index, progressEvent);
          console.log(`分片 ${index} 上传进度: ${progress.percent}%`);
        },
      });
    };

    for (let i = 0; i < chunks.length; i++) {
      if (uploadedChunks.includes(i)) continue;

      if (promises.length === MAX_CONCURRENCY) await Promise.race(promises);

      const task = uploadChunk(chunks[i] as Blob, i).finally(() => {
        const index = promises.indexOf(task);
        if (index !== -1) promises.splice(index, 1);
      });
      promises.push(task);
    }

    await Promise.all(promises);

    const mergeRes = await $axios.post('/upload/merge-chunks', {
      userId: useUserStore().userData.userId,
      fileHash,
      filename: file.name,
      caption,
      chunkCount: chunks.length,
    });

    return mergeRes.data;
  } catch (error) {
    return error;
  }
}
