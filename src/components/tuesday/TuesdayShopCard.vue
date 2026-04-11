<script setup lang="ts">
/**
 * TuesdayShopCard component.
 *
 * A specialised variant of the shop card used exclusively in `TuesdayView`.
 * It renders a Yelp business with a prominent rank badge (🥇/🥈/🥉 medals
 * for the top-3 spots, a numbered `v-chip` for ranks 4–10) overlaid on the
 * cover photo, plus the shop's name, a randomly selected Tuesday-themed
 * tagline, star rating, address, price range, and a Yelp deep-link button.
 *
 * Cards are stacked vertically in `TuesdayView` and are only shown when it
 * is actually Tuesday and the Yelp API has returned results.
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
import type { YelpBusiness } from '@/types/yelp'

/**
 * Props accepted by the TuesdayShopCard component.
 */
const props = defineProps<{
  /**
   * The Yelp business to render. Must be a fully-hydrated `YelpBusiness`
   * record sourced from the Yelp proxy endpoint via `tuesdayStore`.
   */
  shop: YelpBusiness

  /**
   * 1-based rank of this shop in the sorted result list.
   * Ranks 1–3 display medal emoji; ranks 4+ display a numbered chip.
   */
  rank: number
}>()

/**
 * Pool of six Tuesday-specific taglines.
 * One is randomly selected once per component mount to give each card a
 * unique flavour without requiring network data.
 */
const taglines = [
  'Your Tuesday just got a whole lot tastier.',
  'The taco gods have spoken.',
  'Tuesday never looked so delicious.',
  'This is your sign. Go get tacos.',
  'Ranked by vibes and the universe.',
  'The taco council endorses this spot.',
]

/**
 * A randomly selected tagline from the `taglines` pool.
 * Stable for the lifetime of this card instance.
 */
const tagline = taglines[Math.floor(Math.random() * taglines.length)]

/**
 * The shop's full street address as a single comma-separated string,
 * constructed by joining the `display_address` array from the Yelp payload.
 *
 * @example "456 NW 23rd Ave, Portland, OR 97210"
 */
const address = props.shop.location.display_address.join(', ')

/**
 * Maps the numeric rank to a medal emoji for the top-3 positions, or
 * `null` for ranks 4 and above (which fall back to a numbered chip in
 * the template).
 *
 * @returns {'🥇' | '🥈' | '🥉' | null} Medal emoji, or null for rank > 3.
 *
 * @example
 * // rank === 1 → '🥇'
 * // rank === 4 → null  (template renders "#4" chip instead)
 */
const rankEmoji = computed(() => {
  if (props.rank === 1) return '🥇'
  if (props.rank === 2) return '🥈'
  if (props.rank === 3) return '🥉'
  return null
})
</script>

<template>
  <v-card color="surface" rounded="lg" class="tuesday-shop-card">
    <v-img
      v-if="shop.image_url"
      :src="shop.image_url"
      :alt="`Photo of ${shop.name}`"
      height="180"
      cover
    />

    <div class="rank-badge pa-3">
      <span v-if="rankEmoji" style="font-size: 28px" :aria-label="`Rank ${rank}`">
        {{ rankEmoji }}
      </span>
      <v-chip v-else color="primary" size="small" :aria-label="`Rank ${rank}`">
        #{{ rank }}
      </v-chip>
    </div>

    <v-card-title class="text-h6 pt-2 pb-1" style="white-space: normal">
      {{ shop.name }}
    </v-card-title>

    <v-card-subtitle class="pb-2 font-italic text-secondary">
      {{ tagline }}
    </v-card-subtitle>

    <v-card-text class="pb-2">
      <div class="d-flex align-center ga-2 mb-2">
        <v-rating
          :model-value="shop.rating"
          readonly
          half-increments
          density="compact"
          color="secondary"
          active-color="secondary"
          aria-label="Shop rating"
        />
        <span class="text-body-2 text-medium-emphasis">({{ shop.review_count }} reviews)</span>
      </div>

      <div class="d-flex align-start ga-2 mb-3">
        <v-icon size="small" color="accent" aria-hidden="true">mdi-map-marker</v-icon>
        <span class="text-body-2">{{ address }}</span>
      </div>

      <div class="d-flex flex-wrap ga-1">
        <v-chip v-if="shop.price" size="small" color="primary" variant="tonal">
          {{ shop.price }}
        </v-chip>
      </div>
    </v-card-text>

    <v-card-actions class="pa-4 pt-0">
      <v-btn
        variant="outlined"
        color="primary"
        :href="shop.url"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View on Yelp"
      >
        View on Yelp
        <v-icon end aria-hidden="true">mdi-open-in-new</v-icon>
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
