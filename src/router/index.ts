/**
 * @file src/router/index.ts
 *
 * Vue Router 4 configuration for Tacology.
 *
 * Uses `createWebHashHistory` so that all navigation is handled entirely on
 * the client side via URL hash fragments (e.g. `/#/map`). This eliminates the
 * need for any server-side URL rewriting — essential for static hosting on
 * Vercel without a custom `vercel.json` catch-all rule for the SPA routes.
 *
 * **Route table**
 *
 * | Path          | Behaviour                              |
 * |---------------|----------------------------------------|
 * | `/`           | Redirect → `/map`                      |
 * | `/map`        | Lazy-loads `MapView.vue`               |
 * | `/recipes`    | Lazy-loads `RecipesView.vue`           |
 * | `/randomizer` | Lazy-loads `RandomizerView.vue`        |
 * | `/tuesday`    | Lazy-loads `TuesdayView.vue`           |
 *
 * All view components are **lazy-loaded** via dynamic `import()` expressions.
 * Vite splits each view into its own chunk, which keeps the initial bundle
 * small and defers loading heavy dependencies (e.g. Mapbox GL) until the user
 * first navigates to that view.
 *
 * @module router
 */
import { createRouter, createWebHashHistory } from 'vue-router'

/**
 * The application's singleton Vue Router instance.
 *
 * Registered in `src/main.ts` via `app.use(router)` so that `<router-view>`,
 * `useRoute()`, and `useRouter()` are available throughout the component tree.
 *
 * @example
 * ```ts
 * import router from '@/router'
 * router.push('/tuesday')
 * ```
 */
const router = createRouter({
  /**
   * Hash-based history mode. All routes are prefixed with `#` in the browser
   * address bar, preventing 404s on direct URL access or page refresh since the
   * server only ever sees the path up to `#`.
   */
  history: createWebHashHistory(),
  routes: [
    /**
     * Root redirect — navigating to `/#/` immediately redirects to `/#/map`
     * so the user always lands on the map view when opening the app.
     */
    { path: '/', redirect: '/map' },
    {
      /**
       * Map view — renders the Mapbox GL taco-shop finder.
       * Lazy-loaded to defer Mapbox GL JS initialisation until first visit.
       */
      path: '/map',
      component: () => import('../views/MapView.vue'),
    },
    {
      /**
       * Recipes view — renders the TheMealDB recipe browser with debounced
       * search, a recipe grid, and a full-detail modal.
       */
      path: '/recipes',
      component: () => import('../views/RecipesView.vue'),
    },
    {
      /**
       * Randomizer view — renders the canvas spin wheel that picks a random
       * taco type and fetches a matching meal from TheMealDB.
       */
      path: '/randomizer',
      component: () => import('../views/RandomizerView.vue'),
    },
    {
      /**
       * Taco Tuesday view — renders the Fiesta experience (confetti + ranked
       * Yelp spots) on Tuesdays, or the countdown banner on all other days.
       */
      path: '/tuesday',
      component: () => import('../views/TuesdayView.vue'),
    },
  ],
})

export default router
