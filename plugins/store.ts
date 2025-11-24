import { useUserStore } from '~/stores/user.ts';
import { useProfileStore } from '~/stores/profile.ts';
import { useGeneralStore } from '~/stores/general.ts';

export default defineNuxtPlugin(NuxtApp => {
  return {
    provide: {
      userStore: useUserStore(),
      profileStore: useProfileStore(),
      generalStore: useGeneralStore(),
    },
  };
});
