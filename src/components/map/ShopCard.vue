<script setup lang="ts">
/**
 * ShopCard component.
 *
 * Displays a summary card for a single Mapbox taco POI: its name, a randomly
 * selected humorous tagline, full address, category chips, and a deep link to
 * Google Maps driving directions.
 *
 * Designed to be rendered both inside the desktop `v-navigation-drawer` panel
 * and the mobile `v-bottom-sheet` panel within `MapView`.
 *
 * @example
 * ```vue
 * <ShopCard :shop="mapStore.selectedShop" />
 * ```
 */
import { computed } from 'vue'
import type { MapboxTacoShop } from '@/types/mapbox'

const props = defineProps<{
  /**
   * The Mapbox POI to render. Must be a fully-hydrated `MapboxTacoShop`
   * record returned by the Mapbox Search Box API.
   */
  shop: MapboxTacoShop
}>()

/**
 * Pool of humorous taco-themed taglines. One is randomly selected on mount.
 */
const quips = [
  'This place slaps harder than a late-night craving.',
  'Rated 🌮🌮🌮 on the Todd Scale.',
  'Your taste buds called. This is their answer.',
  'Certified banger by the Taco Council.',
  "We're not saying it's perfect, but it's pretty close.",
  'The taco gods smile upon this establishment.',
  'Warning: may cause immediate taco obsession.',
  'Life is short. Eat here first.',
  'Scientists confirm: this place cures sadness.',
  'Five out of five tacos. Would recommend. Again and again.',
]

const tagline = quips[Math.floor(Math.random() * quips.length)]

/**
 * Converts a Mapbox category slug (e.g. `"mexican_restaurant"`) into a
 * human-readable label (e.g. `"Mexican Restaurant"`).
 */
function formatCategory(slug: string): string {
  return slug
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Google Maps directions deep-link targeting this shop's coordinates.
 */
const directionsUrl = computed(() => {
  const { latitude, longitude } = props.shop.coordinates
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
})
</script>

<template>
  <v-card color="surface" class="shop-card" rounded="lg">
    <v-card-title class="text-h6 pt-4 pb-1" style="white-space: normal">
      {{ shop.name }}
    </v-card-title>

    <v-card-subtitle class="pb-2 font-italic text-secondary">
      {{ tagline }}
    </v-card-subtitle>

    <v-card-text class="pb-2">
      <!-- Address -->
      <div v-if="shop.full_address" class="d-flex align-start ga-2 mb-3">
        <v-icon size="small" color="accent" aria-hidden="true">mdi-map-marker</v-icon>
        <span class="text-body-2">{{ shop.full_address }}</span>
      </div>

      <!-- Categories -->
      <div v-if="shop.categories.length" class="d-flex flex-wrap ga-1">
        <v-chip
          v-for="category in shop.categories"
          :key="category"
          size="small"
          color="accent"
          variant="tonal"
          :aria-label="`Category: ${formatCategory(category)}`"
        >
          {{ formatCategory(category) }}
        </v-chip>
      </div>
    </v-card-text>

    <v-card-actions class="pa-4 pt-0">
      <v-btn
        variant="outlined"
        color="primary"
        :href="directionsUrl"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Get directions"
      >
        Get Directions
        <v-icon end aria-hidden="true">mdi-directions</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.shop-card {
  min-width: 280px;
}
</style>
