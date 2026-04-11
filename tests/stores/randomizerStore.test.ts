import { vi, beforeEach, describe, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { SpoonacularRecipe } from '@/types/spoonacular'

const mockGetRandomRecipeForType = vi.fn()

vi.mock('@/composables/useSpoonacular', () => ({
  useSpoonacular: () => ({
    searchRecipes: vi.fn(),
    getRecipeById: vi.fn(),
    getRandomRecipeForType: mockGetRandomRecipeForType,
  }),
}))

import { useRandomizerStore } from '@/stores/randomizerStore'

const mockRecipe: SpoonacularRecipe = {
  id: 1,
  title: 'Al Pastor Tacos',
  image: 'https://example.com/thumb.jpg',
  cuisines: ['Mexican'],
  extendedIngredients: [],
  instructions: 'Marinate and grill the pork.',
}

describe('randomizerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('spin', () => {
    it('sets result when a recipe is found, isSpinning is false, error is null', async () => {
      mockGetRandomRecipeForType.mockResolvedValueOnce(mockRecipe)

      const store = useRandomizerStore()
      await store.spin('Al Pastor')

      expect(store.result).toEqual(mockRecipe)
      expect(store.result?.title).toBe('Al Pastor Tacos')
      expect(store.isSpinning).toBe(false)
      expect(store.error).toBeNull()
    })

    it('sets error with taco-less message when no results returned', async () => {
      mockGetRandomRecipeForType.mockResolvedValueOnce(null)

      const store = useRandomizerStore()
      await store.spin('unicorn taco')

      expect(store.result).toBeNull()
      expect(store.error).toBe(
        "Spoonacular came up empty for 'unicorn taco'. The audacity. Try again! 🌮"
      )
      expect(store.isSpinning).toBe(false)
    })

    it('sets error message on exception', async () => {
      mockGetRandomRecipeForType.mockRejectedValueOnce(new Error('API down'))

      const store = useRandomizerStore()
      await store.spin('taco')

      expect(store.result).toBeNull()
      expect(store.error).toBe('API down')
      expect(store.isSpinning).toBe(false)
    })
  })

  describe('reset', () => {
    it('resets result, error, and isSpinning', async () => {
      mockGetRandomRecipeForType.mockResolvedValueOnce(mockRecipe)

      const store = useRandomizerStore()
      await store.spin('Al Pastor')
      expect(store.result).toEqual(mockRecipe)

      store.reset()
      expect(store.result).toBeNull()
      expect(store.error).toBeNull()
      expect(store.isSpinning).toBe(false)
    })
  })
})
