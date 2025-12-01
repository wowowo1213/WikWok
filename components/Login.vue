<template>
  <div class="text-center text-[28px] mb-4 font-bold">登录</div>

  <div class="px-6 pb-4">
    <TextInput placeholder="手机号码" v-model="phoneNumber" inputType="text" :autoFocus="true" />
  </div>

  <div class="px-6 pb-2">
    <TextInput placeholder="密码" v-model="password" inputType="password" />
  </div>
  <div class="px-6 text-[12px] text-gray-600 cursor-pointer mt-2">忘记密码?</div>

  <div v-if="errors" class="flex justify-center text-red-500 text-[15px] font-bold">
    {{ errors }}
  </div>

  <div class="px-6 pb-2 mt-2">
    <button
      :disabled="!phoneNumber || !password"
      :class="
        !phoneNumber || !password ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#F02C56] cursor-pointer'
      "
      @click="login()"
      class="w-full text-[17px] font-semibold text-white py-3 rounded-sm"
    >
      登录
    </button>
  </div>
</template>

<script setup lang="ts">
const { $userStore, $generalStore } = useNuxtApp();
let phoneNumber = ref('');
let password = ref('');
let errors = ref(null);

const login = async () => {
  errors.value = null;

  try {
    await $userStore.login(phoneNumber.value, password.value);
    await $userStore.getUserInfo($userStore.userData.userId);
    $generalStore.isLoginOpen = false;
  } catch (error) {
    errors.value = error instanceof Array ? error[0] : error;
  }
};
</script>
