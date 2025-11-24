<template>
  <MainLayout>
    <div class="mt-[81px] lg:ml-[210px] ml-[65px] pr-2 w-full">
      <div class="flex">
        <img
          class="max-w-[54px] lg:max-w-[120px] rounded-full"
          src="../../assets/images/logo.jpg"
        />
        <div class="ml-2 lg:ml-5 w-full h-[54px] lg:h-full flex justify-between lg:flex-col">
          <div>
            <div class="text-[22px] lg:text-[30px] font-bold truncate">User name</div>
            <div class="text-[12px] lg:text-[18px] truncate">User name</div>
          </div>
          <div>
            <button
              v-if="true"
              class="w-[100px] lg:w-[114px] flex item-center rounded-md py-1.5 px-3.5 ml-2 mt-3 text-[12px] lg:text-[15px] font-semibold border hover:bg-gray-100"
            >
              <Icon class="mt-0.5 mr-1" name="mdi:pencil" size="14" />
              <div>编辑信息</div>
            </button>

            <button
              v-else
              class="flex item-center rounded-md py-1.5 px-8 mt-3 text-[15px] text-white font-semibold bg-[#F02C56]"
            >
              关注
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center pt-4">
        <div class="mr-4">
          <span class="font-bold">10K</span>
          <span class="text-gray-500 font-light text-[15px] pl-1.5">关注列表</span>
        </div>
        <div class="mr-4">
          <span class="font-bold">44K</span>
          <span class="text-gray-500 font-light text-[15px] pl-1.5">粉丝</span>
        </div>
        <div class="mr-4">
          <span class="font-bold">3K</span>
          <span class="text-gray-500 font-light text-[15px] pl-1.5">赞过</span>
        </div>
      </div>

      <div class="pt-4 mr-4 text-gray-500 font-light text-[15px] pl-1.5 max-w-[500px]">
        bio section
      </div>

      <div class="w-full flex items-center pt-4 border-b">
        <div class="w-60 text-center py-2 text-[17px] font-semibold border-b-2 border-b-black">
          视频
        </div>
        <div class="w-60 text-gray-500 text-center py-2 text-[17px] font-semibold">
          <Icon name="material-symbols:lock-open" class="mb-0.5" /> 赞过
        </div>
      </div>

      <div
        class="mt-4 grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-3"
      >
        <PostUser />
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '~/layouts/MainLayout.vue';
</script>
