<template>
  <div
    id="VideoPage"
    class="fixed lg:flex justify-between z-50 top-0 left-0 w-full h-full bg-black lg:overflow-hidden overflow-auto"
  >
    <div v-if="$generalStore.selectedVideo" class="lg:w-[calc(100%-540px)] h-full relative">
      <NuxtLink
        :to="$generalStore.backUrl"
        class="absolute flex z-20 m-5 rounded-full bg-gray-700 p-1.5 hover:bg-gray-800 cursor-pointer"
      >
        <Icon name="material-symbols:close" color="#FFFFFF" size="27" />
      </NuxtLink>

      <div v-if="$generalStore.videoIds.length > 0">
        <button
          :disabled="!isLoaded"
          @click="loopThroughVideosUp()"
          class="absolute z-20 right-4 top-4 flex items-center justify-center rounded-full bg-gray-700 p-1.5 hover:bg-gray-800 cursor-pointer"
        >
          <Icon name="mdi:chevron-up" size="30" color="#FFFFFF" />
        </button>

        <button
          :disabled="!isLoaded"
          @click="loopThroughVideosDown()"
          class="absolute z-20 right-4 top-20 flex items-center justify-center rounded-full bg-gray-700 p-1.5 hover:bg-gray-800 cursor-pointer"
        >
          <Icon name="mdi:chevron-down" size="30" color="#FFFFFF" />
        </button>
      </div>

      <img
        class="absolute top-[18px] left-[70px] rounded-full"
        width="45"
        src="~/assets/images/tiktok-logo-small.png"
      />

      <video
        v-if="$generalStore.selectedVideo"
        muted
        class="absolute object-cover w-full my-auto z-[-1] h-screen"
        :src="`http://localhost:5000${$generalStore.selectedVideo.videoUrl}`"
      />

      <div
        v-if="!isLoaded"
        class="flex items-center justify-center bg-black/70 h-screen lg:min-w-[480px]"
      >
        <Icon class="animate-spin ml-1 text-white" name="eos-icons:bubble-loading" size="100" />
      </div>

      <div class="bg-black/70 lg:min-w-[480px]">
        <video
          v-if="$generalStore.selectedVideo"
          ref="videoRef"
          loop
          muted
          controls
          class="h-screen mx-auto"
          :src="`http://localhost:5000${$generalStore.selectedVideo.videoUrl}`"
        />
      </div>
    </div>

    <div
      id="InfoSection"
      v-if="$generalStore.selectedVideo"
      class="lg:max-w-[550px] relative w-full h-full bg-white"
    >
      <div class="py-7" />

      <div class="flex items-center justify-between px-8">
        <div class="flex items-center">
          <NuxtLink :to="`/profile/${$generalStore.selectedVideo.user.userId}`">
            <img
              class="rounded-full lg:mx-0 mx-auto"
              width="40"
              :src="`http://localhost:5000${$generalStore.selectedVideo.user.avatarUrl}`"
            />
          </NuxtLink>
          <div class="ml-3 pt-0.5">
            <div class="text-[17px] font-semibold">
              {{ $generalStore.selectedVideo.user.username }}
            </div>
            <div class="font-medium">
              {{ $generalStore.selectedVideo.updatedAt.split('.')[0]?.split('T').join(' ') }}
            </div>
          </div>
        </div>

        <Icon
          v-if="$generalStore.selectedVideo.user.userId === $userStore.userData.userId"
          @click="deleteVideo()"
          class="cursor-pointer"
          name="material-symbols:delete-outline-sharp"
          size="25"
        />
      </div>

      <div class="px-8 mt-4 font-bold">标题：{{ $generalStore.selectedVideo.filename }}</div>

      <div class="px-8 mt-4 text-sm">简介：{{ $generalStore.selectedVideo.caption }}</div>

      <div class="flex items-center px-8 mt-8">
        <div class="pb-4 text-center flex items-center">
          <button
            @click="isLiked ? unlikeVideo() : likeVideo()"
            class="flex rounded-full bg-gray-200 p-2 cursor-pointer"
          >
            <Icon
              name="mdi:heart"
              size="25"
              class="group-hover:text-red-600"
              :class="isLiked ? 'text-red-600' : ''"
            />
          </button>
          <span class="text-xs pl-2 pr-4 text-gray-800 font-semibold">
            {{ $generalStore.selectedVideo.likes.length }}
          </span>
        </div>

        <div class="pb-4 text-center flex items-center">
          <div class="flex rounded-full bg-gray-200 p-2 cursor-pointer">
            <Icon name="bx:bxs-message-rounded-dots" size="25" />
          </div>
          <span class="text-xs pl-2 text-gray-800 font-semibold">
            {{ $generalStore.selectedVideo.comments.length }}
          </span>
        </div>
      </div>

      <div
        id="Comments"
        class="bg-[#F8F8F8] z-0 w-full h-[calc(100%-273px)] border-t-2 overflow-auto"
      >
        <div class="pt-2" />

        <div
          v-if="$generalStore.selectedVideo.comments.length === 0"
          class="text-center mt-6 text-xl text-gray-500"
        >
          没有评论捏...
        </div>

        <div
          v-else
          v-for="comment in $generalStore.selectedVideo.comments"
          :key="comment.id"
          class="flex items-center justify-between px-8 mt-4"
        >
          <div
            class="flex items-center relative w-full border border-gray-500 rounded-lg p-3 hover:border-gray-300 duration-200"
          >
            <NuxtLink :to="`/profile/${comment.user.userId}`">
              <img
                class="rounded-full"
                width="60"
                :src="`http://localhost:5000${comment.user.avatarUrl}`"
              />
            </NuxtLink>
            <div class="ml-6 pt-0.5 w-full">
              <div class="text-[15px] font-semibold flex items-center justify-between">
                {{ comment.user.username }}
                <Icon
                  v-if="$userStore.userData.userId === comment.user.userId"
                  @click="deleteComment($generalStore.selectedVideo.videoId, comment.id)"
                  class="cursor-pointer"
                  name="material-symbols:delete-outline-sharp"
                  size="25"
                />
              </div>
              <div class="text-[15px] font-light">{{ comment.text }}</div>
            </div>
          </div>
        </div>

        <div class="mb-28" />
      </div>

      <div
        id="CreateComment"
        v-if="$userStore.userData.userId"
        class="absolute flex items-center justify-between bottom-0 bg-white h-[85px] lg:max-w-[550px] w-full py-5 px-8 border-t-2"
      >
        <div
          :class="inputFocused ? 'border-2 border-gray-400' : 'border-2 border-[#F1F1F2]'"
          class="bg-[#F1F1F2] flex items-center rounded-lg w-full lg:max-w-[420px]"
        >
          <input
            v-model="commentText"
            @focus="inputFocused = true"
            @blur="inputFocused = false"
            class="bg-[#F1F1F2] text-[14px] focus:outline-none w-full lg:max-w-[420px] p-2 rounded-lg"
            type="text"
            placeholder="发布评论..."
          />
        </div>
        <button
          :disabled="!commentText"
          @click="addComment()"
          :class="
            commentText
              ? 'text-[#F02C56] cursor-pointer hover:bg-gray-100'
              : 'text-gray-400 cursor-not-allowed'
          "
          class="font-semibold text-sm ml-5 border border-red-200 disabled:border-gray-300 rounded-xl w-20 p-2 flex items-center justify-center"
        >
          发布
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AxiosError } from 'axios';

