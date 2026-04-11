import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Meal } from '@/types/mealdb'
import { useMealDB } from '@/composables/useMealDB'

export const useRandomizerStore = defineStore('randomizer', () => {
  const isSpinning = ref(false)
  const result = ref<Meal | null>(null)
  const error = ref<string | null>(null)

  async function spin(tacoType: string) {
    isSpinning.value = true
    error.value = null
    result.value = null
    try {
      const { searchMeals } = useMealDB()
      const meals = await searchMeals(tacoType)
      if (meals.length === 0) {
        error.value = `TheMealDB is taco-less for '${tacoType}'. The audacity. Try again! 🌮`
      } else {
        result.value = meals[0]
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      isSpinning.value = false
    }
  }

  function reset() {
    result.value = null
    error.value = null
    isSpinning.value = false
  }

  return { isSpinning, result, error, spin, reset }
})
