import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { YelpBusiness } from '@/types/yelp'
import { useYelp } from '@/composables/useYelp'

/**
 * Pinia store for the Taco Tuesday feature that backs the `/tuesday` route.
 *
 * Responsible for discovering and storing the best "taco tuesday" spots near
 * the user on — you guessed it — Tuesdays.  When it is not Tuesday, this
 * store is intentionally left empty; `TuesdayView` only calls `fetchSpots`
 * after confirming `useTuesdayCheck().isTuesday` is `true`.
 *
 * Data is sourced from the Yelp Fusion API via the `api/yelp.ts` serverless
 * proxy, using `term='taco tuesday'` and `limit=10` so only the most relevant
 * spots are returned.
 *
 * State shape:
 *   - `spots`    – ordered list (by Yelp rating) of nearby Taco Tuesday
 *                  businesses; displayed as ranked `TuesdayShopCard` items
 *   - `loading`  – true while the Yelp network request is in flight
 *   - `error`    – human-readable error message, or `null` when healthy
 *
 * Getter:
 *   - `hasSpots` – convenience boolean derived from `spots.length > 0`;
 *                  determines whether the shop list or the empty-state
 *                  copy is rendered
 *
 * Typical usage:
 * ```ts
 * import { useTuesdayStore } from '@/stores/tuesdayStore'
 * import { useTuesdayCheck } from '@/composables/useTuesdayCheck'
 *
 * const tuesdayStore = useTuesdayStore()
 * const { isTuesday } = useTuesdayCheck()
 *
 * if (isTuesday.value) {
 *   const { lat, lng } = await getLocation()
 *   await tuesdayStore.fetchSpots(lat, lng)
 * }
 *
 * // In the template:
 * // v-if="tuesdayStore.hasSpots" → show TuesdayShopCard list
 * // v-else-if="!tuesdayStore.loading" → show empty-state copy
 * ```
 */
export const useTuesdayStore = defineStore('tuesday', () => {
  /**
   * Ordered list of Yelp businesses returned by the most recent
   * `fetchSpots` call.  Sorted by rating (highest first) as requested by
   * `useYelp`.
   *
   * The first three entries receive gold/silver/bronze rank badges (🥇🥈🥉)
   * in `TuesdayShopCard`; positions 4–10 display plain numeric badges.
   *
   * Resets to an empty array at the start of each `fetchSpots` call (on
   * error) and whenever `clear()` is called, ensuring no stale data is
   * shown.
   *
   * @type {import('vue').Ref<YelpBusiness[]>}
   */
  const spots = ref<YelpBusiness[]>([])

  /**
   * True while the Yelp network request inside `fetchSpots` is in flight.
   *
   * `TuesdayView` renders `v-progress-circular` while this is `true` and
   * switches to the ranked shop list once it returns to `false`.
   *
   * @type {import('vue').Ref<boolean>}
   */
  const loading = ref(false)

  /**
   * Human-readable error message when the most recent `fetchSpots` call
   * failed, or `null` when there is no error.
   *
   * Possible values per the copy spec:
   *   - Network/API failure:
   *     `"Couldn't find Taco Tuesday spots nearby. Your city might just not deserve tacos. 😤"`
   *   - Empty Yelp result set (handled in the view, not the store):
   *     `"Yelp has no idea. Go find your own Tuesday tacos. 🕵️"`
   *
   * Reset to `null` at the start of every `fetchSpots` call and by
   * `clear()`.
   *
   * @type {import('vue').Ref<string | null>}
   */
  const error = ref<string | null>(null)

  /**
   * Derived boolean that is `true` when `spots` contains at least one
   * business.
   *
   * Computed directly from `spots.value.length > 0` so it stays in sync
   * with `spots` automatically without any manual updates.
   *
   * Use this in templates instead of checking `spots.length` directly:
   * ```html
   * <TuesdayShopList v-if="tuesdayStore.hasSpots" />
   * <EmptyState v-else-if="!tuesdayStore.loading" />
   * ```
   *
   * @type {import('vue').ComputedRef<boolean>}
   */
  const hasSpots = computed(() => spots.value.length > 0)

  /**
   * Fetches up to 10 "taco tuesday" businesses near the given geographic
   * coordinates from the Yelp Fusion API (via `api/yelp.ts`) and stores
   * the results in `spots`.
   *
   * Execution flow:
   * 1. Sets `loading` to `true` and resets `error` to `null`.
   * 2. Calls `useYelp().searchTacoTuesdayShops(lat, lng)` which issues a
   *    GET to
   *    `/api/yelp?term=taco+tuesday&latitude={lat}&longitude={lng}&limit=10&sort_by=rating`.
   * 3. On success: stores the returned `YelpBusiness[]` in `spots`.
   * 4. On failure: stores the error message in `error` and resets `spots`
   *    to an empty array so no stale results remain visible.
   * 5. Always sets `loading` back to `false` in the `finally` block.
   *
   * This action should only be called when `useTuesdayCheck().isTuesday`
   * is `true`.  On non-Tuesdays, `TuesdayView` renders `TuesdayBanner`
   * instead of triggering a Yelp search.
   *
   * @param {number} lat - WGS-84 latitude of the search origin.
   *   Falls back to `45.5231` (Portland, OR) when geolocation is
   *   unavailable.
   * @param {number} lng - WGS-84 longitude of the search origin.
   *   Falls back to `-122.6765` (Portland, OR) when geolocation is
   *   unavailable.
   * @returns {Promise<void>} Resolves when the fetch completes (successfully
   *   or with an error).  Updated state is the side-effect; nothing is
   *   returned directly.
   * @throws Never — errors are caught internally and written to `error`.
   *
   * @example
   * const { lat, lng } = await getLocation().catch(() => ({
   *   lat: 45.5231,
   *   lng: -122.6765,
   * }))
   * await tuesdayStore.fetchSpots(lat, lng)
   *
   * if (tuesdayStore.error) {
   *   showErrorBanner(tuesdayStore.error)
   * } else if (!tuesdayStore.hasSpots) {
   *   showEmptyState("Yelp has no idea. Go find your own Tuesday tacos. 🕵️")
   * }
   */
  async function fetchSpots(lat: number, lng: number) {
    loading.value = true
    error.value = null
    try {
      const { searchTacoTuesdayShops } = useYelp()
      spots.value = await searchTacoTuesdayShops(lat, lng)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      spots.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Resets `spots` and `error` to their initial values.
   *
   * After calling `clear()`:
   *   - `spots`    → `[]`    (hides the shop list; `hasSpots` becomes `false`)
   *   - `error`    → `null`  (clears any error banner)
   *   - `loading`  is left unchanged (clear does not abort in-flight requests)
   *
   * Typical use cases:
   *   - Navigating away from `/tuesday` to avoid stale data on return.
   *   - Resetting state in component tests (`beforeEach` teardown).
   *   - Explicitly clearing results when `isTuesday` becomes `false` (e.g.
   *     in a long-running session that crosses midnight into Wednesday).
   *
   * Does not interact with TheMealDB or any external service.
   *
   * @returns {void}
   *
   * @example
   * tuesdayStore.clear()
   * // tuesdayStore.spots.length === 0  →  true
   * // tuesdayStore.hasSpots           →  false
   * // tuesdayStore.error              →  null
   */
  function clear() {
    spots.value = []
    error.value = null
  }

  return { spots, loading, error, hasSpots, fetchSpots, clear }
})
