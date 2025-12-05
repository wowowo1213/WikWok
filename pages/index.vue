<template>
  <MainLayout>
    <div class="pt-[61px] w-full ml-[60px] lg:ml-[270px]">
      <div v-for="video in $generalStore.suggestedVideos" :key="video.videoId">
        <MainView :video="video" />
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '~/layouts/MainLayout.vue';

const { $generalStore } = useNuxtApp();

onMounted(async () => {
  try {
    $generalStore.setActiveItem('forYou');
    await $generalStore.getSuggestedVideos();
  } catch (error) {
    console.log(error);
  }
});
</script>
