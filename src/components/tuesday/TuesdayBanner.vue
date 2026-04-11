<script setup lang="ts">
/**
 * TuesdayBanner component.
 *
 * Rendered exclusively on non-Tuesday days in `TuesdayView`. Displays a
 * centred, desaturated placeholder screen that tells the user Taco Tuesday
 * has not yet arrived and shows a live countdown (in days) until the next
 * Tuesday. The taco emoji performs a gentle vertical bobbing animation to
 * maintain visual interest while keeping the mood deliberately subdued
 * (grayscale palette, no fiesta colours).
 *
 * This component has no props and emits no events — it reads the current
 * date directly from `new Date()` on each render cycle.
 *
 * @example
 * ```vue
 * <!-- Shown automatically by TuesdayView when it is NOT Tuesday -->
 * <TuesdayBanner />
 * ```
 */
import { computed } from 'vue'

/**
 * Computed number of days from today until the next Tuesday (day index 2).
 *
 * The formula `(2 - dayOfWeek + 7) % 7` always yields a value in [0, 6].
 * A result of 0 means today IS Tuesday, which should never occur here
 * (TuesdayView gates this component behind `!isTuesday`), but the guard
 * `daysUntil === 0 ? 7 : daysUntil` handles the edge case defensively by
 * returning 7 (i.e. "next Tuesday is in a full week").
 *
 * @returns {number} Integer in the range [1, 7] representing the day offset.
 *
 * @example
 * // If today is Wednesday (dayOfWeek = 3):
 * // (2 - 3 + 7) % 7 === 6 → 6 days until Tuesday
 */
const daysUntilTuesday = computed(() => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysUntil = (2 - dayOfWeek + 7) % 7
  return daysUntil === 0 ? 7 : daysUntil
})
</script>

<template>
  <v-container class="d-flex align-center justify-center" style="min-height: 70vh">
    <div class="text-center">
      <div class="bobbing-taco" style="font-size: 80px">🌮</div>
      <h2 class="text-h4 font-weight-bold mb-3" style="color: #888">Come Back on Tuesday</h2>
      <p class="text-body-1 mb-4" style="color: #888">Tacos are coming. Hold tight.</p>
      <p class="text-body-2" style="color: #888">
        Next Taco Tuesday in: {{ daysUntilTuesday }} days
      </p>
    </div>
  </v-container>
</template>

<style scoped>
.bobbing-taco {
  animation: bob 2s ease-in-out infinite;
  display: inline-block;
}
@keyframes bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}
</style>
