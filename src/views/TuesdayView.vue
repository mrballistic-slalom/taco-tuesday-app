<script setup lang="ts">
/**
 * TuesdayView — the `/tuesday` route view.
 *
 * Two distinct experiences based on `useTuesdayCheck`:
 *
 * **It IS Tuesday** — Full celebration: papel-picado banner strip across the
 *   top, animated warm-gradient hero, bobbing taco emoji, sub-headline, and
 *   a ranked list of nearby spots. The #1 spot gets the "Today's Champion"
 *   glow treatment.
 *
 * **It is NOT Tuesday** — `<TuesdayBanner>` with countdown.
 *
 * Data flow on mount (Tuesday only): resolve geolocation (Portland fallback),
 * call `tuesdayStore.fetchSpots`. Errors surface in a snackbar; unmount
 * clears the store to prevent stale data on return.
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { useTuesdayCheck } from '@/composables/useTuesdayCheck'
import { useGeolocation } from '@/composables/useGeolocation'
import { useTuesdayStore } from '@/stores/tuesdayStore'
import FiestaOverlay from '@/components/tuesday/FiestaOverlay.vue'
import TuesdayBanner from '@/components/tuesday/TuesdayBanner.vue'
import TuesdayShopCard from '@/components/tuesday/TuesdayShopCard.vue'

const { isTuesday } = useTuesdayCheck()
const { getLocation } = useGeolocation()
const tuesdayStore = useTuesdayStore()
const showError = ref(false)

onMounted(async () => {
  if (!isTuesday.value) return

  let lat = 45.5231
  let lng = -122.6765

  try {
    const location = await getLocation()
    lat = location.lat
    lng = location.lng
  } catch {
    // Fall back to Portland silently
  }

  await tuesdayStore.fetchSpots(lat, lng)

  if (tuesdayStore.error) {
    showError.value = true
  }
})

onUnmounted(() => {
  tuesdayStore.clear()
})
</script>

<template>
  <div v-if="isTuesday" class="tuesday-view">
    <FiestaOverlay />

    <!-- Papel picado strip across the top -->
    <div class="papel-strip" aria-hidden="true">
      <svg
        viewBox="0 0 240 40"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="papel" x="0" y="0" width="60" height="40" patternUnits="userSpaceOnUse">
            <!-- A single banderita: rectangle with cut-out diamond + dots -->
            <path
              d="M0 0 H56 V26 L46 36 H10 L0 26 Z"
              fill="#fcd34d"
              stroke="#e11d48"
              stroke-width="0.6"
            />
            <circle cx="28" cy="12" r="3.5" fill="rgba(0,0,0,0.18)" />
            <circle cx="14" cy="20" r="1.8" fill="rgba(0,0,0,0.16)" />
            <circle cx="42" cy="20" r="1.8" fill="rgba(0,0,0,0.16)" />
            <path d="M28 32 L24 28 L32 28 Z" fill="rgba(0,0,0,0.14)" />
            <line x1="0" y1="0" x2="60" y2="0" stroke="#7c2d12" stroke-width="1.5" />
          </pattern>
        </defs>
        <rect width="240" height="40" fill="url(#papel)" />
      </svg>
    </div>

    <div class="tuesday-hero">
      <div class="hero-eyebrow">Today's the day</div>
      <h1 class="hero-headline">
        <span>It's</span>
        <span class="hero-emphasis">Taco Tuesday</span>
        <span>, baby</span>
      </h1>
      <div class="hero-emojis" aria-hidden="true">
        <span class="emoji-bob delay-0">🌮</span>
        <span class="emoji-bob delay-1">🥑</span>
        <span class="emoji-bob delay-2">🌶️</span>
        <span class="emoji-bob delay-3">🌮</span>
        <span class="emoji-bob delay-4">🧀</span>
      </div>
      <p class="hero-sub">Your nearest Taco Tuesday spots, ranked and ready.</p>
    </div>

    <v-container class="spot-list-container">
      <v-progress-circular
        v-if="tuesdayStore.loading"
        indeterminate
        color="secondary"
        size="64"
        class="d-flex mx-auto my-8"
      />
      <div v-else-if="tuesdayStore.error">
        <v-snackbar v-model="showError" timeout="5000" color="error">
          Couldn't find Taco Tuesday spots nearby. Your city might just not deserve tacos. 😤
        </v-snackbar>
      </div>
      <div v-else-if="!tuesdayStore.hasSpots" class="empty-state">
        <span class="empty-emoji" aria-hidden="true">🕵️</span>
        <p>The map's coming up empty. Go find your own Tuesday tacos.</p>
      </div>
      <div v-else class="spot-list">
        <TuesdayShopCard
          v-for="(spot, index) in tuesdayStore.spots"
          :key="spot.id"
          :shop="spot"
          :rank="index + 1"
          :is-champion="index === 0"
          class="spot-card"
          :style="{ animationDelay: `${index * 60}ms` }"
        />
      </div>
    </v-container>
  </div>
  <div v-else>
    <TuesdayBanner />
  </div>
</template>

<style scoped>
.tuesday-view {
  min-height: 100vh;
  padding-bottom: 48px;
}

/* === Papel picado strip === */
.papel-strip {
  width: 100%;
  height: 44px;
  overflow: hidden;
  filter: drop-shadow(0 4px 10px rgba(20, 6, 8, 0.4));
}

