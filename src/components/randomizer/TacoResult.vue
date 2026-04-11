<template>
  <v-card max-width="400" class="mx-auto" elevation="8">
    <v-img :src="meal.strMealThumb" height="200" cover />
    <v-card-title class="text-h5 pt-3">{{ meal.strMeal }}</v-card-title>
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
import type { Meal } from '@/types/mealdb'

defineProps<{
  meal: Meal
}>()

const emit = defineEmits<{
  (e: 'view-recipe'): void
  (e: 'spin-again'): void
}>()
</script>
