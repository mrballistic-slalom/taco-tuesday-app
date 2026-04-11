import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SpoonacularRecipe } from '@/types/spoonacular'
import { useSpoonacular } from '@/composables/useSpoonacular'

/**
 * Pinia store for the taco recipe browser that backs the `/recipes` route.
 *
 * Manages all recipe-related state: the list of recipes returned by a search,
 * which recipe (if any) the user has opened in the detail modal, the current
 * search query string, and async loading / error indicators.
 *
 * Data is sourced from Spoonacular (https://spoonacular.com/food-api) — a
 * recipe REST API.  All network calls are delegated to `useSpoonacular`,
 * keeping the store free of raw `fetch` logic.
 *
 * State shape:
 *   - `recipes`        – flat list of recipes matching the most recent search
 *   - `selectedRecipe` – the recipe currently open in `RecipeModal`
 *   - `loading`        – true while any async Spoonacular call is in flight
 *   - `searchQuery`    – the last query string submitted (used for display /
 *                        re-trigger logic in components)
 *   - `error`          – human-readable error string, or `null` when healthy
 *
 * Typical usage:
 * ```ts
 * import { useRecipeStore } from '@/stores/recipeStore'
 *
 * const recipeStore = useRecipeStore()
 *
 * // Initial load — triggered on mount in RecipesView with query 'taco':
 * await recipeStore.searchRecipes('taco')
 *
 * // Open a recipe modal by ID (e.g. from a deep-link):
 * await recipeStore.fetchRecipeById(52772)
 *
 * // Close the modal:
 * recipeStore.clearSelection()
 * ```
 */
