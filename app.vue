<template>
  <NuxtLayout class="min-h-screen">
    <NuxtPage />
    <AuthOverlay v-if="isLoginOpen" />
    <EditProfileOverlay v-if="isEditProfileOpen" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { AppLoadStateKey } from '~/types/app-load-state';
const { $axios, $userStore, $generalStore } = useNuxtApp();
const { isLoginOpen, isEditProfileOpen } = storeToRefs($generalStore);

const isAppLoaded = ref(false);

provide(AppLoadStateKey, {
  isAppLoaded,
});

onMounted(async () => {
  $generalStore.bodySwitch(false);
  isLoginOpen.value = false;
  isEditProfileOpen.value = false;

  try {
    await $generalStore.getCsrfToken();
    // await $generalStore.getRandomUsers('suggested');
    // await $generalStore.getRandomUsers('following');
    if ($userStore.currentUserId) await $userStore.getUserInfo($userStore.currentUserId);
  } catch (error) {
    console.log(error);
  } finally {
    isAppLoaded.value = true;
  }
});

const isModalOpen = computed(() => isLoginOpen.value || isEditProfileOpen.value);
watch(
  () => isModalOpen.value,
  val => $generalStore.bodySwitch(val)
);
</script>
