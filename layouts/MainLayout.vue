<template>
  <TopNav />
  <div :class="route.fullPath === '/' ? 'max-w-[1140px]' : ''" class="flex justify-between w-full">
    <div>
      <SideNavMain />
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
</script>
