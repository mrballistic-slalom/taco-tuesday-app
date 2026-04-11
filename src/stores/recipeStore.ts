import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Meal } from '@/types/mealdb'
import { useMealDB } from '@/composables/useMealDB'

export const useRecipeStore = defineStore('recipe', () => {
  const recipes = ref<Meal[]>([])
  const selectedRecipe = ref<Meal | null>(null)
  const loading = ref(false)
  const searchQuery = ref('')
  const error = ref<string | null>(null)

  async function searchRecipes(query: string) {
    loading.value = true
    error.value = null
    searchQuery.value = query
    try {
      const { searchMeals } = useMealDB()
      recipes.value = await searchMeals(query)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      recipes.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchRecipeById(id: string) {
    loading.value = true
    error.value = null
    try {
      const { getMealById } = useMealDB()
      selectedRecipe.value = await getMealById(id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  function clearSelection() {
    selectedRecipe.value = null
  }

  return { recipes, selectedRecipe, loading, searchQuery, error, searchRecipes, fetchRecipeById, clearSelection }
})
