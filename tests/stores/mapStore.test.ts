import { vi, beforeEach, describe, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { MapboxTacoShop } from '@/types/mapbox'

const mockSearchTacoShops = vi.fn()

vi.mock('@/composables/useMapbox', () => ({
  useMapbox: () => ({
    searchTacoShops: mockSearchTacoShops,
    searchTacoTuesdayShops: vi.fn(),
  }),
}))

import { useMapStore } from '@/stores/mapStore'

const mockShop: MapboxTacoShop = {
  id: 'abc',
  name: 'Taco Paradise',
  full_address: '123 Taco St, Portland, OR',
  coordinates: { latitude: 45.52, longitude: -122.68 },
  categories: ['restaurant', 'mexican_restaurant'],
  maki: 'restaurant',
}

describe('mapStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('fetchShops', () => {
    it('sets shops on success and clears loading and error', async () => {
      mockSearchTacoShops.mockResolvedValueOnce([mockShop])

      const store = useMapStore()
      await store.fetchShops(45.52, -122.68)

      expect(store.shops).toEqual([mockShop])
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
      store.selectShop(mockShop)
      expect(store.selectedShop).toEqual(mockShop)
    })
  })

  describe('clearSelection', () => {
    it('sets selectedShop to null', () => {
      const store = useMapStore()
      store.selectShop(mockShop)
      store.clearSelection()
      expect(store.selectedShop).toBeNull()
    })
  })
})
