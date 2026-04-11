import { useYelp } from '@/composables/useYelp'
import type { YelpBusiness } from '@/types/yelp'

const mockBusiness: YelpBusiness = {
  id: '1',
  name: 'Taco Shop',
  rating: 4.5,
  review_count: 100,
  location: { display_address: ['123 Main St'] },
  coordinates: { latitude: 45.52, longitude: -122.68 },
  categories: [{ alias: 'tacos', title: 'Tacos' }],
  url: 'https://yelp.com/biz/taco-shop',
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

describe('useYelp', () => {
  describe('searchTacoShops', () => {
    it('returns businesses array on success', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ businesses: [mockBusiness], total: 1 }),
      } as Response)

      const { searchTacoShops } = useYelp()
      const result = await searchTacoShops(45.52, -122.68)

      expect(result).toEqual([mockBusiness])
    })

    it('throws when response JSON contains { error }', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: 'Invalid API key' }),
      } as Response)

      const { searchTacoShops } = useYelp()
      await expect(searchTacoShops(45.52, -122.68)).rejects.toThrow('Invalid API key')
    })

    it('throws on non-2xx response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response)

      const { searchTacoShops } = useYelp()
      await expect(searchTacoShops(45.52, -122.68)).rejects.toThrow(
        'Yelp API request failed: 401 Unauthorized'
      )
    })

    it('calls the proxy with term=tacos in the URL', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ businesses: [mockBusiness], total: 1 }),
      } as Response)

      const { searchTacoShops } = useYelp()
      await searchTacoShops(45.52, -122.68)

      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string
      expect(calledUrl).toContain('term=tacos')
    })
  })

  describe('searchTacoTuesdayShops', () => {
    it('returns businesses array on success', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ businesses: [mockBusiness], total: 1 }),
      } as Response)

      const { searchTacoTuesdayShops } = useYelp()
      const result = await searchTacoTuesdayShops(45.52, -122.68)

      expect(result).toEqual([mockBusiness])
    })

    it('calls the proxy with taco tuesday in the URL', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ businesses: [mockBusiness], total: 1 }),
      } as Response)

      const { searchTacoTuesdayShops } = useYelp()
      await searchTacoTuesdayShops(45.52, -122.68)

      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string
      // URLSearchParams encodes spaces as + or %20
      expect(calledUrl).toMatch(/term=taco[\s+%20]?tuesday/i)
    })
  })
})
