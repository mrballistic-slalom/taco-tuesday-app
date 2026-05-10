import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SpoonacularRecipe } from '@/types/spoonacular'
import { useSpoonacular } from '@/composables/useSpoonacular'

/**
 * Pinia store for the taco randomizer wheel feature that backs the
 * `/randomizer` route.
 *
 * Coordinates the full spin lifecycle:
 *   1. The `SpinWheel` canvas component animates a 4-second spin, then calls
 *      `spin(tacoType)` with the segment name that landed under the pointer.
 *   2. `spin` fetches a matching recipe from Spoonacular and stores it in
 *      `result`.
 *   3. `TacoResult` renders the recipe image, name, and action buttons.
 *   4. The user can call `reset()` (via "SPIN AGAIN") to return every ref to
 *      its initial state so the wheel can be spun a second time.
 *
 * State shape:
 *   - `isSpinning` – true while the Spoonacular fetch (not just the animation)
 *                    is in flight; used to disable the spin button
 *   - `result`     – the `SpoonacularRecipe` returned for the winning taco
 *                    type, or `null` before/between spins
 *   - `error`      – human-readable failure message, or `null` when healthy
 *
 * Typical usage:
 * ```ts
 * import { useRandomizerStore } from '@/stores/randomizerStore'
 *
 * const randomizerStore = useRandomizerStore()
 *
 * // Called by SpinWheel once the CSS animation resolves to a segment:
 * await randomizerStore.spin('Carnitas')
 *
 * // Check results:
 * if (randomizerStore.result) {
 *   // Show TacoResult component
 * } else if (randomizerStore.error) {
 *   // Show error snackbar
 * }
 *
 * // Reset for another spin:
 * randomizerStore.reset()
 * ```
 */
export const useRandomizerStore = defineStore('randomizer', () => {
  /**
   * True while the store is awaiting a Spoonacular response after the wheel
   * animation has resolved to a segment.
   *
   * Note: The visual spin animation in `SpinWheel` runs for ~4 seconds via
   * CSS regardless of this flag.  `isSpinning` specifically covers the
   * network request that follows the animation.  The spin button in the UI
   * should be `disabled` whenever this is `true`.
   *
   * @type {import('vue').Ref<boolean>}
   */
  const isSpinning = ref(false)

  /**
   * The `SpoonacularRecipe` object returned by Spoonacular for the winning
   * taco type, or `null` when no spin has been completed yet (initial state
   * and after `reset()`).
   *
   * When this transitions from `null` to a `SpoonacularRecipe`, `TacoResult`
   * animates in via `<Transition name="slide-up">`.
   *
   * @type {import('vue').Ref<SpoonacularRecipe | null>}
   */
  const result = ref<SpoonacularRecipe | null>(null)

  /**
   * Human-readable error message when the most recent `spin` call failed,
   * or `null` when everything is healthy.
   *
   * Two categories of failure are captured here:
   *   - Network / API errors: the raw `Error.message` from `useSpoonacular`.
   *   - Empty result set: Spoonacular has no recipe for the given taco type.
   *     In that case the message follows the exact copy spec:
   *     `"Spoonacular came up empty for '{type}'. The audacity. Try again! 🌮"`
   *
   * Reset to `null` at the start of every new `spin` call.
   *
   * @type {import('vue').Ref<string | null>}
   */
  const error = ref<string | null>(null)

  /**
   * Looks up a recipe in Spoonacular that matches the taco type landed on by
   * the randomizer wheel, and stores the result in `result`.
   *
   * Execution flow:
   * 1. Sets `isSpinning` to `true`, resets `error` to `null`, and resets
   *    `result` to `null` (clears any previous spin).
   * 2. Calls `useSpoonacular().getRandomRecipeForType(tacoType)` which
   *    queries Spoonacular for a recipe matching the taco type.
   * 3a. If the result is `null`: sets `error` to the "came up empty" copy
   *     string (no result is stored).
   * 3b. If a recipe is returned: stores it in `result`.
   * 4. On network / API failure: stores the error message in `error`.
   * 5. Always sets `isSpinning` back to `false` in the `finally` block.
   *
   * The 8 possible values for `tacoType` (driven by `SpinWheel` segments):
   *   `Al Pastor`, `Carnitas`, `Fish Taco`, `Veggie`, `Chicken Tinga`,
   *   `Shrimp`, `Chorizo`, `Potato`
   *   (Birria, Lengua, Barbacoa, and Carne Asada are excluded — no
   *   TheMealDB recipes match.)
   *
   * @param {string} tacoType - The taco category name that the wheel
   *   landed on.  Passed verbatim to `getRandomRecipeForType`.
   * @returns {Promise<void>} Resolves when the lookup completes.  Updated
   *   state is the side-effect; nothing is returned directly.
   * @throws Never — errors are caught internally and written to `error`.
   *
   * @example
   * // SpinWheel calls this after animation settles on "Birria":
   * await randomizerStore.spin('Birria')
   *
   * if (randomizerStore.result) {
   *   console.log(randomizerStore.result.title) // e.g. "Birria De Res"
   * } else {
   *   console.warn(randomizerStore.error)
   * }
   */
  async function spin(tacoType: string) {
    isSpinning.value = true
    error.value = null
    result.value = null
    try {
      const { getRandomRecipeForType } = useSpoonacular()
      const recipe = await getRandomRecipeForType(tacoType)
      if (!recipe) {
        error.value = `Spoonacular came up empty for '${tacoType}'. The audacity. Try again! 🌮`
      } else {
        result.value = recipe
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      isSpinning.value = false
    }
  }

  /**
   * Resets all store state to its initial values, preparing the randomizer
   * for another spin.
   *
   * After calling `reset()`:
   *   - `result`     → `null`  (hides `TacoResult`)
   *   - `error`      → `null`  (clears any error banner)
   *   - `isSpinning` → `false` (re-enables the spin button)
   *
   * Typically triggered by the "SPIN AGAIN" button rendered inside
   * `TacoResult` after the user has viewed their meal.
   *
   * Does not interact with Spoonacular or any other external service.
   *
   * @returns {void}
   *
   * @example
   * randomizerStore.reset()
   * // randomizerStore.result     === null   →  true
   * // randomizerStore.error      === null   →  true
   * // randomizerStore.isSpinning === false  →  true
   */
  function reset() {
    result.value = null
    error.value = null
    isSpinning.value = false
  }

  return { isSpinning, result, error, spin, reset }
})
