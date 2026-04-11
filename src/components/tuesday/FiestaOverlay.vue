<script setup lang="ts">
/**
 * FiestaOverlay component.
 *
 * Renders an accessibility-aware, full-viewport confetti animation that is
 * active only on Taco Tuesday (i.e. when `useFiestaMode().isActive` is
 * `true`). The overlay is `position: fixed`, `pointer-events: none`, and
 * sits at `z-index: 9999` so it floats above all content without
 * intercepting user interactions.
 *
 * On mount (when Fiesta Mode is active AND `prefers-reduced-motion` is NOT
 * set), 80 `<div>` confetti pieces are programmatically created, assigned
 * random colours from the brand palette, random sizes, random horizontal
 * positions, and staggered `confettiFall` CSS animations that carry each
 * piece from `-20px` above the viewport to `110vh` below it while rotating
 * 720 degrees. This gives a continuous, looping rain-of-confetti effect.
 *
 * On unmount all confetti elements are removed from the DOM to prevent
 * memory leaks.
 *
 * Accessibility: if `window.matchMedia('(prefers-reduced-motion: reduce)')`
 * matches, no confetti elements are created at all. The overlay container
 * itself carries `aria-hidden="true"` because it is purely decorative.
 *
 * @example
 * ```vue
 * <!-- Placed at the top of TuesdayView; self-manages its own visibility -->
 * <FiestaOverlay />
 * ```
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { useFiestaMode } from '@/composables/useFiestaMode'

/**
 * Whether Fiesta Mode is currently active (i.e. today is Tuesday).
 * Sourced from `useFiestaMode`, which internally delegates to
 * `useTuesdayCheck`.
 */
const { isActive } = useFiestaMode()

/**
 * Template ref pointing to the `.fiesta-overlay` container `<div>`.
 * Confetti elements are appended to this node at runtime so they are
 * scoped within the overlay and cleaned up correctly on unmount.
 */
const containerRef = ref<HTMLDivElement | null>(null)

/**
 * Non-reactive array that tracks all 80 programmatically created confetti
 * `<div>` elements. Using a plain array (not a ref) avoids triggering
 * unnecessary Vue reactivity overhead for DOM-only operations.
 */
const confettiEls: HTMLDivElement[] = []

/**
 * Brand colour palette used for confetti pieces.
 * Drawn from the Tacology Vuetify theme:
 * - `#FF6B35` — taco orange (primary)
 * - `#FFD166` — warm yellow (secondary)
 * - `#06D6A0` — cilantro green (accent)
 * - `#EF476F` — salsa red (error)
 * - `#A855F7` — purple (bonus celebration colour)
 */
const COLORS = ['#FF6B35', '#FFD166', '#06D6A0', '#EF476F', '#A855F7']

/**
 * Lifecycle hook: creates and mounts 80 confetti `<div>` elements inside the
 * overlay container, each with randomised properties to produce a natural,
 * staggered falling effect.
 *
 * Early-exits without creating any elements when:
 *   - `isActive` is false (it is not Tuesday), or
 *   - the OS `prefers-reduced-motion` media query is active.
 *
 * Each piece is given:
 * - A random colour from `COLORS`
 * - An animation `duration` between 3 s and 7 s
 * - An animation `delay` between 0 s and 3 s (staggers initial appearance)
 * - A random `left` position from 0 vw to 100 vw
 * - A random `width` between 6 px and 12 px
 * - A random `height` between 10 px and 18 px
 */
onMounted(() => {
  if (!isActive.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div')
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    const duration = 3 + Math.random() * 4
    const delay = Math.random() * 3
    const left = Math.random() * 100
    const width = 6 + Math.random() * 6
    const height = 10 + Math.random() * 8
    el.style.cssText = `
      position: absolute;
      left: ${left}vw;
      top: -20px;
      width: ${width}px;
      height: ${height}px;
      background-color: ${color};
      animation: confettiFall ${duration}s ${delay}s linear infinite;
      will-change: transform;
    `
    containerRef.value?.appendChild(el)
    confettiEls.push(el)
  }
})

/**
 * Lifecycle hook: removes every confetti element from the DOM and empties the
 * tracking array. Called automatically when the component is unmounted (e.g.
 * when navigating away from TuesdayView) to prevent DOM leaks.
 */
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
    top: -20px;
    transform: rotate(0deg);
  }
  to {
    top: 110vh;
    transform: rotate(720deg);
  }
}
</style>
