import { vi, beforeEach, describe, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { YelpBusiness } from '@/types/yelp'

const mockSearchTacoShops = vi.fn()

vi.mock('@/composables/useYelp', () => ({
  useYelp: () => ({
    searchTacoShops: mockSearchTacoShops,
    searchTacoTuesdayShops: vi.fn(),
  }),
}))

import { useMapStore } from '@/stores/mapStore'

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

describe('mapStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('fetchShops', () => {
    it('sets shops on success and clears loading and error', async () => {
      mockSearchTacoShops.mockResolvedValueOnce([mockBusiness])

      const store = useMapStore()
      await store.fetchShops(45.52, -122.68)

      expect(store.shops).toEqual([mockBusiness])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('sets error and empty shops array on failure', async () => {
      mockSearchTacoShops.mockRejectedValueOnce(new Error('Network failure'))

      const store = useMapStore()
      await store.fetchShops(45.52, -122.68)

      expect(store.shops).toEqual([])
      expect(store.error).toBe('Network failure')
      expect(store.loading).toBe(false)
    })
  })

  describe('selectShop', () => {
    it('sets selectedShop', () => {
      const store = useMapStore()
      store.selectShop(mockBusiness)
      expect(store.selectedShop).toEqual(mockBusiness)
    })
  })

  describe('clearSelection', () => {
    it('sets selectedShop to null', () => {
      const store = useMapStore()
      store.selectShop(mockBusiness)
      store.clearSelection()
      expect(store.selectedShop).toBeNull()
    })
  })
})
