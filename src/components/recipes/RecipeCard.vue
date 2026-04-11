<template>
  <v-card class="recipe-card" :elevation="2" @click="emit('click')">
    <v-img :src="recipe.image" height="200" cover />
    <v-card-title class="text-wrap">{{ recipe.title }}</v-card-title>
    <v-card-text>
      <v-chip size="small" color="primary" class="mr-2">
        {{ recipe.cuisines?.[0] ?? recipe.dishTypes?.[0] ?? 'Taco' }}
      </v-chip>
      <v-chip v-if="recipe.dishTypes?.[0]" size="small" color="secondary">
        {{ recipe.dishTypes[0] }}
      </v-chip>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" variant="elevated" @click.stop="emit('click')">Get Recipe</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
/**
 * @component RecipeCard
 *
 * A clickable Vuetify card that presents a single taco recipe from Spoonacular.
 * Renders the recipe's image at a fixed 200px height, the recipe title as
 * the card title, and chips indicating the recipe's cuisine (e.g. "Mexican")
 * and dish type (e.g. "main course"), when available. A "Get Recipe" action
 * button is included at the bottom of the card. Both the card surface and the
 * action button emit the same `click` event so the parent can open a detail modal.
 *
 * Hover state lifts the card with a translateY(-4px) transform and deepens the
 * drop shadow — this is handled entirely by the scoped CSS, requiring no script
 * logic.
 *
 * @example
 * <RecipeCard :recipe="recipe" @click="openModal(recipe)" />
 */

import type { SpoonacularRecipe } from '@/types/spoonacular'

/**
 * Props accepted by RecipeCard.
 *
 * @prop recipe - The `SpoonacularRecipe` object to display. Used to render the
 *   image (`image`), recipe title (`title`), cuisine chip
 *   (`cuisines?.[0] ?? dishTypes?.[0] ?? 'Taco'`), and optional dish type chip
 *   (`dishTypes?.[0]`). The same object is available to the parent via the
 *   `click` emit so it can be passed directly into a detail store or modal.
 */
defineProps<{
  recipe: SpoonacularRecipe
}>()

/**
 * Events emitted by RecipeCard.
 *
 * @emits click - Fired when the user clicks anywhere on the card surface or the
 *   "Get Recipe" action button. The parent should respond by fetching the full
 *   recipe detail and opening a `RecipeModal`. Note that the action button uses
 *   `.stop` to prevent double-firing the native click bubble while still
 *   triggering this emit.
 */
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<style scoped>
.recipe-card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4) !important;
}
</style>
