<script setup lang="ts">
/**
 * ShopCard component.
 *
 * Displays a rich summary card for a single Yelp taco shop, including its
 * cover photo, a randomly selected humorous tagline, star rating, address,
 * price range, category chips, and a deep-link button to the Yelp listing.
 *
 * Designed to be rendered both inside the desktop `v-navigation-drawer` panel
 * and the mobile `v-bottom-sheet` panel within `MapView`.
 *
 * @example
 * ```vue
 * <ShopCard :shop="mapStore.selectedShop" />
 * ```
 */
import type { YelpBusiness } from '@/types/yelp'

/**
 * Props accepted by the ShopCard component.
 */
const props = defineProps<{
  /**
   * The Yelp business object to render. Must be a fully-hydrated
   * `YelpBusiness` record returned by the Yelp proxy endpoint.
   */
  shop: YelpBusiness
}>()

/**
 * Pool of humorous taco-themed taglines.
 * One is randomly selected on each component mount to give each
 * shop card a unique, fun personality without requiring external data.
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

/**
 * A randomly selected tagline from the `quips` pool.
 * Evaluated once at component setup time — stays stable for the lifetime
 * of this card instance.
 */
const tagline = quips[Math.floor(Math.random() * quips.length)]

/**
 * The shop's full street address as a single comma-separated string,
 * derived by joining the `display_address` array from the Yelp API response.
 *
 * @example "123 SE Burnside St, Portland, OR 97214"
 */
const address = props.shop.location.display_address.join(', ')
</script>

<template>
  <v-card color="surface" class="shop-card" rounded="lg">
    <v-img
      v-if="shop.image_url"
      :src="shop.image_url"
      :alt="`Photo of ${shop.name}`"
      height="180"
      cover
    />

    <v-card-title class="text-h6 pt-4 pb-1" style="white-space: normal">
      {{ shop.name }}
    </v-card-title>

    <v-card-subtitle class="pb-2 font-italic text-secondary">
      {{ tagline }}
    </v-card-subtitle>

    <v-card-text class="pb-2">
      <!-- Rating -->
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
        <span class="text-body-2 text-medium-emphasis">
          ({{ shop.review_count }} reviews)
        </span>
      </div>

      <!-- Address -->
      <div class="d-flex align-start ga-2 mb-3">
        <v-icon size="small" color="accent" aria-hidden="true">mdi-map-marker</v-icon>
        <span class="text-body-2">{{ address }}</span>
      </div>

      <!-- Price + Categories -->
      <div class="d-flex flex-wrap ga-1">
        <v-chip
          v-if="shop.price"
          size="small"
          color="primary"
          variant="tonal"
          aria-label="`Price range: ${shop.price}`"
        >
          {{ shop.price }}
        </v-chip>
        <v-chip
          v-for="category in shop.categories"
          :key="category.alias"
          size="small"
          color="accent"
          variant="tonal"
          :aria-label="`Category: ${category.title}`"
        >
          {{ category.title }}
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
.shop-card {
  min-width: 280px;
}
</style>
