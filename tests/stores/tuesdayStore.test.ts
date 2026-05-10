import { vi, beforeEach, describe, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { MapboxTacoShop } from '@/types/mapbox'

const mockSearchTacoTuesdayShops = vi.fn()

vi.mock('@/composables/useMapbox', () => ({
  useMapbox: () => ({
    searchTacoShops: vi.fn(),
    searchTacoTuesdayShops: mockSearchTacoTuesdayShops,
  }),
}))

import { useTuesdayStore } from '@/stores/tuesdayStore'

const mockShop: MapboxTacoShop = {
  id: 'abc',
  name: 'Taco Paradise',
  full_address: '123 Taco St, Portland, OR',
  coordinates: { latitude: 45.52, longitude: -122.68 },
  categories: ['restaurant'],
}

describe('tuesdayStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('fetchSpots', () => {
    it('sets spots and hasSpots is true on success', async () => {
      mockSearchTacoTuesdayShops.mockResolvedValueOnce([mockShop])

      const store = useTuesdayStore()
      await store.fetchSpots(45.52, -122.68)

      expect(store.spots).toEqual([mockShop])
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
      mockSearchTacoTuesdayShops.mockResolvedValueOnce([mockShop])

      const store = useTuesdayStore()
      await store.fetchSpots(45.52, -122.68)
      expect(store.spots).toEqual([mockShop])

      store.clear()
      expect(store.spots).toEqual([])
      expect(store.error).toBeNull()
    })
  })
})
