import { defineStore } from 'pinia';
import { useUserStore } from './user';
import axios from '~/plugins/axios';

const $axios = axios().provide.axios;

export const useGeneralStore = defineStore(
  'general',
  () => {
    const isLoginOpen = ref(false);
    const isEditProfileOpen = ref(false);
    const selectedVideo = ref(null);
    const ids = ref(null);
    const isBackUrl = ref('/');
    const videos = ref(null);
    const suggested = ref(null);
    const following = ref(null);

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

    async function hasSessionExpired() {
      await $axios.interceptors.response.use(
        response => response,
        error => {
          switch (error.response.status) {
            case 400: // 请求出错
              return Promise.reject(error.response.data.message);
            case 401: // 未登录
            case 419: // cookie过期
            case 503: // 服务器暂不可用
              useUserStore().resetUser();
              window.location.href = '/';
              break;
            case 500:
              alert('服务器内部出错');
              break;
            default:
              return Promise.reject(error);
          }
        }
      );
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
      bodySwitch,
      setBackUrl,
      hasSessionExpired,
    };
  },
  {
    persist: true,
  }
);
