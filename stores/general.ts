import { defineStore } from 'pinia';
import { useUserStore } from './user';
import axios from '../plugins/axios';

const $axios = axios().provide.axios;

export const useGeneralStore = defineStore('general', {
  state: () => ({
    isLoginOpen: false,
    isEditProfileOpen: false,
    selectedPost: null,
    ids: null,
    isBackUrl: '/',
    posts: null,
    suggested: null,
    following: null,
  }),
  actions: {
    bodySwitch(val: boolean) {
      if (val) {
        document.body.style.overflow = 'hidden';
        return;
      }
      document.body.style.overflow = 'visible';
    },

    async hasSessionExpired() {
      await $axios.interceptors.response.use(
        response => response,
        error => {
          switch (error.response.status) {
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
    },
  },
  persist: true,
});
