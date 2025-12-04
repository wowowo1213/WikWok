<template>
  <div
    id="EditProfileOverlay"
    class="fixed flex justify-center pt-14 md:pt-[105px] z-50 top-0 left-0 w-full h-full bg-black/50 overflow-auto"
  >
    <div
      class="relative bg-white w-full max-w-[700px] sm:h-[580px] h-[655px] mx-3 p-4 rounded-lg mb-10"
      :class="!uploadedImage ? 'h-[655px]' : 'h-[580px]'"
    >
      <div
        class="absolute flex items-center justify-between w-full p-5 left-0 top-0 border-b border-b-gray-300"
      >
        <div class="text-[22px] font-medium">修改个人信息</div>
        <button @click="$generalStore.isEditProfileOpen = false" class="cursor-pointer">
          <Icon name="mdi:close" size="25" />
        </button>
      </div>

      <div class="h-[calc(500px-200px)]" :class="!uploadedImage ? 'mt-16' : 'mt-[58px]'">
        <div v-if="!uploadedImage">
          <div
            id="ProfilePhotoSection"
            class="flex flex-col border-b sm:h-[118px] h-[145px] px-1.5 py-2 w-full"
          >
            <div
              class="font-semibold text-[15px] sm:mb-0 mb-1 text-gray-700 sm:w-40 sm:text-left text-center"
            >
              头像
            </div>

            <div class="flex items-center justify-center sm:-mt-6">
              <label for="image" class="relative cursor-pointer">
                <img
                  class="size-24 object-cover rounded-full"
                  :src="croppedImage || imgSrc"
                  alt="用户头像"
                />
                <div
                  class="absolute bottom-0 right-0 rounded-full bg-white shadow-xl border p-1 border-gray-300 inline-block w-8"
                >
                  <Icon name="ph:pencil-simple-line-bold" size="17" class="-mt-1 ml-0.5" />
                </div>
              </label>
              <input
                class="hidden"
                type="file"
                id="image"
                @input="handleUploadedImage"
                accept="image/png, image/jpeg, image/jpg"
              />
            </div>
          </div>

          <div
            id="UsernameSectionSection"
            class="flex flex-col border-b sm:h-[118px] px-1.5 py-2 mt-1.5 w-full"
          >
            <div
              class="font-semibold text-[15px] sm:mb-0 mb-1 text-gray-700 sm:w-40 sm:text-left text-center"
            >
              昵称
            </div>

            <div class="flex items-center justify-center sm:-mt-6">
              <div class="sm:w-[60%] w-full max-w-md">
                <TextInput placeholder="昵称" v-model="username" inputType="text" max="30" />
                <div class="text-[11px] text-gray-500 mt-4">
                  用户名仅可包含字母、数字、下划线和句点。修改用户名后，您的个人资料链接也会随之变更。
                </div>
              </div>
            </div>
          </div>

          <div id="BioSection" class="flex flex-col sm:h-[120px] px-1.5 py-2 mt-2 w-full">
            <div
              class="font-semibold text-[15px] sm:mb-0 mb-1 text-gray-700 sm:w-40 sm:text-left text-center"
            >
              个人简介
            </div>

            <div class="flex items-center justify-center sm:-mt-6">
              <div class="sm:w-[60%] w-full max-w-md">
                <textarea
                  cols="30"
                  rows="4"
                  v-model="bio"
                  maxlength="80"
                  class="resize-none w-full bg-[#F1F1F2] text-gray-800 border border-gray-300 rounded-md py-2.5 px-3 focus:outline-none"
                ></textarea>
                <div v-if="bio" class="text-[11px] text-gray-500">{{ bio.length }}/80</div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="w-full h-[430px]">
          <Cropper
            class="h-[430px]"
            ref="cropper"
            :stencil-component="CircleStencil"
            :src="uploadedImage"
          />
        </div>
      </div>

      <div
        id="ButtonSection"
        class="absolute p-5 left-0 bottom-0 border-t border-t-gray-300 w-full"
      >
        <div id="UpdateInfoButtons" v-if="!uploadedImage" class="flex items-center justify-end">
          <button
            @click="$generalStore.isEditProfileOpen = false"
            class="flex items-center border rounded-sm px-3 py-1.5 hover:bg-gray-100 cursor-pointer"
          >
            <span class="px-2 font-medium text-[15px]">取消</span>
          </button>

          <button
            :disabled="!isUpdated"
            :class="!isUpdated ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#F02C56] cursor-pointer'"
            @click="updateUserinfo()"
            class="flex items-center bg-[#F02C56] text-white border rounded-md ml-3 px-3 py-1.5"
          >
            <span class="mx-4 font-medium text-[15px]">保存</span>
          </button>
        </div>

        <div id="CropperButtons" v-else class="flex items-center justify-end">
          <button
            @click="uploadedImage = ''"
            class="flex items-center border rounded-sm px-3 py-1.5 hover:bg-gray-100 cursor-pointer"
          >
            <span class="px-2 font-medium text-[15px]">后退</span>
          </button>

          <button
            @click="handleCropAvatar()"
            class="flex items-center bg-[#F02C56] text-white border rounded-md ml-3 px-3 py-1.5 cursor-pointer"
          >
            <span class="mx-4 font-medium text-[15px]">应用</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Cropper, CircleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

