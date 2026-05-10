<script setup lang="ts">
/**
 * TuesdayShopCard — glass card for a single ranked Taco Tuesday spot.
 *
 * Ranks 1–3 wear medal emoji; ranks 4+ get a numbered chip. When `isChampion`
 * is true (typically rank 1), the card gets a glowing marigold border, a
 * "Today's Champion" eyebrow ribbon, and a slow shimmer animation. Mapbox
 * doesn't return ratings, prices, or photos, so cards lead with name +
 * address + category chips + a Google Maps directions deep link.
 */
import { computed } from 'vue'
import type { MapboxTacoShop } from '@/types/mapbox'

const props = defineProps<{
  shop: MapboxTacoShop
  rank: number
  /**
   * When `true`, applies the "Today's Champion" glow + ribbon treatment.
   * `TuesdayView` passes this for the first spot in the ranked list.
   */
  isChampion?: boolean
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

const rankEmoji = computed(() => {
  if (props.rank === 1) return '🥇'
  if (props.rank === 2) return '🥈'
  if (props.rank === 3) return '🥉'
  return null
})

const directionsUrl = computed(() => {
  const { latitude, longitude } = props.shop.coordinates
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
})
</script>

<template>
  <article
    class="tuesday-shop-card glass-panel-strong"
    :class="{ champion: isChampion }"
  >
    <div v-if="isChampion" class="champion-ribbon" aria-hidden="true">
      <span class="ribbon-crown">👑</span>
      <span>Today's Champion</span>
    </div>

    <div class="rank-badge">
      <span v-if="rankEmoji" class="rank-emoji" :aria-label="`Rank ${rank}`">{{ rankEmoji }}</span>
      <span v-else class="rank-number" :aria-label="`Rank ${rank}`">#{{ rank }}</span>
    </div>

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
.tuesday-shop-card {
  position: relative;
  border-radius: 18px;
  color: var(--taco-bone);
  overflow: hidden;
  padding: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.tuesday-shop-card:hover {
  transform: translateY(-2px);
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

.rank-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-emoji {
  font-size: 34px;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.45));
}

.rank-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff6b35 0%, #e11d48 100%);
  color: var(--taco-bone);
  font-family: 'Yatra One', cursive;
  font-size: 0.95rem;
  box-shadow:
    0 4px 12px rgba(255, 107, 53, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.card-header {
  padding: 18px 64px 8px 22px;
}

.shop-name {
  font-family: 'Yatra One', cursive;
  font-size: 1.55rem;
  margin: 0 0 6px;
  line-height: 1.2;
  color: var(--taco-bone);
}

.tagline {
  margin: 0;
  font-size: 0.9rem;
  font-style: italic;
  color: var(--taco-marigold);
}

.card-body {
  padding: 8px 22px 14px;
}

.address-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.94rem;
  color: rgba(255, 248, 240, 0.88);
  margin-bottom: 14px;
  line-height: 1.45;
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
  padding: 6px 22px 20px;
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

/* === Champion treatment === */
.tuesday-shop-card.champion {
  border: 1px solid rgba(252, 211, 77, 0.55);
  box-shadow:
    0 12px 36px rgba(20, 6, 8, 0.45),
    0 0 0 1px rgba(252, 211, 77, 0.35),
    0 0 32px rgba(252, 211, 77, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  animation: championShimmer 4s ease-in-out infinite;
}

.tuesday-shop-card.champion .card-strip {
  height: 6px;
  background: linear-gradient(
    90deg,
    #fcd34d 0%,
    #ff6b35 50%,
    #fcd34d 100%
  );
  background-size: 200% 100%;
  animation: stripeShift 3s linear infinite;
}

.champion-ribbon {
  position: absolute;
  top: 14px;
  left: 0;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px 6px 12px;
  background: linear-gradient(135deg, #fcd34d 0%, #ff6b35 100%);
  color: #2a0e0e;
  font-family: 'Yatra One', cursive;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  border-radius: 0 999px 999px 0;
  box-shadow:
    0 4px 14px rgba(252, 211, 77, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.ribbon-crown {
  font-size: 1rem;
}

@keyframes championShimmer {
  0%,
  100% {
    box-shadow:
      0 12px 36px rgba(20, 6, 8, 0.45),
      0 0 0 1px rgba(252, 211, 77, 0.35),
      0 0 32px rgba(252, 211, 77, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.22);
  }
  50% {
    box-shadow:
      0 14px 42px rgba(20, 6, 8, 0.5),
      0 0 0 1px rgba(252, 211, 77, 0.55),
      0 0 48px rgba(252, 211, 77, 0.55),
      inset 0 1px 0 rgba(255, 255, 255, 0.32);
  }
}

@keyframes stripeShift {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 200% 0;
  }
}

/* Champion ribbon pushes the header right a bit so it doesn't collide */
.tuesday-shop-card.champion .card-header {
  padding-top: 50px;
}

@media (prefers-reduced-motion: reduce) {
  .tuesday-shop-card,
  .tuesday-shop-card.champion,
  .tuesday-shop-card.champion .card-strip {
    animation: none;
  }
}
</style>
