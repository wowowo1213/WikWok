<template>
  <UApp :toaster="toaster" class="container">
    <NuxtLayout class="min-h-screen">
      <NuxtPage />
      <AuthOverlay v-if="isLoginOpen" />
      <EditProfileOverlay v-if="isEditProfileOpen" />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const { $userStore, $generalStore } = useNuxtApp();
const { isLoginOpen, isEditProfileOpen } = storeToRefs($generalStore);

const toaster = { position: 'top-center' as const, max: 3 };

onMounted(async () => {
  $generalStore.bodySwitch(false);
  isLoginOpen.value = false;
  isEditProfileOpen.value = false;

  try {
    await $generalStore.getCsrfToken();
    await $generalStore.getSuggestedUsers();
    if ($userStore.userData.userId) {
      await $userStore.getUserInfo($userStore.userData.userId);
      await $generalStore.getFollowingUsers();
    }
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
