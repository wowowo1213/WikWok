import { defineStore } from 'pinia';
import type { UserData } from './user';
import { renderSlot } from 'vue';

export const useGeneralStore = defineStore(
  'general',
  () => {
    const { $axios, $userStore } = useNuxtApp();

    const isLoginOpen = ref(false);
    const isEditProfileOpen = ref(false);
    const isBackUrl = ref('/');
    const suggestedUsers = ref<null | Array<UserData>>(null);
    const followingUsers = ref<null | Array<UserData>>(null);

    async function getCsrfToken() {
      let res = await $axios.get('/auth/csrf-token');
      sessionStorage.setItem('x-csrf-token', res.data.csrfToken);
    }

    function bodySwitch(val: boolean) {
      if (val) {
        document.body.style.overflow = 'hidden';
        return;
      }
      document.body.style.overflow = 'visible';
    }

    function setBackUrl(url: string) {
      isBackUrl.value = url;
    }

    async function getSuggestedUsers() {
      const res = await $axios.get('/user/get-suggested-users', {
        params: { userId: $userStore.userData.userId },
      });
      return res.data.data;
    }

    async function getFollowingUsers() {
      const res = await $axios.get('/user/get-following-users', {
        params: { userId: $userStore.userData.userId },
      });
      return res.data.data;
    }

    function updateSideMenuImage(users: Array<UserData>, userData: UserData) {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (user?.userId == userData.userId) {
          user.avatarUrl = userData.avatarUrl;
        }
      }
    }

    return {
      isLoginOpen,
      isEditProfileOpen,
      isBackUrl,
      suggestedUsers,
      followingUsers,
      getCsrfToken,
      bodySwitch,
      setBackUrl,
      getSuggestedUsers,
      getFollowingUsers,
      updateSideMenuImage,
    };
  },
  {
    persist: true,
  }
);
