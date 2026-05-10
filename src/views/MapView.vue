<script setup lang="ts">
/**
 * MapView — the `/map` route view.
 *
 * The map container is fixed to the full viewport so the glass-frosted nav
 * (left on desktop, bottom on mobile) blurs over it as a single unbroken
 * canvas. A slim glass "count pill" sits top-center: it shows a "finding
 * spots…" state during loading and switches to "🌮 N spots near you" once
 * `mapStore.shops` resolves.
 *
 * Shop selection still opens a right-edge drawer on desktop / bottom sheet
 * on mobile with the full `<ShopCard>` detail. Errors surface in a glass
 * snackbar at the bottom.
 *
 * No props, no emits — all state lives in `mapStore`.
 */
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import TacoMap from '@/components/map/TacoMap.vue'
import ShopCard from '@/components/map/ShopCard.vue'
import { useMapStore } from '@/stores/mapStore'

const mapStore = useMapStore()
const { mdAndUp } = useDisplay()

/**
 * The map center captured from the most recent user pan/zoom. While set,
 * the floating "Search this area" pill is visible. Cleared after a manual
 * re-fetch (`searchHere`) completes or whenever the user navigates away.
 */
const pendingSearchCenter = ref<{ lat: number; lng: number } | null>(null)

function onUserMove(center: { lat: number; lng: number }) {
  pendingSearchCenter.value = center
}

async function searchHere() {
  if (!pendingSearchCenter.value || mapStore.loading) return
  const { lat, lng } = pendingSearchCenter.value
  pendingSearchCenter.value = null
  await mapStore.fetchShops(lat, lng)
}

const snackbarVisible = computed(() => mapStore.error !== null)

/**
 * Label rendered inside the glass count pill at the top of the map.
 * Shows a loading message while shops are in flight, otherwise the
 * spot count once they've resolved.
 */
const countPillLabel = computed(() => {
  if (mapStore.loading) return 'Finding taco spots…'
  if (mapStore.error) return 'No spots loaded'
  const n = mapStore.shops.length
  if (n === 0) return 'No taco spots nearby'
  return `${n} taco spot${n === 1 ? '' : 's'} near you`
})

function closeSelection() {
  mapStore.clearSelection()
}
</script>

<template>
  <div class="map-view">
    <!-- Map fills the full viewport (behind the glass nav) -->
    <TacoMap @user-move="onUserMove" />

    <!-- Glass count pill — replaces the old "Find Tacos Near You" panel.
         Uses its own warm-dark glass tint (not the bone glass-panel utility)
         so it stays legible over the light map basemap. -->
    <div class="count-pill" role="status" aria-live="polite">
      <span class="pill-icon" aria-hidden="true">🌮</span>
      <span class="pill-label">{{ countPillLabel }}</span>
      <span v-if="mapStore.loading" class="pill-dots" aria-hidden="true">
        <span /><span /><span />
      </span>
    </div>

    <!-- "Search this area" pill — only appears after the user pans/zooms
         the map and disappears once they tap it (or the fetch resolves). -->
    <Transition name="search-rise">
      <button
        v-if="pendingSearchCenter && !mapStore.loading"
        class="search-here-btn"
        type="button"
        aria-label="Search this area"
        @click="searchHere"
      >
        <v-icon size="18" aria-hidden="true">mdi-magnify</v-icon>
        <span>Search this area</span>
      </button>
    </Transition>

    <!-- Desktop: a single floating shop card pinned to the right edge.
         Slides in from the right; no drawer slab around it. -->
    <Transition name="card-slide">
      <div
        v-if="mdAndUp && mapStore.selectedShop"
        class="shop-card-float"
        role="dialog"
        aria-label="Shop details"
      >
        <button
          class="card-close-btn"
          type="button"
          aria-label="Close shop details"
          @click="closeSelection"
        >
          <v-icon size="20" aria-hidden="true">mdi-close</v-icon>
        </button>
        <ShopCard :shop="mapStore.selectedShop" />
      </div>
    </Transition>

    <!-- Mobile: floating card pinned to the bottom edge + tap-to-dismiss scrim.
         Same "just the card" treatment as desktop — no Vuetify bottom-sheet
         panel underneath, so the card's own warm glass is the only background. -->
    <Transition name="scrim-fade">
      <div
        v-if="!mdAndUp && mapStore.selectedShop"
        class="shop-scrim"
        aria-hidden="true"
        @click="closeSelection"
      />
    </Transition>
    <Transition name="card-rise">
      <div
        v-if="!mdAndUp && mapStore.selectedShop"
        class="shop-card-float-mobile"
        role="dialog"
        aria-label="Shop details"
      >
        <button
          class="card-close-btn"
          type="button"
          aria-label="Close shop details"
          @click="closeSelection"
        >
          <v-icon size="20" aria-hidden="true">mdi-close</v-icon>
        </button>
        <ShopCard :shop="mapStore.selectedShop" />
      </div>
    </Transition>

    <!-- Error snackbar -->
    <v-snackbar
      :model-value="snackbarVisible"
      color="error"
      timeout="5000"
      location="bottom"
    >
      The taco truck broke down 🚚💨 — couldn't load shops.
      <template #actions>
        <v-btn
          variant="text"
          aria-label="Dismiss error"
          @click="mapStore.error = null"
        >
          Dismiss
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<style scoped>
/* Map container fills the viewport so the glass nav blurs it underneath. */
.map-view :deep(#map) {
  position: fixed !important;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  z-index: 0;
}

