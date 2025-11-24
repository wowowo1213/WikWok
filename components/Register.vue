<template>
  <div class="text-center text-[28px] mb-4 font-bold relative">注册</div>

  <div class="px-6 pb-3">
    <TextInput
      placeholder="昵称"
      v-model="name"
      inputType="text"
      :autoFocus="true"
      :error="errors && errors.name ? errors.name[0] : ''"
    />
  </div>

  <div class="px-6 pb-3">
    <TextInput
      placeholder="邮箱"
      v-model="email"
      inputType="email"
      :error="errors && errors.email ? errors.email[0] : ''"
    />
  </div>

  <div class="px-6 pb-3">
    <TextInput
      placeholder="密码"
      v-model="password"
      inputType="password"
      :error="errors && errors.password ? errors.password[0] : ''"
    />
  </div>

  <div class="px-6 pb-3">
    <TextInput
      placeholder="确认密码"
      v-model="confirmPassword"
      inputType="password"
      :error="errors && errors.confirmPassword ? errors.confirmPassword[0] : ''"
    />
  </div>

  <div class="px-6 pb-3 mt-4">
    <button
      :disabled="!name || !email || !password || !confirmPassword"
      :class="
        !name || !email || !password || !confirmPassword
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
let name = ref(null);
let email = ref(null);
let password = ref(null);
let confirmPassword = ref(null);
let errors = ref(null);

const register = async () => {
  errors.value = null;
};
</script>
