export function useGeolocation() {
  function getLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`))
        },
        { timeout: 8000 }
      )
    })
  }

  return { getLocation }
}
