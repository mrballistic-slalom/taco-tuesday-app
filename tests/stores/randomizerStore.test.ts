import { vi, beforeEach, describe, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { Meal } from '@/types/mealdb'

const mockSearchMeals = vi.fn()

vi.mock('@/composables/useMealDB', () => ({
  useMealDB: () => ({
    searchMeals: mockSearchMeals,
    getMealById: vi.fn(),
    getRandomMeal: vi.fn(),
  }),
}))

import { useRandomizerStore } from '@/stores/randomizerStore'

const mockMeal: Meal = {
  idMeal: '1',
  strMeal: 'Beef Tacos',
  strCategory: 'Mexican',
  strArea: 'Mexican',
  strInstructions: 'Cook the beef.',
  strMealThumb: 'https://example.com/thumb.jpg',
}

describe('randomizerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('spin', () => {
    it('sets result when a meal is found, isSpinning is false, error is null', async () => {
      mockSearchMeals.mockResolvedValueOnce([mockMeal])

      const store = useRandomizerStore()
      await store.spin('beef taco')

      expect(store.result).toEqual(mockMeal)
      expect(store.isSpinning).toBe(false)
      expect(store.error).toBeNull()
    })

    it('sets error with taco-less message when no results returned', async () => {
      mockSearchMeals.mockResolvedValueOnce([])

      const store = useRandomizerStore()
      await store.spin('unicorn taco')

      expect(store.result).toBeNull()
      expect(store.error).toBe(
        "TheMealDB is taco-less for 'unicorn taco'. The audacity. Try again! 🌮"
      )
      expect(store.isSpinning).toBe(false)
    })

    it('sets error message on exception', async () => {
      mockSearchMeals.mockRejectedValueOnce(new Error('API down'))

      const store = useRandomizerStore()
      await store.spin('taco')

      expect(store.result).toBeNull()
      expect(store.error).toBe('API down')
      expect(store.isSpinning).toBe(false)
    })
  })

  describe('reset', () => {
    it('resets result, error, and isSpinning', async () => {
      mockSearchMeals.mockResolvedValueOnce([mockMeal])

      const store = useRandomizerStore()
      await store.spin('beef taco')
      expect(store.result).toEqual(mockMeal)

      store.reset()
      expect(store.result).toBeNull()
      expect(store.error).toBeNull()
      expect(store.isSpinning).toBe(false)
    })
  })
})
