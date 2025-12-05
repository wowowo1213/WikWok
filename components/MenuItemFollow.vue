<template>
  <div class="flex items-center hover:bg-gray-700 rounded-md w-full py-1.5 px-2">
    <img
      class="rounded-full"
      width="35"
      :src="`http://localhost:5000${props.userData.avatarUrl}`"
    />
    <div class="lg:pl-2.5 lg:block hidden">
      <div class="font-bold text-[14px]">{{ userData.username }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps(['userData']);
</script>
