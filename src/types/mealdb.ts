/**
 * @file mealdb.ts
 * @description TypeScript type definitions for the TheMealDB API responses.
 *
 * TheMealDB is a free, open meal database API (https://www.themealdb.com/).
 * It requires no authentication for its public endpoints and returns JSON
 * objects describing meals, their ingredients, and cooking instructions.
 *
 * These types are consumed by {@link useMealDB} and the Pinia `recipeStore`
 * and `randomizerStore`. They are not used server-side.
 */

/**
 * Represents a single meal record returned by TheMealDB API.
 *
 * TheMealDB stores ingredient and measurement data as numbered flat properties
 * (`strIngredient1`–`strIngredient20`, `strMeasure1`–`strMeasure20`) rather
 * than as a nested array. Empty ingredient slots are returned as empty strings
 * or `null`. Always filter these out before displaying — see `parseIngredients`
 * in the implementation for the recommended approach.
 *
 * @example
 * // A partial Meal object as returned by the API
 * const meal: Meal = {
 *   idMeal: '52772',
 *   strMeal: 'Teriyaki Chicken Casserole',
 *   strCategory: 'Chicken',
 *   strArea: 'Japanese',
 *   strInstructions: 'Preheat oven to 350°...',
 *   strMealThumb: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
 *   strYoutube: 'https://www.youtube.com/watch?v=4aZr5hZXP_s',
 *   strIngredient1: 'soy sauce',
 *   strMeasure1: '3/4 cup',
 *   strIngredient2: 'water',
 *   strMeasure2: '1/2 cup',
 *   // ... up to strIngredient20 / strMeasure20
 * }
 */
export interface Meal {
  /** Unique numeric identifier for the meal, returned as a string by the API (e.g. `"52772"`). */
  idMeal: string

  /** Human-readable name of the meal (e.g. `"Chicken Tacos"`). */
  strMeal: string

  /**
   * Broad category the meal belongs to (e.g. `"Chicken"`, `"Beef"`, `"Vegetarian"`).
   * Used for display and filtering in the recipe grid.
   */
  strCategory: string

  /**
   * Cuisine origin of the meal (e.g. `"Mexican"`, `"American"`, `"Italian"`).
   * Displayed as a chip on `RecipeCard` and in `RecipeModal`.
   */
  strArea: string

  /**
   * Full cooking instructions as a single plain-text string. Line breaks are
   * represented by `\n` characters — replace them with `<br>` tags when
   * rendering in HTML (as done in `RecipeModal`).
   */
  strInstructions: string

  /**
   * Absolute URL to the meal's thumbnail image hosted on TheMealDB CDN.
   * Always present; safe to use as an `<img src>` without a fallback guard,
   * though a placeholder is still recommended for network failures.
   */
  strMealThumb: string

  /**
   * Optional YouTube video URL demonstrating how to prepare the meal.
   * When present, `RecipeModal` renders a "Watch on YouTube 🎬" button.
   * When absent or undefined, the button is hidden.
   *
   * @example 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
   */
  strYoutube?: string

  /**
   * Dynamically-keyed ingredient name slots (`strIngredient1` through `strIngredient20`).
   * The API always returns all 20 slots; unused slots contain an empty string `""` or `null`.
   * Use the index signature to access them programmatically when parsing ingredients.
   *
   * @example
   * const ingredient = meal[`strIngredient${i}`] // e.g. "chicken breast"
   */
  [key: `strIngredient${number}`]: string | null

  /**
   * Dynamically-keyed measurement slots (`strMeasure1` through `strMeasure20`).
   * Each index corresponds to the ingredient at the same index number.
   * Unused slots contain an empty string `""` or `null`.
   *
   * @example
   * const measure = meal[`strMeasure${i}`] // e.g. "2 lbs"
   */
  [key: `strMeasure${number}`]: string | null
}

/**
 * Top-level wrapper returned by all TheMealDB search and lookup endpoints.
 *
 * The API consistently wraps results in a `meals` key. When a query returns
 * no matches — for example, searching a term that exists in no meal name —
 * the API returns `{ "meals": null }` rather than an empty array. Always
 * perform a null check before iterating over `meals`.
 *
 * @example
 * // Successful response
 * const response: MealDBResponse = { meals: [{ idMeal: '1', strMeal: 'Taco', ... }] }
 *
 * // Empty / no-results response
 * const empty: MealDBResponse = { meals: null }
 *
 * // Correct usage pattern
 * const meals = response.meals ?? []
 */
export interface MealDBResponse {
  /**
   * Array of meal objects matching the query, or `null` if no results were found.
   * Never throw on a `null` value — treat it as an empty result set.
   */
  meals: Meal[] | null
}

/**
 * A normalized ingredient-measurement pair extracted from a {@link Meal} object.
 *
 * TheMealDB stores ingredients and measures as 20 numbered flat properties
 * (`strIngredient1`…`strIngredient20`, `strMeasure1`…`strMeasure20`). The
 * `parseIngredients` utility collapses those into a clean array of
 * `ParsedIngredient` objects, filtering out any empty slots.
 *
 * This type is used in `RecipeModal` to render each ingredient as a checklist
 * item, allowing the user to tick off ingredients they already have.
 *
 * @example
 * const parsed: ParsedIngredient = { ingredient: 'chicken breast', measure: '2 lbs' }
 */
export interface ParsedIngredient {
  /**
   * The name of the ingredient (e.g. `"chicken breast"`, `"lime juice"`).
   * Sourced from `strIngredient{n}` on the raw {@link Meal} object.
   * Guaranteed to be a non-empty string after parsing (empty slots are filtered out).
   */
  ingredient: string

  /**
   * The quantity or measurement for the ingredient (e.g. `"2 lbs"`, `"1/2 cup"`, `"to taste"`).
   * Sourced from `strMeasure{n}` on the raw {@link Meal} object.
   * May be an empty string if the API did not supply a measurement for the ingredient.
   */
  measure: string
}
