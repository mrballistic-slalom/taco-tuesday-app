<template>
  <v-container>
    <div class="mb-6">
      <h1 class="text-h3 font-weight-black mb-2">🌮 Taco Recipes</h1>
      <p class="text-subtitle-1 text-medium-emphasis">Because every taco deserves to exist.</p>
    </div>

    <v-text-field
      prepend-inner-icon="mdi-magnify"
      placeholder="Search tacos..."
      variant="outlined"
      clearable
      class="mb-6"
      @input="onSearchInput(($event.target as HTMLInputElement).value)"
      @click:clear="recipeStore.searchRecipes('taco')"
    />

    <template v-if="recipeStore.loading">
      <v-row>
        <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3">
          <v-skeleton-loader type="card" />
        </v-col>
      </v-row>
    </template>

    <template v-else-if="recipeStore.recipes.length === 0">
      <div class="d-flex flex-column align-center justify-center py-16">
        <svg width="60" height="60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <text y="0.9em" font-size="80">😢</text>
        </svg>
        <p class="text-h6 mt-4">No tacos found. We're as sad as you are. 😢</p>
      </div>
    </template>

    <template v-else>
      <RecipeGrid :recipes="recipeStore.recipes" @recipe-click="onRecipeClick" />
    </template>

    <RecipeModal
      v-if="recipeStore.selectedRecipe"
      :recipe="recipeStore.selectedRecipe"
      :model-value="modalOpen"
      @update:model-value="onModalUpdate"
    />
  </v-container>
</template>

<script setup lang="ts">
/**
 * @component RecipesView
 *
 * The `/recipes` route view for Tacology. Renders a searchable grid of taco
 * recipes sourced from TheMealDB via the `recipeStore`. This is the primary
 * recipe-browsing screen of the app.
 *
 * Layout and behaviour:
 *  - A page heading ("🌮 Taco Recipes") and subtitle.
 *  - A Vuetify outlined text field with a magnify icon for live recipe search.
 *    Input is debounced by 400 ms to avoid hammering the API on every keystroke.
 *    Clicking the clear button resets the search to `"taco"`.
 *  - While `recipeStore.loading` is true, eight `v-skeleton-loader` cards are
 *    shown as placeholder UI (one per expected result column).
 *  - If the store returns zero recipes an empty-state message is displayed:
 *    "No tacos found. We're as sad as you are. 😢"
 *  - Otherwise a `RecipeGrid` renders all results. Clicking a card calls
 *    `onRecipeClick`, which fetches the full recipe detail and opens a
 *    `RecipeModal`.
 *  - `RecipeModal` is conditionally mounted only when `recipeStore.selectedRecipe`
 *    is non-null, preventing a flash of an empty modal on initial load.
 *
 * On mount the view immediately fires a search for `"taco"` to populate the
 * grid with relevant initial content.
 *
 * No props or emits — this is a top-level route view.
 */

import { ref, watch, onMounted } from 'vue'
import { useRecipeStore } from '@/stores/recipeStore'
import RecipeGrid from '@/components/recipes/RecipeGrid.vue'
import RecipeModal from '@/components/recipes/RecipeModal.vue'
import type { SpoonacularRecipe } from '@/types/spoonacular'

/**
 * The Pinia recipe store. Provides `recipes` (search results array),
 * `selectedRecipe` (detail record for the open modal), `loading` (boolean for
 * skeleton display), and actions `searchRecipes`, `fetchRecipeById`, and
 * `clearSelection`.
 */
const recipeStore = useRecipeStore()

/**
 * Controls the open/closed state of `RecipeModal`. Set to `true` when a recipe
 * card is clicked and the full detail has been fetched; set back to `false`
 * when the modal emits `update:modelValue` with `false` (user closes it). Also
 * watches `recipeStore.selectedRecipe` to cover the case where the store
 * populates `selectedRecipe` through a code path other than `onRecipeClick`.
 */
const modalOpen = ref(false)

/**
 * Handle for the active debounce timer. Stored at module scope (not inside a
 * ref) because it does not need to be reactive — it is only used for
 * `clearTimeout` in the next call. `ReturnType<typeof setTimeout>` is used for
 * cross-environment compatibility (browser returns a number, Node returns a
 * `Timeout` object).
 */
let debounceTimer: ReturnType<typeof setTimeout>

/**
 * Handles the `input` event from the search text field. Clears the previous
 * debounce timer and schedules a new call to `recipeStore.searchRecipes` after
 * 400 ms of inactivity. This prevents an API request on every keystroke while
 * still feeling responsive to the user.
 *
 * @param val - The current value of the search input field, read directly from
 *   `$event.target.value` in the template.
 */
function onSearchInput(val: string) {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => recipeStore.searchRecipes(val), 400)
}

/**
 * Handles a `recipe-click` event bubbled up from `RecipeGrid` → `RecipeCard`.
 * Fetches the full recipe detail by ID (the search results only contain
 * partial data), then opens the modal. The `await` ensures the modal doesn't
 * open with stale or empty `selectedRecipe` data from a previous interaction.
 *
 * @param recipe - The `SpoonacularRecipe` object from the clicked card. Only
 *   `recipe.id` is used here; the rest of the object is present in the grid
 *   results but the full record (with instructions and extendedIngredients)
 *   must be fetched separately.
 */
async function onRecipeClick(recipe: SpoonacularRecipe) {
  await recipeStore.fetchRecipeById(recipe.id)
  modalOpen.value = true
}

/**
 * Handles the `update:modelValue` event emitted by `RecipeModal` when the user
 * requests it to close (via the close button or clicking outside). When `value`
 * is `false`, both the local `modalOpen` ref and the store's `selectedRecipe`
 * are cleared so that the modal unmounts cleanly and the next open starts fresh.
 *
 * @param value - The new desired visibility state. `true` keeps the modal open
 *   (emitted during internal Vuetify dialog interactions); `false` closes it.
 */
function onModalUpdate(value: boolean) {
  if (!value) {
    modalOpen.value = false
    recipeStore.clearSelection()
  }
}

/**
 * Watches `recipeStore.selectedRecipe` to automatically open the modal whenever
 * the store sets a new selection — for example, if a future feature selects a
 * recipe programmatically without going through `onRecipeClick`. This acts as a
 * secondary trigger alongside the direct `onRecipeClick` path.
 *
 * Only reacts when `newVal` is truthy (i.e., a recipe was set); clearing the
 * selection (`newVal` is `null`) is handled by `onModalUpdate` instead.
 */
watch(
  () => recipeStore.selectedRecipe,
  (newVal) => {
    if (newVal) {
      modalOpen.value = true
    }
  }
)

/**
 * Lifecycle hook: fires an initial search for `"taco"` as soon as the view
 * mounts, populating the grid with relevant results immediately without waiting
 * for user input. This avoids showing the empty-state on first load.
 */
onMounted(() => {
  recipeStore.searchRecipes('taco')
})
</script>
