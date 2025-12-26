<template>
  <MainLayout>
    <div
      v-if="isLoading"
      class="fixed flex items-center justify-center top-0 left-0 w-full h-full bg-black/50 z-100 text-white"
    >
      <Icon class="animate-spin ml-1" name="mingcute:loading-line" size="100" />
    </div>

    <div
      v-if="$userStore.profileData.userId"
      class="mt-[81px] lg:ml-[210px] ml-[65px] mr-20 w-full"
    >
      <div class="flex">
        <img
          class="rounded-full size-18 lg:size-24 mr-2 object-cover bg-white"
          :src="`http://localhost:5000${$userStore.profileData.avatarUrl}`"
          alt="用户头像"
        />

        <div class="flex flex-col justify-between">
          <div class="pt-1 lg:pt-3 flex justify-between items-center w-50 lg:w-70 rounded-xl">
            <div class="mr-2 text-[20px] lg:text-[26px] text-black font-bold truncate">
              {{ $userStore.profileData.username }}
            </div>

            <button
              v-if="route.params.id === $userStore.userData.userId"
              @click="$generalStore.isEditProfileOpen = true"
              class="flex items-center justify-between rounded-md p-1.5 bg-[#c4cac8] hover:bg-gray-200 cursor-pointer"
            >
              <Icon class="text-[#6a6d85]" name="material-symbols:edit-square-rounded" size="20" />
            </button>

            <button
              v-else
              class="flex item-center rounded-md py-1.5 px-4 text-[15px] text-white font-semibold bg-[#F02C56] hover:bg-red-700 cursor-pointer"
            >
              关注
            </button>
          </div>

          <div class="lg:pb-2 text-[14px] lg:text-[16px] text-black font-semibold truncate">
            {{ $userStore.profileData.bio }}
          </div>
        </div>
      </div>

      <div class="flex items-center pt-4">
        <div class="mr-4">
          <span class="font-bold">{{ formatNumber($userStore.profileData.followings) }}</span>
          <span class="text-gray-500 font-light text-[15px] pl-1.5 cursor-pointer">关注列表</span>
        </div>
        <div class="mr-4">
          <span class="font-bold"> {{ formatNumber($userStore.profileData.followers) }}</span>
          <span class="text-gray-500 font-light text-[15px] pl-1.5 cursor-pointer">粉丝数</span>
        </div>
        <div class="mr-4">
          <span class="font-bold">{{ $userStore.profileTotalLikes }}</span>
          <span class="text-gray-500 font-light text-[15px] pl-1.5 cursor-pointer">总获赞数</span>
        </div>
      </div>

      <div class="w-full flex items-center pt-4 border-b">
        <div
          class="w-40 md:w-60 text-center py-2 text-[17px] font-semibold border-b-2 border-b-black cursor-pointer hover:text-blue-300"
        >
          视频
        </div>
        <div
          class="w-40 md:w-60 text-gray-500 text-center py-2 text-[17px] font-semibold cursor-pointer hover:text-blue-300"
        >
          赞过
        </div>
      </div>

      <div
        class="mt-4 grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-3"
      >
        <div v-for="video in $userStore.profileData.videos" :key="video.videoId">
          <UserVideo :video="video" />
        </div>
      </div>
    </div>

    <div v-else class="font-bold mt-[81px] lg:ml-[210px] ml-[65px] mr-20 w-full">
      <div class="flex justify-center items-center mt-20">
        <h1
          class="bg-clip-text text-transparent bg-linear-to-r from-blue-500 via-green-500 to-purple-700 font-bold md:text-[50px] lg:text-[60px] xl:text-[80px]"
        >
          {{ errorMessage }}
        </h1>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '~/layouts/MainLayout.vue';
const { $userStore, $generalStore } = useNuxtApp();

const route = useRoute();
definePageMeta({ middleware: 'auth' });

let isLoading = ref(false);
let errorMessage = ref('');

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

onMounted(async () => {
  try {
    $generalStore.setActiveItem('userInfo');
    isLoading.value = true;
    errorMessage.value = '';

    $userStore.resetProfileData();
    await $userStore.getProfileInfo(route.params.id as string);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    if (error instanceof Error) {
      if (error.message.includes('Cast to ObjectId failed')) errorMessage.value = '请求用户不存在';

      errorMessage.value = error.message;
    } else {
      errorMessage.value = '获取用户信息失败';
    }
  } finally {
    isLoading.value = false;
  }
});

watch(
  () => isLoading.value,
  val => $generalStore.bodySwitch(val)
);
</script>
