import type { YelpBusiness, YelpSearchResponse } from '@/types/yelp'

async function fetchYelp(params: URLSearchParams): Promise<YelpBusiness[]> {
  const response = await fetch(`/api/yelp?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`Yelp API request failed: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as YelpSearchResponse | { error: string }

  if ('error' in data) {
    throw new Error(`Yelp API error: ${data.error}`)
  }

  return data.businesses
}

export function useYelp() {
  async function searchTacoShops(lat: number, lng: number): Promise<YelpBusiness[]> {
    const params = new URLSearchParams({
      term: 'tacos',
      latitude: String(lat),
      longitude: String(lng),
      limit: '20',
      sort_by: 'rating',
    })
    return fetchYelp(params)
  }

  async function searchTacoTuesdayShops(lat: number, lng: number): Promise<YelpBusiness[]> {
    const params = new URLSearchParams({
      term: 'taco tuesday',
      latitude: String(lat),
      longitude: String(lng),
      limit: '10',
      sort_by: 'rating',
    })
    return fetchYelp(params)
  }

  return { searchTacoShops, searchTacoTuesdayShops }
}
