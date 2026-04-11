/**
 * @file api/spoonacular.ts
 *
 * Vercel Edge Function that proxies requests to the Spoonacular Recipe API
 * (https://spoonacular.com/food-api). Running this logic server-side keeps
 * `SPOONACULAR_API_KEY` out of the browser bundle entirely.
 *
 * Supported query parameters:
 *   - `query`  – Recipe search term (e.g. `"birria tacos"`). Defaults to `"tacos"`.
 *   - `number` – Max results to return. Defaults to `"20"`.
 *   - `id`     – Numeric recipe ID. When present, fetches a single recipe by ID
 *                instead of performing a search.
 *
 * Response format:
 *   - Search: `SpoonacularSearchResponse` (results array + pagination metadata)
 *   - Single: `SpoonacularRecipe` (full recipe object)
 *   - Error:  `{ error: string }` with an appropriate HTTP status code
 *
 * @example
 * // Search
 * fetch('/api/spoonacular?query=al+pastor+tacos&number=10')
 * // Single recipe
 * fetch('/api/spoonacular?id=716429')
 */

/** Instruct Vercel to run this function on the Edge runtime. */
export const config = { runtime: 'edge' }

/** Base URL for the Spoonacular REST API. */
const SPOONACULAR_BASE = 'https://api.spoonacular.com'

/**
 * Edge Function handler for Spoonacular API proxying.
 *
 * Reads `SPOONACULAR_API_KEY` from the server environment, constructs the
 * appropriate Spoonacular URL based on the incoming query parameters, and
 * forwards the response back to the client. Responses include a 5-minute
 * `Cache-Control` header to reduce redundant upstream calls.
 *
 * @param request - The incoming HTTP request from the browser.
 * @returns A `Response` containing the Spoonacular JSON payload, or a JSON
 *   error object with the relevant HTTP status code.
 * @throws Never — all errors are caught and returned as JSON error responses.
 *
 * @example
 * // Called internally by useSpoonacular.ts:
 * const res = await fetch('/api/spoonacular?query=birria&number=10')
 * const { results } = await res.json()
 */
export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const query = url.searchParams.get('query')
  const id = url.searchParams.get('id')
  const number = url.searchParams.get('number') ?? '20'

  const apiKey = process.env.SPOONACULAR_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Spoonacular API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const spoonacularUrl = id
    ? `${SPOONACULAR_BASE}/recipes/${encodeURIComponent(id)}/information?apiKey=${apiKey}`
    : `${SPOONACULAR_BASE}/recipes/complexSearch?query=${encodeURIComponent(query ?? 'tacos')}&number=${number}&addRecipeInformation=true&apiKey=${apiKey}`

  try {
    const res = await fetch(spoonacularUrl)
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Spoonacular returned ${res.status}` }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    const data = await res.json()
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
