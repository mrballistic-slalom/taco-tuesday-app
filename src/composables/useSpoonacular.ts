/**
 * @file src/composables/useSpoonacular.ts
 *
 * Vue composable that wraps all Spoonacular Recipe API calls. Every request is
 * routed through the Vercel Edge Function at `/api/spoonacular` so that the
 * `SPOONACULAR_API_KEY` is never exposed in the browser bundle.
 *
 * Consumers:
 *   - `src/stores/recipeStore.ts`     — `searchRecipes`, `getRecipeById`
 *   - `src/stores/randomizerStore.ts` — `getRandomRecipeForType`
 */

import type { SpoonacularRecipe, SpoonacularSearchResponse } from '@/types/spoonacular'

/**
 * Builds the proxy URL and executes a fetch against `/api/spoonacular`.
 * Throws if the response is not 2xx.
 *
 * @param params - Key-value pairs to append as query parameters on the proxy URL.
 *   Valid keys: `query`, `number`, `id`.
 * @returns The raw `Response` from the proxy (caller must call `.json()`).
 * @throws {Error} If the HTTP response status is not OK (4xx / 5xx).
 * @internal
 */
async function fetchSpoonacular(params: Record<string, string>): Promise<Response> {
  const url = new URL('/api/spoonacular', window.location.origin)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Spoonacular request failed: ${res.status}`)
  return res
}

/**
 * Composable factory for Spoonacular Recipe API operations.
 *
 * All functions in the returned object delegate to the `/api/spoonacular`
 * proxy and throw on non-2xx HTTP responses so that calling stores can
 * catch errors and set their own `error` state.
 *
 * @returns An object containing:
 *   - `searchRecipes(query, number?)` — full-text recipe search
 *   - `getRecipeById(id)` — fetch a single recipe by numeric Spoonacular ID
 *   - `getRandomRecipeForType(tacoType)` — search by taco type, return one at random
 *
 * @example
 * // In a Pinia store:
 * const { searchRecipes } = useSpoonacular()
 * const tacos = await searchRecipes('birria tacos', 10)
 */
export function useSpoonacular() {
  /**
   * Searches Spoonacular for recipes matching the given query string and
   * returns up to `number` results with full recipe information included.
   *
   * Maps to: `GET /recipes/complexSearch?query={query}&number={number}&addRecipeInformation=true`
   *
   * @param query  - Free-text search term (e.g. `"al pastor tacos"`).
   *   The initial mount in `RecipesView` always passes `"tacos"` to pre-fill
   *   the grid with taco-relevant results.
   * @param number - Maximum number of results to return. Defaults to `20`.
   *   The randomizer uses `10` to keep the result set small when picking at random.
   * @returns A `Promise` resolving to an array of `SpoonacularRecipe` objects.
   *   Returns an empty array (never `null`) when the API finds no matches,
   *   normalising the occasional absent `results` field from the API.
   * @throws {Error} If the proxy returns a non-2xx status (e.g. 402 quota exceeded).
   *
   * @example
   * const { searchRecipes } = useSpoonacular()
   * const results = await searchRecipes('shrimp tacos', 5)
   * console.log(results[0].title) // "Baja Shrimp Tacos"
   */
  async function searchRecipes(query: string, number = 20): Promise<SpoonacularRecipe[]> {
    const res = await fetchSpoonacular({ query, number: String(number) })
    const data: SpoonacularSearchResponse = await res.json()
    return data.results ?? []
  }

  /**
   * Fetches the full details of a single recipe by its Spoonacular numeric ID.
   *
   * Maps to: `GET /recipes/{id}/information`
   *
   * @param id - The numeric Spoonacular recipe ID (e.g. `716429`). Found in the
   *   `id` field of every `SpoonacularRecipe` returned by `searchRecipes`.
   * @returns A `Promise` resolving to the full `SpoonacularRecipe` object, or
   *   `null` if the fetch fails (network error or ID not found).
   * @throws Never — errors are caught internally and `null` is returned.
   *
   * @example
   * const { getRecipeById } = useSpoonacular()
   * const recipe = await getRecipeById(716429)
   * console.log(recipe?.title) // "Pasta with Garlic, Scallions…"
   */
  async function getRecipeById(id: number): Promise<SpoonacularRecipe | null> {
    try {
      const res = await fetchSpoonacular({ id: String(id) })
      return res.json() as Promise<SpoonacularRecipe>
    } catch {
      return null
    }
  }

  /**
   * Searches Spoonacular for recipes matching `"{tacoType} taco"` and returns
   * one result chosen at random from the first 10 matches. Used by the
   * randomizer wheel to surface a different recipe each spin even when the
   * same taco type lands twice.
   *
   * @param tacoType - The taco category label that the spin wheel landed on
   *   (e.g. `"Birria"`, `"Al Pastor"`, `"Carnitas"`). Appended with `" taco"`
   *   to bias Spoonacular toward taco-specific results.
   * @returns A `Promise` resolving to a randomly selected `SpoonacularRecipe`,
   *   or `null` if Spoonacular returns no results for the given type.
   * @throws {Error} If the underlying `searchRecipes` call fails (non-2xx response).
   *
   * @example
   * const { getRandomRecipeForType } = useSpoonacular()
   * const recipe = await getRandomRecipeForType('Birria')
   * console.log(recipe?.title) // "Birria Tacos with Consommé" (random each call)
   */
  async function getRandomRecipeForType(tacoType: string): Promise<SpoonacularRecipe | null> {
    const results = await searchRecipes(`${tacoType} taco`, 10)
    if (!results.length) return null
    return results[Math.floor(Math.random() * results.length)]
  }

  return { searchRecipes, getRecipeById, getRandomRecipeForType }
}
