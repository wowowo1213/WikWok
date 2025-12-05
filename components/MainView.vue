<template>
  <div :id="`MainView-${video.videoId}`" class="flex border-b py-6">
    <NuxtLink :to="`profile/${video.user.userId}`" class="cursor-pointer">
      <img
        class="rounded-full max-h-[60px]"
        width="60"
        :src="`http://localhost:5000${video.user.avatarUrl}`"
      />
    </NuxtLink>

    <div class="pl-3 w-full px-4">
      <div class="flex items-center justify-between">
        <button>
          <span class="font-bold hover:underline cursor-pointer">用户昵称 </span>
          <span class="text-[13px] text-light text-gray-500 pl-1 cursor-pointer">
            {{ video.user.username }}
          </span>
        </button>

        <button
          v-if="!video.isFollowing && video.user.userId !== $userStore.userData.userId"
          class="border text-[15px] px-[21px] py-0.5 border-[#F02C56] text-[#F02C56] hover:bg-[#ffeef2] font-semibold rounded-md cursor-pointer"
        >
          关注
        </button>
      </div>

      <div class="text-[15px] pb-0.5 wrap-break-word md:max-w-[400px] max-w-[300px]">标题</div>
      <div class="text-[14px] text-gray-500 pb-0.5">#fun #cool #SuperAwesome</div>
      <div class="text-[14px] pb-0.5 flex items-center font-semibold">
        <Icon name="mdi:music" size="17" />
        <div class="px-1">{{ video.filename }}</div>
        <Icon name="mdi:heart" size="20" />
      </div>

      <div class="mt-1 flex">
        <div
          class="relative min-h-[480px] max-h-[580px] w-full md:max-w-[260px] flex items-center bg-black rounded-xl cursor-pointer"
        >
          <video
            ref="videoRef"
            loop
            muted
            class="rounded-xl object-cover h-full"
            :src="`http://localhost:5000${video.videoUrl}`"
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
              <span class="text-xs text-gray-800 font-semibold">{{ video.likes }}</span>
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
              <span class="text-xs text-gray-800 font-semibold">评论数</span>
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
              <span class="text-xs text-gray-800 font-semibold">转发数</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SuggestedVideo } from '~/stores/general';

const { $generalStore, $userStore } = useNuxtApp();
const router = useRouter();

const props = defineProps<{
  video: SuggestedVideo;
}>();

const { video } = toRefs(props);
const videoRef = ref<HTMLVideoElement | null>(null);
let observer: IntersectionObserver | null = null;
let mainViewElement: HTMLElement | null = null;

onMounted(() => {
  mainViewElement = document.getElementById(`MainView-${video.value.videoId}`);

  if (!mainViewElement || !videoRef.value) {
    console.warn('MainView组件不存在或者其中的video元素不存在');
    return;
  }

  observer = new IntersectionObserver(
    entries => {
      const entry = entries[0];
      if (!entry) return;
      entry.isIntersecting ? videoRef.value?.play() : videoRef.value?.pause();
    },
    { threshold: 0.7 }
  );

  observer.observe(mainViewElement);
});

onBeforeUnmount(() => {
  if (videoRef.value) {
    videoRef.value.pause();
    videoRef.value.currentTime = 0;
    videoRef.value.src = '';
    videoRef.value = null;
  }

  if (observer && mainViewElement) {
    observer.unobserve(mainViewElement);
    observer.disconnect();
    observer = null;
  }

  mainViewElement = null;
});
</script>
