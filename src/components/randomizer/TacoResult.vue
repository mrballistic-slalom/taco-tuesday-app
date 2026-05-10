<template>
  <v-card max-width="400" class="mx-auto" elevation="8">
    <v-img :src="recipe.image" height="200" cover />
    <v-card-title class="text-h5 pt-3">{{ recipe.title }}</v-card-title>
    <v-card-text>Your destiny is served. 🌮</v-card-text>
    <v-card-actions class="pa-4 pt-0 gap-2">
      <v-btn
        v-if="recipe.sourceUrl"
        color="primary"
        variant="elevated"
        :href="recipe.sourceUrl"
        target="_blank"
        rel="noopener noreferrer"
        append-icon="mdi-open-in-new"
      >
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
 *      1. "View Full Recipe" (primary, elevated) — a direct external link to
 *         `recipe.sourceUrl` opened in a new tab. Hidden when `sourceUrl`
 *         is absent.
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
 * @emits spin-again - Fired when the user clicks "SPIN AGAIN 🎲". The parent
 *   calls `randomizerStore.reset()`, which clears `result` and `error` in the
 *   store, causing the `v-if="randomizerStore.result"` condition in the parent
 *   template to become false and hiding this component via the slide-up
 *   transition.
 *
 * The "View Full Recipe" button is rendered as a direct `<a target="_blank">`
 * link to `recipe.sourceUrl`, so there is no `view-recipe` event — the parent
 * doesn't need to mediate the navigation.
 */
const emit = defineEmits<{
  (e: 'spin-again'): void
}>()
</script>
