<script setup lang="ts">
/**
 * TuesdayView — the `/tuesday` route view.
 *
 * Renders one of two experiences depending on the current day of the week:
 *
 * **It IS Tuesday (`isTuesday === true`)**
 * - `<FiestaOverlay>` — full-viewport confetti animation (disabled when the
 *   user prefers reduced motion).
 * - Hero banner with gradient background and the headline
 *   _"🌮 IT'S TACO TUESDAY, BABY! 🌮"_.
 * - A vertically stacked list of `<TuesdayShopCard>` components showing the
 *   top Taco Tuesday spots nearby, sourced from the Yelp proxy via
 *   `tuesdayStore.fetchSpots()`.
 * - A `v-progress-circular` shown while `tuesdayStore.loading` is `true`.
 * - A `v-snackbar` (color `error`, 5 s timeout) if `tuesdayStore.error` is
 *   set — uses the project-standard copy:
 *   _"Couldn't find Taco Tuesday spots nearby. Your city might just not
 *   deserve tacos. 😤"_
 * - An empty-state paragraph if `!tuesdayStore.hasSpots`:
 *   _"Yelp has no idea. Go find your own Tuesday tacos. 🕵️"_
 *
 * **It is NOT Tuesday (`isTuesday === false`)**
 * - Only `<TuesdayBanner>` is rendered — a desaturated, countdown-style
 *   placeholder with a bobbing taco emoji.
 *
 * **Data flow on mount (Tuesday only)**
 * 1. Calls `getLocation()` to resolve the user's lat/lng.
 * 2. Falls back silently to Portland, OR (`45.5231`, `-122.6765`) on denial
 *    or unavailability.
 * 3. Calls `tuesdayStore.fetchSpots(lat, lng)` which hits the Yelp proxy
 *    with `term='taco tuesday'`, `limit=10`, `sort_by=rating`.
 * 4. Sets `showError` to `true` if the store records an error after fetching.
 *
 * On unmount, `tuesdayStore.clear()` is called to reset the spots list so
 * stale data is never shown if the user re-visits the view.
 *
 * This view has **no props** and **no emits**.
 *
 * @example
 * ```ts
 * // Registered in src/router/index.ts as a lazy-loaded route:
 * { path: '/tuesday', component: () => import('./views/TuesdayView.vue') }
 * ```
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { useTuesdayCheck } from '@/composables/useTuesdayCheck'
import { useGeolocation } from '@/composables/useGeolocation'
import { useTuesdayStore } from '@/stores/tuesdayStore'
import FiestaOverlay from '@/components/tuesday/FiestaOverlay.vue'
import TuesdayBanner from '@/components/tuesday/TuesdayBanner.vue'
import TuesdayShopCard from '@/components/tuesday/TuesdayShopCard.vue'

/**
 * `isTuesday` — a `ComputedRef<boolean>` from `useTuesdayCheck` that evaluates
 * `new Date().getDay() === 2`. Drives the top-level `v-if / v-else` branch in
 * the template to select between the Fiesta experience and the countdown banner.
 */
const { isTuesday } = useTuesdayCheck()

/**
 * `getLocation` — async function from `useGeolocation` that resolves to
 * `{ lat, lng }` on success, or rejects if the user denies permission or the
 * API times out. This view catches all rejections and falls back to Portland.
 */
const { getLocation } = useGeolocation()

/**
 * Pinia store that owns the list of Taco Tuesday spots (`spots`), the
 * `loading` flag, the `error` string, and the `hasSpots` getter.
 * Also exposes `fetchSpots(lat, lng)` and `clear()` actions used during the
 * view's lifecycle.
 */
const tuesdayStore = useTuesdayStore()

/**
 * Reactive boolean that controls the error `v-snackbar` visibility. Set to
 * `true` by `onMounted` if `tuesdayStore.fetchSpots` completes with an error.
 * The snackbar auto-dismisses after 5 seconds.
 */
const showError = ref(false)

/**
 * Lifecycle hook: fetches nearby Taco Tuesday spots from the Yelp proxy,
 * but only when today is actually Tuesday. Short-circuits immediately on any
 * other day of the week to avoid unnecessary network requests.
 *
 * Steps performed (Tuesday only):
 * 1. Starts with Portland fallback coordinates (`45.5231`, `-122.6765`).
 * 2. Attempts to resolve the user's real coordinates via `getLocation()`.
 *    Any error (denial, timeout, unsupported) is caught and swallowed — the
 *    Portland defaults are used silently.
 * 3. Calls `tuesdayStore.fetchSpots(lat, lng)` which populates `spots`.
 * 4. Checks `tuesdayStore.error`; if set, flips `showError` to `true` to
 *    trigger the snackbar.
 */
onMounted(async () => {
  if (!isTuesday.value) return

  let lat = 45.5231
  let lng = -122.6765

  try {
    const location = await getLocation()
    lat = location.lat
    lng = location.lng
  } catch {
    // Fall back to Portland silently
  }

  await tuesdayStore.fetchSpots(lat, lng)

  if (tuesdayStore.error) {
    showError.value = true
  }
})

/**
 * Lifecycle hook: resets the `tuesdayStore` spots list via `tuesdayStore.clear()`
 * when the user navigates away from the view. This prevents stale Yelp data
 * from being displayed if the view is re-mounted later in the same session.
 */
onUnmounted(() => {
  tuesdayStore.clear()
})
</script>

<template>
  <div v-if="isTuesday" class="tuesday-view">
    <FiestaOverlay />
    <div class="tuesday-hero">
      <h1>🌮 IT'S TACO TUESDAY, BABY! 🌮</h1>
      <p>Find your nearest Taco Tuesday spots</p>
    </div>
    <v-container>
      <v-progress-circular
        v-if="tuesdayStore.loading"
        indeterminate
        color="primary"
        size="64"
        class="d-flex mx-auto my-8"
      />
      <div v-else-if="tuesdayStore.error">
        <v-snackbar v-model="showError" timeout="5000" color="error">
          Couldn't find Taco Tuesday spots nearby. Your city might just not deserve tacos. 😤
        </v-snackbar>
      </div>
      <div v-else-if="!tuesdayStore.hasSpots" class="text-center pa-8">
        <p>The map's coming up empty. Go find your own Tuesday tacos. 🕵️</p>
      </div>
      <div v-else>
        <TuesdayShopCard
          v-for="(spot, index) in tuesdayStore.spots"
          :key="spot.id"
          :shop="spot"
          :rank="index + 1"
          class="mb-4"
        />
      </div>
    </v-container>
  </div>
  <div v-else>
    <TuesdayBanner />
  </div>
</template>

<style scoped>
.tuesday-hero {
  background: linear-gradient(135deg, #ff6b35, #ffd166);
  text-align: center;
  padding: 48px 16px;
}
.tuesday-hero h1 {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 900;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  margin: 0;
}
</style>
