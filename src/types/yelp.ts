export interface YelpBusiness {
  id: string
  name: string
  rating: number
  review_count: number
  price?: string
  location: { display_address: string[] }
  coordinates: { latitude: number; longitude: number }
  categories: { alias: string; title: string }[]
  url: string
  image_url?: string
}

export interface YelpSearchResponse {
  businesses: YelpBusiness[]
  total: number
}
