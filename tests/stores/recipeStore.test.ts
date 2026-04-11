import { vi, beforeEach, describe, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { Meal } from '@/types/mealdb'

const mockSearchMeals = vi.fn()
const mockGetMealById = vi.fn()

vi.mock('@/composables/useMealDB', () => ({
  useMealDB: () => ({
    searchMeals: mockSearchMeals,
    getMealById: mockGetMealById,
    getRandomMeal: vi.fn(),
  }),
}))

import { useRecipeStore } from '@/stores/recipeStore'

const mockMeal: Meal = {
  idMeal: '1',
  strMeal: 'Beef Tacos',
  strCategory: 'Mexican',
  strArea: 'Mexican',
  strInstructions: 'Cook the beef.',
  strMealThumb: 'https://example.com/thumb.jpg',
}

describe('recipeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('searchRecipes', () => {
    it('sets recipes to returned meals on success', async () => {
      mockSearchMeals.mockResolvedValueOnce([mockMeal])

      const store = useRecipeStore()
      await store.searchRecipes('taco')

      expect(store.recipes).toEqual([mockMeal])
      expect(store.searchQuery).toBe('taco')
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('sets recipes to empty array when no meals returned', async () => {
      mockSearchMeals.mockResolvedValueOnce([])

      const store = useRecipeStore()
      await store.searchRecipes('mystery')

      expect(store.recipes).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('sets error and empty recipes on failure', async () => {
      mockSearchMeals.mockRejectedValueOnce(new Error('Search failed'))

      const store = useRecipeStore()
      await store.searchRecipes('taco')

      expect(store.recipes).toEqual([])
      expect(store.error).toBe('Search failed')
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchRecipeById', () => {
    it('sets selectedRecipe on success', async () => {
      mockGetMealById.mockResolvedValueOnce(mockMeal)

      const store = useRecipeStore()
      await store.fetchRecipeById('1')

      expect(store.selectedRecipe).toEqual(mockMeal)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('keeps selectedRecipe null when result is null', async () => {
      mockGetMealById.mockResolvedValueOnce(null)

      const store = useRecipeStore()
      await store.fetchRecipeById('999')

      expect(store.selectedRecipe).toBeNull()
      expect(store.loading).toBe(false)
    })
  })

  describe('clearSelection', () => {
    it('resets selectedRecipe to null', async () => {
      mockGetMealById.mockResolvedValueOnce(mockMeal)

      const store = useRecipeStore()
      await store.fetchRecipeById('1')
      expect(store.selectedRecipe).toEqual(mockMeal)

      store.clearSelection()
      expect(store.selectedRecipe).toBeNull()
    })
  })
})
