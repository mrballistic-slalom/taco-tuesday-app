<template>
  <v-card max-width="400" class="mx-auto" elevation="8">
    <v-img :src="recipe.image" height="200" cover />
    <v-card-title class="text-h5 pt-3">{{ recipe.title }}</v-card-title>
    <v-card-text>Your destiny is served. 🌮</v-card-text>
    <v-card-actions class="pa-4 pt-0 gap-2">
      <v-btn color="primary" variant="elevated" @click="emit('view-recipe')">
        View Full Recipe
      </v-btn>
      <v-btn variant="outlined" @click="emit('spin-again')"> SPIN AGAIN 🎲 </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
/**
 * @component TacoResult
 *
 * Displays the outcome of a successful randomizer spin. Rendered inside a
 * `<Transition name="slide-up">` in `RandomizerView` so it animates in
 * smoothly (translateY 40px → 0, opacity 0 → 1) when the `randomizerStore`
 * populates its `result` field after a spin.
 *
 * The card shows:
 *  - The recipe's image (200px height, cover-cropped).
 *  - The recipe title in `text-h5` typography.
 *  - A fun static tagline: "Your destiny is served. 🌮".
 *  - Two action buttons:
 *      1. "View Full Recipe" (primary, elevated) — emits `view-recipe` so the
 *         parent can open a `RecipeModal` for this recipe.
 *      2. "SPIN AGAIN 🎲" (outlined) — emits `spin-again` so the parent can
 *         call `randomizerStore.reset()` and clear the result, hiding this card.
 *
 * This component is purely presentational: it holds no local state and performs
 * no data fetching. All business logic is handled by the parent view.
 *
 * @example
 * <TacoResult
 *   :recipe="randomizerStore.result"
 *   @view-recipe="openRecipeModal(randomizerStore.result)"
 *   @spin-again="randomizerStore.reset()"
 * />
 */

import type { SpoonacularRecipe } from '@/types/spoonacular'

/**
 * Props accepted by TacoResult.
 *
 * @prop recipe - The `SpoonacularRecipe` object returned by `randomizerStore`
 *   after a successful spin and Spoonacular lookup. Used to render the recipe
 *   image (`image`) and title (`title`). The parent passes the full recipe
 *   object so that the `view-recipe` handler can open a `RecipeModal` without
 *   needing an additional API call.
 */
defineProps<{
  recipe: SpoonacularRecipe
}>()

/**
 * Events emitted by TacoResult.
 *
 * @emits view-recipe - Fired when the user clicks "View Full Recipe". The
 *   parent (`RandomizerView`) responds by setting `selectedRecipeForModal` to
 *   the current recipe and opening a `RecipeModal` dialog. No payload is
 *   included — the parent already has the recipe from the store.
 *
 * @emits spin-again - Fired when the user clicks "SPIN AGAIN 🎲". The parent
 *   calls `randomizerStore.reset()`, which clears `result` and `error` in the
 *   store, causing the `v-if="randomizerStore.result"` condition in the parent
 *   template to become false and hiding this component via the slide-up
 *   transition.
 */
const emit = defineEmits<{
  (e: 'view-recipe'): void
  (e: 'spin-again'): void
}>()
</script>
