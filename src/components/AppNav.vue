<script setup lang="ts">
/**
 * AppNav component.
 *
 * Renders the application's primary navigation in a responsive layout:
 *
 * - **Desktop (≥ md / 960 px):** A permanent `v-navigation-drawer` (220 px
 *   wide) on the left side with the "🌮 Tacology" logo at the top, four
 *   nav items, and a randomly selected taco-fact chip plus a GitHub link in
 *   the drawer footer.
 * - **Mobile (< md):** A `v-bottom-navigation` bar with four icon+label
 *   buttons pinned to the bottom of the screen.
 *
 * Both layouts support **Fiesta Mode**: when today is Tuesday and the user's
 * OS does not prefer reduced motion, the navigation container background
 * cycles through the Tacology brand palette via the `fiestaNav` CSS
 * keyframe animation, and the "Taco Tuesday" nav item pulses via the
 * `pulse` keyframe.
 *
 * The `prefers-reduced-motion` media query is checked once on mount; if the
 * user prefers reduced motion, no CSS animations are applied to the nav.
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

/** The current Vue Router route object, used to highlight the active nav item. */
const route = useRoute()

/** The Vue Router instance, used to programmatically navigate between views. */
const router = useRouter()

/** Vuetify display composable providing breakpoint information (e.g. `mdAndUp`). */
const display = useDisplay()

/**
 * Whether Fiesta Mode is currently active (i.e. today is Tuesday).
 * Drives the `fiestaNavStyle` and `tuesdayItemStyle` computed properties.
 */
const { isActive } = useFiestaMode()

/**
 * Whether the user has requested reduced motion via their OS accessibility
 * settings. Checked once on mount via `window.matchMedia`. When `true`,
 * all CSS animation styles are suppressed in both nav layouts.
 */
const reducedMotion = ref(false)

/**
 * Lifecycle hook: reads the `prefers-reduced-motion` media query and selects
 * a random taco fact to display in the desktop drawer footer.
 */
onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  randomFact.value = tacoFacts[Math.floor(Math.random() * tacoFacts.length)]
})

/**
 * Pool of five fun taco facts displayed as a rotating chip in the desktop
 * drawer footer. A new fact is selected randomly on each page load (i.e.
 * each time the component mounts).
 */
const tacoFacts = [
  'Americans eat over 4.5 billion tacos a year!',
  'The word "taco" predates Europeans arriving in Mexico.',
  'The first hard-shell taco recipe appeared in 1949.',
  'Tacos are the most popular Mexican food in the US.',
  'October 4th is National Taco Day.',
]

/**
 * The currently displayed taco fact. Initialised as an empty string and
 * populated in `onMounted` to avoid hydration mismatches in SSR scenarios.
 */
const randomFact = ref('')

/**
 * Static configuration for the four main navigation destinations.
 * Each entry defines the human-readable label, the router path, and the
 * Material Design icon name used in both the desktop drawer and mobile bar.
 */
const navItems = [
  { label: 'Find Tacos', path: '/map', icon: 'mdi-map-marker-radius' },
  { label: 'Recipes', path: '/recipes', icon: 'mdi-book-open-variant' },
  { label: 'Spin It', path: '/randomizer', icon: 'mdi-slot-machine' },
  { label: 'Taco Tuesday', path: '/tuesday', icon: 'mdi-party-popper' },
]

/**
 * Computed string of the current route path (e.g. `"/map"`).
 * Used to mark the corresponding nav item as active in both layouts.
 */
const currentRoute = computed(() => route.path)

/**
 * Programmatically navigates to the specified route path using Vue Router.
 * Called by click handlers on both desktop drawer items and mobile nav
 * buttons.
 *
 * @param path - The router path to navigate to (e.g. `"/tuesday"`).
 *
 * @example
 * navigate('/recipes') // pushes /recipes onto the history stack
 */
function navigate(path: string) {
  router.push(path)
}

/**
 * Computed inline style object that applies the `fiestaNav` background-color
 * cycling animation to the nav container when Fiesta Mode is active and the
 * user has not requested reduced motion. Returns an empty object otherwise,
 * so no style attribute is rendered.
 *
 * @returns Inline style object with `animation` property, or `{}`.
 */
const fiestaNavStyle = computed(() => {
  if (!isActive.value || reducedMotion.value) return {}
  return { animation: 'fiestaNav 4s linear infinite' }
})

/**
 * Computed inline style object that applies the `pulse` opacity animation
 * to the "Taco Tuesday" nav item when Fiesta Mode is active and the user
 * has not requested reduced motion. Returns an empty object otherwise.
 *
 * @returns Inline style object with `animation` property, or `{}`.
 */
const tuesdayItemStyle = computed(() => {
  if (!isActive.value || reducedMotion.value) return {}
  return { animation: 'pulse 1.5s infinite' }
})
</script>

<template>
  <template v-if="display.mdAndUp.value">
    <!-- Desktop: permanent navigation drawer -->
    <v-navigation-drawer permanent width="220" :style="fiestaNavStyle">
      <div class="nav-logo pa-4">
        <div class="text-h5 font-weight-black">🌮 Tacology</div>
      </div>

      <v-divider />

      <v-list nav class="mt-2">
        <v-list-item
          v-for="item in navItems"
          :key="item.path"
          :prepend-icon="item.icon"
          :title="item.label"
          :active="currentRoute === item.path"
          color="primary"
          :style="item.path === '/tuesday' ? tuesdayItemStyle : {}"
          @click="navigate(item.path)"
        />
      </v-list>

      <template #append>
        <div class="pa-3">
          <v-chip size="small" color="secondary" class="text-wrap mb-2" style="height: auto; white-space: normal">
            {{ randomFact }}
          </v-chip>
          <div class="mt-1">
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
        </div>
      </template>
    </v-navigation-drawer>
  </template>

  <template v-else>
    <!-- Mobile: bottom navigation -->
    <v-bottom-navigation :model-value="currentRoute" color="#FF6B35" :style="fiestaNavStyle">
      <v-btn
        v-for="item in navItems"
        :key="item.path"
        :value="item.path"
        :style="item.path === '/tuesday' ? tuesdayItemStyle : {}"
        @click="navigate(item.path)"
      >
        <v-icon>{{ item.icon }}</v-icon>
        <span>{{ item.label }}</span>
      </v-btn>
    </v-bottom-navigation>
  </template>
</template>

<style scoped>
.nav-logo {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

@keyframes fiestaNav {
  0% {
    background-color: #ff6b35;
  }
  25% {
    background-color: #ffd166;
  }
  50% {
    background-color: #06d6a0;
  }
  75% {
    background-color: #ef476f;
  }
  100% {
    background-color: #ff6b35;
  }
}

.github-link {
  display: flex;
  align-items: center;
  color: rgba(234, 234, 234, 0.5);
  text-decoration: none;
  transition: color 0.2s;
}

.github-link:hover {
  color: #eaeaea;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
