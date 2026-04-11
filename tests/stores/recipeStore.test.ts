import { vi, beforeEach, describe, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { SpoonacularRecipe } from '@/types/spoonacular'

const mockSearchRecipes = vi.fn()
const mockGetRecipeById = vi.fn()

vi.mock('@/composables/useSpoonacular', () => ({
  useSpoonacular: () => ({
    searchRecipes: mockSearchRecipes,
    getRecipeById: mockGetRecipeById,
    getRandomRecipeForType: vi.fn(),
  }),
}))

import { useRecipeStore } from '@/stores/recipeStore'

const mockRecipe: SpoonacularRecipe = {
  id: 1,
  title: 'Beef Tacos',
  image: 'https://example.com/thumb.jpg',
  cuisines: ['Mexican'],
  extendedIngredients: [],
  instructions: 'Cook the beef.',
}

describe('recipeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('searchRecipes', () => {
    it('sets recipes to returned recipes on success', async () => {
      mockSearchRecipes.mockResolvedValueOnce([mockRecipe])

      const store = useRecipeStore()
      await store.searchRecipes('taco')

      expect(store.recipes).toEqual([mockRecipe])
      expect(store.searchQuery).toBe('taco')
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('sets recipes to empty array when no recipes returned', async () => {
      mockSearchRecipes.mockResolvedValueOnce([])

      const store = useRecipeStore()
      await store.searchRecipes('mystery')

      expect(store.recipes).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('sets error and empty recipes on failure', async () => {
      mockSearchRecipes.mockRejectedValueOnce(new Error('Search failed'))

      const store = useRecipeStore()
      await store.searchRecipes('taco')

      expect(store.recipes).toEqual([])
      expect(store.error).toBe('Search failed')
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchRecipeById', () => {
    it('sets selectedRecipe on success', async () => {
      mockGetRecipeById.mockResolvedValueOnce(mockRecipe)

      const store = useRecipeStore()
      await store.fetchRecipeById(1)

      expect(store.selectedRecipe).toEqual(mockRecipe)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('keeps selectedRecipe null when result is null', async () => {
      mockGetRecipeById.mockResolvedValueOnce(null)

      const store = useRecipeStore()
      await store.fetchRecipeById(999)

      expect(store.selectedRecipe).toBeNull()
      expect(store.loading).toBe(false)
    })
  })

  describe('clearSelection', () => {
    it('resets selectedRecipe to null', async () => {
      mockGetRecipeById.mockResolvedValueOnce(mockRecipe)

      const store = useRecipeStore()
      await store.fetchRecipeById(1)
      expect(store.selectedRecipe).toEqual(mockRecipe)

      store.clearSelection()
      expect(store.selectedRecipe).toBeNull()
    })
  })
})