const { $userStore, $generalStore } = useNuxtApp();
const route = useRoute();
const router = useRouter();
definePageMeta({ middleware: 'auth' });

let videoRef = ref<HTMLVideoElement | null>(null);
let isLoaded = ref(false);
let commentText = ref('');
let inputFocused = ref(false);

const videoId = ref('');

const isLiked = computed(() => {
  if (!$generalStore.selectedVideo || !$userStore.userData?.userId) return false;
  if ($generalStore.selectedVideo.likes.length === 0) return false;
  return $generalStore.selectedVideo.likes.some(userId => userId === $userStore.userData.userId);
});

onMounted(async () => {
  try {
    videoId.value = route.params.id as string;
    await $generalStore.getVideosById(videoId.value);
  } catch (error) {
    console.log('视频播放界面出错:' + error);
    const axiosError = error as AxiosError;
    if (axiosError && axiosError.response?.status === 400) router.push('/');
  }

  if (!videoRef.value) return;
  if (videoRef.value.readyState >= 3) {
    isLoaded.value = true;
    videoRef.value.play();
    return;
  }
  videoRef.value.addEventListener('loadeddata', onLoadedData);
});

onBeforeUnmount(() => {
  if (!videoRef.value) return;
  videoRef.value.removeEventListener('loadeddata', onLoadedData);
  videoRef.value.pause();
  videoRef.value.currentTime = 0;
  videoRef.value.src = '';
});

