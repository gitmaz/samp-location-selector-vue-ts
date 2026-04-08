import type { InjectionKey } from 'vue';
import { createStore, type Store } from 'vuex';
import type { RootState } from '@/types/store';
import locations from './modules/locations';

export type { RootState };

export const storeKey: InjectionKey<Store<RootState>> = Symbol('store');

export default createStore<RootState>({
  modules: {
    locations,
  },
});
