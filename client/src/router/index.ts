import { createRouter, createWebHistory } from 'vue-router';
import MapPage from '../views/MapPage.vue';
import HistoryPage from '../views/HistoryPage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'map', component: MapPage },
    { path: '/history', name: 'history', component: HistoryPage },
  ],
});

export default router;
