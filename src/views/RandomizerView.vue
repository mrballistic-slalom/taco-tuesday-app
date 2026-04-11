<template>
  <v-container class="text-center py-8">
    <h1 class="text-h3 font-weight-black mb-2">🌮 Spin the Wheel</h1>
    <p class="text-subtitle-1 text-medium-emphasis mb-8">Fortune favors the taco-bold.</p>

    <SpinWheel @spin-complete="onSpinComplete" />

    <Transition name="slide-up">
      <div v-if="randomizerStore.result" class="mt-10">
        <TacoResult
          :recipe="randomizerStore.result"
          @view-recipe="openRecipeModal(randomizerStore.result!)"
          @spin-again="randomizerStore.reset()"
        />
      </div>
    </Transition>

    <v-snackbar
      :model-value="randomizerStore.error !== null"
      color="error"
      timeout="5000"
      location="bottom"
      @update:model-value="(v) => !v && randomizerStore.reset()"
    >
      {{ randomizerStore.error }}
    </v-snackbar>

    <RecipeModal
      v-if="selectedMealForModal"
      :recipe="selectedMealForModal"
      :model-value="modalOpen"
      @update:model-value="onModalUpdate"
    />
  </v-container>
</template>

<script setup lang="ts">
/**
 * @component RandomizerView
 *
 * The `/randomizer` route view for Tacology. Presents a prize-wheel experience
 * that lets the user spin to discover a random taco type and then immediately
 * look up a matching recipe from TheMealDB.
 *
 * Layout and behaviour:
 *  - A page heading ("🌮 Spin the Wheel") and subtitle ("Fortune favors the
 *    taco-bold.") set the playful tone.
 *  - A `SpinWheel` canvas component handles all wheel rendering and animation.
 *    When the animation finishes it emits `spin-complete` with the winning taco
 *    type string, which this view forwards to `randomizerStore.spin()`.
 *  - Once `randomizerStore.result` is populated (i.e. a recipe was found), a
 *    `TacoResult` card animates in via a `<Transition name="slide-up">` (40px
 *    translateY + opacity, 0.4 s ease-out). The result card offers two actions:
 *      1. "View Full Recipe" — opens a `RecipeModal` for the winning meal.
 *      2. "SPIN AGAIN" — calls `randomizerStore.reset()`, clearing the result
 *         and hiding the `TacoResult` card so the user can spin again.
 *  - A `v-snackbar` (5 s timeout, error colour) is shown if `randomizerStore.error`
 *    is set (e.g. TheMealDB returned no results for the taco type). Dismissing
 *    the snackbar also calls `randomizerStore.reset()` to clear the error state.
 *  - `RecipeModal` is conditionally mounted only when `selectedMealForModal` is
 *    non-null, preventing an empty modal flash. The meal ref is populated in
 *    `openRecipeModal` and cleared when the modal closes.
 *
 * No props or emits — this is a top-level route view.
 */

import { ref } from 'vue'
import { useRandomizerStore } from '@/stores/randomizerStore'
import SpinWheel from '@/components/randomizer/SpinWheel.vue'
import TacoResult from '@/components/randomizer/TacoResult.vue'
import RecipeModal from '@/components/recipes/RecipeModal.vue'
import type { SpoonacularRecipe } from '@/types/spoonacular'

/**
 * The Pinia randomizer store. Provides:
 *  - `isSpinning` — `true` while the async TheMealDB lookup is in flight.
 *  - `result` — the `SpoonacularRecipe` object returned on a successful spin, or `null`.
 *  - `error` — a human-readable error string if the lookup failed, or `null`.
 *  - `spin(tacoType)` — triggers the async recipe lookup for the given type.
 *  - `reset()` — clears `result` and `error`, returning the store to its idle state.
 */
const randomizerStore = useRandomizerStore()

/**
 * The recipe whose details are shown in the `RecipeModal`. Set by `openRecipeModal`
 * when the user clicks "View Full Recipe" inside `TacoResult`. Reset to `null`
 * when the modal closes so `v-if="selectedMealForModal"` unmounts the modal and
 * keeps memory clean between openings.
 */
const selectedMealForModal = ref<SpoonacularRecipe | null>(null)

/**
 * Controls the open/closed state of `RecipeModal`. Set to `true` by
 * `openRecipeModal` and set back to `false` by `onModalUpdate` when the modal
 * emits `update:modelValue` with `false`.
 */
const modalOpen = ref(false)

/**
 * Handles the `spin-complete` event emitted by `SpinWheel` at the end of the
 * canvas spin animation. Delegates to `randomizerStore.spin(tacoType)`, which
 * performs the async TheMealDB search and populates `randomizerStore.result`
 * (or `randomizerStore.error`) on completion.
 *
 * @param tacoType - The winning taco type label from the wheel, e.g. `"Birria"`.
 *   Always one of the 12 strings defined in `SpinWheel`'s `TACO_TYPES` array.
 */
function onSpinComplete(tacoType: string) {
  randomizerStore.spin(tacoType)
}

/**
 * Opens the `RecipeModal` for the given recipe. Called from the template when
 * `TacoResult` emits `view-recipe`. Stores the recipe in `selectedMealForModal`
 * (which causes the `v-if` to mount the modal) and sets `modalOpen` to `true`
 * to display it.
 *
 * @param recipe - The `SpoonacularRecipe` object to display in the modal. This
 *   is the same object stored in `randomizerStore.result`; the non-null
 *   assertion (`!`) in the template is safe at this point because `TacoResult`
 *   is only rendered when `randomizerStore.result` is non-null.
 */
function openRecipeModal(recipe: SpoonacularRecipe) {
  selectedMealForModal.value = recipe
  modalOpen.value = true
}

/**
 * Handles the `update:modelValue` event emitted by `RecipeModal` when the user
 * requests a visibility change (close button or backdrop click). When `value`
 * is `false`, the modal is closed and `selectedMealForModal` is cleared so the
 * modal unmounts. When `value` is `true` (rare — emitted during internal Vuetify
 * dialog transitions) the modal is kept open.
 *
 * @param value - The new desired visibility state for the modal. `false` closes
 *   it and nulls out the recipe ref; `true` keeps it open.
 */
function onModalUpdate(value: boolean) {
  modalOpen.value = value
  if (!value) {
    selectedMealForModal.value = null
  }
}
</script>

<style scoped>
.slide-up-enter-active {
  transition: all 0.4s ease-out;
}
.slide-up-enter-from {
  transform: translateY(40px);
  opacity: 0;
}
</style>
