/**
 * @file useTuesdayCheck.ts
 * @description Vue composable that determines whether the current day of the
 * week is Tuesday.
 *
 * Tuesday detection drives several features in Tacology:
 * - The Taco Tuesday view (`TuesdayView.vue`) shows real Yelp data only on
 *   Tuesdays; on other days it shows a countdown banner instead.
 * - Fiesta Mode (confetti, nav animation) is gated on this composable via
 *   {@link useFiestaMode}.
 * - The Taco Tuesday nav item pulses in `AppNav` only on Tuesdays.
 *
 * The day is evaluated once when the composable is initialized (i.e., when
 * the component using it is set up). There is no reactive timer — if the app
 * is left open overnight and Tuesday rolls around, a page refresh is required.
 * This is an intentional simplification for v1.
 */

import { computed } from 'vue'

/**
 * Composable that exposes a reactive boolean indicating whether today is Tuesday.
 *
 * Internally, it creates a Vue `computed` ref that evaluates
 * `new Date().getDay() === 2` (`getDay()` returns 2 for Tuesday in JavaScript's
 * 0-indexed Sunday-origin week: Sun=0, Mon=1, **Tue=2**, …, Sat=6).
 *
 * Because the `computed` is not connected to any reactive time source, its
 * value is stable for the lifetime of the component and will not automatically
 * update if the day changes while the app is open.
 *
 * In tests, use `vi.useFakeTimers()` followed by `vi.setSystemTime()` to
 * control what `new Date()` returns before calling this composable.
 *
 * @returns An object containing:
 *   - `isTuesday` — a `ComputedRef<boolean>` that is `true` when the current
 *     day of the week is Tuesday, and `false` on all other days.
 *
 * @example
 * // Inside a <script setup> block
 * import { useTuesdayCheck } from '@/composables/useTuesdayCheck'
 *
 * const { isTuesday } = useTuesdayCheck()
 * // isTuesday.value === true  (when run on a Tuesday)
 * // isTuesday.value === false (when run on any other day)
 *
 * @example
 * // In a Vitest test — simulating a Tuesday
 * vi.useFakeTimers()
 * vi.setSystemTime(new Date('2024-01-09')) // 2024-01-09 is a Tuesday
 * const { isTuesday } = useTuesdayCheck()
 * expect(isTuesday.value).toBe(true)
 * vi.useRealTimers()
 *
 * @example
 * // In a Vitest test — simulating a non-Tuesday (Monday)
 * vi.useFakeTimers()
 * vi.setSystemTime(new Date('2024-01-08')) // 2024-01-08 is a Monday
 * const { isTuesday } = useTuesdayCheck()
 * expect(isTuesday.value).toBe(false)
 * vi.useRealTimers()
 */
export function useTuesdayCheck() {
  /**
   * A computed ref that is `true` when today's day-of-week index equals 2
   * (Tuesday in JavaScript's `Date.getDay()` convention) and `false` otherwise.
   *
   * The value is computed lazily and cached by Vue's reactivity system.
   * Because the expression `new Date().getDay()` does not depend on any
   * reactive dependency, the computed ref effectively acts as a constant for
   * the current render cycle and will only re-evaluate if Vue's scheduler
   * decides to do so (e.g., during component re-mount after a route change).
   */
  const isTuesday = computed(() => new Date().getDay() === 2)
  return { isTuesday }
}
