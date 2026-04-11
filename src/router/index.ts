import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/map' },
    {
      path: '/map',
      component: () => import('../views/MapView.vue'),
    },
    {
      path: '/recipes',
      component: () => import('../views/RecipesView.vue'),
    },
    {
      path: '/randomizer',
      component: () => import('../views/RandomizerView.vue'),
    },
    {
      path: '/tuesday',
      component: () => import('../views/TuesdayView.vue'),
    },
  ],
})

export default router
