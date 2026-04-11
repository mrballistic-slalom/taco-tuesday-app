<script setup lang="ts">
/**
 * App — root application shell component.
 *
 * This is the single component that Vite mounts onto `#app` via `src/main.ts`.
 * It is responsible for three things only:
 *
 * 1. **Layout scaffold**: Renders Vuetify's `<v-app>` container, which injects
 *    the active theme (tacoTheme, dark), applies global CSS custom properties,
 *    and manages the stacking order for drawers, bottom sheets, snackbars, and
 *    overlays.
 *
 * 2. **Persistent navigation**: Renders `<AppNav>` outside the router outlet so
 *    that the nav is never destroyed during route transitions. `AppNav` renders
 *    itself as either a desktop `v-navigation-drawer` or a mobile
 *    `v-bottom-navigation` based on the active Vuetify breakpoint.
 *
 * 3. **Animated route transitions**: Wraps `<router-view>` in a `<Transition
 *    name="fade" mode="out-in">` so that navigating between views produces a
 *    smooth 200 ms opacity cross-fade rather than an abrupt swap.
 *
 * Global styles (non-scoped) are defined in the `<style>` block of this
 * component:
 * - `body { background-color: #1A1A2E }` — ensures the dark base colour fills
 *   any area not covered by a Vuetify surface.
 * - `* { font-family: 'Nunito', sans-serif }` — applies the project-wide
 *   typeface loaded from Google Fonts in `index.html`.
 * - `.fade-enter-active` / `.fade-leave-active` / `.fade-enter-from` /
 *   `.fade-leave-to` — the four classes that drive the router-view fade
 *   transition.
 *
 * This component has **no props**, **no emits**, and **no reactive state** —
 * all application state lives in Pinia stores.
 *
 * @example
 * ```ts
 * // In src/main.ts:
 * import App from './App.vue'
 * const app = createApp(App)
 * app.mount('#app')
 * ```
 */
import AppNav from './components/AppNav.vue'
</script>

<template>
  <v-app>
    <AppNav />
    <v-main>
      <router-view v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </v-main>
  </v-app>
</template>

<style>
body {
  background-color: #1a1a2e;
}
* {
  font-family: 'Nunito', sans-serif;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
