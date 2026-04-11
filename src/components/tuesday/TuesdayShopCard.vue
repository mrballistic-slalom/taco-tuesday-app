<script setup lang="ts">
import { computed } from 'vue'
import type { YelpBusiness } from '@/types/yelp'

const props = defineProps<{
  shop: YelpBusiness
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

const address = props.shop.location.display_address.join(', ')

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
