<template>
  <div
    id="SideNavMain"
    :class="route.fullPath === '/' ? 'lg:w-[260px]' : 'lg:w-[190px]'"
    class="fixed z-20 bg-gray-800 text-white pt-[61px] h-full"
  >
    <div class="lg:w-full w-[55px]">
      <NuxtLink to="/">
        <MenuItem iconName="For You" colorString="#F02C56" sizeString="30" />
      </NuxtLink>
      <MenuItem iconName="Following" colorString="#000000" sizeString="27" />
      <MenuItem iconName="LIVE" colorString="#000000" sizeString="27" />

      <div class="border-b border-gray-600 mt-2" />

      <div class="lg:block hidden text-xs text-gray-600 font-semibold px-2 pt-4 pb-2">推荐账户</div>

      <div class="lg:hidden block pt-3" />

      <div v-for="suggestedUser in $generalStore.suggestedUsers" :key="suggestedUser.userId">
        <div @click="isLoggedIn(suggestedUser)" class="cursor-pointer">
          <MenuItemFollow :userData="suggestedUser" />
        </div>
      </div>

      <button class="lg:block hidden text-[#F02C56] pt-1.5 pl-2 text-[13px] cursor-pointer">
        查看更多
      </button>

      <div class="border-b border-gray-600 mt-2" />

      <div class="lg:block hidden text-xs text-gray-600 font-semibold pt-4 pb-2 px-2">
        已关注账户
      </div>

      <div class="lg:hidden block pt-3" />

      <div v-for="followingUser in $generalStore.followingUsers" :key="followingUser.userId">
        <div @click="isLoggedIn(followingUser)" class="cursor-pointer">
          <MenuItemFollow :userData="followingUser" />
        </div>
      </div>

      <button class="lg:block hidden text-[#F02C56] pt-1.5 pl-2 text-[13px] cursor-pointer">
        查看更多
      </button>

      <div class="lg:block hidden border-b border-gray-600 mt-2" />

      <div class="pb-14"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserData } from '~/stores/user';

const { $generalStore, $userStore } = useNuxtApp();
const route = useRoute();
const router = useRouter();

const isLoggedIn = (userInfo: UserData) => {
  if (!$userStore.userData.userId) {
    $generalStore.isLoginOpen = true;
    return;
  }
  router.push(`/profile/${userInfo.userId}`);
};
</script>
