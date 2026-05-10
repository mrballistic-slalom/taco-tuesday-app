import { vi, beforeEach, describe, it, expect } from 'vitest'
import { useMapbox } from '@/composables/useMapbox'
import type { MapboxSearchResponse } from '@/types/mapbox'

const mockFeature: MapboxSearchResponse['features'][number] = {
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [-122.68, 45.52] },
  properties: {
    mapbox_id: 'dXJuOm1ieHBvaTphYmM',
    name: 'Taco Shop',
    full_address: '123 Main St, Portland, OR 97201',
    coordinates: { latitude: 45.52, longitude: -122.68 },
    poi_category: ['restaurant', 'mexican_restaurant'],
    maki: 'restaurant',
  },
}

const mockResponse: MapboxSearchResponse = {
  type: 'FeatureCollection',
  features: [mockFeature],
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
  vi.stubEnv('VITE_MAPBOX_TOKEN', 'test-token')
})

describe('useMapbox', () => {
  describe('searchTacoShops', () => {
    it('returns reshaped shop array on success', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const { searchTacoShops } = useMapbox()
      const result = await searchTacoShops(45.52, -122.68)

      expect(result).toEqual([
        {
          id: 'dXJuOm1ieHBvaTphYmM',
          name: 'Taco Shop',
          full_address: '123 Main St, Portland, OR 97201',
          coordinates: { latitude: 45.52, longitude: -122.68 },
          categories: ['restaurant', 'mexican_restaurant'],
          maki: 'restaurant',
        },
      ])
    })

    it('throws on non-2xx response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response)

      const { searchTacoShops } = useMapbox()
      await expect(searchTacoShops(45.52, -122.68)).rejects.toThrow(
        'Mapbox Search request failed: 401 Unauthorized'
      )
    })

    it('throws when the payload is missing features', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ type: 'FeatureCollection' }),
      } as Response)

      const { searchTacoShops } = useMapbox()
      await expect(searchTacoShops(45.52, -122.68)).rejects.toThrow(
        'Mapbox Search returned an unexpected payload'
      )
    })

    it('throws when VITE_MAPBOX_TOKEN is missing', async () => {
      vi.stubEnv('VITE_MAPBOX_TOKEN', '')
      const { searchTacoShops } = useMapbox()
      await expect(searchTacoShops(45.52, -122.68)).rejects.toThrow(
        'Mapbox token not configured'
      )
    })

    it('calls the Mapbox forward endpoint with q=tacos and proximity', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const { searchTacoShops } = useMapbox()
      await searchTacoShops(45.52, -122.68)

      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string
      expect(calledUrl).toContain('api.mapbox.com/search/searchbox/v1/forward')
      expect(calledUrl).toContain('q=tacos')
      expect(calledUrl).toMatch(/proximity=-122\.68%2C45\.52|proximity=-122.68,45.52/)
    })

    it('falls back to place_formatted and geometry coords when properties are sparse', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [-122.68, 45.52] },
              properties: {
                mapbox_id: 'abc',
                name: 'Minimal Taco',
                place_formatted: 'Portland, OR',
              },
            },
          ],
        }),
      } as Response)

      const { searchTacoShops } = useMapbox()
      const result = await searchTacoShops(45.52, -122.68)
      expect(result[0]).toEqual({
        id: 'abc',
        name: 'Minimal Taco',
        full_address: 'Portland, OR',
        coordinates: { latitude: 45.52, longitude: -122.68 },
        categories: [],
        maki: undefined,
      })
    })
  })

  describe('searchTacoTuesdayShops', () => {
    it('calls the forward endpoint with q="taco tuesday"', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const { searchTacoTuesdayShops } = useMapbox()
      await searchTacoTuesdayShops(45.52, -122.68)

      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string
      // URLSearchParams encodes the space as +
      expect(calledUrl).toMatch(/q=taco[\s+%20]tuesday/i)
    })
  })
})
