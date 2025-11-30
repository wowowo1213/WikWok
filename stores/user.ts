import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface Video {
  id: string;
  videoUrl: string;
  caption: string;
  likes: number;
  views: number;
  updatedAt: string;
}

interface UserData {
  userId: string;
  username: string;
  bio: string;
  avatar: string;
  followers: number;
  followings: number;
  videos: Video[];
}

export const useUserStore = defineStore(
  'user',
  () => {
    const { $axios } = useNuxtApp();

    const currentUserId = ref<string>('');
    const userData = ref<UserData>({
      userId: '',
      username: '',
      bio: '',
      avatar: '',
      followers: 0,
      followings: 0,
      videos: [],
    });

    const allLikes = computed(() =>
      userData.value.videos.reduce((total, video) => total + video.likes, 0)
    );

    async function register(
      phoneNumber: string,
      username: string,
      password: string,
      confirmPassword: string
    ) {
      const res = await $axios.post('/auth/register', {
        phoneNumber,
        username,
        password,
        confirmPassword,
      });
      currentUserId.value = res.data.data.userId;
      localStorage.setItem('jwtToken', res.data.data.jwtToken); // 这边可以检验jwttoken是否过期
    }

    async function login(phoneNumber: string, password: string) {
      const res = await $axios.post('/user/login', {
        phoneNumber,
        password,
      });
      currentUserId.value = res.data.data.userId;
      localStorage.setItem('jwtToken', res.data.data.jwtToken); // 这边可以检验jwttoken是否过期
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
        userId: '',
        username: '',
        bio: '',
        avatar: '',
        followers: 0,
        followings: 0,
        videos: [],
      };
    }

    function resetUser() {
      currentUserId.value = '';
      userData.value = {
        userId: '',
        username: '',
        bio: '',
        avatar: '',
        followers: 0,
        followings: 0,
        videos: [],
      };
      localStorage.removeItem('jwtToken'); // 这边移除？？
    }

    return {
      currentUserId,
      userData,
      allLikes,
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
