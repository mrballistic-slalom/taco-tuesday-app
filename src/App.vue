<script setup lang="ts">
/**
 * App — root application shell.
 *
 * Renders the persistent nav, a router outlet with cross-fade transitions,
 * and the global "Mercado Glass" canvas: a fixed warm-sunset gradient with
 * a subtle film-grain overlay. Vuetify's app + main containers are made
 * transparent so the gradient shows through every view.
 *
 * Global CSS custom properties exposed on `:root` for glassmorphism reuse:
 *   --glass-bg, --glass-bg-strong, --glass-border, --glass-blur,
 *   --glass-shadow, --glass-shadow-lifted
 */
import AppNav from './components/AppNav.vue'
import { Analytics } from '@vercel/analytics/vue'
</script>

<template>
  <v-app>
    <AppNav />
    <v-main>
      <router-view v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </v-main>
    <Analytics />
  </v-app>
</template>

<style>
:root {
  /* Frosted-glass tokens — used by nav, cards, overlays. */
  --glass-bg: rgba(255, 248, 240, 0.08);
  --glass-bg-strong: rgba(255, 248, 240, 0.14);
  --glass-border: rgba(255, 248, 240, 0.18);
  --glass-blur: 22px;
  --glass-shadow:
    0 8px 32px rgba(20, 6, 8, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  --glass-shadow-lifted:
    0 18px 48px rgba(20, 6, 8, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);

  /* Accent ramps used by hero gradients, glows, etc. */
  --taco-orange: #ff6b35;
  --taco-marigold: #fcd34d;
  --taco-cilantro: #06d6a0;
  --taco-salsa: #e11d48;
  --taco-bone: #fff8f0;
}

html,
body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

body {
  background-color: #1a0608;
  background-image:
    radial-gradient(at 14% 8%, rgba(252, 211, 77, 0.22), transparent 45%),
    radial-gradient(at 88% 92%, rgba(255, 107, 53, 0.35), transparent 55%),
    linear-gradient(
      160deg,
      #1a0608 0%,
      #3b0f14 22%,
      #7c2d12 50%,
      #c2410c 78%,
      #ea8b26 100%
    );
  background-attachment: fixed;
  background-size: cover;
}

/* Film-grain overlay — adds hand-printed texture without busy-ness. */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* Let the body gradient show through Vuetify's chrome. */
.v-application,
.v-application__wrap,
.v-main,
.v-layout {
  background: transparent !important;
}

* {
  font-family: 'Nunito', sans-serif;
}

/* Display font — cantina signage energy. */
h1,
h2,
.display-font {
  font-family: 'Yatra One', 'Nunito', sans-serif;
  letter-spacing: 0.01em;
}

/* Reusable glass utility — apply on a panel/card to get the frosted look. */
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(140%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(140%);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

.glass-panel-strong {
  background: var(--glass-bg-strong);
  backdrop-filter: blur(var(--glass-blur)) saturate(160%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(160%);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow-lifted);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  body::before {
    opacity: 0.25;
  }
}
</style>
