import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Comment {
  user: {
    userId: string;
    username: string;
    avatarUrl: string;
  };
  id: string;
  text: string;
}

export interface Video {
  videoId: string;
  videoUrl: string;
  filename: string;
  caption: string;
  likes: string[]; // 用户id数组
  views: string[]; // 用户id数组
  updatedAt: string;
  isFollowing: null | boolean;
  user: { userId: string; username: string; avatarUrl: string };
  comments: Comment[];
}

export interface UserData {
  userId: string;
  username: string;
  bio: string;
  avatarUrl: string;
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
      avatarUrl: '',
      followers: 0,
      followings: 0,
      videos: [],
    });

    const profileData = ref<UserData>({
      userId: '',
      username: '',
      bio: '',
      avatarUrl: '',
      followers: 0,
      followings: 0,
      videos: [],
    });

    const totalLikes = (userDataRef: Ref<UserData>) =>
      computed(() =>
        userDataRef.value.videos.reduce((sum, video) => sum + video?.likes?.length, 0)
      );

    const totalViews = (userDataRef: Ref<UserData>) =>
      computed(() =>
        userDataRef.value.videos.reduce((sum, video) => sum + video?.views?.length, 0)
      );

    const resetUserData = () => {
      userData.value = {
        userId: '',
        username: '',
        bio: '',
        avatarUrl: '',
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
        avatarUrl: '',
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

    async function updateUserInfo(formData: FormData) {
      await $axios.post('/user/update-userinfo', formData);
    }

    async function followUser(targetUserId: string) {
      await $axios.post('/user/follow-user', { userId: userData.value.userId, targetUserId });
    }

    async function unfollowUser(targetUserId: string) {
      await $axios.post('/user/unfollow-user', { userId: userData.value.userId, targetUserId });
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
      followUser,
      unfollowUser,
    };
  },
  { persist: true }
);
