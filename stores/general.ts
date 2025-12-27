import { defineStore } from 'pinia';
import type { Video, UserData, Comment } from './user';

export const useGeneralStore = defineStore(
  'general',
  () => {
    const { $axios } = useNuxtApp();

    const userStore = useUserStore();

    const isLoginOpen = ref(false);
    const isEditProfileOpen = ref(false);
    const activeItem = ref('forYou');
    const backUrl = ref('/');
    const selectedVideo = ref<null | Video>(null);
    const suggestedVideos = ref<null | Array<Video>>(null);
    const suggestedUsers = ref<null | Array<UserData>>(null);
    const followingUsers = ref<null | Array<UserData>>(null);
    const videoIds = ref([]);

    async function getCsrfToken() {
      let res = await $axios.get('/auth/csrf-token');
      sessionStorage.setItem('x-csrf-token', res.data.csrfToken);
    }

    function setActiveItem(itemName: string) {
      activeItem.value = itemName;
    }

    function bodySwitch(val: boolean) {
      if (val) {
        document.body.style.overflow = 'hidden';
        return;
      }
      document.body.style.overflow = 'visible';
    }

    function setBackUrl(url: string) {
      backUrl.value = url;
    }

    async function getSuggestedUsers() {
      suggestedUsers.value = null;
      const res = await $axios.get('/user-public/get-suggested-users', {
        params: { userId: userStore.userData.userId },
      });
      suggestedUsers.value = res.data.data.users;
    }

    async function getFollowingUsers() {
      followingUsers.value = null;
      const res = await $axios.get('/user/get-following-users', {
        params: { userId: userStore.userData.userId },
      });
      followingUsers.value = res.data.data.users;
    }

    async function getSuggestedVideos() {
      suggestedVideos.value = null;
      const res = await $axios.get('/user-public/get-suggested-videos', {
        params: { userId: userStore.userData?.userId },
      });
      suggestedVideos.value = res.data.data;
    }

    function updateSideMenuItemFollow(users: Array<UserData>, userData: UserData) {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (user?.userId == userData.userId) {
          user.avatarUrl = userData.avatarUrl;
        }
      }
    }

    async function submitVideoMeta(data: {
      fileHash: string;
      filename: string;
      caption: string;
      views?: number;
      likes?: number;
    }) {
      return $axios.post('/upload/submit-meta', {
        userId: userStore.userData.userId,
        ...data,
      });
    }

    async function getVideosById(videoId: string) {
      const res = await $axios.get('/user/get-video-detail', {
        params: { videoId },
      });

      selectedVideo.value = res.data.data;
    }

    async function deleteVideo(videoId: string) {
      await $axios.post(`user/${videoId}/video/delete`);
    }

    async function likeVideo(videoId: string) {
      const res = await $axios.post(`/user/${videoId}/like`);
      selectedVideo.value = res.data.data;
    }

    async function unlikeVideo(videoId: string) {
      const res = await $axios.post(`/user/${videoId}/unlike`);
      selectedVideo.value = res.data.data;
    }

    async function addComment(videoId: string, text: string) {
      const res = await $axios.post(`/user/${videoId}/comment`, { text });
      selectedVideo.value?.comments.unshift(res.data.data);
    }

    async function deleteComment(videoId: string, commentId: string) {
      await $axios.post(`/user/${videoId}/comment/${commentId}/delete`);
      if (selectedVideo.value) {
        selectedVideo.value.comments = selectedVideo.value.comments.filter(
          (c: Comment) => c.id !== commentId
        );
      }
    }

    return {
      isLoginOpen,
      isEditProfileOpen,
      activeItem,
      backUrl,
      selectedVideo,
      suggestedVideos,
      suggestedUsers,
      followingUsers,
      videoIds,
      getCsrfToken,
      setActiveItem,
      bodySwitch,
      setBackUrl,
      getSuggestedUsers,
      getFollowingUsers,
      getSuggestedVideos,
      updateSideMenuItemFollow,
      submitVideoMeta,
      getVideosById,
      deleteVideo,
      likeVideo,
      unlikeVideo,
      addComment,
      deleteComment,
    };
  },
  {
    persist: true,
  }
);
