/**
 * @file src/main.ts
 *
 * Application entry point for Tacology.
 *
 * This module bootstraps the Vue 3 application by:
 *
 * 1. Importing the Mapbox GL CSS bundle — required for the map canvas and
 *    built-in controls to render correctly. Must be imported before any
 *    component that uses `mapbox-gl`.
 *
 * 2. Creating the root Vue application instance from the `App` root component.
 *
 * 3. Registering global plugins in dependency order:
 *    - **Pinia** (`createPinia()`) — the central state management layer.
 *      Registered first so stores are available to any plugin or component
 *      that runs setup logic immediately on `app.use()`.
 *    - **Vue Router** (`router`) — the hash-history router defined in
 *      `src/router/index.ts`. Provides `<router-view>` and `useRoute`/
 *      `useRouter` throughout the component tree.
 *    - **Vuetify** (`vuetify`) — the UI component library configured with the
 *      custom `tacoTheme` (dark mode, brand palette, MDI icons). Registered
 *      last so it can detect whether a router is already installed.
 *
 * 4. Mounting the application onto the `#app` DOM element defined in
 *    `index.html`.
 *
 * @module main
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'mapbox-gl/dist/mapbox-gl.css'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'

/**
 * Root Vue application instance. Plugins are chained onto this before mount.
 *
 * @see {@link https://vuejs.org/api/application.html#createapp} Vue 3 `createApp`
 */
const app = createApp(App)

/**
 * Register Pinia as the global state management solution.
 * All stores (`mapStore`, `recipeStore`, `randomizerStore`, `tuesdayStore`)
 * are accessible via `useXxxStore()` after this call.
 */
app.use(createPinia())

/**
 * Register the Vue Router instance.
 * Enables hash-based client-side routing across the four main views:
 * `/map`, `/recipes`, `/randomizer`, and `/tuesday`.
 */
app.use(router)

/**
 * Register Vuetify with the custom `tacoTheme`.
 * Provides all `v-*` components, directives, and the design-system CSS
 * custom properties throughout the application.
 */
app.use(vuetify)

/**
 * Mount the application onto the `<div id="app">` element in `index.html`.
 * This is the last statement — nothing should run after this in this module.
 */
app.mount('#app')
