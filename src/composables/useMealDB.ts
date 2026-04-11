import type { Meal, MealDBResponse } from '@/types/mealdb'

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1'

async function fetchMealDB(path: string): Promise<MealDBResponse> {
  const response = await fetch(`${BASE_URL}${path}`)
  if (!response.ok) {
    throw new Error(`TheMealDB request failed: ${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<MealDBResponse>
}

export function useMealDB() {
  async function searchMeals(query: string): Promise<Meal[]> {
    const data = await fetchMealDB(`/search.php?s=${encodeURIComponent(query)}`)
    return data.meals ?? []
  }

  async function getMealById(id: string): Promise<Meal | null> {
    const data = await fetchMealDB(`/lookup.php?i=${encodeURIComponent(id)}`)
    return data.meals?.[0] ?? null
  }

  async function getRandomMeal(): Promise<Meal | null> {
    const data = await fetchMealDB('/random.php')
    return data.meals?.[0] ?? null
  }

  return { searchMeals, getMealById, getRandomMeal }
}
