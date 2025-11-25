<template>
  <div class="text-center text-[28px] mb-4 font-bold">登录</div>

  <div class="px-6 pb-4">
    <TextInput
      placeholder="邮箱"
      v-model="email"
      inputType="email"
      :autoFocus="true"
      :error="errors && errors.email ? errors.email[0] : ''"
    />
  </div>

  <div class="px-6 pb-2">
    <TextInput placeholder="密码" v-model="password" inputType="password" />
  </div>
  <div class="px-6 text-[12px] text-gray-600 cursor-pointer mt-2">忘记密码?</div>

  <div class="px-6 pb-2 mt-2">
    <button
      :disabled="!email || !password"
      :class="
        !email || !password ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#F02C56] cursor-pointer'
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
let email = ref('');
let password = ref('');
let errors = ref(null);

const login = async () => {
  errors.value = null;

  try {
    await $userStore.getTokens();
    await $userStore.login(email.value, password.value);
    await $userStore.getUser();

    // await $generalStore.getRandomUsers('suggested');
    // await $generalStore.getRandomUsers('following')
    $generalStore.isLoginOpen = false;
  } catch (error) {
    errors.value = error.response.data.errors;
  }
};
</script>
