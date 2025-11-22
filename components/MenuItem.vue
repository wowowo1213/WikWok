<template>
  <div class="w-full flex items-center hover:bg-gray-700 p-2.5 rounded-md cursor-pointer">
    <div class="flex items-center" :class="`text-[${colorString}]`">
      <Icon :name="icon" :size="sizeString" />
      <span class="hidden lg:block pl-[9px] mt-0.5 font-semibold text-[17px]">
        {{ name }}
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['iconName', 'colorString', 'sizeString']);
const { iconName, colorString, sizeString } = toRefs(props);

let icon = ref('');
let name = ref('');

const iconNames = {
  'For You': 'mdi:home',
  Following: 'ci:group',
  LIVE: 'mdi:video-outline',
};
for (const key in iconNames) {
  if (key === iconName.value) {
    icon.value = iconNames[key];
  }
}

const TAB_NAMES = {
  'For You': '为您推荐',
  Following: '你的关注',
  LIVE: '生活',
};
for (const key in TAB_NAMES) {
  if (key === iconName.value) {
    name.value = TAB_NAMES[key];
  }
}
</script>
