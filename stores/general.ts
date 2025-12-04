import { defineStore } from 'pinia';
import type { Video, UserData } from './user';

interface SuggestedVideos extends Video {
  username: string;
  avatarUrl: string;
}

export const useGeneralStore = defineStore(
  'general',
  () => {
    const { $axios } = useNuxtApp();
    const userStore = useUserStore();

    const isLoginOpen = ref(false);
    const isEditProfileOpen = ref(false);
    const activeItem = ref('forYou');
    const isBackUrl = ref('/');
    const suggestedVideos = ref<null | Array<SuggestedVideos>>(null);
    const suggestedUsers = ref<null | Array<UserData>>(null);
    const followingUsers = ref<null | Array<UserData>>(null);

    async function getCsrfToken() {
      let res = await $axios.get('/auth/csrf-token');
      sessionStorage.setItem('x-csrf-token', res.data.csrfToken);
    }

    function setActiveItem(itemName: string) {
      activeItem.value = itemName;
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
        params: { userId: userStore.userData.userId },
      });
      return res.data.data;
    }

    async function getFollowingUsers() {
      const res = await $axios.get('/user/get-following-users', {
        params: { userId: userStore.userData.userId },
      });
      return res.data.data;
    }

    async function getRecommendedVideos() {
      const res = await $axios.get('/user/get-recommended-videos', {
        params: { userId: userStore.userData.userId },
      });
      suggestedVideos.value = res.data.data.videos;
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
      activeItem,
      isBackUrl,
      suggestedVideos,
      suggestedUsers,
      followingUsers,
      getCsrfToken,
      setActiveItem,
      bodySwitch,
      setBackUrl,
      getSuggestedUsers,
      getFollowingUsers,
      getRecommendedVideos,
      updateSideMenuImage,
    };
  },
  {
    persist: true,
  }
);