.papel-strip svg {
  width: 100%;
  height: 100%;
  display: block;
  animation: papelSway 6s ease-in-out infinite;
  transform-origin: top center;
}

@keyframes papelSway {
  0%,
  100% {
    transform: rotate(-0.4deg) translateY(0);
  }
  50% {
    transform: rotate(0.4deg) translateY(1px);
  }
}

/* === Hero === */
.tuesday-hero {
  text-align: center;
  padding: 36px 16px 28px;
  position: relative;
}

.hero-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.32em;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--taco-marigold);
  margin-bottom: 12px;
  text-shadow: 0 1px 6px rgba(20, 6, 8, 0.5);
}

.hero-headline {
  font-family: 'Yatra One', cursive;
  font-size: clamp(2.4rem, 7vw, 4.6rem);
  line-height: 1.05;
  margin: 0;
  color: var(--taco-bone);
  text-shadow: 0 4px 18px rgba(20, 6, 8, 0.55);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0 0.35em;
}

.hero-emphasis {
  background: linear-gradient(180deg, #fff8f0 0%, #fcd34d 55%, #ff6b35 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: heroPulse 3s ease-in-out infinite;
}

.hero-emojis {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 18px;
  font-size: clamp(2rem, 6vw, 2.6rem);
}

.emoji-bob {
  display: inline-block;
  animation: bobEmoji 2.4s ease-in-out infinite;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.45));
}
.emoji-bob.delay-0 { animation-delay: 0s; }
.emoji-bob.delay-1 { animation-delay: 0.15s; }
.emoji-bob.delay-2 { animation-delay: 0.3s; }
.emoji-bob.delay-3 { animation-delay: 0.45s; }
.emoji-bob.delay-4 { animation-delay: 0.6s; }

.hero-sub {
  margin-top: 22px;
  font-size: 1rem;
  color: rgba(255, 248, 240, 0.85);
  font-style: italic;
}

@keyframes bobEmoji {
  0%,
  100% {
    transform: translateY(0) rotate(-3deg);
  }
  50% {
    transform: translateY(-12px) rotate(4deg);
  }
}

@keyframes heroPulse {
  0%,
  100% {
    filter: drop-shadow(0 0 0 rgba(252, 211, 77, 0));
  }
  50% {
    filter: drop-shadow(0 0 22px rgba(252, 211, 77, 0.6));
  }
}

/* === Spot list === */
.spot-list-container {
  max-width: 720px;
}

.spot-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.spot-card {
  animation: cardIn 420ms ease-out both;
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-state {
  text-align: center;
  padding: 48px 16px;
  color: rgba(255, 248, 240, 0.85);
  font-size: 1.05rem;
}

.empty-emoji {
  display: block;
  font-size: 56px;
  margin-bottom: 12px;
  filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.4));
}

@media (prefers-reduced-motion: reduce) {
  .papel-strip svg,
  .emoji-bob,
  .hero-emphasis,
  .spot-card {
    animation: none;
  }
}
</style>
