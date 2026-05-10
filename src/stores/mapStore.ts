import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MapboxTacoShop } from '@/types/mapbox'
import { useMapbox } from '@/composables/useMapbox'

/**
 * Pinia store for the interactive taco-shop map feature.
 *
 * Manages the lifecycle of taco-shop data that backs the `/map` route:
 * fetching nearby shops from the Mapbox Search Box API, tracking which
 * shop the user has selected, and surfacing loading / error state so the
 * UI can respond appropriately.
 *
 * State shape:
 *   - `shops`        – the list of nearby taco POIs returned by Mapbox
 *   - `selectedShop` – whichever shop the user clicked on the map
 *   - `loading`      – true while an async Mapbox fetch is in flight
 *   - `error`        – human-readable error message when a fetch fails
 *
 * All Mapbox calls are routed through `useMapbox`, which targets
 * `api.mapbox.com` directly using the publishable `VITE_MAPBOX_TOKEN`.
 */
export const useMapStore = defineStore('map', () => {
  /**
   * Ordered list of taco POIs returned by the most recent Mapbox search,
   * sorted by proximity to the search origin (Mapbox default).
   */
  const shops = ref<MapboxTacoShop[]>([])

  /**
   * The shop most recently selected via a map pin click or shop-card tap.
   * `null` means no shop is currently selected.
   */
  const selectedShop = ref<MapboxTacoShop | null>(null)

  /**
   * `true` while a Mapbox request is in flight.
   */
  const loading = ref(false)

  /**
   * Human-readable error message after a failed `fetchShops` call, or
   * `null` when there is no error.
   */
  const error = ref<string | null>(null)

  /**
   * Fetches up to 10 taco POIs near the given coordinates from the Mapbox
   * Search Box API and stores them in `shops`. Resets `shops` to `[]` on
   * failure so no stale data is displayed alongside an error message.
   */
  async function fetchShops(lat: number, lng: number) {
    loading.value = true
    error.value = null
    try {
      const { searchTacoShops } = useMapbox()
      shops.value = await searchTacoShops(lat, lng)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      shops.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Sets the given shop as the currently selected one. Consumers typically
   * react by flying the Mapbox camera and opening the detail panel.
   */
  function selectShop(shop: MapboxTacoShop) {
    selectedShop.value = shop
  }

  /**
   * Clears the selection, returning `selectedShop` to `null`.
   */
  function clearSelection() {
    selectedShop.value = null
  }

  return { shops, selectedShop, loading, error, fetchShops, selectShop, clearSelection }
})
