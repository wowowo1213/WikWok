import type { InjectionKey, Ref } from 'vue';

export interface AppLoadState {
  isAppLoaded: Ref<boolean>;
}

export const AppLoadStateKey: InjectionKey<AppLoadState> = Symbol('appLoadState');
