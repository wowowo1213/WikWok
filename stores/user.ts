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

    const userData = ref<UserData>({
      userId: '',
      username: '',
      bio: '',
      avatar: '',
      followers: 0,
      followings: 0,
      videos: [],
    });

    const profileData = ref<UserData>({
      userId: '',
      username: '',
      bio: '',
      avatar: '',
      followers: 0,
      followings: 0,
      videos: [],
    });

    const totalLikes = (userDataRef: Ref<UserData>) =>
      computed(() => userDataRef.value.videos.reduce((sum, video) => sum + video.likes, 0));

    const totalViews = (userDataRef: Ref<UserData>) =>
      computed(() => userDataRef.value.videos.reduce((sum, video) => sum + video.views, 0));

    const resetUserData = () => {
      userData.value = {
        userId: '',
        username: '',
        bio: '',
        avatar: '',
        followers: 0,
        followings: 0,
        videos: [],
      };
    };

    const resetProfileData = () => {
      profileData.value = {
        userId: '',
        username: '',
        bio: '',
        avatar: '',
        followers: 0,
        followings: 0,
        videos: [],
      };
    };

    const resetUserStore = () => {
      resetUserData();
      resetProfileData();
    };

    const saveJwtToken = (token: string) => {
      localStorage.setItem('jwtToken', token);
    };

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
      userData.value.userId = res.data.data.userId;
      saveJwtToken(res.data.data.jwtToken);
    }

    async function login(phoneNumber: string, password: string) {
      const res = await $axios.post('/auth/login', {
        phoneNumber,
        password,
      });
      userData.value.userId = res.data.data.userId;
      saveJwtToken(res.data.data.jwtToken);
    }

    async function getUserInfo(userId: string) {
      const res = await $axios.get('/user/get-userinfo', { params: { userId } });
      userData.value = res?.data?.data;
    }

    async function getProfileInfo(userId: string) {
      const res = await $axios.get('/user/get-userinfo', { params: { userId } });
      profileData.value = res?.data?.data;
    }

    // 这边还可以更新关注数和粉丝数
    async function updateUserInfo(username?: string, bio?: string) {
      const res = await $axios.post('/user/update-userinfo', {
        userId: userData.value.userId,
        username,
        bio,
      });

      userData.value = { ...userData.value, ...res.data.data };
    }

    async function updateAvatar(data: FormData) {
      await $axios.post('/user/update-avatar', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    return {
      userData,
      profileData,
      userTotalLikes: totalLikes(userData),
      userTotalViews: totalViews(userData),
      profileTotalLikes: totalLikes(profileData),
      profileTotalViews: totalViews(profileData),
      resetUserData,
      resetProfileData,
      resetUserStore,
      register,
      login,
      getUserInfo,
      getProfileInfo,
      updateUserInfo,
      updateAvatar,
    };
  },
  { persist: true }
);
