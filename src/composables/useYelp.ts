/**
 * @file useYelp.ts
 * @description Vue composable providing a typed interface to the Yelp Fusion
 * Business Search API via the server-side Vercel proxy at `/api/yelp`.
 *
 * **Why a proxy?** The Yelp Fusion API does not support CORS, so browser code
 * cannot call `api.yelp.com` directly — the request would be blocked. All Yelp
 * traffic is routed through the Edge Function at `api/yelp.ts`, which appends
 * the `Authorization: Bearer` header using the server-only `YELP_API_KEY`
 * environment variable and forwards the response to the client.
 *
 * **Never** import `YELP_API_KEY` in browser-side code or prefix it with
 * `VITE_` — doing so would expose the secret in the JavaScript bundle.
 *
 * **Usage in the app:**
 * - `mapStore` calls `searchTacoShops` to populate the map with nearby taco
 *   markers whenever the user's location is resolved.
 * - `tuesdayStore` calls `searchTacoTuesdayShops` on Tuesdays to populate the
 *   ranked list of Taco Tuesday spots in `TuesdayView.vue`.
 *
 * **Error handling:** Both exported functions throw on HTTP errors or when the
 * proxy returns an `{ error: string }` payload. Callers (stores) are
 * responsible for catching and surfacing the appropriate UI error message.
 */

import type { YelpBusiness, YelpSearchResponse } from '@/types/yelp'

/**
 * Internal helper that sends a GET request to the Vercel Yelp proxy and
 * returns the array of {@link YelpBusiness} objects from the response.
 *
 * The function handles two distinct error cases:
 * 1. A non-2xx HTTP status from the proxy itself (network error, server crash,
 *    rate-limit response forwarded as-is, etc.).
 * 2. A 2xx response whose JSON body contains an `error` key — this is the
 *    shape returned by `api/yelp.ts` when the upstream Yelp API returns an
 *    error (e.g. invalid API key, malformed parameters).
 *
 * Both cases result in a thrown `Error` so callers have a single catch path.
 *
 * @param params - A fully-populated {@link URLSearchParams} instance containing
 *   all query parameters to forward to the proxy. Required keys are `term`,
 *   `latitude`, `longitude`, `limit`, and `sort_by`. The function appends the
 *   params to `/api/yelp` as a query string.
 *
 * @returns A Promise that resolves to the `businesses` array from the
 *   {@link YelpSearchResponse}. The array may be empty if no businesses matched
 *   the query — this is not an error condition.
 *
 * @throws {Error} If the proxy responds with a non-2xx HTTP status.
 *   Message: `"Yelp API request failed: {status} {statusText}"`.
 *
 * @throws {Error} If the proxy responds with a 2xx status but the JSON body
 *   contains an `error` key (upstream Yelp API failure).
 *   Message: `"Yelp API error: {error}"`.
 *
 * @internal Not exported; use the functions returned by {@link useYelp} instead.
 */
