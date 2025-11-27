<template>
  <NuxtLayout class="min-h-screen">
    <NuxtPage />
    <AuthOverlay v-if="isLoginOpen" />
    <EditProfileOverlay v-if="isEditProfileOpen" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
const { $userStore, $generalStore } = useNuxtApp();
const { isLoginOpen, isEditProfileOpen } = storeToRefs($generalStore);

onMounted(async () => {
  $generalStore.bodySwitch(false);
  isLoginOpen.value = false;
  isEditProfileOpen.value = false;

  try {
    await $generalStore.hasSessionExpired();
    // await $generalStore.getRandomUsers('suggested');
    // await $generalStore.getRandomUsers('following');

    if ($userStore.id) $userStore.getUserinfo($userStore.id);
  } catch (error) {
    console.log(error);
  }
});

const isModalOpen = computed(() => isLoginOpen.value || isEditProfileOpen.value);
watch(
  () => isModalOpen.value,
  val => $generalStore.bodySwitch(val)
);
</script>
