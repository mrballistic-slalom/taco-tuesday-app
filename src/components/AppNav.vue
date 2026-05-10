<script setup lang="ts">
/**
 * AppNav component.
 *
 * Primary navigation, rendered as a glass-frosted permanent drawer on
 * desktop (≥ md) or a glass-frosted bottom navigation bar on mobile.
 * On Tuesdays — and only when the user has not requested reduced motion —
 * the "Taco Tuesday" nav item picks up a soft marigold glow that pulses
 * gently. The drawer body itself stays calm; the fiesta is a tasteful
 * accent, not a background-color rave.
 *
 * @example
 * ```vue
 * <!-- Used once in App.vue, outside the router-view -->
 * <AppNav />
 * ```
 */
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useFiestaMode } from '@/composables/useFiestaMode'

const route = useRoute()
const router = useRouter()
const display = useDisplay()
const { isActive } = useFiestaMode()

/**
 * Whether the OS reports `prefers-reduced-motion: reduce`. Resolved on mount
 * and used to suppress the Tuesday glow animation.
 */
const reducedMotion = ref(false)

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  randomFact.value = tacoFacts[Math.floor(Math.random() * tacoFacts.length)]
})

const tacoFacts = [
  'Americans eat over 4.5 billion tacos a year!',
  'The word "taco" predates Europeans arriving in Mexico.',
  'The first hard-shell taco recipe appeared in 1949.',
  'Tacos are the most popular Mexican food in the US.',
  'October 4th is National Taco Day.',
]

const randomFact = ref('')

const navItems = [
  { label: 'Find Tacos', path: '/map', icon: 'mdi-map-marker-radius' },
  { label: 'Recipes', path: '/recipes', icon: 'mdi-book-open-variant' },
  { label: 'Spin It', path: '/randomizer', icon: 'mdi-slot-machine' },
  { label: 'Taco Tuesday', path: '/tuesday', icon: 'mdi-party-popper' },
]

const currentRoute = computed(() => route.path)

function navigate(path: string) {
  router.push(path)
}

/**
 * Whether the Tuesday-only marigold glow effect should render on the
 * "Taco Tuesday" nav item.
 */
const tuesdayGlowOn = computed(() => isActive.value && !reducedMotion.value)
</script>

<template>
  <template v-if="display.mdAndUp.value">
    <!-- Desktop: glass-frosted permanent drawer -->
    <v-navigation-drawer permanent width="240" floating class="taco-nav-drawer">
      <div class="nav-logo">
        <span class="logo-emoji" aria-hidden="true">🌮</span>
        <span class="logo-text">Tacology</span>
      </div>

      <div class="nav-divider" />

      <v-list nav class="nav-list mt-2">
        <v-list-item
          v-for="item in navItems"
          :key="item.path"
          :prepend-icon="item.icon"
          :title="item.label"
          :active="currentRoute === item.path"
          color="primary"
          rounded="lg"
          :class="{ 'tuesday-glow': item.path === '/tuesday' && tuesdayGlowOn }"
          @click="navigate(item.path)"
        />
      </v-list>

      <template #append>
        <div class="pa-3 nav-footer">
          <div class="taco-fact">
            <span class="fact-bullet" aria-hidden="true">✦</span>
            <span>{{ randomFact }}</span>
          </div>
          <a
            href="https://github.com/mrballistic-slalom/taco-tuesday-app"
            target="_blank"
            rel="noopener noreferrer"
            class="github-link"
            aria-label="View source on GitHub"
          >
            <v-icon size="14" class="mr-1">mdi-github</v-icon>
            <span class="text-caption">View source</span>
          </a>
        </div>
      </template>
    </v-navigation-drawer>
  </template>

  <template v-else>
    <!-- Mobile: glass-frosted bottom navigation -->
    <v-bottom-navigation
      :model-value="currentRoute"
      color="#FF6B35"
      class="taco-nav-bottom"
    >
      <v-btn
        v-for="item in navItems"
        :key="item.path"
        :value="item.path"
        :class="{ 'tuesday-glow': item.path === '/tuesday' && tuesdayGlowOn }"
        @click="navigate(item.path)"
      >
        <v-icon>{{ item.icon }}</v-icon>
        <span>{{ item.label }}</span>
      </v-btn>
    </v-bottom-navigation>
  </template>
</template>

