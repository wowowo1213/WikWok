import { defineStore } from 'pinia';
import axios from '~/plugins/axios';
const $axios = axios().provide.axios;

interface Userinfo {
  id: string;
  username: string;
  bio: string;
  avatar: string;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    id: '',
    username: '',
    bio: '',
    avatar: '',
  }),

  actions: {
    async getTokens() {
      await $axios.get('/auth/csrf-cookie');
    },

    async register(
      phoneNumber: string,
      username: string,
      password: string,
      confirmPassword: string
    ) {
      let res = await $axios.post('/user/register', {
        phoneNumber,
        username,
        password,
        confirmPassword,
      });
      this.setUser(res.data.data);
    },

    async login(phoneNumber: string, password: string) {
      let res = await $axios.post('/user/login', {
        phoneNumber,
        password,
      });
      this.setUser(res.data.data);
    },

    setUser(res: Userinfo) {
      this.id = res.id;
      this.username = res.username;
      this.bio = res.bio;
      this.avatar = res.avatar;
    },

    async logout() {
      this.resetUser();
    },

    resetUser() {
      this.id = '';
      this.username = '';
      this.bio = '';
      this.avatar = '';
    },
  },
  persist: true,
});
