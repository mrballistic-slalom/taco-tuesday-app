<template>
  <v-card class="recipe-card" :elevation="2" @click="emit('click')">
    <v-img :src="meal.strMealThumb" height="200" cover />
    <v-card-title class="text-wrap">{{ meal.strMeal }}</v-card-title>
    <v-card-text>
      <v-chip size="small" color="primary" class="mr-2">{{ meal.strCategory }}</v-chip>
      <v-chip size="small" color="secondary">{{ meal.strArea }}</v-chip>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" variant="elevated" @click.stop="emit('click')">Get Recipe</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { Meal } from '@/types/mealdb'

defineProps<{
  meal: Meal
}>()

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
