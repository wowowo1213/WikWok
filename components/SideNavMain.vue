<template>
  <div
    id="SideNavMain"
    :class="route.fullPath === '/' ? 'lg:w-[260px]' : 'lg:w-[170px]'"
    class="fixed z-20 bg-gray-800 text-white pt-[61px] h-full w-[55px]"
  >
    <div class="lg:w-full w-[55px]">
      <NuxtLink to="/">
        <MenuItem iconName="For You" colorString="#F02C56" sizeString="30" />
      </NuxtLink>
      <MenuItem iconName="Following" colorString="#000000" sizeString="27" />
      <MenuItem iconName="LIVE" colorString="#000000" sizeString="27" />

      <div class="border-b border-gray-400 mt-2" />

      <div class="lg:block hidden text-xs text-gray-600 font-semibold px-2 pt-4 pb-2">
        Suggested accounts
      </div>

      <div class="lg:hidden block pt-3" />

      <div class="cursor-pointer">
        <MenuItemFollow />
      </div>

      <button class="lg:block hidden text-[#F02C56] pt-1.5 pl-2 text-[13px]">See all</button>

      <div class="border-b border-gray-400 mt-2" />

      <div class="lg:block hidden text-xs text-gray-600 font-semibold pt-4 pb-2 px-2">
        Following accounts
      </div>

      <div class="lg:hidden block pt-3" />

      <div class="cursor-pointer">
        <MenuItemFollow />
      </div>

      <button class="lg:block hidden text-[#F02C56] pt-1.5 pl-2 text-[13px]">See more</button>

      <div class="lg:block hidden border-b border-gray-400 mt-2" />

      <div class="lg:block hidden text-[11px] text-gray-500">
        <div class="pt-4 px-2">About Newsroom TikTok Shop Contact Careers ByteDance</div>
        <div class="pt-4 px-2">
          TikTok for Good Advertise Developers Transparency TikTok Rewards TikTok Browse TikTok
          Embeds
        </div>
        <div class="pt-4 px-2">Help Safety Terms Privacy Creator Portal Community Guidelines</div>
        <div class="pt-4 px-2">© 2025 TikTok</div>
      </div>

      <div class="pb-14"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
</script>
