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
      <video
        ref="videoRef"
        muted
        loop
        class="aspect-3/4 object-cover rounded-md"
        :src="`http://localhost:5000${props.video.videoUrl}`"
      />
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
const { $generalStore } = useNuxtApp();

const route = useRoute();
const router = useRouter();

const props = defineProps(['video']);

let videoRef = ref<HTMLVideoElement | null>(null);

let isLoaded = ref(false);

const updatedTime = props.video.updatedAt.split('.')[0].split('T').join(' ');

onMounted(() => {
  if (!videoRef.value) return;
  if (videoRef.value.readyState >= 3) {
    isLoaded.value = true;
    return;
  }
  videoRef.value?.addEventListener('loadeddata', onLoadedData);
});

onBeforeUnmount(() => {
  if (!videoRef.value) return;
  videoRef.value.removeEventListener('loadeddata', onLoadedData);
  videoRef.value.pause();
  videoRef.value.currentTime = 0;
  videoRef.value.src = '';
});

const onLoadedData = () => {
  isLoaded.value = true;
};

const dispalyVideo = () => {
  $generalStore.setBackUrl('/profile/' + route.params.id);
  $generalStore.selectedVideo = props.video;
  router.push(`/video/${props.video.videoId}`);
};

const isHover = (bool: boolean) => {
  if (!videoRef.value) return;
  bool ? videoRef.value.play() : videoRef.value.pause();
};
</script>
