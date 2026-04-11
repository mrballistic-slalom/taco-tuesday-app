/**
 * @file useMealDB.ts
 * @description Vue composable providing a typed interface to the TheMealDB
 * public REST API (https://www.themealdb.com/api.php).
 *
 * TheMealDB is a free, community-driven meal database that requires no API key
 * for its public (v1) endpoints. All three endpoints used here return
 * `{ meals: Meal[] | null }` — a `null` meals array signals "no results" and
 * must be handled gracefully (never throw on null).
 *
 * **Usage in the app:**
 * - `recipeStore` calls `searchMeals` to populate the recipe grid and
 *   `getMealById` to load a single recipe into the modal.
 * - `randomizerStore` calls `getRandomMeal` to fetch a surprise taco recipe
 *   after the spin wheel lands.
 *
 * **Error handling:** All three functions throw on non-2xx HTTP responses.
 * Callers (stores) are responsible for catching those errors and setting their
 * own `error` state for display in the UI.
 *
 * **No auth:** The base URL `https://www.themealdb.com/api/json/v1/1` is the
 * public v1 endpoint. No `Authorization` header is needed or added.
 */

import type { Meal, MealDBResponse } from '@/types/mealdb'

/**
 * Base URL for all TheMealDB API v1 requests.
 * Using the public (free) endpoint — no API key required.
 *
 * @internal Not exported; used only by `fetchMealDB`.
 */
const BASE_URL = 'https://www.themealdb.com/api/json/v1/1'

/**
 * Internal helper that performs a GET request to TheMealDB and parses the
 * JSON response body as {@link MealDBResponse}.
 *
 * This function is module-private (not exported) — all external callers use
 * the higher-level functions exposed by {@link useMealDB}.
 *
 * @param path - The path to append to `BASE_URL`, including a leading `/` and
 *   any query string (e.g. `"/search.php?s=taco"`). The caller is responsible
 *   for URL-encoding query parameter values via `encodeURIComponent`.
 *
 * @returns A Promise that resolves to the parsed {@link MealDBResponse} object.
 *
 * @throws {Error} If the HTTP response status is not in the 2xx range.
 *   Message: `"TheMealDB request failed: {status} {statusText}"`.
 *   Network-level failures (no internet, DNS failure) also reject the promise
 *   with the native `fetch` error.
 *
 * @internal
 */
