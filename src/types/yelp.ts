/**
 * @file yelp.ts
 * @description TypeScript type definitions for the Yelp Fusion API responses.
 *
 * These types model the subset of the Yelp Business Search API response
 * (https://docs.developer.yelp.com/reference/v3_business_search) that
 * Tacology consumes. The full Yelp response contains many additional fields
 * that are not typed here because they are unused by the app.
 *
 * IMPORTANT: Yelp API calls must NEVER be made directly from browser code.
 * The Yelp API does not support CORS, so all requests must go through the
 * server-side Vercel proxy at `api/yelp.ts`. The composable {@link useYelp}
 * enforces this by targeting `/api/yelp` only.
 *
 * The `YELP_API_KEY` environment variable must have no `VITE_` prefix —
 * it is only accessible in `api/yelp.ts` on the server and must never be
 * exposed to the browser bundle.
 */

/**
 * Represents a single business (taco shop) returned by the Yelp Business
 * Search API via the `/api/yelp` proxy.
 *
 * This type is used throughout the map feature (`mapStore`, `TacoMap.vue`,
 * `ShopCard.vue`) and the Taco Tuesday feature (`tuesdayStore`,
 * `TuesdayView.vue`, `TuesdayShopCard.vue`).
 *
 * @example
 * const shop: YelpBusiness = {
 *   id: 'abc-taco-co-portland',
 *   name: 'ABC Taco Co.',
 *   rating: 4.5,
 *   review_count: 312,
 *   price: '$$',
 *   location: { display_address: ['123 Taco St', 'Portland, OR 97201'] },
 *   coordinates: { latitude: 45.5231, longitude: -122.6765 },
 *   categories: [{ alias: 'tacos', title: 'Tacos' }],
 *   url: 'https://www.yelp.com/biz/abc-taco-co-portland',
 *   image_url: 'https://s3-media1.fl.yelpcdn.com/bphoto/example.jpg'
 * }
 */
export interface YelpBusiness {
  /**
   * Yelp's unique slug identifier for the business (e.g. `"abc-taco-co-portland"`).
   * Stable across API calls and can be used as a Vue `:key` in lists.
   */
  id: string

  /**
   * The publicly displayed name of the business (e.g. `"ABC Taco Co."`).
   * Rendered as the primary heading in `ShopCard` and `TuesdayShopCard`.
   */
  name: string

  /**
   * Aggregate Yelp star rating from 1.0 to 5.0, in 0.5 increments.
   * Displayed via `v-rating` in shop cards. A higher value is better.
   */
  rating: number

  /**
   * Total number of reviews the business has received on Yelp.
   * Displayed alongside the star rating to indicate review volume and reliability.
   */
  review_count: number

  /**
   * Price range indicator using dollar signs: `"$"`, `"$$"`, `"$$$"`, or `"$$$$"`.
   * Not all businesses have a price listed — always handle the `undefined` case
   * in templates by falling back to a dash or empty string.
   */
  price?: string

  /**
   * Location data for the business, including a pre-formatted address array.
   * `display_address` is an array of address line strings suitable for joining
   * with a comma or newline for display (e.g. `["123 Taco St", "Portland, OR 97201"]`).
   */
  location: {
    /**
     * Pre-formatted mailing address split into display lines by Yelp.
     * Join with `', '` for a single-line display or render each element on its own line.
     *
     * @example ['123 Taco St', 'Portland, OR 97201']
     */
    display_address: string[]
  }

  /**
   * Geographic coordinates of the business.
   * Used to place map markers in `TacoMap.vue` via Mapbox GL JS and to
   * fly the camera to a selected shop's position.
   */
  coordinates: {
    /** WGS 84 latitude in decimal degrees (e.g. `45.5231`). */
    latitude: number
    /** WGS 84 longitude in decimal degrees (e.g. `-122.6765`). */
    longitude: number
  }

  /**
   * Array of Yelp category tags the business is listed under.
   * Each entry has a machine-readable `alias` (e.g. `"tacos"`) and a
   * human-readable `title` (e.g. `"Tacos"`). May contain multiple categories
   * (e.g. a shop listed under both "Tacos" and "Mexican").
   *
   * @example [{ alias: 'tacos', title: 'Tacos' }, { alias: 'mexican', title: 'Mexican' }]
   */
  categories: {
    /** Machine-readable Yelp category slug (e.g. `"tacos"`, `"mexican"`). */
    alias: string
    /** Human-readable category label suitable for display (e.g. `"Tacos"`, `"Mexican"`). */
    title: string
  }[]

  /**
   * Deep link to the business's page on yelp.com.
   * Used in "Open on Yelp" buttons in `ShopCard` and `TuesdayShopCard`.
   * Always present; rendered as an `<a target="_blank">` link.
   *
   * @example 'https://www.yelp.com/biz/abc-taco-co-portland'
   */
  url: string

  /**
   * URL to the business's primary cover photo hosted on Yelp's CDN (Amazon S3).
   * Not guaranteed to be present — some businesses have no photos uploaded.
   * Always guard against `undefined` before rendering as an `<img src>`.
   *
   * @example 'https://s3-media1.fl.yelpcdn.com/bphoto/example/o.jpg'
   */
  image_url?: string
}

/**
 * Top-level wrapper returned by the Yelp Business Search API endpoint and
 * mirrored through the `/api/yelp` proxy.
 *
 * The proxy at `api/yelp.ts` forwards the raw Yelp JSON to the client. On
 * success, this shape is what callers receive. On failure, the proxy returns
 * `{ error: string }` instead — the {@link useYelp} composable checks for the
 * `error` key before casting to this type.
 *
 * @example
 * const response: YelpSearchResponse = {
 *   businesses: [{ id: 'abc-taco-co', name: 'ABC Taco Co.', ... }],
 *   total: 1
 * }
 */
export interface YelpSearchResponse {
  /**
   * Array of business objects matching the search query and location parameters.
   * Already limited to the requested `limit` count (20 for general taco search,
   * 10 for Taco Tuesday search). May be an empty array if no results were found
   * in the area — distinct from an error condition.
   */
  businesses: YelpBusiness[]

  /**
   * The total count of businesses that matched the query across ALL pages,
   * not just the current page. Because Tacology does not paginate, this value
   * is used only for informational purposes if displayed at all.
   */
  total: number
}
