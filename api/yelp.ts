export const config = { runtime: 'edge' }

const YELP_BASE_URL = 'https://api.yelp.com/v3/businesses/search'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiKey = process.env.YELP_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { searchParams } = new URL(request.url)
  const forwardedParams = new URLSearchParams()

  for (const key of ['term', 'latitude', 'longitude', 'limit', 'sort_by']) {
    const value = searchParams.get(key)
    if (value !== null) {
      forwardedParams.set(key, value)
    }
  }

  const yelpUrl = `${YELP_BASE_URL}?${forwardedParams.toString()}`

  let yelpResponse: Response
  try {
    yelpResponse = await fetch(yelpUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown fetch error'
    return new Response(JSON.stringify({ error: `Failed to reach Yelp: ${message}` }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const data: unknown = await yelpResponse.json()

  return new Response(JSON.stringify(data), {
    status: yelpResponse.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
