import { vi, beforeEach, describe, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { YelpBusiness } from '@/types/yelp'

const mockSearchTacoTuesdayShops = vi.fn()

vi.mock('@/composables/useYelp', () => ({
  useYelp: () => ({
    searchTacoShops: vi.fn(),
    searchTacoTuesdayShops: mockSearchTacoTuesdayShops,
  }),
}))

import { useTuesdayStore } from '@/stores/tuesdayStore'

const mockBusiness: YelpBusiness = {
  id: '1',
  name: 'Taco Paradise',
  rating: 4.5,
  review_count: 200,
  location: { display_address: ['123 Taco St'] },
  coordinates: { latitude: 45.52, longitude: -122.68 },
  categories: [{ alias: 'tacos', title: 'Tacos' }],
  url: 'https://yelp.com/biz/taco-paradise',
}

describe('tuesdayStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('fetchSpots', () => {
    it('sets spots and hasSpots is true on success', async () => {
      mockSearchTacoTuesdayShops.mockResolvedValueOnce([mockBusiness])

      const store = useTuesdayStore()
      await store.fetchSpots(45.52, -122.68)

      expect(store.spots).toEqual([mockBusiness])
      expect(store.hasSpots).toBe(true)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('sets error and spots stays empty on failure', async () => {
      mockSearchTacoTuesdayShops.mockRejectedValueOnce(new Error('Tuesday fail'))

      const store = useTuesdayStore()
      await store.fetchSpots(45.52, -122.68)

      expect(store.spots).toEqual([])
      expect(store.error).toBe('Tuesday fail')
      expect(store.loading).toBe(false)
    })

    it('spots is empty and hasSpots is false when empty results returned', async () => {
      mockSearchTacoTuesdayShops.mockResolvedValueOnce([])

      const store = useTuesdayStore()
      await store.fetchSpots(45.52, -122.68)

      expect(store.spots).toEqual([])
      expect(store.hasSpots).toBe(false)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('clear', () => {
    it('resets spots and error', async () => {
      mockSearchTacoTuesdayShops.mockResolvedValueOnce([mockBusiness])

      const store = useTuesdayStore()
      await store.fetchSpots(45.52, -122.68)
      expect(store.spots).toEqual([mockBusiness])

      store.clear()
      expect(store.spots).toEqual([])
      expect(store.error).toBeNull()
    })
  })
})
