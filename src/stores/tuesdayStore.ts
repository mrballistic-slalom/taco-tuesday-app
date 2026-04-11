import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { YelpBusiness } from '@/types/yelp'
import { useYelp } from '@/composables/useYelp'

export const useTuesdayStore = defineStore('tuesday', () => {
  const spots = ref<YelpBusiness[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const hasSpots = computed(() => spots.value.length > 0)

  async function fetchSpots(lat: number, lng: number) {
    loading.value = true
    error.value = null
    try {
      const { searchTacoTuesdayShops } = useYelp()
      spots.value = await searchTacoTuesdayShops(lat, lng)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      spots.value = []
    } finally {
      loading.value = false
    }
  }

  function clear() {
    spots.value = []
    error.value = null
  }

  return { spots, loading, error, hasSpots, fetchSpots, clear }
})