const { $userStore, $generalStore } = useNuxtApp();
const { userData } = storeToRefs($userStore);

const route = useRoute();

const imgSrc = computed(() => `http://localhost:5000${$userStore.userData.avatarUrl}`);

onMounted(() => {
  username.value = userData.value.username;
  bio.value = userData.value.bio;
});

interface AvatarData {
  imageFile?: File;
  coordinates?: {
    height: number;
    width: number;
    top: number;
    left: number;
  };
}

const cropper = ref<InstanceType<typeof Cropper> | null>(null);
const username = ref('');
const bio = ref('');
const imageFile = ref<File | null>(null);
const uploadedImage = ref<string | null>(null);
const croppedImage = ref<string | null>(null);
let avatarData: AvatarData = reactive({ imageFile: undefined, coordinates: undefined });

const isUpdated = computed(() => {
  const isChanged =
    username.value !== userData.value.username ||
    bio.value !== userData.value.bio ||
    croppedImage.value !== null;
  const isNotEmpty = username.value.trim() && bio.value.trim();
  return isChanged && isNotEmpty;
});

const handleUploadedImage = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (!target.files?.[0]) return;
  imageFile.value = target.files[0];
  uploadedImage.value = URL.createObjectURL(target.files[0]);
  croppedImage.value = null;
};

const handleCropAvatar = async () => {
  if (!cropper.value || !imageFile.value) return;

  const { canvas } = cropper.value.getResult();
  if (canvas) {
    croppedImage.value = canvas.toDataURL();

    avatarData = {
      imageFile: imageFile.value,
      coordinates: cropper.value.getResult().coordinates,
    };

    imageFile.value = null;
    uploadedImage.value = null;
  }
};

const updateUserinfo = async () => {
  const formData = new FormData();

  formData.append('userId', $userStore.userData.userId);
  formData.append('username', username.value);
  formData.append('bio', bio.value);

  if (avatarData.imageFile && avatarData.coordinates) {
    formData.append('image', avatarData.imageFile);
    formData.append('height', avatarData.coordinates.height.toString());
    formData.append('width', avatarData.coordinates.width.toString());
    formData.append('top', avatarData.coordinates.top.toString());
    formData.append('left', avatarData.coordinates.left.toString());
  }

  await $userStore.updateUserInfo(formData);
  await $userStore.getUserInfo($userStore.userData.userId);
  await $userStore.getProfileInfo($userStore.userData.userId);

  if ($generalStore.suggestedUsers) {
    $generalStore.updateSideMenuImage($generalStore.suggestedUsers, $userStore.userData);
  }
  if ($generalStore.followingUsers) {
    $generalStore.updateSideMenuImage($generalStore.followingUsers, $userStore.userData);
  }

  croppedImage.value = null;
  avatarData = { imageFile: undefined, coordinates: undefined };
  $generalStore.isEditProfileOpen = false;
};
</script>