<style scoped>
/* === Desktop drawer === */
.taco-nav-drawer :deep(.v-navigation-drawer__content) {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(160%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(160%);
}

.taco-nav-drawer :deep(.v-navigation-drawer) {
  border: none;
  border-right: 1px solid var(--glass-border) !important;
  box-shadow: var(--glass-shadow);
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px 14px;
  background:
    radial-gradient(circle at 30% 20%, rgba(252, 211, 77, 0.35), transparent 60%),
    linear-gradient(135deg, rgba(255, 107, 53, 0.45) 0%, rgba(225, 29, 72, 0.25) 100%);
  border-bottom: 1px solid var(--glass-border);
}

.logo-emoji {
  font-size: 30px;
}

.logo-text {
  font-family: 'Yatra One', cursive;
  font-size: 1.65rem;
  color: var(--taco-bone);
  letter-spacing: 0.02em;
}

.nav-divider {
  height: 1px;
  margin: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--glass-border) 20%,
    var(--glass-border) 80%,
    transparent 100%
  );
}

.nav-list :deep(.v-list-item) {
  margin: 4px 8px;
  color: rgba(255, 248, 240, 0.85);
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.nav-list :deep(.v-list-item:hover) {
  background: rgba(255, 248, 240, 0.06);
}

.nav-list :deep(.v-list-item--active) {
  background: linear-gradient(
    135deg,
    rgba(255, 107, 53, 0.9) 0%,
    rgba(225, 29, 72, 0.85) 100%
  );
  box-shadow:
    0 4px 14px rgba(255, 107, 53, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

/* Force bone-white on the title + icon of the active item — Vuetify's
   color="primary" prop otherwise paints them taco-orange (orange-on-orange). */
.nav-list :deep(.v-list-item--active),
.nav-list :deep(.v-list-item--active .v-list-item-title),
.nav-list :deep(.v-list-item--active .v-icon),
.nav-list :deep(.v-list-item--active .v-list-item__prepend > .v-icon) {
  color: var(--taco-bone) !important;
  caret-color: var(--taco-bone) !important;
}

.nav-footer {
  border-top: 1px solid var(--glass-border);
}

.taco-fact {
  display: flex;
  gap: 8px;
  font-size: 0.78rem;
  line-height: 1.4;
  color: rgba(255, 248, 240, 0.78);
  font-style: italic;
  padding: 6px 0 10px;
}

.fact-bullet {
  color: var(--taco-marigold);
  font-size: 0.9rem;
  line-height: 1.1;
  flex-shrink: 0;
}

.github-link {
  display: flex;
  align-items: center;
  color: rgba(255, 248, 240, 0.55);
  text-decoration: none;
  transition: color 0.2s ease;
}

.github-link:hover {
  color: var(--taco-marigold);
}

/* === Mobile bottom nav === */
.taco-nav-bottom {
  background: transparent !important;
}

.taco-nav-bottom :deep(.v-bottom-navigation__content) {
  /* Warm-dark glass so labels stay legible over the warm faded basemap. */
  background: linear-gradient(
    180deg,
    rgba(60, 15, 22, 0.82) 0%,
    rgba(20, 6, 8, 0.92) 100%
  );
  backdrop-filter: blur(var(--glass-blur)) saturate(160%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(160%);
  border-top: 1px solid rgba(252, 211, 77, 0.28);
  box-shadow:
    0 -8px 32px rgba(20, 6, 8, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

/* Inactive buttons: legible bone-white at reduced emphasis. */
.taco-nav-bottom :deep(.v-btn) {
  color: rgba(255, 248, 240, 0.72) !important;
  text-shadow: 0 1px 3px rgba(20, 6, 8, 0.55);
  transition: color 0.18s ease, transform 0.18s ease;
}

.taco-nav-bottom :deep(.v-btn:hover) {
  color: var(--taco-marigold) !important;
}

/* Active button: marigold-glowing orange — pops against the dark glass
   and clearly signals "selected". Vuetify normally tints the active label
   with the v-bottom-navigation's `color` prop; we override here so the
   text reads bone-white on top of a marigold glow halo. */
.taco-nav-bottom :deep(.v-btn--active) {
  color: var(--taco-bone) !important;
}

.taco-nav-bottom :deep(.v-btn--active::before) {
  content: '';
  position: absolute;
  inset: 6px 10px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.85) 0%, rgba(225, 29, 72, 0.85) 100%);
  box-shadow:
    0 4px 14px rgba(255, 107, 53, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  z-index: -1;
}

/* === Tuesday glow effect === */
.tuesday-glow {
  position: relative;
  animation: tuesdayPulse 2.4s ease-in-out infinite;
}

.tuesday-glow::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 12px;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(252, 211, 77, 0.35),
    transparent 70%
  );
  pointer-events: none;
  animation: tuesdayShimmer 2.4s ease-in-out infinite;
  z-index: -1;
}

@keyframes tuesdayPulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(252, 211, 77, 0);
  }
  50% {
    box-shadow:
      0 0 24px 4px rgba(252, 211, 77, 0.45),
      0 0 6px 1px rgba(255, 107, 53, 0.55);
  }
}

@keyframes tuesdayShimmer {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.85;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tuesday-glow,
  .tuesday-glow::after {
    animation: none;
  }
}
</style>
