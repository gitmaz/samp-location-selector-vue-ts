import type { ActionContext } from 'vuex';
import type { LocationRow } from '@/types/location';
import type { LocationsState, RootState } from '@/types/store';
import * as api from '@/api/locations';

type LocationsContext = ActionContext<LocationsState, RootState>;

const state = (): LocationsState => ({
  items: [],
  loading: false,
  error: null,
  lastSaved: null,
});

const mutations = {
  SET_ITEMS(s: LocationsState, items: LocationRow[]) {
    s.items = items;
  },
  SET_LOADING(s: LocationsState, v: boolean) {
    s.loading = v;
  },
  SET_ERROR(s: LocationsState, err: string | null) {
    s.error = err;
  },
  SET_LAST_SAVED(s: LocationsState, row: LocationRow | null) {
    s.lastSaved = row;
  },
  REMOVE_ITEM(s: LocationsState, id: number) {
    s.items = s.items.filter((x) => x.id !== id);
  },
};

const actions = {
  async fetchAll({ commit }: LocationsContext) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const items = await api.listLocations();
      commit('SET_ITEMS', items);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load locations';
      commit('SET_ERROR', msg);
      throw e;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async saveSelection(
    { commit, dispatch }: LocationsContext,
    payload: { latitude: number; longitude: number; address?: string }
  ) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const row = await api.createLocation(payload);
      commit('SET_LAST_SAVED', row);
      await dispatch('fetchAll');
      return row;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save location';
      commit('SET_ERROR', msg);
      throw e;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async deleteById({ commit }: LocationsContext, id: number) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      await api.deleteLocation(id);
      commit('REMOVE_ITEM', id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to delete location';
      commit('SET_ERROR', msg);
      throw e;
    } finally {
      commit('SET_LOADING', false);
    }
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
