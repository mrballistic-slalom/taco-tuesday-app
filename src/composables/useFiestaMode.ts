/**
 * @file useFiestaMode.ts
 * @description Vue composable that exposes a reactive boolean indicating
 * whether "Fiesta Mode" is currently active.
 *
 * Fiesta Mode is a set of delightful Tuesday-only visual effects across the
 * application:
 * - Animated confetti falling over the viewport (`FiestaOverlay.vue`)
 * - The app navigation background cycles through the Fiesta color palette
 *   (`AppNav.vue`)
 * - The Taco Tuesday nav item pulses
 * - The nav logo area cycles through brand colors
 *
 * All of these effects are gated on `isActive`. By funnelling the Tuesday
 * check through this dedicated composable, the Tuesday business logic lives
 * in one place (`useTuesdayCheck`) while Fiesta-specific consumers import
 * `useFiestaMode` — making it trivial to extend Fiesta Mode with additional
 * conditions in the future (e.g., a user preference toggle) without touching
 * every consumer.
 *
 * **Accessibility:** Code that uses `isActive` to trigger animations must also
 * check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and
 * skip all motion-based effects when that media query is true.
 */

import { computed, type ComputedRef } from 'vue'
import { useTuesdayCheck } from '@/composables/useTuesdayCheck'

/**
 * Composable that exposes a reactive flag indicating whether Fiesta Mode is
 * currently active.
 *
 * Fiesta Mode is active when and only when today is Tuesday, as determined by
 * {@link useTuesdayCheck}. The `isActive` computed ref delegates directly to
 * `isTuesday`, so its semantics are identical — it is `true` on Tuesdays and
 * `false` on all other days.
 *
 * The indirection exists to decouple the "is it Tuesday?" domain question from
 * the "should we show party effects?" UI question. Future v2 features (e.g., a
 * "preview Fiesta Mode" developer toggle) can add additional conditions here
 * without changing `useTuesdayCheck` or any of its other consumers.
 *
 * @returns An object containing:
 *   - `isActive` — a `ComputedRef<boolean>` that is `true` when Fiesta Mode
 *     should be active (currently: when the current day is Tuesday), and
 *     `false` otherwise.
 *
 * @example
 * // Inside a <script setup> block in AppNav.vue
 * import { useFiestaMode } from '@/composables/useFiestaMode'
 *
 * const { isActive } = useFiestaMode()
 *
 * // Conditionally apply the fiesta animation style
 * const navStyle = computed(() =>
 *   isActive.value ? { animation: 'fiestaNav 3s ease-in-out infinite' } : {}
 * )
 *
 * @example
 * // In FiestaOverlay.vue — respect reduced motion preferences
 * import { useFiestaMode } from '@/composables/useFiestaMode'
 * import { onMounted, onUnmounted } from 'vue'
 *
 * const { isActive } = useFiestaMode()
 *
 * onMounted(() => {
 *   const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
 *   if (isActive.value && !reducedMotion) {
 *     // create confetti elements
 *   }
 * })
 *
 * @example
 * // In a Vitest test — controlling Tuesday state
 * import { vi } from 'vitest'
 * vi.useFakeTimers()
 * vi.setSystemTime(new Date('2024-01-09')) // Tuesday
 * const { isActive } = useFiestaMode()
 * expect(isActive.value).toBe(true)
 * vi.useRealTimers()
 */
export function useFiestaMode(): { isActive: ComputedRef<boolean> } {
  const { isTuesday } = useTuesdayCheck()

  /**
   * A computed ref that mirrors the `isTuesday` value from {@link useTuesdayCheck}.
   *
   * `true` when the current day of the week is Tuesday; `false` on all other
   * days. Components that depend on this value should also check
   * `prefers-reduced-motion` before triggering CSS animations or spawning DOM
   * elements for visual effects.
   */
  const isActive = computed(() => isTuesday.value)
  return { isActive }
}
