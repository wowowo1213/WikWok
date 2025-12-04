<template>
  <div class="flex items-center hover:bg-gray-700 rounded-md w-full py-1.5 px-2">
    <img
      class="rounded-full"
      width="35"
      :src="`http://localhost:5000${props.userData.avatarUrl}`"
    />
    <div class="lg:pl-2.5 lg:block hidden">
      <div class="flex items-center">
        <div class="font-bold text-[14px]">用户昵称</div>
        <div class="ml-1 rounded-full bg-[#58D5EC] h-3.5 relative">
          <Icon
            class="relative -top-[7px]"
            name="teenyicons:tick-small-solid"
            color="#FFFFFF"
            size="15"
          />
        </div>
      </div>

      <div class="font-light text-[12px] text-gray-600">{{ userData.username }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps(['userData']);
</script>