async function fetchMealDB(path: string): Promise<MealDBResponse> {
  const response = await fetch(`${BASE_URL}${path}`)
  if (!response.ok) {
    throw new Error(`TheMealDB request failed: ${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<MealDBResponse>
}

/**
 * Composable that exposes three async functions for querying TheMealDB.
 *
 * The composable holds no reactive state of its own — it is a thin, stateless
 * wrapper around `fetchMealDB`. Reactive loading/error state lives in the
 * Pinia stores (`recipeStore`, `randomizerStore`) that call these functions.
 *
 * Call `useMealDB()` inside a `<script setup>` block, a Pinia store action,
 * or another composable. It is safe to call multiple times.
 *
 * @returns An object containing three async functions:
 *   - `searchMeals(query)` — search meals by name
 *   - `getMealById(id)` — fetch a single meal by its numeric ID
 *   - `getRandomMeal()` — fetch one random meal
 *
 * @example
 * // Inside a Pinia store action
 * import { useMealDB } from '@/composables/useMealDB'
 *
 * const { searchMeals, getMealById, getRandomMeal } = useMealDB()
 *
 * // Search
 * const results = await searchMeals('taco') // Meal[]
 *
 * // Lookup by ID
 * const meal = await getMealById('52772')   // Meal | null
 *
 * // Random
 * const random = await getRandomMeal()      // Meal | null
 */
export function useMealDB() {
  /**
   * Searches TheMealDB for meals whose name contains the given query string.
   *
   * Calls `GET /search.php?s={query}`. The query is URL-encoded before being
   * appended to the request URL. Results are sorted by TheMealDB's default
   * relevance order (alphabetical by meal name).
   *
   * When no meals match the query, the API returns `{ meals: null }`. This
   * function normalises that to an empty array (`[]`) so callers do not need
   * to null-check the result.
   *
   * In `recipeStore`, the search is debounced by 400 ms and seeded with the
   * query `"taco"` on component mount.
   *
   * @param query - The search term to look up (e.g. `"taco"`, `"chicken"`).
   *   Will be passed through `encodeURIComponent`. An empty string returns all
   *   meals (TheMealDB behaviour — not recommended for performance).
   *
   * @returns A Promise that resolves to an array of {@link Meal} objects. The
   *   array is empty when no meals match the query.
   *
   * @throws {Error} On non-2xx HTTP responses. See `fetchMealDB` for the error
   *   message format. Callers should catch this and set the store's `error`
   *   state to `"No tacos found. We're as sad as you are. 😢"`.
   *
   * @example
   * const meals = await searchMeals('taco')
   * // [{ idMeal: '52772', strMeal: 'Chicken Tacos', ... }, ...]
   *
   * const noResults = await searchMeals('zzznomatch')
   * // []
   */
  async function searchMeals(query: string): Promise<Meal[]> {
    const data = await fetchMealDB(`/search.php?s=${encodeURIComponent(query)}`)
    return data.meals ?? []
  }

  /**
   * Fetches a single meal record by its TheMealDB numeric ID.
   *
   * Calls `GET /lookup.php?i={id}`. The ID is URL-encoded before use, though
   * in practice TheMealDB IDs are always numeric strings (e.g. `"52772"`).
   *
   * When the ID does not correspond to any known meal, the API returns
   * `{ meals: null }`. This function normalises that to `null` so callers can
   * display a "not found" state rather than crashing.
   *
   * @param id - The TheMealDB meal ID as a string (e.g. `"52772"`). Obtained
   *   from a {@link Meal}'s `idMeal` property.
   *
   * @returns A Promise that resolves to the matching {@link Meal} object, or
   *   `null` if no meal with that ID exists.
   *
   * @throws {Error} On non-2xx HTTP responses. Callers should catch this and
   *   set appropriate error state.
   *
   * @example
   * const meal = await getMealById('52772')
   * if (meal) {
   *   console.log(meal.strMeal) // "Chicken Tacos"
   * }
   *
   * const missing = await getMealById('00000')
   * // null
   */
  async function getMealById(id: string): Promise<Meal | null> {
    const data = await fetchMealDB(`/lookup.php?i=${encodeURIComponent(id)}`)
    return data.meals?.[0] ?? null
  }

  /**
   * Fetches a single random meal from TheMealDB.
   *
   * Calls `GET /random.php`. TheMealDB selects and returns one meal at random
   * on each request — the result is non-deterministic and will differ between
   * calls. Used by `randomizerStore` to look up a matching meal after the spin
   * wheel lands on a taco type.
   *
   * In the extremely unlikely event that the API returns an empty result set
   * (i.e., `{ meals: null }`), this function returns `null`. The
   * `randomizerStore` maps `null` to the error message:
   * `"TheMealDB is taco-less for '{type}'. The audacity. Try again! 🌮"`.
   *
   * @returns A Promise that resolves to a randomly selected {@link Meal}
   *   object, or `null` if the API unexpectedly returns no meal.
   *
   * @throws {Error} On non-2xx HTTP responses. Callers should catch this and
   *   set the store's `error` state accordingly.
   *
   * @example
   * const meal = await getRandomMeal()
   * if (meal) {
   *   console.log(meal.strMeal) // "Teriyaki Chicken Casserole" (random each call)
   * }
   */
  async function getRandomMeal(): Promise<Meal | null> {
    const data = await fetchMealDB('/random.php')
    return data.meals?.[0] ?? null
  }

  return { searchMeals, getMealById, getRandomMeal }
}
