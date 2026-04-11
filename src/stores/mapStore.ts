import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { YelpBusiness } from '@/types/yelp'
import { useYelp } from '@/composables/useYelp'

export const useMapStore = defineStore('map', () => {
  const shops = ref<YelpBusiness[]>([])
  const selectedShop = ref<YelpBusiness | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchShops(lat: number, lng: number) {
    loading.value = true
    error.value = null
    try {
      const { searchTacoShops } = useYelp()
      shops.value = await searchTacoShops(lat, lng)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      shops.value = []
    } finally {
      loading.value = false
    }
  }

  function selectShop(shop: YelpBusiness) {
    selectedShop.value = shop
  }

  function clearSelection() {
    selectedShop.value = null
  }

  return { shops, selectedShop, loading, error, fetchShops, selectShop, clearSelection }
})
