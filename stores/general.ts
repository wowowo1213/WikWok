import { defineStore } from 'pinia';

export const useGeneralStore = defineStore(
  'general',
  () => {
    const { $axios } = useNuxtApp();

    const isLoginOpen = ref(false);
    const isEditProfileOpen = ref(false);
    const isBackUrl = ref('/');
    const suggested = ref([]);
    const following = ref([]);

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

    // 这边得修改一下
    function updateSideMenuImage(array, userData) {
      for (let i = 0; i < array.length; i++) {
        const res = array[i];
        if (res.id == userData.id) {
          res.image = userData.avatarUrl;
        }
      }
    }

    return {
      isLoginOpen,
      isEditProfileOpen,
      isBackUrl,
      suggested,
      following,
      getCsrfToken,
      bodySwitch,
      setBackUrl,
      updateSideMenuImage,
    };
  },
  {
    persist: true,
  }
);
