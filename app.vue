<template>
  <NuxtLayout class="min-h-screen">
    <NuxtPage />
    <AuthOverlay v-if="isLoginOpen" />
    <EditProfileOverlay v-if="isEditProfileOpen" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
const { $generalStore } = useNuxtApp();
const { isLoginOpen, isEditProfileOpen } = storeToRefs($generalStore);
</script>
