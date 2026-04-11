import { useGeolocation } from '@/composables/useGeolocation'

describe('useGeolocation', () => {
  describe('getLocation', () => {
    it('resolves with { lat, lng } when getCurrentPosition calls success callback', async () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn((success: PositionCallback) => {
          success({ coords: { latitude: 45.52, longitude: -122.68 } } as GeolocationPosition)
        }),
      }
      vi.stubGlobal('navigator', { geolocation: mockGeolocation })

      const { getLocation } = useGeolocation()
      const result = await getLocation()

      expect(result).toEqual({ lat: 45.52, lng: -122.68 })
    })

    it('rejects when getCurrentPosition calls the error callback', async () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn(
          (_success: PositionCallback, error: PositionErrorCallback) => {
            error({ code: 1, message: 'User denied geolocation' } as GeolocationPositionError)
          }
        ),
      }
      vi.stubGlobal('navigator', { geolocation: mockGeolocation })

      const { getLocation } = useGeolocation()
      await expect(getLocation()).rejects.toThrow('User denied geolocation')
    })

    it('rejects when navigator.geolocation is undefined', async () => {
      vi.stubGlobal('navigator', { geolocation: undefined })

      const { getLocation } = useGeolocation()
      await expect(getLocation()).rejects.toThrow(
        'Geolocation is not supported by this browser.'
      )
    })
  })
})
