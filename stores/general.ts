import { defineStore } from 'pinia';

export const useGeneralStore = defineStore(
  'general',
  () => {
    const { $axios } = useNuxtApp();

    const isLoginOpen = ref(false);
    const isEditProfileOpen = ref(false);
    const selectedVideo = ref(null);
    const ids = ref(null);
    const isBackUrl = ref('/');
    const videos = ref(null);
    const suggested = ref(null);
    const following = ref(null);

    async function getCsrfToken() {
      let res = await $axios.get('/auth/csrf-token');
      localStorage.setItem('x-csrf-token', res.data.csrfToken);
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

    return {
      isLoginOpen,
      isEditProfileOpen,
      selectedVideo,
      ids,
      isBackUrl,
      videos,
      suggested,
      following,
      getCsrfToken,
      bodySwitch,
      setBackUrl,
    };
  },
  {
    persist: true,
  }
);
