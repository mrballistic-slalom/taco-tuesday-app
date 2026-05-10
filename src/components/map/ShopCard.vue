<script setup lang="ts">
/**
 * ShopCard — frosted-glass detail card for a single Mapbox taco POI.
 *
 * Used in both the desktop right-drawer and the mobile bottom-sheet inside
 * `MapView`. Renders the shop name, a randomly selected tagline, full
 * address, category chips with friendly emoji prefixes, and a deep link to
 * Google Maps driving directions. Mapbox does not supply ratings, prices,
 * or photos — those Yelp-era fields are intentionally absent.
 */
import { computed } from 'vue'
import type { MapboxTacoShop } from '@/types/mapbox'

const props = defineProps<{
  shop: MapboxTacoShop
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

const CATEGORY_EMOJI: Record<string, string> = {
  mexican_restaurant: '🇲🇽',
  taco_shop: '🌮',
  restaurant: '🍽️',
  food: '🍴',
  food_truck: '🚚',
  fast_food_restaurant: '🥡',
  bar: '🍻',
  cafe: '☕',
  bakery: '🥐',
  ice_cream: '🍦',
}

function formatCategory(slug: string): string {
  return slug
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function categoryEmoji(slug: string): string {
  return CATEGORY_EMOJI[slug] ?? '✦'
}

const directionsUrl = computed(() => {
  const { latitude, longitude } = props.shop.coordinates
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
})
</script>

<template>
  <article class="shop-card">
    <div class="card-strip" aria-hidden="true" />

    <header class="card-header">
      <h3 class="shop-name">{{ shop.name }}</h3>
      <p class="tagline">{{ tagline }}</p>
    </header>

    <div class="card-body">
      <div v-if="shop.full_address" class="address-row">
        <v-icon size="small" color="secondary" aria-hidden="true">mdi-map-marker</v-icon>
        <span>{{ shop.full_address }}</span>
      </div>

      <div v-if="shop.categories.length" class="chip-row">
        <span
          v-for="category in shop.categories"
          :key="category"
          class="category-chip"
          :aria-label="`Category: ${formatCategory(category)}`"
        >
          <span class="chip-emoji" aria-hidden="true">{{ categoryEmoji(category) }}</span>
          {{ formatCategory(category) }}
        </span>
      </div>
    </div>

    <footer class="card-actions">
      <a
        class="directions-btn"
        :href="directionsUrl"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Get directions"
      >
        <span>Get Directions</span>
        <v-icon size="small" aria-hidden="true">mdi-arrow-top-right</v-icon>
      </a>
    </footer>
  </article>
</template>

<style scoped>
.shop-card {
  position: relative;
  border-radius: 18px;
  color: var(--taco-bone);
  min-width: 280px;
  overflow: hidden;
  padding: 0;
  /* Warm-dark glass — the card lives over a light faded map, so a bone
     tint would disappear. Same recipe as the count pill. */
  background: linear-gradient(
    135deg,
    rgba(60, 15, 22, 0.86) 0%,
    rgba(124, 45, 18, 0.78) 100%
  );
  backdrop-filter: blur(var(--glass-blur)) saturate(160%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(160%);
  border: 1px solid rgba(252, 211, 77, 0.32);
  box-shadow:
    0 18px 48px rgba(20, 6, 8, 0.5),
    0 0 0 1px rgba(255, 248, 240, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.card-strip {
  height: 4px;
  background: linear-gradient(
    90deg,
    #e11d48 0%,
    #ff6b35 40%,
    #fcd34d 75%,
    #06d6a0 100%
  );
}

.card-header {
  padding: 18px 20px 8px;
}

.shop-name {
  font-family: 'Yatra One', cursive;
  font-size: 1.45rem;
  margin: 0 0 6px;
  color: var(--taco-bone);
  line-height: 1.2;
}

.tagline {
  margin: 0;
  font-size: 0.88rem;
  font-style: italic;
  color: var(--taco-marigold);
}

.card-body {
  padding: 8px 20px 14px;
}

.address-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.92rem;
  color: rgba(255, 248, 240, 0.88);
  margin-bottom: 14px;
  line-height: 1.4;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(6, 214, 160, 0.16);
  border: 1px solid rgba(6, 214, 160, 0.32);
  color: var(--taco-bone);
  font-size: 0.78rem;
  font-weight: 600;
}

.chip-emoji {
  font-size: 0.9rem;
  line-height: 1;
}

.card-actions {
  padding: 6px 20px 18px;
}

.directions-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff6b35 0%, #e11d48 100%);
  color: var(--taco-bone);
  font-weight: 700;
  font-size: 0.92rem;
  text-decoration: none;
  letter-spacing: 0.01em;
  box-shadow:
    0 6px 18px rgba(255, 107, 53, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.directions-btn:hover {
  transform: translateY(-1px);
  box-shadow:
    0 10px 24px rgba(255, 107, 53, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.directions-btn:active {
  transform: translateY(0);
}
</style>