export const useRecipeStore = defineStore('recipe', () => {
  /**
   * The ordered list of recipes returned by the most recent `searchRecipes`
   * call.  Populated from Spoonacular's recipe search endpoint.
   *
   * Resets to an empty array at the start of each new search and whenever a
   * network error occurs, ensuring the UI never shows stale results.
   *
   * @type {import('vue').Ref<SpoonacularRecipe[]>}
   */
  const recipes = ref<SpoonacularRecipe[]>([])

  /**
   * The recipe the user has chosen to view in full detail inside
   * `RecipeModal`.  `null` means the modal is closed / no recipe is selected.
   *
   * May be set by two different flows:
   *   1. User clicks a `RecipeCard` → `RecipeModal` calls `fetchRecipeById`.
   *   2. The randomizer selects a recipe → `randomizerStore.result` is used
   *      directly without writing to this ref.
   *
   * Cleared by `clearSelection()` when the modal closes.
   *
   * @type {import('vue').Ref<SpoonacularRecipe | null>}
   */
  const selectedRecipe = ref<SpoonacularRecipe | null>(null)

  /**
   * True while any asynchronous Spoonacular operation (`searchRecipes` or
   * `fetchRecipeById`) is in flight.
   *
   * Components should render `v-skeleton-loader` instead of the recipe grid
   * or modal content while this is `true`.
   *
   * @type {import('vue').Ref<boolean>}
   */
  const loading = ref(false)

  /**
   * The query string that was passed to the most recent `searchRecipes` call.
   * Stored so the UI can display "Showing results for: {searchQuery}" or
   * re-issue the same search after a filter change without requiring the
   * component to track the string separately.
   *
   * Defaults to `''` (empty string) before the first search is performed.
   *
   * @type {import('vue').Ref<string>}
   */
  const searchQuery = ref('')

  /**
   * Human-readable error message produced by the most recent failed async
   * operation, or `null` when everything is healthy.
   *
   * Reset to `null` at the start of every new async call so that a
   * subsequent successful request automatically clears any previous error.
   *
   * Example value when search fails:
   *   `"No tacos found. We're as sad as you are. 😢"`
   *
   * @type {import('vue').Ref<string | null>}
   */
  const error = ref<string | null>(null)

  /**
   * Searches Spoonacular for recipes whose name contains the given query
   * string and stores the results in `recipes`.
   *
   * Execution flow:
   * 1. Sets `loading` to `true`, resets `error` to `null`, and records
   *    `query` in `searchQuery`.
   * 2. Calls `useSpoonacular().searchRecipes(query)` which issues a GET to
   *    the Spoonacular recipe search endpoint.
   * 3. On success: stores the returned `SpoonacularRecipe[]` in `recipes`.
   *    An empty array is stored when there are no matches.
   * 4. On failure (non-2xx response or network error): stores the error
   *    message in `error` and resets `recipes` to `[]`.
   * 5. Always sets `loading` back to `false` in the `finally` block.
   *
   * Note: `RecipesView` debounces calls to this action by 400 ms to avoid
   * hammering the API on every keystroke.  The initial mount uses
   * `query = 'taco'` so the grid is pre-populated.
   *
   * @param {string} query - The search term to send to Spoonacular.
   *   The initial mount always passes `'taco'` to pre-fill the grid with
   *   relevant results.
   * @returns {Promise<void>} Resolves when the fetch completes.  Updated
   *   state is the side-effect; nothing is returned directly.
   * @throws Never — errors are caught internally and written to `error`.
   *
   * @example
   * await recipeStore.searchRecipes('birria')
   * console.log(recipeStore.recipes)    // SpoonacularRecipe[] — all birria recipes
   * console.log(recipeStore.searchQuery) // 'birria'
   */
  async function searchRecipes(query: string) {
    loading.value = true
    error.value = null
    searchQuery.value = query
    try {
      const { searchRecipes: fetch } = useSpoonacular()
      recipes.value = await fetch(query)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      recipes.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetches a single recipe by its Spoonacular ID and stores it in
   * `selectedRecipe`, making it available to `RecipeModal`.
   *
   * Execution flow:
   * 1. Sets `loading` to `true` and resets `error` to `null`.
   * 2. Calls `useSpoonacular().getRecipeById(id)` which issues a GET to
   *    the Spoonacular recipe information endpoint.
   * 3. On success: stores the returned `SpoonacularRecipe | null` in
   *    `selectedRecipe`.  If no result is found for the ID, `selectedRecipe`
   *    is set to `null` (the modal should handle this gracefully).
   * 4. On failure: stores the error message in `error`.  `selectedRecipe`
   *    is left unchanged so the modal can optionally keep showing stale data.
   * 5. Always sets `loading` back to `false` in the `finally` block.
   *
   * @param {number} id - The numeric Spoonacular recipe ID (e.g. `52772`).
   *   IDs are found in the `id` field of every `SpoonacularRecipe` object
   *   returned by `searchRecipes`.
   * @returns {Promise<void>} Resolves when the lookup completes.
   * @throws Never — errors are caught internally and written to `error`.
   *
   * @example
   * await recipeStore.fetchRecipeById(52772)
   * if (recipeStore.selectedRecipe) {
   *   openModal(recipeStore.selectedRecipe)
   * }
   */
  async function fetchRecipeById(id: number) {
    loading.value = true
    error.value = null
    try {
      const { getRecipeById } = useSpoonacular()
      selectedRecipe.value = await getRecipeById(id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  /**
   * Clears the currently selected recipe, returning `selectedRecipe` to
   * `null` and effectively closing the `RecipeModal`.
   *
   * Does not affect `recipes`, `searchQuery`, `loading`, or `error`.
   * Typically called from the modal's close button handler or when the user
   * navigates away from the `/recipes` route.
   *
   * @returns {void}
   *
   * @example
   * recipeStore.clearSelection()
   * // recipeStore.selectedRecipe === null  →  true
   */
  function clearSelection() {
    selectedRecipe.value = null
  }

  return { recipes, selectedRecipe, loading, searchQuery, error, searchRecipes, fetchRecipeById, clearSelection }
})
