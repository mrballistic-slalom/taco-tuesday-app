<script setup lang="ts">
/**
 * TuesdayShopCard component.
 *
 * Specialised shop card for `TuesdayView`. Renders a Mapbox taco POI with a
 * prominent rank badge (🥇/🥈/🥉 for the top three, a numbered `v-chip` for
 * ranks 4+), the shop's name, a randomly selected Tuesday-themed tagline,
 * full address, category chips, and a Google Maps directions deep-link.
 *
 * Cards are stacked vertically in `TuesdayView` and are only shown when it
 * is actually Tuesday and the Mapbox API has returned results.
 *
 * @example
 * ```vue
 * <TuesdayShopCard
 *   v-for="(spot, index) in tuesdayStore.spots"
 *   :key="spot.id"
 *   :shop="spot"
 *   :rank="index + 1"
 *   class="mb-4"
 * />
 * ```
 */
import { computed } from 'vue'
import type { MapboxTacoShop } from '@/types/mapbox'

const props = defineProps<{
  /**
   * The Mapbox POI to render. Sourced from `tuesdayStore.spots`.
   */
  shop: MapboxTacoShop

  /**
   * 1-based rank in the sorted result list. Ranks 1–3 display medal
   * emoji; ranks 4+ display a numbered chip.
   */
  rank: number
}>()

const taglines = [
  'Your Tuesday just got a whole lot tastier.',
  'The taco gods have spoken.',
  'Tuesday never looked so delicious.',
  'This is your sign. Go get tacos.',
  'Ranked by vibes and the universe.',
  'The taco council endorses this spot.',
]

const tagline = taglines[Math.floor(Math.random() * taglines.length)]

function formatCategory(slug: string): string {
  return slug
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Medal emoji for top-3 ranks, or `null` for ranks 4+ (numbered chip path).
 */
const rankEmoji = computed(() => {
  if (props.rank === 1) return '🥇'
  if (props.rank === 2) return '🥈'
  if (props.rank === 3) return '🥉'
  return null
})

/**
 * Google Maps directions deep-link targeting this shop's coordinates.
 */
const directionsUrl = computed(() => {
  const { latitude, longitude } = props.shop.coordinates
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
})
</script>

<template>
  <v-card color="surface" rounded="lg" class="tuesday-shop-card">
    <div class="rank-badge pa-3">
      <span v-if="rankEmoji" style="font-size: 28px" :aria-label="`Rank ${rank}`">
        {{ rankEmoji }}
      </span>
      <v-chip v-else color="primary" size="small" :aria-label="`Rank ${rank}`">
        #{{ rank }}
      </v-chip>
    </div>

    <v-card-title class="text-h6 pt-2 pb-1 pl-14" style="white-space: normal">
      {{ shop.name }}
    </v-card-title>

    <v-card-subtitle class="pb-2 font-italic text-secondary">
      {{ tagline }}
    </v-card-subtitle>

    <v-card-text class="pb-2">
      <div v-if="shop.full_address" class="d-flex align-start ga-2 mb-3">
        <v-icon size="small" color="accent" aria-hidden="true">mdi-map-marker</v-icon>
        <span class="text-body-2">{{ shop.full_address }}</span>
      </div>

      <div v-if="shop.categories.length" class="d-flex flex-wrap ga-1">
        <v-chip
          v-for="category in shop.categories"
          :key="category"
          size="small"
          color="accent"
          variant="tonal"
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
.tuesday-shop-card {
  position: relative;
}
.rank-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
}
</style>
