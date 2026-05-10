/**
 * @file mapbox.ts
 * @description TypeScript type definitions for the Mapbox Search Box API.
 *
 * These types model the subset of the Mapbox Search Box "forward" endpoint
 * response (https://docs.mapbox.com/api/search/search-box/#forward) that
 * Tacology consumes. Mapbox returns a GeoJSON `FeatureCollection`; the
 * composable extracts and reshapes each feature into a {@link MapboxTacoShop}
 * for downstream stores and components.
 *
 * Unlike the old Yelp integration, Mapbox Search Box supports CORS, so all
 * requests are made directly from the browser using `VITE_MAPBOX_TOKEN`
 * — no server-side proxy is required.
 */

/**
 * Normalised taco shop returned by `useMapbox`.
 *
 * Sourced from one feature in a Mapbox Search Box `forward` response and
 * reshaped for application use. Mapbox does not provide ratings, review
 * counts, prices, or photos, so those fields are absent here — components
 * fall back to category chips and a directions deep-link.
 *
 * @example
 * const shop: MapboxTacoShop = {
 *   id: 'dXJuOm1ieHBvaTphYmM',
 *   name: 'ABC Taco Co.',
 *   full_address: '123 Taco St, Portland, OR 97201',
 *   coordinates: { latitude: 45.5231, longitude: -122.6765 },
 *   categories: ['restaurant', 'mexican_restaurant'],
 *   maki: 'restaurant',
 * }
 */
export interface MapboxTacoShop {
  /**
   * Stable Mapbox POI identifier (`properties.mapbox_id`). Safe to use as a
   * Vue `:key` in lists.
   */
  id: string

  /**
   * Human-readable POI name (`properties.name`).
   */
  name: string

  /**
   * Pre-formatted single-line street address. Prefers `properties.full_address`
   * and falls back to `properties.place_formatted` when `full_address` is
   * unavailable.
   *
   * @example "123 Taco St, Portland, OR 97201"
   */
  full_address: string

  /**
   * Geographic coordinates of the POI. Used by Mapbox markers and by the
   * directions deep-link.
   */
  coordinates: {
    /** WGS 84 latitude in decimal degrees. */
    latitude: number
    /** WGS 84 longitude in decimal degrees. */
    longitude: number
  }

  /**
   * Mapbox POI category slugs (`properties.poi_category`). May be empty for
   * loosely classified POIs. Rendered as `v-chip` tags in shop cards.
   *
   * @example ['restaurant', 'mexican_restaurant']
   */
  categories: string[]

  /**
   * Mapbox "maki" icon name (`properties.maki`), if present. Useful for
   * rendering category-appropriate iconography alongside the POI.
   */
  maki?: string
}

/**
 * Shape of a single feature in the Mapbox Search Box forward response.
 *
 * Only the fields Tacology reads are typed. The full Mapbox schema includes
 * many additional fields (context, language, metadata, external_ids, etc.)
 * that are intentionally omitted.
 */
export interface MapboxSearchFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: {
    mapbox_id: string
    name: string
    full_address?: string
    place_formatted?: string
    coordinates?: { latitude: number; longitude: number }
    poi_category?: string[]
    maki?: string
  }
}

/**
 * Top-level wrapper returned by the Mapbox Search Box forward endpoint.
 * Conforms to the GeoJSON `FeatureCollection` shape.
 */
export interface MapboxSearchResponse {
  type: 'FeatureCollection'
  features: MapboxSearchFeature[]
  attribution?: string
}
