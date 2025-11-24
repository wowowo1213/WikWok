<template>
  <div class="flex items-center hover:bg-gray-700 rounded-md w-full py-1.5 px-2">
    <img class="rounded-full" width="35" src="../assets/images/logo.jpg" />
    <div class="lg:pl-2.5 lg:block hidden">
      <div class="flex items-center">
        <div class="font-bold text-[14px]">User Name</div>
        <div class="ml-1 rounded-full bg-[#58D5EC] h-[14px] relative">
          <Icon
            class="relative -top-[7px]"
            name="teenyicons:tick-small-solid"
            color="#FFFFFF"
            size="15"
          />
        </div>
      </div>

      <div class="font-light text-[12px] text-gray-600">user name</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps(['user']);
</script>
