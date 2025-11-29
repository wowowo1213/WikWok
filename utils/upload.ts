import axios from '~/plugins/axios';

const $axios = axios().provide.axios;
const { $userStore } = useNuxtApp();

export async function getFileChunks(file: File) {
  const chunkSize = 20 * 1024 * 1024;
  const chunks = [];
  let start = 0;
  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    chunks.push(file.slice(start, end));
    start = end;
  }
  return chunks;
}

export async function calculateFileHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/uploadFileHashWorker.ts', import.meta.url));
    const chunkSize = 20 * 1024 * 1024;
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
  return $axios.post('/upload/submit-meta', {
    userId: $userStore.currentUserId,
    ...data,
  });
}

function calculateProgress(
  chunks: Blob[],
  currentChunkIndex: number,
  progressEvent: ProgressEvent
) {
  const loadedSize =
    chunks.slice(0, currentChunkIndex).reduce((sum, chunk) => sum + chunk.size, 0) +
    progressEvent.loaded;

  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  const percent = Math.round((loadedSize / totalSize) * 100);

  return { loadedSize, totalSize, percent };
}

export async function uploadVideo(file: File, caption: string) {
  try {
    const fileHash = await calculateFileHash(file);
    const { exists } = await $axios.get('/upload/upload-check', { params: { hash: fileHash } });

    if (exists) return submitVideoMeta({ fileHash, filename: file.name, caption });

    const chunks = await getFileChunks(file);
    const uploadPromises = chunks.map((chunk, index) => {
      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('hash', `${fileHash}-${index}`);
      formData.append('filename', file.name);
      formData.append('chunkCount', chunks.length.toString());

      let res = $axios.post('/upload/upload-chunk', formData, {
        onUploadProgress: progressEvent => {
          calculateProgress(chunks, index, progressEvent);
        },
      });

      return res;
    });

    await Promise.all(uploadPromises);

    const mergeRes = await $axios.post('/upload/merge-chunks', {
      userId: $userStore.currentUserId,
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
