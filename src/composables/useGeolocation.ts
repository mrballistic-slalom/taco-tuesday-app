/**
 * @file useGeolocation.ts
 * @description Vue composable that wraps the browser's Geolocation API in a
 * Promise-based interface.
 *
 * This composable is the single place in the codebase where
 * `navigator.geolocation` is accessed. It is consumed by `mapStore` and
 * `tuesdayStore` to obtain the user's position before making Yelp API calls.
 *
 * **Fallback behavior:** Callers are responsible for catching rejections and
 * falling back to a default location (Portland, OR: `[-122.6765, 45.5231]`).
 * Geolocation denial must NEVER surface an error to the user — the stores
 * catch the rejection and silently substitute the Portland coordinates.
 *
 * **Browser support:** The Geolocation API is supported in all modern browsers
 * when served over HTTPS. It is unavailable in some embedded webviews and will
 * be denied by the browser if the page is served over HTTP in production.
 */

/**
 * Composable that provides a Promise-based wrapper around
 * `navigator.geolocation.getCurrentPosition`.
 *
 * Call `useGeolocation()` inside a `<script setup>` block or another
 * composable to obtain the `getLocation` function. The composable itself holds
 * no reactive state — it is stateless and safe to call multiple times.
 *
 * @returns An object containing the `getLocation` function.
 *
 * @example
 * // Inside a Pinia store action
 * import { useGeolocation } from '@/composables/useGeolocation'
 *
 * const { getLocation } = useGeolocation()
 *
 * try {
 *   const { lat, lng } = await getLocation()
 *   await fetchShops(lat, lng)
 * } catch {
 *   // User denied or geolocation unavailable — fall back to Portland, OR
 *   await fetchShops(45.5231, -122.6765)
 * }
 */
export function useGeolocation() {
  /**
   * Requests the device's current geographic position using the browser
   * Geolocation API and resolves with a plain `{ lat, lng }` coordinate object.
   *
   * The request has an 8-second timeout (`timeout: 8000`). If the browser does
   * not return a position within that window the returned Promise rejects with
   * a `TIMEOUT` error (code 3).
   *
   * The function does not cache the result — each call triggers a fresh
   * permission prompt (or uses a cached browser permission grant if one exists).
   *
   * @returns A Promise that resolves to `{ lat: number; lng: number }` where
   *   `lat` is the WGS 84 latitude in decimal degrees and `lng` is the WGS 84
   *   longitude in decimal degrees.
   *
   * @throws {Error} If `navigator.geolocation` is not available in the current
   *   environment (e.g. older browsers, non-HTTPS contexts, or certain webviews).
   *   Message: `"Geolocation is not supported by this browser."`
   *
   * @throws {Error} If the browser returns a geolocation error — most commonly
   *   because the user denied the permission prompt (error code 1), or because
   *   the device could not determine its position (error code 2), or because the
   *   8-second timeout elapsed (error code 3).
   *   Message: `"Geolocation error: <browser error message>"`
   *
   * @example
   * // Successful resolution
   * const { lat, lng } = await getLocation()
   * // lat === 45.5231, lng === -122.6765 (example — actual values depend on device)
   *
   * @example
   * // Handling denial / unavailability with a Portland fallback
   * const PORTLAND = { lat: 45.5231, lng: -122.6765 }
   * const coords = await getLocation().catch(() => PORTLAND)
   */
  function getLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`))
        },
        { timeout: 8000 }
      )
    })
  }

  return { getLocation }
}
