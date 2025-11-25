import { defineStore } from 'pinia';
import axios from '~/plugins/axios';
const $axios = axios().provide.axios;

export const useUserStore = defineStore('user', {
  state: () => ({
    id: '',
    name: '',
    email: '',
    bio: '',
    image: '',
  }),
  actions: {
    async getTokens() {
      await $axios.get('/sanctum/csrf-cookie');
    },

    async login(email: string, password: string) {
      await $axios.post('/login', {
        email,
        password,
      });
    },

    async register(name: string, email: string, password: string, confirmPassword: string) {
      await $axios.post('/register', {
        name,
        email,
        password,
        password_confirmation: confirmPassword,
      });
    },

    async getUser() {
      let res = await $axios.get('/api/logged-in-user');

      this.id = res.data[0].id;
      this.name = res.data[0].name;
      this.bio = res.data[0].bio;
      this.image = res.data[0].image;
    },

    async logout() {
      await $axios.post('/logout');
      this.resetUser();
    },

    resetUser() {
      this.id = '';
      this.name = '';
      this.email = '';
      this.bio = '';
      this.image = '';
    },
  },
  persist: true,
});
