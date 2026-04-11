export interface Meal {
  idMeal: string
  strMeal: string
  strCategory: string
  strArea: string
  strInstructions: string
  strMealThumb: string
  strYoutube?: string
  [key: `strIngredient${number}`]: string | null
  [key: `strMeasure${number}`]: string | null
}

export interface MealDBResponse {
  meals: Meal[] | null
}

export interface ParsedIngredient {
  ingredient: string
  measure: string
}
