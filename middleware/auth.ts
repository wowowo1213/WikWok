import { useGeneralStore } from '~/stores/general';
import { useUserStore } from '~/stores/user';
export default defineNuxtRouteMiddleware((to, from) => {
  const generalStore = useGeneralStore();
  const userStore = useUserStore();

  if (to.path !== '/' && !userStore.userData.userId) {
    navigateTo('/');
    generalStore.isLoginOpen = true;
  }
});
