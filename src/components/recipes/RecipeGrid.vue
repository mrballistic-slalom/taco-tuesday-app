<template>
  <v-row>
    <v-col
      v-for="recipe in recipes"
      :key="recipe.idMeal"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <RecipeCard :meal="recipe" @click="emit('recipe-click', recipe)" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { Meal } from '@/types/mealdb'
import RecipeCard from '@/components/recipes/RecipeCard.vue'

defineProps<{
  recipes: Meal[]
}>()

const emit = defineEmits<{
  (e: 'recipe-click', meal: Meal): void
}>()
</script>
