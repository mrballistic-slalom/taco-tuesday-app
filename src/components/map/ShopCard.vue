<script setup lang="ts">
import type { YelpBusiness } from '@/types/yelp'

const props = defineProps<{
  shop: YelpBusiness
}>()

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
