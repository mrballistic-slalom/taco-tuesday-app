import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { YelpBusiness } from '@/types/yelp'
import { useYelp } from '@/composables/useYelp'

/**
 * Pinia store for the interactive taco-shop map feature.
 *
 * Manages the full lifecycle of taco-shop data that backs the `/map` route:
 * fetching nearby shops from Yelp (via the server-side proxy), tracking which
 * shop the user has selected, and surfacing loading / error state so the UI
 * can respond appropriately.
 *
 * State shape:
 *   - `shops`        – the paginated list of nearby taco businesses
 *   - `selectedShop` – whichever shop the user clicked on the map
 *   - `loading`      – true while an async Yelp fetch is in flight
 *   - `error`        – human-readable error message when a fetch fails
 *
 * Typical usage in a component:
 * ```ts
 * import { useMapStore } from '@/stores/mapStore'
 *
 * const mapStore = useMapStore()
 *
 * // Fetch shops near the user's current position:
 * await mapStore.fetchShops(45.5231, -122.6765)
 *
 * // React to the shop list:
 * console.log(mapStore.shops)        // YelpBusiness[]
 * console.log(mapStore.selectedShop) // YelpBusiness | null
 *
 * // Select a shop when the user clicks a map pin:
 * mapStore.selectShop(someShop)
 *
 * // Deselect when the panel is closed:
 * mapStore.clearSelection()
 * ```
 *
 * All Yelp network calls are routed through `useYelp`, which proxies via
 * `api/yelp.ts` — never directly from the browser to the Yelp Fusion API.
 */
export const useMapStore = defineStore('map', () => {
  /**
   * The ordered list of taco businesses returned by the most recent Yelp
   * search.  Sorted by rating (highest first) as requested by `useYelp`.
   * Resets to an empty array whenever `fetchShops` is called and when an
   * error occurs, so the UI never displays stale results alongside an error.
   *
   * @type {import('vue').Ref<YelpBusiness[]>}
   */
  const shops = ref<YelpBusiness[]>([])

  /**
   * The taco business the user most recently selected by clicking a map pin
   * or a shop card.  `null` means no shop is currently selected (the detail
   * panel should be hidden).
   *
   * Set via `selectShop(shop)` and cleared via `clearSelection()`.
   *
   * @type {import('vue').Ref<YelpBusiness | null>}
   */
  const selectedShop = ref<YelpBusiness | null>(null)

  /**
   * Indicates whether a Yelp network request is currently in flight.
   * Components should show a loading skeleton or progress indicator while
   * this is `true` and hide the shop list until it returns to `false`.
   *
   * @type {import('vue').Ref<boolean>}
   */
  const loading = ref(false)

  /**
   * Contains a human-readable error message when the most recent
   * `fetchShops` call failed, or `null` when there is no error.
   *
   * Typical value on failure:
   *   `"The taco truck broke down 🚚💨 — couldn't load shops."`
   *
   * The error is reset to `null` at the start of every `fetchShops` call so
   * a subsequent successful fetch automatically clears any previous error.
   *
   * @type {import('vue').Ref<string | null>}
   */
  const error = ref<string | null>(null)

  /**
   * Fetches up to 20 taco shops near the given geographic coordinates from
   * the Yelp Fusion API (via the `api/yelp.ts` server-side proxy) and
   * stores the results in `shops`.
   *
   * Execution flow:
   * 1. Sets `loading` to `true` and clears any previous `error`.
   * 2. Calls `useYelp().searchTacoShops(lat, lng)` which issues a GET to
   *    `/api/yelp?term=tacos&latitude={lat}&longitude={lng}&limit=20&sort_by=rating`.
   * 3. On success: stores the returned `YelpBusiness[]` in `shops`.
   * 4. On failure: stores the error message in `error` and resets `shops`
   *    to an empty array so no stale data is displayed.
   * 5. Always sets `loading` back to `false` in the `finally` block.
   *
   * @param {number} lat - WGS-84 latitude of the search origin.
   *   Falls back to `45.5231` (Portland, OR) when geolocation is unavailable.
   * @param {number} lng - WGS-84 longitude of the search origin.
   *   Falls back to `-122.6765` (Portland, OR) when geolocation is unavailable.
   * @returns {Promise<void>} Resolves when the fetch completes (successfully
   *   or with an error).  The store's reactive state is updated as a
   *   side-effect; there is no return value to consume.
   *
   * @example
   * // Inside a Vue component or composable:
   * const mapStore = useMapStore()
   * await mapStore.fetchShops(37.7749, -122.4194) // San Francisco
   * if (mapStore.error) {
   *   showToast(mapStore.error)
   * } else {
   *   renderPins(mapStore.shops)
   * }
   */
  async function fetchShops(lat: number, lng: number) {
    loading.value = true
    error.value = null
    try {
      const { searchTacoShops } = useYelp()
      shops.value = await searchTacoShops(lat, lng)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      shops.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Sets the given taco business as the currently selected shop.
   *
   * Calling this triggers any watchers or computed properties that depend on
   * `selectedShop`, which is typically used to:
   *   - Fly the Mapbox camera to the shop's coordinates (zoom 15, pitch 60).
   *   - Open the `ShopCard` detail panel.
   *
   * Does not clear `shops` — the full list remains available so the user can
   * switch selection without re-fetching.
   *
   * @param {YelpBusiness} shop - The Yelp business object to select.
   *   Must be a member of the current `shops` array, though this is not
   *   enforced at runtime.
   * @returns {void}
   *
   * @example
   * mapStore.selectShop(mapStore.shops[0])
   * // mapStore.selectedShop === mapStore.shops[0]  →  true
   */
  function selectShop(shop: YelpBusiness) {
    selectedShop.value = shop
  }

  /**
   * Clears the currently selected shop, returning `selectedShop` to `null`.
   *
   * Typically called when the user:
   *   - Closes the `ShopCard` panel via its close button.
   *   - Navigates away from the `/map` route.
   *   - Clicks an empty area of the map.
   *
   * Does not affect `shops`, `loading`, or `error`.
   *
   * @returns {void}
   *
   * @example
   * mapStore.clearSelection()
   * // mapStore.selectedShop === null  →  true
   */
  function clearSelection() {
    selectedShop.value = null
  }

  return { shops, selectedShop, loading, error, fetchShops, selectShop, clearSelection }
})
