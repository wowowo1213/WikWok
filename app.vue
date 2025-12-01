<template>
  <NuxtLayout class="min-h-screen">
    <NuxtPage />
    <AuthOverlay v-if="isLoginOpen" />
    <EditProfileOverlay v-if="isEditProfileOpen" />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { $userStore, $generalStore } = useNuxtApp();
const { isLoginOpen, isEditProfileOpen } = storeToRefs($generalStore);

onMounted(async () => {
  $generalStore.bodySwitch(false);
  isLoginOpen.value = false;
  isEditProfileOpen.value = false;

  try {
    await $generalStore.getCsrfToken();
    if ($userStore.userData.userId) await $userStore.getUserInfo($userStore.userData.userId);
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
