import { defineStore } from 'pinia';
import axios from '~/plugins/axios';
const $axios = axios().provide.axios;

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
      this.id = res.data.data.id;
    },

    async login(phoneNumber: string, password: string) {
      let res = await $axios.post('/user/login', {
        phoneNumber,
        password,
      });
      this.id = res.data.data.id;
    },

    async getUserinfo(id: string) {
      if (!id) throw new Error('请求id不能为空');
      const res = await $axios.get('/user/get-userinfo', { params: { id } });
      const { username, bio, avatar } = res.data.data;
      this.username = username;
      this.bio = bio;
      this.avatar = avatar;
    },

    async updateUserinfo(username: string, bio: string, avatar: string) {
      const id = this.id;
      let res = await $axios.post('/user/update-userinfo', { id, username, bio, avatar });
      // 这边更新之后 getUserinfo 的接口不会返回更新之后的结果，所以只能到这边写了
      this.username = res.data.data.username;
      this.bio = res.data.data.bio;
      this.avatar = res.data.data.avatar;
    },

    async uploadVideo(data: FormData) {
      await $axios.post('/user/post-video', data);
    },

    logout() {
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