async function fetchYelp(params: URLSearchParams): Promise<YelpBusiness[]> {
  const response = await fetch(`/api/yelp?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`Yelp API request failed: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as YelpSearchResponse | { error: string }

  if ('error' in data) {
    throw new Error(`Yelp API error: ${data.error}`)
  }

  return data.businesses
}

/**
 * Composable that exposes two async functions for searching taco-related
 * businesses near a geographic coordinate via the Yelp Fusion API proxy.
 *
 * The composable itself holds no reactive state — loading indicators, error
 * messages, and the resulting shop lists all live in the Pinia stores
 * (`mapStore`, `tuesdayStore`) that call these functions.
 *
 * Call `useYelp()` inside a `<script setup>` block, a Pinia store action, or
 * another composable. It is safe to call multiple times without side effects.
 *
 * @returns An object containing two async functions:
 *   - `searchTacoShops(lat, lng)` — search for taco restaurants near a point,
 *     returning up to 20 results sorted by rating.
 *   - `searchTacoTuesdayShops(lat, lng)` — search for Taco Tuesday specials
 *     near a point, returning up to 10 results sorted by rating.
 *
 * @example
 * // Inside a Pinia store action (mapStore.ts)
 * import { useYelp } from '@/composables/useYelp'
 *
 * const { searchTacoShops } = useYelp()
 *
 * try {
 *   const shops = await searchTacoShops(45.5231, -122.6765)
 *   this.shops = shops
 * } catch (err) {
 *   this.error = "The taco truck broke down 🚚💨 — couldn't load shops."
 * }
 *
 * @example
 * // Inside a Pinia store action (tuesdayStore.ts)
 * import { useYelp } from '@/composables/useYelp'
 *
 * const { searchTacoTuesdayShops } = useYelp()
 *
 * try {
 *   const spots = await searchTacoTuesdayShops(45.5231, -122.6765)
 *   this.spots = spots
 * } catch (err) {
 *   this.error = "Couldn't find Taco Tuesday spots nearby. Your city might just not deserve tacos. 😤"
 * }
 */
export function useYelp() {
  /**
   * Searches for taco restaurants near the provided geographic coordinates
   * using the Yelp term `"tacos"`.
   *
   * Results are sorted by Yelp rating (highest first) and capped at 20
   * businesses per request. This is the primary data source for the map view
   * — each returned {@link YelpBusiness} becomes a marker on `TacoMap.vue`.
   *
   * The request flows through the Vercel Edge Function at `api/yelp.ts`, which
   * injects the `Authorization` header before forwarding to Yelp. The browser
   * never sees or sends the API key.
   *
   * @param lat - The WGS 84 latitude of the search center in decimal degrees
   *   (e.g. `45.5231` for Portland, OR). Typically obtained from
   *   `useGeolocation().getLocation()`, falling back to Portland on denial.
   *
   * @param lng - The WGS 84 longitude of the search center in decimal degrees
   *   (e.g. `-122.6765` for Portland, OR). Must be paired with `lat`.
   *
   * @returns A Promise that resolves to an array of up to 20 {@link YelpBusiness}
   *   objects sorted by rating descending. Returns an empty array if Yelp finds
   *   no taco restaurants in the area (not treated as an error).
   *
   * @throws {Error} On proxy HTTP failure or upstream Yelp API error.
   *   The calling store should catch and set its `error` state to:
   *   `"The taco truck broke down 🚚💨 — couldn't load shops."`
   *
   * @example
   * const shops = await searchTacoShops(45.5231, -122.6765)
   * // [{ id: 'abc-tacos', name: 'ABC Tacos', rating: 4.8, ... }, ...]
   *
   * @example
   * // With error handling in a Pinia action
   * try {
   *   this.shops = await searchTacoShops(lat, lng)
   * } catch {
   *   this.error = "The taco truck broke down 🚚💨 — couldn't load shops."
   * }
   */
  async function searchTacoShops(lat: number, lng: number): Promise<YelpBusiness[]> {
    const params = new URLSearchParams({
      term: 'tacos',
      latitude: String(lat),
      longitude: String(lng),
      limit: '20',
      sort_by: 'rating',
    })
    return fetchYelp(params)
  }

  /**
   * Searches for Taco Tuesday promotions and specials near the provided
   * geographic coordinates using the Yelp term `"taco tuesday"`.
   *
   * Results are sorted by Yelp rating (highest first) and capped at 10
   * businesses per request — a tighter limit than `searchTacoShops` since the
   * Tuesday view renders a ranked list (with 🥇🥈🥉 badges) rather than a map.
   *
   * This function is only called when `useTuesdayCheck().isTuesday` is `true`
   * (i.e. when `tuesdayStore.fetchSpots` is triggered from `TuesdayView.vue`
   * on a Tuesday). On other days, the Tuesday view shows a countdown banner
   * and does not call Yelp.
   *
   * The request flows through the same Vercel Edge Function proxy as
   * `searchTacoShops`.
   *
   * @param lat - The WGS 84 latitude of the search center in decimal degrees
   *   (e.g. `45.5231` for Portland, OR). Typically obtained from
   *   `useGeolocation().getLocation()`, falling back to Portland on denial.
   *
   * @param lng - The WGS 84 longitude of the search center in decimal degrees
   *   (e.g. `-122.6765` for Portland, OR). Must be paired with `lat`.
   *
   * @returns A Promise that resolves to an array of up to 10 {@link YelpBusiness}
   *   objects sorted by rating descending. Returns an empty array when Yelp
   *   finds no matching Taco Tuesday businesses — the store maps this empty
   *   result to the message:
   *   `"Yelp has no idea. Go find your own Tuesday tacos. 🕵️"`.
   *
   * @throws {Error} On proxy HTTP failure or upstream Yelp API error.
   *   The calling store should catch and set its `error` state to:
   *   `"Couldn't find Taco Tuesday spots nearby. Your city might just not deserve tacos. 😤"`
   *
   * @example
   * const spots = await searchTacoTuesdayShops(45.5231, -122.6765)
   * // [{ id: 'best-tacos-tuesday', name: 'Best Tacos', rating: 4.9, ... }, ...]
   *
   * @example
   * // With error handling in a Pinia action
   * try {
   *   this.spots = await searchTacoTuesdayShops(lat, lng)
   *   if (this.spots.length === 0) {
   *     this.error = "Yelp has no idea. Go find your own Tuesday tacos. 🕵️"
   *   }
   * } catch {
   *   this.error = "Couldn't find Taco Tuesday spots nearby. Your city might just not deserve tacos. 😤"
   * }
   */
  async function searchTacoTuesdayShops(lat: number, lng: number): Promise<YelpBusiness[]> {
    const params = new URLSearchParams({
      term: 'taco tuesday',
      latitude: String(lat),
      longitude: String(lng),
      limit: '10',
      sort_by: 'rating',
    })
    return fetchYelp(params)
  }

  return { searchTacoShops, searchTacoTuesdayShops }
}
