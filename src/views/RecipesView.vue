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
      :meal="recipeStore.selectedRecipe"
      :model-value="modalOpen"
      @update:model-value="onModalUpdate"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRecipeStore } from '@/stores/recipeStore'
import RecipeGrid from '@/components/recipes/RecipeGrid.vue'
import RecipeModal from '@/components/recipes/RecipeModal.vue'
import type { Meal } from '@/types/mealdb'

const recipeStore = useRecipeStore()
const modalOpen = ref(false)

let debounceTimer: ReturnType<typeof setTimeout>

function onSearchInput(val: string) {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => recipeStore.searchRecipes(val), 400)
}

async function onRecipeClick(meal: Meal) {
  await recipeStore.fetchRecipeById(meal.idMeal)
  modalOpen.value = true
}

function onModalUpdate(value: boolean) {
  if (!value) {
    modalOpen.value = false
    recipeStore.clearSelection()
  }
}

watch(
  () => recipeStore.selectedRecipe,
  (newVal) => {
    if (newVal) {
      modalOpen.value = true
    }
  }
)

onMounted(() => {
  recipeStore.searchRecipes('taco')
})
</script>
