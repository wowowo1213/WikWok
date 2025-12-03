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
        {{ props.video.filename || '默认视频名称' }}
      </div>
      <div class="text-gray-700 text-[15px] pt-1 text-ellipsis">{{ props.video.caption }}</div>
      <div class="flex items-center -ml-1 text-gray-600 font-bold text-xs">
        <Icon name="gg:loadbar-sound" size="20" />
        3%
        <Icon class="ml-1" name="tabler:alert-circle" size="16" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $generalStore } = useNuxtApp();

const route = useRoute();
const router = useRouter();

const props = defineProps(['video']);

let video = ref<HTMLVideoElement | null>(null);
const videoSrc = computed(() => {
  const baseUrl = 'http://localhost:5000';
  const videoUrl = props.video.videoUrl;

  return baseUrl + videoUrl;
});

let isLoaded = ref(false);

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
  $generalStore.selectedVideo = null;
  setTimeout(() => {
    router.push(`/video/${props.video.id}`);
  }, 300);
};

const isHover = (bool: boolean) => {
  if (!video.value) return;
  bool ? video.value.play() : video.value.pause();
};
</script>
