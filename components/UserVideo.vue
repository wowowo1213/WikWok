<template>
  <div
    @click="dispalyVideo()"
    @mouseenter="isHover(true)"
    @mouseleave="isHover(false)"
    class="relative brightness-90 hover:brightness-[1.1] cursor-pointer"
  >
    <div
      v-if="!isLoaded"
      class="absolute flex items-center justify-center top-0 left-0 aspect-3/4 w-full object-cover rounded-md bg-black"
    >
      <Icon class="animate-spin ml-1 text-white" name="eos-icons:bubble-loading" size="100" />
    </div>
    <div>
      <video ref="video" muted loop class="aspect-3/4 object-cover rounded-md" :src="videoSrc" />
    </div>
    <div class="px-1">
      <div class="text-gray-700 text-[15px] pt-2 wrap-break-word">
        {{ props.video.filename }}
      </div>
      <div class="text-gray-700 text-[15px] pt-1 text-ellipsis overflow-hidden whitespace-nowrap">
        视频简介：{{ props.video.caption }}
      </div>
      <div class="text-gray-700 text-[12px] pt-1 text-ellipsis overflow-hidden whitespace-nowrap">
        更新时间：{{ updatedTime }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $userStore, $generalStore } = useNuxtApp();

const route = useRoute();
const router = useRouter();

const props = defineProps(['video']);

let video = ref<HTMLVideoElement | null>(null);
const videoSrc = computed(() => `http://localhost:5000${props.video.videoUrl}`);

let isLoaded = ref(false);

const updatedTime = props.video.updatedAt.split('.')[0].split('T').join(' ');

onMounted(() => {
  if (!video.value) return;
  if (video.value.readyState >= 3) {
    isLoaded.value = true;
    return;
  }
  video.value?.addEventListener('loadeddata', onLoadedData);
});

onBeforeUnmount(() => {
  if (!video.value) return;
  video.value.removeEventListener('loadeddata', onLoadedData);
  video.value.pause();
  video.value.currentTime = 0;
  video.value.src = '';
});

const onLoadedData = () => {
  isLoaded.value = true;
};

const dispalyVideo = () => {
  $generalStore.setBackUrl('/profile/' + route.params.id);
  $generalStore.selectedVideo = {
    ...props.video,
    user: {
      userId: $userStore.profileData.userId,
      avatarUrl: $userStore.profileData.avatarUrl,
      username: $userStore.profileData.username,
    },
  };
  router.push(`/video/${props.video.videoId}`);
};

const isHover = (bool: boolean) => {
  if (!video.value) return;
  bool ? video.value.play() : video.value.pause();
};
</script>
