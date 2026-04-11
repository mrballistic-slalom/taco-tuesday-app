import { useMealDB } from '@/composables/useMealDB'
import type { Meal } from '@/types/mealdb'

const mockMeal: Meal = {
  idMeal: '1',
  strMeal: 'Taco',
  strCategory: 'Mexican',
  strArea: 'Mexican',
  strInstructions: 'Cook it',
  strMealThumb: 'https://example.com/thumb.jpg',
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

describe('useMealDB', () => {
  describe('searchMeals', () => {
    it('returns an array of meals on success', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ meals: [mockMeal] }),
      } as Response)

      const { searchMeals } = useMealDB()
      const result = await searchMeals('taco')

      expect(result).toEqual([mockMeal])
    })

    it('returns empty array when meals is null', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ meals: null }),
      } as Response)

      const { searchMeals } = useMealDB()
      const result = await searchMeals('notfound')

      expect(result).toEqual([])
    })

    it('throws on non-2xx response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response)

      const { searchMeals } = useMealDB()
      await expect(searchMeals('taco')).rejects.toThrow('TheMealDB request failed')
    })
  })

  describe('getMealById', () => {
    it('returns the first meal on success', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ meals: [mockMeal] }),
      } as Response)

      const { getMealById } = useMealDB()
      const result = await getMealById('1')

      expect(result).toEqual(mockMeal)
    })

    it('returns null when meals is null', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ meals: null }),
      } as Response)

      const { getMealById } = useMealDB()
      const result = await getMealById('999')

      expect(result).toBeNull()
    })
  })

  describe('getRandomMeal', () => {
    it('returns the first meal on success', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ meals: [mockMeal] }),
      } as Response)

      const { getRandomMeal } = useMealDB()
      const result = await getRandomMeal()

      expect(result).toEqual(mockMeal)
    })

    it('returns null when meals is null', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ meals: null }),
      } as Response)

      const { getRandomMeal } = useMealDB()
      const result = await getRandomMeal()

      expect(result).toBeNull()
    })
  })
})
