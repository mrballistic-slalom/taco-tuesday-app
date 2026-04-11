/**
 * @file src/types/spoonacular.ts
 *
 * TypeScript interfaces for the Spoonacular Recipe API
 * (https://spoonacular.com/food-api). All network calls to Spoonacular are
 * proxied through the Vercel Edge Function at `api/spoonacular.ts` so the
 * API key never reaches the browser.
 *
 * Consumers:
 *   - `src/composables/useSpoonacular.ts` — the fetch layer
 *   - `src/stores/recipeStore.ts`         — recipe search & detail
 *   - `src/stores/randomizerStore.ts`     — random recipe per taco type
 *   - Recipe and randomizer components    — rendering
 */

/**
 * A single ingredient entry as returned by Spoonacular inside the
 * `extendedIngredients` array on a full recipe object.
 *
 * Spoonacular normalises ingredient data into structured fields, unlike
 * TheMealDB's flat `strIngredient1`…`strIngredient20` string slots.
 */
export interface SpoonacularIngredient {
  /** Spoonacular's internal numeric identifier for this ingredient. */
  id: number

  /**
   * The canonical ingredient name, lowercase and singular
   * (e.g. `"garlic"`, `"chicken breast"`).
   */
  name: string

  /**
   * The full original ingredient string exactly as written in the recipe
   * (e.g. `"2 cloves garlic, minced"`). Suitable for display in a checklist.
   */
  original: string

  /**
   * The numeric quantity of the ingredient (e.g. `2` for "2 cloves of garlic").
   * Combined with `unit` for display.
   */
  amount: number

  /**
   * The unit of measure for the quantity (e.g. `"cloves"`, `"cups"`, `"g"`).
   * May be an empty string for unitless quantities (e.g. `"3 eggs"`).
   */
  unit: string
}

/**
 * A Spoonacular recipe object returned either from the
 * `complexSearch?addRecipeInformation=true` endpoint (embedded in the
 * `results` array) or from the single-recipe `/recipes/{id}/information`
 * endpoint.
 *
 * All fields except `id`, `title`, and `image` are optional because the
 * search endpoint may omit some fields when `addRecipeInformation` is false,
 * and the API occasionally returns incomplete data for community-sourced recipes.
 */
export interface SpoonacularRecipe {
  /** Spoonacular's unique numeric identifier for the recipe. */
  id: number

  /** The recipe name (e.g. `"Birria Tacos with Consommé"`). */
  title: string

  /**
   * URL of the recipe's cover image hosted on spoonacular.com.
   * Typically a JPEG at 312×231 px (`-312x231.jpg` suffix).
   */
  image: string

  /** Image file extension, usually `"jpg"`. */
  imageType?: string

  /** Estimated preparation + cooking time in minutes. */
  readyInMinutes?: number

  /** Number of servings the recipe yields. */
  servings?: number

  /**
   * Canonical URL of the original recipe source (the website that published
   * the recipe). Shown as a "View Full Recipe" link in `RecipeModal`.
   */
  sourceUrl?: string

  /**
   * An HTML summary / teaser description of the recipe, potentially including
   * `<b>` and `<a>` tags. Sanitise before rendering with `v-html`.
   */
  summary?: string

  /**
   * Array of cuisine labels (e.g. `["Mexican"]`). May be empty if Spoonacular
   * could not classify the recipe. The first entry is used as the primary
   * cuisine chip in `RecipeCard`.
   */
  cuisines?: string[]

  /**
   * Array of dish-type classifications (e.g. `["dinner", "main course"]`).
   * Displayed as the secondary chip in `RecipeCard` when no cuisine is present.
   */
  dishTypes?: string[]

  /**
   * Structured ingredient list. Present when the recipe is fetched with
   * `addRecipeInformation=true` or via the single-recipe endpoint.
   * Used by `RecipeModal` to render the ingredient checklist.
   */
  extendedIngredients?: SpoonacularIngredient[]

  /**
   * Step-by-step cooking instructions as a plain-text or lightly HTML-formatted
   * string. Newlines separate steps. Rendered inside `RecipeModal` with `<br>`
   * substitution for line breaks.
   */
  instructions?: string
}

/**
 * The top-level response shape returned by Spoonacular's
 * `GET /recipes/complexSearch` endpoint.
 *
 * Pagination is supported via `offset` and `number`, though Tacology
 * always requests a single page.
 *
 * @example
 * const response: SpoonacularSearchResponse = await fetch('/api/spoonacular?query=tacos').then(r => r.json())
 * console.log(response.totalResults) // e.g. 86
 * console.log(response.results[0].title) // "Birria Tacos"
 */
export interface SpoonacularSearchResponse {
  /** The array of matching recipes, each optionally including full recipe info. */
  results: SpoonacularRecipe[]

  /** Zero-based index of the first result in this page. */
  offset: number

  /** Number of results requested (matches the `number` query parameter). */
  number: number

  /** Total number of recipes matching the query across all pages. */
  totalResults: number
}
