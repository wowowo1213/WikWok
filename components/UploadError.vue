<template>
  <div class="w-[100%] relative flex justify-center">
    <div
      class="absolute top-24 z-100 mx-auto bg-red-600 opacity-70 text-white px-14 py-3 rounded-full font-bold"
      :class="errorType ? 'visible' : 'invisible'"
    >
      {{ error }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['errorType']);
const { errorType } = toRefs(props);

let error = ref('');

watch(
  () => errorType.value,
  () => {
    if (errorType.value == 'caption') {
      error.value = '字母最长长度为150个字符!';
    } else if (errorType.value == 'bio') {
      error.value = 'Maximum 80 characters.';
    } else if (errorType.value == 'file') {
      error.value = '仅支持MP4文件格式';
    } else {
      error.value = '';
    }
  }
);
</script>
