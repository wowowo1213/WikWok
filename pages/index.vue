<template>
  <MainLayout>
    <div
      v-if="isLoaded"
      class="fixed flex items-center justify-center top-0 left-0 w-full h-screen bg-black/50 z-100 text-white"
    >
      <Icon class="animate-spin ml-1" name="mingcute:loading-line" size="100" />
    </div>

    <div
      class="pt-[61px] w-full ml-[60px] lg:ml-[270px] h-[calc(100vh-61px)]"
      data-simplebar
      data-simplebar-auto-hide="false"
    >
      <div v-for="video in $generalStore.suggestedVideos" :key="video.videoId">
        <SuggestedVideo :video="video" />
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '~/layouts/MainLayout.vue';
import 'simplebar/dist/simplebar.min.css';

const { $generalStore } = useNuxtApp();

const isLoaded = ref(false);

onMounted(async () => {
  try {
    isLoaded.value = true;
    $generalStore.bodySwitch(true);
    $generalStore.setActiveItem('forYou');
    await $generalStore.getSuggestedVideos();
  } catch (error) {
    console.log(error);
  } finally {
    isLoaded.value = false;
    $generalStore.bodySwitch(false);
  }
});
</script>
