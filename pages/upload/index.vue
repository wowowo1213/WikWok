<template>
  <UploadError :errorType="errorType" />

  <div
    v-if="isUploading"
    class="fixed inset-0 flex items-center justify-center bg-black/50 z-100 text-white"
  >
    <div class="flex flex-col">
      <Icon class="animate-spin ml-1" name="mingcute:loading-line" size="100" />
      <button
        @click="cancelUpload"
        class="mt-4 px-4 py-1.5 text-white text-[15px] bg-[#F02C56] rounded-sm hover:bg-red-700 cursor-pointer"
      >
        取消上传
      </button>
    </div>
  </div>

  <UploadLayout>
    <div class="w-full mt-20 mb-10 bg-white shadow-lg rounded-md py-6 md:px-10 px-4">
      <div>
        <div class="text-[23px] font-semibold">上传视频</div>
        <div class="text-gray-400 mt-1">在您的账号中上传一个视频</div>
      </div>

      <div class="mt-8 md:flex gap-6">
        <input ref="file" type="file" id="fileInput" @input="onChange" hidden accept=".mp4" />
        <label
          v-if="!fileDisplay"
          for="fileInput"
          @drop.prevent="onDrop"
          @dragover.prevent=""
          class="mx-auto mt-4 mb-6 flex flex-col items-center justify-center w-full max-w-65 h-117.5 text-center p-3 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer"
        >
          <Icon name="majesticons:cloud-upload" size="40" color="#b3b3b1" />
          <div class="mt-4 text-[17px]">选择视频上传</div>
          <div class="mt-1.5 text-gray-500 text-[13px]">或者拖拽一个文件</div>
          <div class="mt-12 text-gray-400 text-sm">MP4</div>
          <div class="mt-2 text-gray-400 text-[13px]">最多30分钟</div>
          <div class="mt-2 text-gray-400 text-[13px]">文件不能大于2GB</div>
          <div
            class="px-2 py-1.5 mt-8 text-white text-[15px] w-[80%] bg-[#F02C56] rounded-sm hover:bg-red-700"
          >
            选择文件
          </div>
        </label>

        <div
          v-else
          class="mx-auto mt-4 md:mb-12 mb-16 flex items-center justify-center w-full max-w-65 h-137.5 p-3 rounded-2xl cursor-pointer relative"
        >
          <div class="bg-white h-full w-full" />
          <img class="absolute z-20 pointer-events-none" src="~/assets/images/mobile-case.png" />
          <img
            class="absolute right-1 bottom-6 z-20"
            width="100"
            src="~/assets/images/tiktok_float.png"
          />
          <video
            autoplay
            loop
            muted
            class="absolute rounded-xl object-cover z-10 p-3.25 w-full h-full"
            :src="fileDisplay"
          />

          <div
            class="absolute -bottom-12 flex items-center justify-between z-50 rounded-xl border w-full p-2 border-gray-300"
          >
            <div class="flex items-center truncate">
              <Icon name="clarity:success-standard-line" size="16" class="min-w-4" />
              <div class="text-[11px] pl-1 mr-1 truncate text-ellipsis">
                {{ fileData?.name }}
              </div>
            </div>
            <button class="w-17.5 text-[11px] font-bold cursor-pointer" @click="changeVideo">
              更换视频
            </button>
          </div>
        </div>

        <div class="mt-4 mb-6">
          <div class="flex bg-[#F8F8F8] py-4 px-6">
            <div>
              <Icon class="mr-4" size="20" name="mdi:box-cutter-off" />
            </div>
            <div>
              <div class="text-semibold text-[15px] mb-1.5">分割与剪辑视频</div>
              <div class="text-semibold text-[13px] text-gray-400">
                您可快速将视频分割为多个片段，删除冗余内容，并将横版视频转换为竖版格式。
              </div>
            </div>
            <div class="flex justify-end max-w-32.5 w-full h-full text-center my-auto">
              <button
                class="px-8 py-1.5 text-white text-[15px] bg-[#F02C56] rounded-sm hover:bg-red-700 cursor-pointer"
              >
                编辑
              </button>
            </div>
          </div>

          <div class="mt-5">
            <div class="flex items-center justify-between">
              <div class="mb-1 text-[15px]">视频简介</div>
              <div class="text-gray-400 text-[12px]">{{ caption.length }}/150</div>
            </div>
            <input
              v-model="caption"
              maxlength="150"
              type="text"
              class="w-full border mt-1 p-2.5 rounded-md focus:outline-none"
            />
          </div>

          <div class="flex gap-3">
            <button
              class="px-10 py-2.5 mt-8 border border-gray-300 text-[16px] cursor-pointer hover:bg-gray-200 rounded-sm"
              @click="discard()"
            >
              取消
            </button>
            <button
              @click="uploadVideo()"
              class="px-10 py-2.5 mt-8 border text-[16px] text-white bg-[#F02C56] rounded-sm hover:bg-red-600 cursor-pointer"
            >
              发布
            </button>
          </div>
          <div class="mt-10 text-red-500 font-semibold">{{ errors }}</div>
        </div>
      </div>
    </div>
  </UploadLayout>
</template>

<script setup lang="ts">
import UploadLayout from '~/layouts/UploadLayout.vue';
import { uploadVideoUtil } from '~/utils/upload';

const { $generalStore, $userStore } = useNuxtApp();
const router = useRouter();
definePageMeta({ middleware: 'auth' });

const file = ref<HTMLInputElement | null>(null);
const fileData = ref<File | null>(null);
const fileDisplay = ref<string | null>(null);
const caption = ref('');
const errorType = ref<'caption' | 'file' | null>(null);
const errors = ref<string | Array<string> | null>(null);

watch(
  () => caption.value,
  newCaption => {
    errorType.value = newCaption.length >= 150 ? 'caption' : null;
  }
);

const onChange = (e: Event) => {
  errorType.value = null;
  const target = e.target as HTMLInputElement;
  handleFile(target.files?.[0]);
};

const onDrop = (e: DragEvent) => {
  errorType.value = null;
  if (!e.dataTransfer?.files?.length) {
    errorType.value = 'file';
    return;
  }
  handleFile(e.dataTransfer.files[0]);
};

const handleFile = (file: File | null | undefined) => {
  if (!file) {
    errorType.value = 'file';
    return;
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension !== 'mp4') {
    errorType.value = 'file';
    return;
  }

  fileData.value = file;
  fileDisplay.value = URL.createObjectURL(file);
};

const changeVideo = () => {
  file.value?.click();
};

const discard = () => {
  file.value = null;
  fileData.value = null;
  fileDisplay.value = null;
  caption.value = '';
  errors.value = null;
};

const isUploading = ref(false);
const uploadVideo = async () => {
  errors.value = null;

  if (!fileData.value) return (errors.value = '上传视频不能为空');
  if (!caption.value) return (errors.value = '视频简介不能为空');

  isUploading.value = true;

  try {
    let res = await uploadVideoUtil(fileData.value, caption.value);
    if (res.status === 200) router.push('/profile/' + $userStore.userData.userId);
  } catch (error: string | Array<string>) {
    errors.value = error;
  } finally {
    isUploading.value = false;
  }
};

const cancelUpload = () => {
  $generalStore.setPauseUploading(true);
  isUploading.value = false;
};

onUnmounted(() => {
  if (fileDisplay.value) URL.revokeObjectURL(fileDisplay.value);
});
</script>