const onLoadedData = () => {
  if (!videoRef.value) return;
  isLoaded.value = true;
  videoRef.value.play();
};

const loopThroughVideosUp = () => {
  let isBreak = false;
  const currentIndex = $generalStore.videoIds.findIndex(id => id === route.params.id);

  for (let i = currentIndex - 1; i >= 0; i--) {
    const id = $generalStore.videoIds[i];
    if (!id) continue;
    router.push(`/video/${id}`);
    isBreak = true;
    return;
  }

  if (!isBreak && $generalStore.videoIds.length > 0) {
    router.push(`/video/${$generalStore.videoIds[$generalStore.videoIds.length - 1]}`);
  }
};

const loopThroughVideosDown = () => {
  let isBreak = false;
  const currentIndex = $generalStore.videoIds.findIndex(id => id === route.params.id);

  for (let i = currentIndex + 1; i < $generalStore.videoIds.length; i++) {
    const id = $generalStore.videoIds[i];
    if (!id) continue;
    router.push(`/video/${id}`);
    isBreak = true;
    return;
  }

  if (!isBreak && $generalStore.videoIds.length > 0) {
    router.push(`/video/${$generalStore.videoIds[0]}`);
  }
};

const deleteVideo = async () => {
  const res = confirm('确定删除该视频么?');
  if (!res || !$generalStore.selectedVideo) return;
  try {
    await $generalStore.deleteVideo($generalStore.selectedVideo.videoId);
    await $userStore.getUserInfo($userStore.userData.userId);
    await $userStore.getProfileInfo($userStore.userData.userId);
    router.push(`/profile/${$userStore.userData.userId}`);
  } catch (error) {
    console.log(error);
  }
};

const likeVideo = async () => {
  try {
    if (!$generalStore.selectedVideo || !$userStore.userData?.userId) return;
    await $generalStore.likeVideo($generalStore.selectedVideo.videoId);
  } catch (error) {
    console.error('点赞失败:', error);
  }
};

const unlikeVideo = async () => {
  try {
    if (!$generalStore.selectedVideo || !$userStore.userData?.userId) return;
    await $generalStore.unlikeVideo($generalStore.selectedVideo.videoId);
  } catch (error) {
    console.error('取消点赞失败:', error);
  }
};

const addComment = async () => {
  if (!commentText.value.trim() || !$generalStore.selectedVideo) return;

  try {
    await $generalStore.addComment($generalStore.selectedVideo.videoId, commentText.value);
    commentText.value = '';
    const comments = document.getElementById('Comments');
    if (comments) comments.scroll({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error('添加评论失败:', error);
  }
};

const deleteComment = async (videoId: string, commentId: string) => {
  const res = confirm('确定删除该评论么?');

  if (!res || !$generalStore.selectedVideo) return;

  try {
    await $generalStore.deleteComment(videoId, commentId);
  } catch (error) {
    console.error('删除评论失败:', error);
  }
};
</script>
