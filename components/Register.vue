<template>
  <div class="text-center text-[28px] mb-4 font-bold relative">注册</div>

  <div class="px-6 pb-3">
    <TextInput placeholder="手机号码" v-model="phoneNumber" inputType="text" :autoFocus="true" />
  </div>

  <div class="px-6 pb-3">
    <TextInput placeholder="昵称" v-model="username" inputType="text" />
  </div>

  <div class="px-6 pb-3">
    <TextInput placeholder="密码" v-model="password" inputType="password" />
  </div>

  <div class="px-6 pb-3">
    <TextInput placeholder="确认密码" v-model="confirmPassword" inputType="password" />
  </div>

  <div v-if="errors" class="flex justify-center text-red-500 text-[15px] font-bold">
    {{ errors }}
  </div>

  <div class="px-6 pb-3 mt-4">
    <button
      :disabled="!phoneNumber || !username || !password || !confirmPassword"
      :class="
        !phoneNumber || !username || !password || !confirmPassword
          ? 'bg-gray-200 cursor-not-allowed'
          : 'bg-[#F02C56] cursor-pointer'
      "
      @click="register()"
      class="w-full text-[17px] font-semibold text-white bg-[#F02C56] py-3 rounded-sm"
    >
      注册
    </button>
  </div>
</template>

<script setup lang="ts">
let phoneNumber = ref('');
let username = ref('');
let password = ref('');
let confirmPassword = ref('');
let errors = ref(null);

const { $userStore, $generalStore } = useNuxtApp();

const register = async () => {
  errors.value = null;

  try {
    await $userStore.register(
      phoneNumber.value,
      username.value,
      password.value,
      confirmPassword.value
    );
    await $userStore.getUserInfo($userStore.userData.userId);
    $generalStore.isLoginOpen = false;
  } catch (error) {
    errors.value = error instanceof Array ? error[0] : error;
  }
};
</script>