.count-pill {
  position: fixed;
  top: 20px;
  /* Center over the visible map area. On desktop the 240px sidebar eats
     the left edge, so shift right by half its width. */
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 999px;
  /* Warm-dark glass so the bone-white text stays legible against the
     light map basemap. */
  background: linear-gradient(
    135deg,
    rgba(60, 15, 22, 0.78) 0%,
    rgba(124, 45, 18, 0.7) 100%
  );
  backdrop-filter: blur(var(--glass-blur)) saturate(160%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(160%);
  border: 1px solid rgba(252, 211, 77, 0.4);
  box-shadow:
    0 8px 24px rgba(20, 6, 8, 0.45),
    0 0 0 1px rgba(255, 248, 240, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  color: var(--taco-bone);
  font-weight: 700;
  font-size: 0.92rem;
  letter-spacing: 0.01em;
  animation: pillIn 320ms cubic-bezier(0.2, 0.9, 0.25, 1.1) both;
  max-width: calc(100vw - 32px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pill-icon {
  font-size: 18px;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.35));
}

.pill-label {
  text-shadow: 0 1px 3px rgba(20, 6, 8, 0.45);
}

.pill-dots {
  display: inline-flex;
  gap: 3px;
  margin-left: 2px;
}

.pill-dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--taco-marigold);
  animation: dotPulse 1.2s ease-in-out infinite;
}

.pill-dots span:nth-child(2) {
  animation-delay: 0.15s;
}

.pill-dots span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes pillIn {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes dotPulse {
  0%,
  100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
}

/* "Search this area" floating pill — bottom-center on desktop, raised
   above the bottom nav on mobile. */
.search-here-btn {
  position: fixed;
  bottom: 32px;
  /* Centered over the visible map area; offset right of the desktop sidebar. */
  left: 50%;
  z-index: 5;
  translate: -50% 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 999px;
  border: 1px solid rgba(252, 211, 77, 0.45);
  background: linear-gradient(
    135deg,
    rgba(255, 107, 53, 0.92) 0%,
    rgba(225, 29, 72, 0.88) 100%
  );
  color: var(--taco-bone);
  font-weight: 700;
  font-size: 0.92rem;
  letter-spacing: 0.01em;
  cursor: pointer;
  box-shadow:
    0 12px 28px rgba(255, 107, 53, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  transition: scale 0.18s cubic-bezier(0.2, 0.9, 0.25, 1.2),
    box-shadow 0.18s ease;
}

.search-here-btn:hover,
.search-here-btn:focus-visible {
  scale: 1.04;
  box-shadow:
    0 14px 32px rgba(255, 107, 53, 0.55),
    0 0 0 1px rgba(255, 255, 255, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
  outline: none;
}

.search-here-btn:active {
  scale: 0.98;
}

@media (max-width: 959.98px) {
  .search-here-btn {
    bottom: 76px;
  }
}

/* Desktop only: offset both floating chrome elements past the 240px sidebar
   so they sit centered over the map, not the whole viewport. */
@media (min-width: 960px) {
  .count-pill {
    left: calc(50% + 120px);
  }
  .search-here-btn {
    left: calc(50% + 120px);
  }
  .search-rise-enter-from {
    translate: -50% 28px;
  }
  .search-rise-leave-to {
    translate: -50% 12px;
  }
}

.search-rise-enter-active,
.search-rise-leave-active {
  transition: opacity 0.26s ease, translate 0.32s cubic-bezier(0.2, 0.9, 0.25, 1.15);
}

.search-rise-enter-from {
  opacity: 0;
  translate: -50% 28px;
}
.search-rise-leave-to {
  opacity: 0;
  translate: -50% 12px;
}

/* Floating shop card (desktop only) — slides in from the right edge. */
.shop-card-float {
  position: fixed;
  top: 88px;
  right: 24px;
  width: 360px;
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 120px);
  z-index: 6;
  overflow: visible;
}

.card-close-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  z-index: 2;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(60, 15, 22, 0.92) 0%, rgba(20, 6, 8, 0.92) 100%);
  border: 1px solid rgba(252, 211, 77, 0.42);
  color: var(--taco-bone);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(20, 6, 8, 0.45);
  transition: background 0.18s ease, scale 0.18s cubic-bezier(0.2, 0.9, 0.25, 1.2);
}

.card-close-btn:hover,
.card-close-btn:focus-visible {
  background: linear-gradient(135deg, rgba(225, 29, 72, 0.9) 0%, rgba(124, 45, 18, 0.92) 100%);
  scale: 1.08;
  outline: none;
}

.card-slide-enter-active,
.card-slide-leave-active {
  transition: opacity 0.28s ease, translate 0.32s cubic-bezier(0.2, 0.9, 0.25, 1.1);
}

.card-slide-enter-from,
.card-slide-leave-to {
  opacity: 0;
  translate: 36px 0;
}

/* Mobile shop card — anchored to the bottom, above the bottom nav. */
.shop-card-float-mobile {
  position: fixed;
  bottom: 76px;
  left: 16px;
  right: 16px;
  z-index: 7;
}

.shop-scrim {
  position: fixed;
  inset: 0;
  background: rgba(20, 6, 8, 0.5);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  z-index: 6;
}

.scrim-fade-enter-active,
.scrim-fade-leave-active {
  transition: opacity 0.24s ease;
}
.scrim-fade-enter-from,
.scrim-fade-leave-to {
  opacity: 0;
}

.card-rise-enter-active,
.card-rise-leave-active {
  transition: opacity 0.28s ease, translate 0.32s cubic-bezier(0.2, 0.9, 0.25, 1.1);
}
.card-rise-enter-from,
.card-rise-leave-to {
  opacity: 0;
  translate: 0 30px;
}

@media (prefers-reduced-motion: reduce) {
  .count-pill,
  .pill-dots span {
    animation: none;
  }
}
</style>
