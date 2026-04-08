import { createStore } from 'vuex';
import locations from './modules/locations';

export default createStore({
  modules: {
    locations,
  },
});
