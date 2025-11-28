import { useUserStore } from '~/stores/user.ts';
import { useGeneralStore } from '~/stores/general.ts';

export default defineNuxtPlugin(NuxtApp => {
  return {
    provide: {
      userStore: useUserStore(),
      generalStore: useGeneralStore(),
    },
  };
});
