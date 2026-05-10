import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MapboxTacoShop } from '@/types/mapbox'
import { useMapbox } from '@/composables/useMapbox'

/**
 * Pinia store for the Taco Tuesday feature backing the `/tuesday` route.
 *
 * On Tuesdays, populates a ranked list of nearby Taco Tuesday spots via
 * the Mapbox Search Box API. On other days the store stays empty —
 * `TuesdayView` only calls `fetchSpots` after confirming `isTuesday`.
 *
 * State shape:
 *   - `spots`    – ordered list of nearby Tuesday taco POIs
 *   - `loading`  – true while the Mapbox network request is in flight
 *   - `error`    – human-readable error message, or `null` when healthy
 *
 * Getter:
 *   - `hasSpots` – `spots.length > 0`; toggles between the list and the
 *                  empty-state copy in the view template.
 */
export const useTuesdayStore = defineStore('tuesday', () => {
  /**
   * Ordered list of Mapbox POIs returned by the most recent `fetchSpots`
   * call. The first three entries receive medal badges in
   * `TuesdayShopCard`; positions 4–10 display numeric chips.
   */
  const spots = ref<MapboxTacoShop[]>([])

  /**
   * `true` while the Mapbox request inside `fetchSpots` is in flight.
   */
  const loading = ref(false)

  /**
   * Human-readable error message after a failed `fetchSpots` call, or
   * `null` when there is no error.
   */
  const error = ref<string | null>(null)

  /**
   * Derived boolean — `true` when `spots` contains at least one POI.
   */
  const hasSpots = computed(() => spots.value.length > 0)

  /**
   * Fetches up to 10 Taco Tuesday POIs near the given coordinates from the
   * Mapbox Search Box API and stores them in `spots`. Resets `spots` to
   * `[]` on failure so no stale data lingers behind an error.
   */
  async function fetchSpots(lat: number, lng: number) {
    loading.value = true
    error.value = null
    try {
      const { searchTacoTuesdayShops } = useMapbox()
      spots.value = await searchTacoTuesdayShops(lat, lng)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      spots.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Resets `spots` and `error` to their initial values. Does not affect
   * `loading` — in-flight requests are not aborted.
   */
  function clear() {
    spots.value = []
    error.value = null
  }

  return { spots, loading, error, hasSpots, fetchSpots, clear }
})
