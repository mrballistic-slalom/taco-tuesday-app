<script setup lang="ts">
/**
 * FiestaOverlay — Tuesday-only full-viewport confetti rain.
 *
 * Mounts 80 falling `<div>` pieces on Tuesday: ~70% colored rectangles, ~30%
 * emoji confetti (🌮 🥑 🌶️ 🌽 🌯) for variety. Each piece picks a random
 * column, size, rotation, and animation duration; staggered delays produce a
 * continuous, organic rain. `prefers-reduced-motion` skips the effect
 * entirely and the overlay also short-circuits on non-Tuesday days.
 *
 * Performance: all pieces are direct children of a single fixed container,
 * `pointer-events: none`, `will-change: transform` — the browser composites
 * them on the GPU layer cheaply.
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { useFiestaMode } from '@/composables/useFiestaMode'

const { isActive } = useFiestaMode()

const containerRef = ref<HTMLDivElement | null>(null)
const confettiEls: HTMLDivElement[] = []

/** Saturated palette for rectangle confetti pieces. */
const COLORS = ['#FF6B35', '#FCD34D', '#06D6A0', '#E11D48', '#A855F7', '#FFF8F0']

/** Emoji shower mix — sprinkles food/celebration emoji among the colors. */
const EMOJIS = ['🌮', '🥑', '🌶️', '🌽', '🌯', '🎉', '✨']

/**
 * Total number of confetti pieces. Locked to 80 because the
 * `FiestaOverlay.test.ts` snapshot asserts exactly that count.
 */
const TOTAL_PIECES = 80

/** Proportion of pieces rendered as emoji (rest are colored rectangles). */
const EMOJI_RATIO = 0.3

onMounted(() => {
  if (!isActive.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  for (let i = 0; i < TOTAL_PIECES; i++) {
    const el = document.createElement('div')
    const duration = 3 + Math.random() * 5
    const delay = Math.random() * 4
    const left = Math.random() * 100
    const startRotate = Math.random() * 360
    const endRotate = startRotate + 540 + Math.random() * 360
    const drift = (Math.random() - 0.5) * 80

    const isEmoji = Math.random() < EMOJI_RATIO

    if (isEmoji) {
      const size = 18 + Math.random() * 14
      el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
      el.style.cssText = `
        position: absolute;
        left: ${left}vw;
        top: -32px;
        font-size: ${size}px;
        line-height: 1;
        --start-rotate: ${startRotate}deg;
        --end-rotate: ${endRotate}deg;
        --drift: ${drift}px;
        animation: confettiFall ${duration}s ${delay}s linear infinite;
        will-change: transform;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));
      `
    } else {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const width = 7 + Math.random() * 7
      const height = 11 + Math.random() * 9
      el.style.cssText = `
        position: absolute;
        left: ${left}vw;
        top: -20px;
        width: ${width}px;
        height: ${height}px;
        background-color: ${color};
        border-radius: 2px;
        --start-rotate: ${startRotate}deg;
        --end-rotate: ${endRotate}deg;
        --drift: ${drift}px;
        animation: confettiFall ${duration}s ${delay}s linear infinite;
        will-change: transform;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      `
    }
    containerRef.value?.appendChild(el)
    confettiEls.push(el)
  }
})

onUnmounted(() => {
  confettiEls.forEach((el) => el.remove())
  confettiEls.length = 0
})
</script>

<template>
  <div v-if="isActive" ref="containerRef" class="fiesta-overlay" aria-hidden="true" />
</template>

<style scoped>
.fiesta-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

@keyframes confettiFall {
  from {
    transform: translate3d(0, 0, 0) rotate(var(--start-rotate));
  }
  to {
    transform: translate3d(var(--drift), 110vh, 0) rotate(var(--end-rotate));
  }
}
</style>
