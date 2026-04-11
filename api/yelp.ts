/**
 * @file api/yelp.ts
 *
 * Vercel Edge Function — Yelp Fusion API proxy.
 *
 * **Purpose**
 * The Yelp Fusion API enforces CORS policies that block direct browser
 * requests. This function acts as a thin server-side proxy: it receives a
 * GET request from the browser, forwards a whitelisted subset of query
 * parameters to the Yelp API with a Bearer token injected from an environment
 * variable, and streams the raw Yelp JSON response back to the caller.
 *
 * **Security model**
 * - `YELP_API_KEY` is a server-only environment variable (no `VITE_` prefix).
 *   It is never included in the client-side JavaScript bundle.
 * - Only the five explicitly whitelisted parameters (`term`, `latitude`,
 *   `longitude`, `limit`, `sort_by`) are forwarded to Yelp. All other query
 *   parameters in the incoming request are silently dropped, preventing
 *   parameter injection attacks.
 *
 * **Runtime**
 * Deployed as a Vercel Edge Function (`runtime: 'edge'`) so it runs in the
 * V8 isolate environment closest to the user, minimising latency. The
 * `Request` / `Response` Web API is available natively in this runtime.
 *
 * **Error handling**
 * | Scenario                         | HTTP status | Response body                            |
 * |----------------------------------|-------------|------------------------------------------|
 * | Non-GET method                   | 405         | `{ "error": "Method not allowed" }`      |
 * | `YELP_API_KEY` env var missing   | 500         | `{ "error": "API key not configured" }`  |
 * | Network error reaching Yelp      | 502         | `{ "error": "Failed to reach Yelp: …" }` |
 * | Any Yelp error (4xx/5xx)         | Pass-through | Raw Yelp JSON error body               |
 *
 * **URL mapping (via `vercel.json`)**
 * ```
 * GET /api/yelp?term=tacos&latitude=45.52&longitude=-122.68&limit=20&sort_by=rating
 *   → proxied to →
 * GET https://api.yelp.com/v3/businesses/search?term=tacos&latitude=45.52&…
 * ```
 *
 * @module api/yelp
 */

/**
 * Vercel runtime configuration object.
 *
 * Setting `runtime` to `'edge'` opts this function into the Vercel Edge
 * Runtime (V8 isolate) rather than the default Node.js serverless runtime.
 * This reduces cold-start latency and enables deployment to Vercel's global
 * edge network.
 *
 * @see {@link https://vercel.com/docs/functions/edge-functions} Vercel Edge Functions
 */
export const config = { runtime: 'edge' }

/**
 * Base URL of the Yelp Fusion Business Search endpoint.
 * Query parameters are appended at request time.
 *
 * @see {@link https://docs.developer.yelp.com/reference/v3_business_search} Yelp Fusion API — Business Search
 */
const YELP_BASE_URL = 'https://api.yelp.com/v3/businesses/search'

/**
 * Vercel Edge Function handler — proxies GET requests to the Yelp Fusion API.
 *
 * The function performs the following steps:
 * 1. Rejects non-GET methods with a 405 response.
 * 2. Reads `YELP_API_KEY` from `process.env`; returns 500 if absent.
 * 3. Extracts and forwards a whitelisted subset of query parameters.
 * 4. Fetches the Yelp Business Search endpoint with the Bearer token in the
 *    `Authorization` header.
 * 5. Returns the raw Yelp JSON (success or error) with the original status
 *    code, or a 502 if the upstream `fetch` itself throws (e.g. DNS failure,
 *    network timeout).
 *
 * @param request - The incoming Web API `Request` object from the Vercel edge
 *   runtime. Expected to be a GET request with the following optional query
 *   parameters:
 *   - `term` — Search term, e.g. `"tacos"` or `"taco tuesday"`.
 *   - `latitude` — Decimal latitude of the search origin, e.g. `"45.52"`.
 *   - `longitude` — Decimal longitude of the search origin, e.g. `"-122.68"`.
 *   - `limit` — Maximum number of results to return (Yelp caps at 50).
 *   - `sort_by` — Sort order; Tacology always passes `"rating"`.
 *
 * @returns {Promise<Response>} A Web API `Response` containing a JSON body.
 *   On success, the body mirrors the Yelp `YelpSearchResponse` shape:
 *   `{ businesses: YelpBusiness[], total: number }`. On failure, the body is
 *   `{ error: string }` with an appropriate HTTP status code.
 *
 * @throws This function never throws — all errors are caught and returned as
 *   structured `Response` objects with JSON bodies.
 *
 * @example
 * ```ts
 * // From useYelp.ts (client-side composable):
 * const res = await fetch(
 *   `/api/yelp?term=tacos&latitude=45.52&longitude=-122.68&limit=20&sort_by=rating`
 * )
 * const data = await res.json() // { businesses: [...], total: 42 }
 * ```
 */
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  /**
   * The Yelp Bearer token sourced exclusively from the server-side environment.
   * Must NOT have a `VITE_` prefix — doing so would expose the key in the
   * client bundle.
   */
  const apiKey = process.env.YELP_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { searchParams } = new URL(request.url)

  /**
   * The set of Yelp Business Search parameters that this proxy is willing to
   * forward. Any other query parameters present in the incoming request are
   * silently ignored.
   */
  const forwardedParams = new URLSearchParams()

  for (const key of ['term', 'latitude', 'longitude', 'limit', 'sort_by']) {
    const value = searchParams.get(key)
    if (value !== null) {
      forwardedParams.set(key, value)
    }
  }

  /** The fully constructed Yelp API URL with whitelisted query parameters. */
  const yelpUrl = `${YELP_BASE_URL}?${forwardedParams.toString()}`

  let yelpResponse: Response
  try {
    /**
     * Forward the request to Yelp with the Bearer token injected server-side.
     * Uses native `fetch` (available in the Edge runtime) rather than Axios,
     * per project conventions.
     */
    yelpResponse = await fetch(yelpUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })
  } catch (err) {
    /**
     * Network-level errors (e.g. DNS resolution failure, connection refused,
     * timeout) are caught here and surfaced as a 502 Bad Gateway with a
     * descriptive message extracted from the caught `Error` instance.
     */
    const message = err instanceof Error ? err.message : 'Unknown fetch error'
    return new Response(JSON.stringify({ error: `Failed to reach Yelp: ${message}` }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  /**
   * Parse the Yelp response body as JSON. Typed as `unknown` to satisfy the
   * `no-explicit-any` ESLint rule — callers are expected to narrow the type
   * (e.g. via `YelpSearchResponse` in `useYelp.ts`).
   */
  const data: unknown = await yelpResponse.json()

  /**
   * Pass through the Yelp HTTP status code verbatim. If Yelp returns a 4xx
   * error (e.g. 401 Unauthorized, 400 Bad Request), the browser-side
   * composable will see the same status and can handle it accordingly.
   */
  return new Response(JSON.stringify(data), {
    status: yelpResponse.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
