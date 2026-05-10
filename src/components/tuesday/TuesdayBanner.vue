<script setup lang="ts">
/**
 * TuesdayBanner — shown on every non-Tuesday day in TuesdayView.
 *
 * Energetic countdown to the next Taco Tuesday rather than a dim placeholder.
 * Big Yatra-One number, glass card backdrop, bobbing taco emoji, and a
 * progress bar that fills as the week creeps toward Tuesday. Reads
 * `new Date()` on render — no reactive timer needed; the page mounts once
 * per visit which is plenty for a daily-resolution countdown.
 *
 * @example
 * ```vue
 * <!-- Shown automatically by TuesdayView when it is NOT Tuesday -->
 * <TuesdayBanner />
 * ```
 */
import { computed } from 'vue'

/**
 * Days from today until the next Tuesday (1–7). Returns 7 when today is
 * already Tuesday to defend against TuesdayView misuse, even though that
 * code path should never render this component.
 */
const daysUntilTuesday = computed(() => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysUntil = (2 - dayOfWeek + 7) % 7
  return daysUntil === 0 ? 7 : daysUntil
})

/**
 * Friendly multi-line ribbon copy that changes with proximity to Tuesday.
 */
const ribbonCopy = computed(() => {
  switch (daysUntilTuesday.value) {
    case 1:
      return { eyebrow: 'Almost there', headline: 'Tomorrow we feast.' }
    case 2:
      return { eyebrow: 'Soon, very soon', headline: 'Two sleeps to tacos.' }
    case 3:
      return { eyebrow: 'Patience, amigo', headline: "We're getting closer." }
    case 4:
    case 5:
      return { eyebrow: 'Hang in there', headline: 'Worth the wait.' }
    default:
      return { eyebrow: 'A full week ahead', headline: 'Build the appetite.' }
  }
})

/**
 * 0–1 progress fraction representing how far we've travelled from the last
 * Tuesday toward the next one. Drives the progress-bar fill width.
 */
const progress = computed(() => 1 - daysUntilTuesday.value / 7)
</script>

<template>
  <div class="banner-wrap">
    <div class="banner glass-panel-strong">
      <div class="banner-eyebrow">{{ ribbonCopy.eyebrow }}</div>

      <div class="bobbing-taco" aria-hidden="true">🌮</div>

      <div class="count-block">
        <span class="count-number">{{ daysUntilTuesday }}</span>
        <span class="count-unit">{{ daysUntilTuesday === 1 ? 'day' : 'days' }}</span>
      </div>

      <h2 class="banner-headline">{{ ribbonCopy.headline }}</h2>

      <p class="banner-sub">Until the next Taco Tuesday.</p>

      <div
        class="progress-rail"
        :style="{ '--progress': progress }"
        :aria-label="`${Math.round(progress * 100)}% of the way to Tuesday`"
      >
        <div class="progress-fill" />
        <span class="progress-emoji" aria-hidden="true">🌮</span>
      </div>

      <div class="week-dots" aria-hidden="true">
        <span v-for="n in 7" :key="n" :class="{ active: n <= 7 - daysUntilTuesday }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.banner-wrap {
  display: flex;
  justify-content: center;
  padding: 48px 16px;
  min-height: 70vh;
}

.banner {
  position: relative;
  padding: 36px 32px 28px;
  border-radius: 24px;
  text-align: center;
  max-width: 440px;
  width: 100%;
  color: var(--taco-bone);
  overflow: hidden;
}

.banner::before {
  /* warm aura tucked behind the glass */
  content: '';
  position: absolute;
  inset: -40%;
  background: radial-gradient(circle at 50% 0%, rgba(252, 211, 77, 0.35), transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.banner > * {
  position: relative;
  z-index: 1;
}

.banner-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.22em;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--taco-marigold);
  margin-bottom: 18px;
  text-shadow: 0 1px 6px rgba(20, 6, 8, 0.5);
}

.bobbing-taco {
  font-size: 72px;
  animation: bob 2.6s ease-in-out infinite;
  filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.4));
  display: inline-block;
}

.count-block {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 4px;
}

.count-number {
  font-family: 'Yatra One', cursive;
  font-size: clamp(5rem, 18vw, 7.5rem);
  line-height: 1;
  color: var(--taco-bone);
  background: linear-gradient(180deg, #fff8f0 0%, #fcd34d 60%, #ff6b35 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 6px 20px rgba(20, 6, 8, 0.35);
}

.count-unit {
  font-family: 'Yatra One', cursive;
  font-size: 1.3rem;
  color: var(--taco-marigold);
  text-transform: lowercase;
}

.banner-headline {
  font-family: 'Yatra One', cursive;
  font-size: 1.7rem;
  margin: 14px 0 6px;
  color: var(--taco-bone);
  text-shadow: 0 2px 10px rgba(20, 6, 8, 0.5);
}

.banner-sub {
  font-size: 0.95rem;
  color: rgba(255, 248, 240, 0.78);
  margin: 0 0 22px;
}

.progress-rail {
  position: relative;
  height: 10px;
  /* Extra vertical room so the taco emoji can ride above the rail without
     being clipped — the rail bg + fill stay 10px, the emoji floats free. */
  margin: 12px 0;
  border-radius: 999px;
  background: rgba(255, 248, 240, 0.12);
  border: 1px solid var(--glass-border);
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: calc(var(--progress, 0) * 100%);
  background: linear-gradient(90deg, #e11d48 0%, #ff6b35 50%, #fcd34d 100%);
  border-radius: 999px;
  transition: width 600ms ease;
  box-shadow: 0 0 16px rgba(255, 107, 53, 0.55);
}

.progress-emoji {
  position: absolute;
  left: calc(var(--progress, 0) * 100%);
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 22px;
  line-height: 1;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.45));
  transition: left 600ms ease;
  pointer-events: none;
}

.week-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 18px;
}

.week-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 248, 240, 0.18);
}

.week-dots span.active {
  background: var(--taco-marigold);
  box-shadow: 0 0 8px rgba(252, 211, 77, 0.7);
}

@keyframes bob {
  0%,
  100% {
    transform: translateY(0) rotate(-2deg);
  }
  50% {
    transform: translateY(-14px) rotate(3deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bobbing-taco {
    animation: none;
  }
  .progress-fill {
    transition: none;
  }
}
</style>
