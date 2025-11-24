<template>
  <div id="MainView" class="flex border-b py-6">
    <div class="cursor-pointer">
      <img class="rounded-full max-h-[60px]" width="60" src="~/assets/images/logo.jpg" />
    </div>

    <div class="pl-3 w-full px-4">
      <div class="flex items-center justify-between">
        <button>
          <span class="font-bold hover:underline cursor-pointer"> User name </span>
          <span class="text-[13px] text-light text-gray-500 pl-1 cursor-pointer"> User name </span>
        </button>

        <button
          class="border text-[15px] px-[21px] py-0.5 border-[#F02C56] text-[#F02C56] hover:bg-[#ffeef2] font-semibold rounded-md cursor-pointer"
        >
          关注
        </button>
      </div>

      <div class="text-[15px] pb-0.5 break-words md:max-w-[400px] max-w-[300px]">标题</div>
      <div class="text-[14px] text-gray-500 pb-0.5">#fun #cool #SuperAwesome</div>
      <div class="text-[14px] pb-0.5 flex items-center font-semibold">
        <Icon name="mdi:music" size="17" />
        <div class="px-1">鬼刀 - MP4</div>
        <Icon name="mdi:heart" size="20" />
      </div>

      <div class="mt-1 flex">
        <div
          class="relative min-h-[480px] max-h-[580px] w-full md:max-w-[260px] flex items-center bg-black rounded-xl cursor-pointer"
        >
          <video
            ref="video"
            loop
            muted
            class="rounded-xl object-cover h-full"
            src="../public/test.mp4"
          />
          <img
            class="absolute -right-4 bottom-100 md:bottom-14 round"
            width="110"
            src="~/assets/images/tiktok_float.png"
          />
        </div>
        <div class="relative">
          <div class="absolute bottom-0 -ml-12 opacity-70 md:ml-2 md:opacity-100">
            <div class="pb-2 text-center">
              <button
                class="rounded-full bg-gray-600 hover:bg-gray-700 cursor-pointer p-2 flex group"
              >
                <Icon name="mdi:heart" class="text-white group-hover:text-red-600" size="25" />
              </button>
              <span class="text-xs text-gray-800 font-semibold">点赞数</span>
            </div>

            <div class="pb-2 text-center">
              <button
                class="rounded-full bg-gray-600 hover:bg-gray-700 p-2 cursor-pointer flex group"
              >
                <Icon
                  name="bx:bxs-message-rounded-dots"
                  class="text-white group-hover:text-red-500"
                  size="25"
                />
              </button>
              <span class="text-xs text-gray-800 font-semibold">43</span>
            </div>

            <div class="text-center">
              <button
                class="rounded-full bg-gray-600 hover:bg-gray-700 p-2 cursor-pointer flex group"
              >
                <Icon
                  name="ri:share-forward-fill"
                  class="text-white group-hover:text-red-500"
                  size="25"
                />
              </button>
              <span class="text-xs text-gray-800 font-semibold">55</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps(['post']);

let video = ref<null | HTMLVideoElement>(null);

onMounted(() => {
  if (video.value) {
    video.value.play();
  }
});
</script>
