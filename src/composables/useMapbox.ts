/**
 * @file useMapbox.ts
 * @description Vue composable providing a typed interface to the Mapbox
 * Search Box "forward" endpoint for locating taco POIs near a coordinate.
 *
 * Mapbox Search Box supports CORS, so this composable calls
 * `api.mapbox.com` directly from the browser using `VITE_MAPBOX_TOKEN`.
 * There is no server-side proxy — the access token is a publishable token
 * already exposed by the Mapbox GL JS map.
 *
 * **Usage in the app:**
 * - `mapStore` calls `searchTacoShops` to populate the map with nearby taco
 *   markers whenever the user's location is resolved.
 * - `tuesdayStore` calls `searchTacoTuesdayShops` on Tuesdays to populate
 *   the ranked list of Taco Tuesday spots in `TuesdayView.vue`.
 *
 * **Error handling:** Both exported functions throw on HTTP errors or when
 * the response is missing the `features` array. Callers (stores) are
 * responsible for catching and surfacing the appropriate UI error message.
 */

import type {
  MapboxSearchFeature,
  MapboxSearchResponse,
  MapboxTacoShop,
} from '@/types/mapbox'

const MAPBOX_FORWARD_URL = 'https://api.mapbox.com/search/searchbox/v1/forward'

/**
 * Reshapes a single Mapbox `Feature` into the application's
 * {@link MapboxTacoShop} type. Coordinates fall back to the GeoJSON
 * `geometry.coordinates` tuple if `properties.coordinates` is absent,
 * and the address falls back to `place_formatted`.
 */
function toShop(feature: MapboxSearchFeature): MapboxTacoShop {
  const { properties, geometry } = feature
  const lng = properties.coordinates?.longitude ?? geometry.coordinates[0]
  const lat = properties.coordinates?.latitude ?? geometry.coordinates[1]

  return {
    id: properties.mapbox_id,
    name: properties.name,
    full_address: properties.full_address ?? properties.place_formatted ?? '',
    coordinates: { latitude: lat, longitude: lng },
    categories: properties.poi_category ?? [],
    maki: properties.maki,
  }
}

/**
 * Internal helper that issues a GET to the Mapbox Search Box forward
 * endpoint and returns the reshaped array of {@link MapboxTacoShop}
 * objects.
 *
 * @param q - Free-text query (e.g. `"tacos"`).
 * @param lat - WGS 84 latitude of the search origin.
 * @param lng - WGS 84 longitude of the search origin.
 * @param limit - Maximum number of results to request (Mapbox caps at 10).
 * @throws {Error} If `VITE_MAPBOX_TOKEN` is missing.
 * @throws {Error} If Mapbox returns a non-2xx HTTP status.
 * @throws {Error} If the response body is missing the `features` array.
 */
async function fetchMapbox(
  q: string,
  lat: number,
  lng: number,
  limit: number
): Promise<MapboxTacoShop[]> {
  const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined
  if (!token) {
    throw new Error('Mapbox token not configured')
  }

  const params = new URLSearchParams({
    q,
    proximity: `${lng},${lat}`,
    limit: String(limit),
    types: 'poi',
    access_token: token,
  })

  const response = await fetch(`${MAPBOX_FORWARD_URL}?${params.toString()}`)

  if (!response.ok) {
    throw new Error(
      `Mapbox Search request failed: ${response.status} ${response.statusText}`
    )
  }

  const data = (await response.json()) as MapboxSearchResponse
  if (!Array.isArray(data.features)) {
    throw new Error('Mapbox Search returned an unexpected payload')
  }

  return data.features.map(toShop)
}

/**
 * Composable that exposes two async functions for searching taco POIs near
 * a geographic coordinate via the Mapbox Search Box API.
 *
 * The composable itself holds no reactive state — loading indicators, error
 * messages, and resulting shop lists all live in the Pinia stores
 * (`mapStore`, `tuesdayStore`) that call these functions.
 *
 * @example
 * const { searchTacoShops } = useMapbox()
 * const shops = await searchTacoShops(45.5231, -122.6765)
 */
export function useMapbox() {
  /**
   * Searches for taco POIs near the provided coordinates with `q="tacos"`
   * and `limit=10` (the Mapbox Search Box forward maximum).
   *
   * @throws {Error} On configuration, HTTP, or payload failure.
   */
  async function searchTacoShops(lat: number, lng: number): Promise<MapboxTacoShop[]> {
    return fetchMapbox('tacos', lat, lng, 10)
  }

  /**
   * Searches for Taco Tuesday-relevant POIs near the provided coordinates
   * with `q="taco tuesday"` and `limit=10`.
   *
   * Mapbox does not index promotional copy, so most results are simply
   * taco-named POIs near the user — but the explicit query keeps the
   * Tuesday view's search distinct from the general map view.
   *
   * @throws {Error} On configuration, HTTP, or payload failure.
   */
  async function searchTacoTuesdayShops(
    lat: number,
    lng: number
  ): Promise<MapboxTacoShop[]> {
    return fetchMapbox('taco tuesday', lat, lng, 10)
  }

  return { searchTacoShops, searchTacoTuesdayShops }
}
