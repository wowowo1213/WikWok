<template>
  <div :id="`SuggestedVideo-${props.video.videoId}`" class="flex border-b py-6">
    <div
      :to="`profile/${props.video.user.userId}`"
      class="cursor-pointer"
      @click="isLoggedIn(props.video.user.userId)"
    >
      <img
        class="rounded-full max-h-[60px]"
        width="60"
        :src="`http://localhost:5000${props.video.user.avatarUrl}`"
      />
    </div>

    <div class="pl-3 w-full px-4">
      <div class="flex items-center justify-between">
        <button @click="isLoggedIn(props.video.user.userId)">
          <span class="font-bold hover:underline cursor-pointer">{{
            props.video.user.username
          }}</span>
        </button>

        <button
          v-if="!props.video.isFollowing && props.video.user.userId !== $userStore.userData.userId"
          class="border text-[15px] px-[21px] py-0.5 border-[#F02C56] text-[#F02C56] hover:bg-[#ffeef2] font-semibold rounded-md cursor-pointer"
        >
          关注
        </button>
      </div>

      <div class="text-[15px] pb-0.5 wrap-break-word md:max-w-[400px] max-w-[300px]">标题</div>
      <div class="text-[14px] text-gray-500 pb-0.5">#fun #cool #SuperAwesome</div>
      <div class="text-[14px] pb-0.5 flex items-center font-semibold">
        <Icon name="mdi:music" size="17" />
        <div class="px-1">{{ props.video.filename }}</div>
        <Icon name="mdi:heart" size="20" />
      </div>

      <div class="mt-1 flex">
        <div
          @click="displayVideo(props.video)"
          class="relative min-h-[480px] max-h-[580px] w-full md:max-w-[260px] flex items-center bg-black rounded-xl cursor-pointer"
        >
          <video
            ref="videoRef"
            loop
            muted
            class="rounded-xl object-cover h-full"
            :src="`http://localhost:5000${props.video.videoUrl}`"
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
                @click="isLiked ? unlikeVideo() : likeVideo()"
                class="rounded-full bg-gray-600 hover:bg-gray-700 cursor-pointer p-2 flex group"
              >
                <Icon
                  name="mdi:heart"
                  size="25"
                  :class="['group-hover:text-red-600', isLiked ? 'text-red-600' : 'text-white']"
                />
              </button>
              <span class="text-xs text-gray-800 font-semibold">
                {{ props.video.likes.length }}
              </span>
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
import type { Video } from '~/stores/user';

const { $generalStore, $userStore } = useNuxtApp();
const router = useRouter();

const props = defineProps(['video']);
const videoRef = ref<HTMLVideoElement | null>(null);
let observer: IntersectionObserver | null = null;
let suggestedVideoElement: HTMLElement | null = null;
// ??????
const isLiked = computed(() => props.video.likes.includes($userStore.userData.userId));

onMounted(() => {
  suggestedVideoElement = document.getElementById(`SuggestedVideo-${props.video.videoId}`);

  if (!suggestedVideoElement || !videoRef.value) {
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

  observer.observe(suggestedVideoElement);
});

onBeforeUnmount(() => {
  if (videoRef.value) {
    videoRef.value.pause();
    videoRef.value.currentTime = 0;
    videoRef.value.src = '';
    videoRef.value = null;
  }

  if (observer && suggestedVideoElement) {
    observer.unobserve(suggestedVideoElement);
    observer.disconnect();
    observer = null;
  }

  suggestedVideoElement = null;
});

const isLoggedIn = (userId: string) => {
  if (!$userStore.userData.userId) {
    $generalStore.isLoginOpen = true;
    return;
  }
  router.push(`/profile/${userId}`);
};

const displayVideo = (video: Video) => {
  if (!$userStore.userData.userId) {
    $generalStore.isLoginOpen = true;
    return;
  }

  $generalStore.setBackUrl('/');
  $generalStore.selectedVideo = video;
  router.push(`/video/${video.videoId}`);
};

const likeVideo = async () => {
  try {
    if (!$generalStore.selectedVideo || !$userStore.userData?.userId) return;
    await $generalStore.likeVideo($generalStore.selectedVideo.videoId);
  } catch (error) {
    console.error('点赞失败:', error);
  }
};

const unlikeVideo = async () => {
  try {
    if (!$generalStore.selectedVideo || !$userStore.userData?.userId) return;
    await $generalStore.unlikeVideo($generalStore.selectedVideo.videoId);
  } catch (error) {
    console.error('取消点赞失败:', error);
  }
};
</script>
