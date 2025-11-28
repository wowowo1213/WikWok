<template>
  <MainLayout>
    <div
      v-if="isLoading"
      class="fixed flex items-center justify-center top-0 left-0 w-full h-full bg-black/50 z-100 text-white"
    >
      <Icon class="animate-spin ml-1" name="mingcute:loading-line" size="100" />
    </div>

    <div v-if="userData.id" class="mt-[81px] lg:ml-[210px] ml-[65px] mr-20 w-full">
      <div class="flex">
        <img class="max-w-[54px] lg:max-w-[120px] rounded-full" :src="userData.avatar" />
        <div class="ml-2 lg:ml-5 w-full h-[54px] lg:h-full flex justify-between lg:flex-col">
          <div>
            <div class="text-[22px] lg:text-[30px] font-bold truncate">
              {{ $generalStore.allLowerCaseNoCaps(userData.username) }}
            </div>
            <div class="text-[12px] lg:text-[18px] truncate">
              {{ userData.username }}
            </div>
          </div>
          <div>
            <button
              v-if="route.params.id === $userStore.currentUserId"
              @click="$generalStore.isEditProfileOpen = true"
              class="lg:mt-3 text-[15px] flex items-center justify-between rounded-sm py-1 px-2 border hover:bg-gray-100 cursor-pointer"
            >
              <div>编辑信息</div>
            </button>

            <button
              v-else
              class="flex item-center rounded-md py-1.5 px-8 mt-3 text-[15px] text-white font-semibold bg-[#F02C56] hover:bg-red-700 cursor-pointer"
            >
              关注
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center pt-4">
        <div class="mr-4">
          <span class="font-bold"> {{ userData.followings }}K</span>
          <span class="text-gray-500 font-light text-[15px] pl-1.5 cursor-pointer">关注列表</span>
        </div>
        <div class="mr-4">
          <span class="font-bold"> {{ userData.followers }}K</span>
          <span class="text-gray-500 font-light text-[15px] pl-1.5 cursor-pointer">粉丝数</span>
        </div>
        <div class="mr-4">
          <span class="font-bold">{{ allLikes }}</span>
          <span class="text-gray-500 font-light text-[15px] pl-1.5 cursor-pointer">总获赞数</span>
        </div>
      </div>

      <div class="pt-4 mr-4 text-gray-500 font-light text-[15px] pl-1.5 max-w-[500px]">
        {{ userData.bio }}
      </div>

      <div class="w-full flex items-center pt-4 border-b">
        <div
          class="w-40 md:w-60 text-center py-2 text-[17px] font-semibold border-b-2 border-b-black"
        >
          视频
        </div>
        <div class="w-40 md:w-60 text-gray-500 text-center py-2 text-[17px] font-semibold"></div>
      </div>

      <div
        class="mt-4 grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-3"
      >
        <div v-for="post in userData.posts" :key="post.id">
          <UserVideo :post="post" />
        </div>
      </div>
    </div>

    <div v-else class="font-bold mt-[81px] lg:ml-[210px] ml-[65px] mr-20 w-full">
      <div class="flex justify-center items-center mt-20">
        <h1
          class="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-green-500 to-purple-700 font-bold md:text-[50px] lg:text-[60px] xl:text-[80px]"
        >
          {{ errorMessage }}
        </h1>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '~/layouts/MainLayout.vue';
import { AppLoadStateKey } from '~/types/app-load-state';
const { $userStore, $generalStore } = useNuxtApp();
const { userData, allLikes } = storeToRefs($userStore);

const route = useRoute();

let isLoading = ref(false);
let errorMessage = ref('');

const { isAppLoaded } = inject(AppLoadStateKey, {
  isAppLoaded: ref(false),
});

const fetchUserData = async (userId: string) => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    await $userStore.getUserInfo(userId);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    if (error.includes('Cast to ObjectId failed')) {
      errorMessage.value = '请求用户不存在';
    } else {
      errorMessage.value = error || '获取用户信息失败';
    }
  } finally {
    isLoading.value = false;
  }
};

// definePageMeta({ middleware: 'auth' });

watch(isAppLoaded, loaded => {
  if (loaded) fetchUserData(route.params.id as string);
});

watch(
  () => isLoading.value,
  val => $generalStore.bodySwitch(val)
);
</script>
