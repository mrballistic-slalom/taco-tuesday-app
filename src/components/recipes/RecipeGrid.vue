<template>
  <v-row>
    <v-col
      v-for="recipe in recipes"
      :key="recipe.id"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <RecipeCard :recipe="recipe" @click="emit('recipe-click', recipe)" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
/**
 * @component RecipeGrid
 *
 * A responsive grid layout that renders a collection of `RecipeCard` components.
 * Each card occupies a full row on mobile (cols="12"), half the row on small
 * screens (sm="6"), a third on medium screens (md="4"), and a quarter on large
 * screens (lg="3"). This matches Vuetify's 12-column breakpoint system.
 *
 * This component is a pure presentational wrapper: it receives an array of recipes
 * and bubbles up card-click events to the parent view. It holds no local state
 * and performs no data fetching.
 *
 * @example
 * <RecipeGrid :recipes="recipeStore.recipes" @recipe-click="onRecipeClick" />
 */

import type { SpoonacularRecipe } from '@/types/spoonacular'
import RecipeCard from '@/components/recipes/RecipeCard.vue'

/**
 * Props accepted by RecipeGrid.
 *
 * @prop recipes - An array of `SpoonacularRecipe` objects sourced from Spoonacular.
 *   Each entry is passed as the `recipe` prop to an individual `RecipeCard`. The
 *   array may be empty, in which case no cards are rendered and the grid collapses
 *   to zero height — the parent view is responsible for showing an empty-state
 *   message in that scenario.
 */
defineProps<{
  recipes: SpoonacularRecipe[]
}>()

/**
 * Events emitted by RecipeGrid.
 *
 * @emits recipe-click - Fired when a `RecipeCard` inside the grid is clicked.
 *   Carries the full `SpoonacularRecipe` object that was clicked so the parent
 *   can call `recipeStore.fetchRecipeById` and open a `RecipeModal` without
 *   needing to maintain its own mapping from card position to recipe data.
 *
 * @param recipe - The `SpoonacularRecipe` object associated with the clicked card.
 */
const emit = defineEmits<{
  (e: 'recipe-click', recipe: SpoonacularRecipe): void
}>()
</script>
