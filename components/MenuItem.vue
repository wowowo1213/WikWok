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

<script setup lang="ts">
const props = defineProps(['iconName', 'colorString', 'sizeString']);
const { iconName, colorString, sizeString } = toRefs(props);

let icon = ref('');
let name = ref('');

const iconNames = {
  'For You': 'mdi:home',
  Following: 'ci:group',
  Live: 'mdi:video-outline',
  Userinfo: 'material-symbols:account-box-sharp',
};

type iconKey = keyof typeof iconNames;

for (const key in iconNames) {
  if (key === iconName?.value) {
    icon.value = iconNames[key as iconKey];
  }
}

const TAB_NAMES = {
  'For You': '为您推荐',
  Following: '你的关注',
  Live: '生活',
  Userinfo: '个人信息',
} as const;

type TabKey = keyof typeof TAB_NAMES;

for (const key in TAB_NAMES) {
  if (key === iconName?.value) {
    name.value = TAB_NAMES[key as TabKey];
  }
}
</script>
