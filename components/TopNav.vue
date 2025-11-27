<template>
  <div class="fixed bg-gray-800 z-30 flex items-center w-full border-b border-gray-600 h-[61px]">
    <div class="flex items-center justify-between w-full relative">
      <div :class="route.fullPath === '/' ? 'w-[80%] lg:w-auto' : 'lg:w-[20%] w-[70%]'">
        <NuxtLink to="/" class="flex items-center">
          <img
            src="../assets/images/logo.jpg"
            alt="WIKWOK Logo"
            class="rounded-full shadow-lg ml-4 w-[44px] lg:w-[54px]"
          />
          <h1
            class="ml-2 font-sans font-bold text-[0px] md:text-xl lg:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-purple-500 tracking-tight"
          >
            WIKWOK
          </h1>
        </NuxtLink>
      </div>

      <div
        class="hidden md:flex max-w-[380px] h-11 lg:max-w-[480px] xl:max-w-[580px] w-full items-center group bg-gray-700 hover:bg-gray-800 focus-within:bg-gray-800 border border-gray-600 hover:border-gray-200 focus-within:border-gray-200 hover:ring-2 focus-within:ring-2 hover:ring-gray-200 focus-within:ring-gray-200 rounded-full"
      >
        <input
          type="text"
          class="w-full pl-4 py-2 bg-transparent placeholder-gray-400 text-lg text-gray-200 focus:outline-none peer"
          placeholder="搜索..."
        />
        <Icon
          name="streamline-ultimate:remove-bold-bold"
          size="18"
          class="mr-4 text-white cursor-pointer"
        ></Icon>
        <button
          class="flex items-center px-4 min-w-24 min-h-full text-white border-l border-gray-600 group-hover:bg-gray-200 group-hover:text-gray-800 peer-focus:bg-gray-200 peer-focus:text-gray-800 rounded-r-xl cursor-pointer"
        >
          <Icon name="ion:search-sharp" color="#A1A2A7" size="24" />
          <span class="pl-1">搜索</span>
        </button>
      </div>

      <div class="flex items-center justify-end gap-3 min-w-[275px] max-w-[320px] w-full mr-3">
        <button
          @click="isLoggedIn()"
          class="flex items-center border border-white rounded-xl px-3 py-[6px] h-10 bg-gray-100 cursor-pointer"
        >
          <Icon name="mdi:plus" color="#000000" size="22" />
          <span class="px-1 font-medium text-[15px] w-[40px]">上传</span>
        </button>

        <div v-if="false" class="flex items-center">
          <button
            @click="$generalStore.isLoginOpen = true"
            class="min-w-22 flex items-center bg-[#F02C56] text-white rounded-xl px-3 py-[6px] h-10 cursor-pointer"
          >
            <span class="mx-4 font-medium text-[15px]">登录</span>
          </button>
          <Icon name="mdi:dots-vertical" class="text-white cursor-pointer" size="25" />
        </div>

        <div v-else class="flex items-center text-white">
          <Icon class="ml-1 mr-4 cursor-pointer" name="carbon:send-alt" color="#161724" size="30" />
          <Icon
            class="mr-5 cursor-pointer"
            name="material-symbols-light:chat"
            color="#161724"
            size="27"
          />
          <div class="relative">
            <button class="mt-1 cursor-pointer" @click="showMenu = !showMenu">
              <img class="rounded-full" width="33" :src="$userStore.avatar" />
            </button>

            <div
              v-if="showMenu"
              id="PopupMenu"
              class="z-50 absolute bg-white rounded-lg w-[200px] shadow-xl top-[52px] -right-2"
            >
              <NuxtLink
                :to="`/profile/${$userStore.id}`"
                @click="showMenu = false"
                class="rounded-lg flex items-center justify-start text-black py-3 px-2 hover:bg-gray-100 cursor-pointer"
              >
                <Icon name="ph:user" size="20" />
                <span class="pl-2 font-semibold">用户信息</span>
              </NuxtLink>
              <div
                @click="logout()"
                class="rounded-lg flex items-center justify-start text-black py-3 px-1.5 hover:bg-gray-100 border-t border-gray-300 cursor-pointer"
              >
                <Icon name="ic:outline-login" size="20" />
                <span class="pl-2 font-semibold">退出登录</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $userStore, $generalStore } = useNuxtApp();

const route = useRoute();
const router = useRouter();

let showMenu = ref(false);

onMounted(() => {
  document.addEventListener('mouseup', function (e: MouseEvent) {
    let popupMenu = document.getElementById('PopupMenu');
    if (popupMenu && e.target instanceof Node && !popupMenu.contains(e.target)) {
      showMenu.value = false;
    }
  });
});

const isLoggedIn = () => {
  $userStore.id ? router.push('/upload') : ($generalStore.isLoginOpen = true);
};

const logout = () => {
  try {
    showMenu.value = false;
    $userStore.logout();
    router.push('/');
  } catch (error) {
    console.log(error);
  }
};
</script>
