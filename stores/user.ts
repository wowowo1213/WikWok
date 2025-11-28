import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from '~/plugins/axios';

const $axios = axios().provide.axios;

interface Post {
  id: string;
  videoUrl: string;
  caption: string;
  likes: number;
  views: number;
  updatedAt: string;
}

interface UserData {
  id: string;
  username: string;
  bio: string;
  avatar: string;
  followers: number;
  followings: number;
  posts: Post[];
}

export const useUserStore = defineStore(
  'user',
  () => {
    const currentUserId = ref<string>('');

    const userData = ref<UserData>({
      id: '',
      username: '',
      bio: '',
      avatar: '',
      followers: 0,
      followings: 0,
      posts: [],
    });

    const allLikes = computed(() =>
      userData.value.posts.reduce((total, post) => total + post.likes, 0)
    );

    async function getTokens() {
      await $axios.get('/auth/csrf-cookie');
    }

    async function register(
      phoneNumber: string,
      username: string,
      password: string,
      confirmPassword: string
    ) {
      const res = await $axios.post('/user/register', {
        phoneNumber,
        username,
        password,
        confirmPassword,
      });
      currentUserId.value = res.data.data.id;
    }

    async function login(phoneNumber: string, password: string) {
      const res = await $axios.post('/user/login', {
        phoneNumber,
        password,
      });
      currentUserId.value = res.data.data.id;
    }

    async function getUserInfo(userId: string) {
      resetUserData();
      const res = await $axios.get('/user/get-userinfo', { params: { id: userId } });
      userData.value = res.data.data;
    }

    // 这边还可以更新关注数和粉丝数
    async function updateUserInfo(newUsername: string, newBio: string, newAvatar: string) {
      const res = await $axios.post('/user/update-userinfo', {
        id: currentUserId.value,
        username: newUsername,
        bio: newBio,
        avatar: newAvatar,
      });

      userData.value = { ...userData.value, ...res.data.data };
    }

    async function uploadVideo(data: FormData) {
      return await $axios.post('/user/upload-video', data);
    }

    function resetUserData() {
      userData.value = {
        id: '',
        username: '',
        bio: '',
        avatar: '',
        followers: 0,
        followings: 0,
        posts: [],
      };
    }

    function resetUser() {
      currentUserId.value = '';
      userData.value = {
        id: '',
        username: '',
        bio: '',
        avatar: '',
        followers: 0,
        followings: 0,
        posts: [],
      };
    }

    return {
      currentUserId,
      userData,
      allLikes,
      getTokens,
      register,
      login,
      getUserInfo,
      updateUserInfo,
      uploadVideo,
      resetUserData,
      resetUser,
    };
  },
  { persist: true }
);
