<script setup lang="ts">
/**
 * MapView — the `/map` route view.
 *
 * Renders a full-viewport interactive taco-shop map alongside contextual UI
 * panels that adapt to the current breakpoint:
 *
 * - **Map layer**: `<TacoMap>` occupies the entire view container. It
 *   initialises Mapbox GL JS, drops taco-emoji markers for every shop, and
 *   flies the camera to the user's geolocation on mount.
 *
 * - **Floating info panel**: A `v-card` anchored to the top-left corner that
 *   shows "Find Tacos Near You" and a `v-progress-circular` spinner while
 *   `mapStore.loading` is `true`.
 *
 * - **Desktop shop panel (≥ md / 960 px)**: A `v-navigation-drawer` on the
 *   right edge that slides open when `mapStore.selectedShop` is non-null,
 *   displaying a `<ShopCard>` for the selected business. Closed via the ✕
 *   button which calls `mapStore.clearSelection()`.
 *
 * - **Mobile shop panel (< md)**: A `v-bottom-sheet` that rises from the
 *   bottom of the screen with the same `<ShopCard>` content.
 *
 * - **Error snackbar**: A 5-second `v-snackbar` (color `error`) shown when
 *   `mapStore.error` is non-null. Dismissed by the user or automatically after
 *   the timeout. Uses the project-standard error copy:
 *   _"The taco truck broke down 🚚💨 — couldn't load shops."_
 *
 * This view has **no props** and **no emits**. All data flow goes through
 * the `mapStore` Pinia store, which is kept alive for the lifetime of the
 * session.
 *
 * @example
 * ```ts
 * // Registered in src/router/index.ts as a lazy-loaded route:
 * { path: '/map', component: () => import('./views/MapView.vue') }
 * ```
 */
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import TacoMap from '@/components/map/TacoMap.vue'
import ShopCard from '@/components/map/ShopCard.vue'
import { useMapStore } from '@/stores/mapStore'

/**
 * Pinia store that owns the list of nearby taco shops, the currently selected
 * shop, the loading flag, and the error string. Mutated by `TacoMap` on
 * marker click and by the shop fetch triggered from `TacoMap.onMounted`.
 */
const mapStore = useMapStore()

/**
 * Vuetify display composable. `mdAndUp` is a computed boolean that is `true`
 * when the viewport width is ≥ 960 px (Vuetify's "md" breakpoint), driving the
 * conditional rendering of the desktop drawer vs. the mobile bottom-sheet.
 */
const { mdAndUp } = useDisplay()

/**
 * Two-way computed ref that controls the desktop `v-navigation-drawer` open
 * state. The getter returns `true` only when both the viewport is ≥ md AND a
 * shop is selected. The setter is intentionally a no-op — open/close state is
 * driven entirely by `mapStore.selectedShop` (set via `mapStore.clearSelection`
 * or `mapStore.selectShop`).
 *
 * @returns {boolean} `true` when the drawer should be shown; `false` otherwise.
 */
const drawerOpen = computed({
  get: () => mdAndUp.value && mapStore.selectedShop !== null,
  set: () => {
    /* controlled via mapStore */
  },
})

/**
 * Two-way computed ref that controls the mobile `v-bottom-sheet` open state.
 * Mirror of `drawerOpen` for viewports narrower than the md breakpoint. The
 * setter is a no-op for the same reasons as `drawerOpen`.
 *
 * @returns {boolean} `true` when the bottom sheet should be shown; `false` otherwise.
 */
const sheetOpen = computed({
  get: () => !mdAndUp.value && mapStore.selectedShop !== null,
  set: () => {
    /* controlled via mapStore */
  },
})

/**
 * Computed boolean that determines whether the error snackbar is visible.
 * Maps directly to `mapStore.error !== null` so the snackbar disappears as
 * soon as the error is cleared (either by the user pressing "Dismiss" or by a
 * subsequent successful shop load resetting the error to `null`).
 *
 * @returns {boolean} `true` when there is an active error message to display.
 */
const snackbarVisible = computed(() => mapStore.error !== null)

/**
 * Clears the currently selected shop from the Pinia store, which causes both
 * `drawerOpen` and `sheetOpen` to evaluate to `false`, closing whichever panel
 * is currently open.
 *
 * Wired to the ✕ close button inside both the desktop drawer and the mobile
 * bottom sheet.
 *
 * @example
 * ```vue
 * <v-btn @click="closeSelection">Close</v-btn>
 * ```
 */
function closeSelection() {
  mapStore.clearSelection()
}
</script>

<template>
  <div class="map-view-container">
    <!-- Map fills the full view -->
    <TacoMap />

    <!-- Floating search/info panel (top-left) -->
    <v-card
      class="map-overlay-panel"
      color="surface"
      elevation="6"
      rounded="lg"
      style="position: absolute; top: 72px; left: 16px; z-index: 10; min-width: 220px"
    >
      <v-card-title class="d-flex align-center ga-3 py-3 px-4">
        <span>Find Tacos Near You</span>
        <v-progress-circular
          v-if="mapStore.loading"
          indeterminate
          size="20"
          width="2"
          color="primary"
          aria-label="Loading taco shops"
        />
      </v-card-title>
    </v-card>

    <!-- Desktop: navigation drawer on the right -->
    <v-navigation-drawer
      v-if="mdAndUp"
      :model-value="drawerOpen"
      location="right"
      :temporary="true"
      width="340"
      color="surface"
      aria-label="Shop details"
      @update:model-value="(v) => !v && closeSelection()"
    >
      <div class="pa-3">
        <div class="d-flex justify-end mb-2">
          <v-btn
            icon
            variant="text"
            aria-label="Close shop details"
            @click="closeSelection"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <ShopCard v-if="mapStore.selectedShop" :shop="mapStore.selectedShop" />
      </div>
    </v-navigation-drawer>

    <!-- Mobile: bottom sheet -->
    <v-bottom-sheet
      v-if="!mdAndUp"
      :model-value="sheetOpen"
      aria-label="Shop details"
      @update:model-value="(v) => !v && closeSelection()"
    >
      <div class="pa-3" style="background-color: #16213e">
        <div class="d-flex justify-end mb-2">
          <v-btn
            icon
            variant="text"
            aria-label="Close shop details"
            @click="closeSelection"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <ShopCard v-if="mapStore.selectedShop" :shop="mapStore.selectedShop" />
      </div>
    </v-bottom-sheet>

    <!-- Error snackbar -->
    <v-snackbar
      :model-value="snackbarVisible"
      color="error"
      timeout="5000"
      location="bottom"
    >
      The taco truck broke down 🚚💨 — couldn't load shops.
      <template #actions>
        <v-btn
          variant="text"
          aria-label="Dismiss error"
          @click="mapStore.error = null"
        >
          Dismiss
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<style scoped>
.map-view-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 64px);
  overflow: hidden;
}
</style>
