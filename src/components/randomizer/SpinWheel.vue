<template>
  <div class="d-flex flex-column align-center">
    <canvas
      ref="canvasEl"
      width="340"
      height="340"
      style="max-width: 100%"
      aria-label="Spinning taco wheel"
    />
    <v-btn
      color="primary"
      size="x-large"
      class="mt-6"
      :disabled="isSpinning || randomizerStore.isSpinning"
      aria-label="Spin the wheel"
      @click="startSpin"
    >
      🌮 SPIN THE WHEEL
    </v-btn>
  </div>
</template>

<script setup lang="ts">
/**
 * @component SpinWheel
 *
 * An interactive prize wheel rendered on an HTML5 Canvas element (340×340px,
 * scaled down responsively via `max-width: 100%`). The wheel is divided into
 * 12 equal segments, one for each taco type in `TACO_TYPES`. Each segment is
 * filled with a warm/vibrant colour from `COLORS` and labelled with the taco
 * type name in white bold text.
 *
 * A downward-pointing triangle (taco orange, `#FF6B35`) is drawn at the top
 * centre of the canvas as a fixed pointer. A small dark circle is drawn at the
 * wheel's hub.
 *
 * When the user presses "🌮 SPIN THE WHEEL", the wheel animates using
 * `requestAnimationFrame` with a cubic ease-out over 4 seconds, rotating
 * between 5 and 8 full turns plus a random extra offset to keep the winning
 * segment unpredictable. Once the animation ends, the component calculates
 * which segment aligns with the pointer and emits `spin-complete` with the
 * taco type string.
 *
 * The spin button is disabled while a spin is in progress (guarded by both
 * the local `isSpinning` ref and `randomizerStore.isSpinning` to prevent
 * double-firing during the async Pinia action).
 *
 * @example
 * <SpinWheel @spin-complete="onSpinComplete" />
 */

import { ref, onMounted } from 'vue'
import { useRandomizerStore } from '@/stores/randomizerStore'

/**
 * Events emitted by SpinWheel.
 *
 * @emits spin-complete - Fired exactly once at the end of each spin animation,
 *   after the winning segment has been determined. The parent (`RandomizerView`)
 *   forwards this value to `randomizerStore.spin(tacoType)` which searches
 *   TheMealDB for a matching recipe.
 *
 * @param tacoType - The label of the winning wheel segment, e.g. `"Al Pastor"`,
 *   `"Birria"`, `"Fish Taco"`, etc. Always one of the 12 strings in `TACO_TYPES`.
 */
const emit = defineEmits<{
  (e: 'spin-complete', tacoType: string): void
}>()

/**
 * The Pinia randomizer store. Used here only to read `randomizerStore.isSpinning`
 * so the spin button can be kept disabled while the store's async `spin` action
 * is in progress (prevents a second spin being triggered before the first result
 * returns from TheMealDB).
 */
const randomizerStore = useRandomizerStore()

/**
 * The 12 taco type labels, one per wheel segment. The order determines the
 * visual layout of segments starting from angle 0 (3 o'clock position) and
 * proceeding clockwise. Changing this array also changes which segment wins for
 * a given final rotation value.
 */
const TACO_TYPES = [
  'Al Pastor',
  'Carnitas',
  'Birria',
  'Fish Taco',
  'Carne Asada',
  'Veggie',
  'Chicken Tinga',
  'Barbacoa',
  'Shrimp',
  'Chorizo',
  'Lengua',
  'Potato',
]

/**
 * Warm/vibrant fill colours assigned to wheel segments in order. There are 12
 * colours matching the 12 taco types; the modulo fallback (`i % COLORS.length`)
 * is a safety measure in case the two arrays ever get out of sync. All colours
 * are oranges, reds, yellows — no muted or cool tones — to create a lively,
 * appetising look consistent with the Tacology brand.
 */
const COLORS = [
  '#FF6B35',
  '#FFD166',
  '#FF4757',
  '#FFA502',
  '#ECCC68',
  '#FF6348',
  '#FF7F50',
  '#FFD700',
  '#FF6B81',
  '#FFBC00',
  '#FF8C00',
  '#FFC300',
]

/**
 * Template ref pointing to the `<canvas>` element in the template. Used to
 * obtain a 2D rendering context for all canvas draw operations. Will be `null`
 * before the component mounts.
 */
const canvasEl = ref<HTMLCanvasElement | null>(null)

/**
 * The current cumulative rotation of the wheel in radians. Persists between
 * spins so each new spin continues from wherever the previous one stopped,
 * making it impossible to predict the outcome by spinning a known number of
 * times. Updated on every animation frame during a spin.
 */
const currentRotation = ref(0)

/**
 * Whether a spin animation is currently running. Set to `true` when
 * `startSpin` begins and back to `false` when the animation frame loop ends.
 * Prevents overlapping spins by disabling the spin button. Mirrored alongside
 * `randomizerStore.isSpinning` for belt-and-suspenders protection.
 */
const isSpinning = ref(false)

/**
 * Renders the complete wheel onto the canvas for a given rotation angle.
 * Called once on mount to draw the initial static state and then on every
 * animation frame during a spin via `startSpin`'s `animate` closure.
 *
 * Drawing order (painter's algorithm):
 *  1. Clear the entire canvas.
 *  2. For each segment: draw a filled arc from center, then a text label
 *     rotated to be radially aligned (reading from center outward).
 *  3. Draw the hub circle over the segment wedges.
 *  4. Draw the fixed pointer triangle at the top of the canvas.
 *
 * The function returns early without throwing if the canvas ref or its 2D
 * context is unavailable (e.g. called before mount in tests).
 *
 * @param rotation - Rotation offset in radians applied to all segment start
 *   angles. Defaults to `0` (initial upright position).
 */
function drawWheel(rotation: number = 0) {
  const canvas = canvasEl.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(centerX, centerY) - 10
  const numSegments = TACO_TYPES.length
  const segmentAngle = (Math.PI * 2) / numSegments

  ctx.clearRect(0, 0, width, height)

  for (let i = 0; i < numSegments; i++) {
    const startAngle = rotation + i * segmentAngle
    const endAngle = startAngle + segmentAngle

    // Draw segment
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = COLORS[i % COLORS.length]
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw text label — radiating from center outward so long labels fit
    const textAngle = startAngle + segmentAngle / 2
    // Segments whose midpoint falls in the left half of the circle would render
    // upside-down if drawn the same way as right-half segments. Detect this and
    // add π so the text is flipped back to a readable orientation.
    const isLeftHalf = Math.cos(textAngle) < 0

    ctx.save()
    ctx.translate(centerX, centerY)
    // After this rotation, the +x axis points radially outward for this segment.
    // For left-half segments the extra π keeps text right-side-up.
    ctx.rotate(textAngle + (isLeftHalf ? Math.PI : 0))
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 11px Nunito, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // Centre the label at 55 % of the radius along the outward direction.
    // For right-half that is +x; for left-half (flipped 180°) outward is -x.
    ctx.fillText(TACO_TYPES[i], radius * 0.55 * (isLeftHalf ? -1 : 1), 0)
    ctx.restore()
  }

  // Draw center circle
  ctx.beginPath()
  ctx.arc(centerX, centerY, 14, 0, Math.PI * 2)
  ctx.fillStyle = '#1A1A2E'
  ctx.fill()
  ctx.strokeStyle = '#FF6B35'
  ctx.lineWidth = 2
  ctx.stroke()

  // Draw pointer triangle at top
  ctx.beginPath()
  ctx.moveTo(centerX - 10, 0)
  ctx.lineTo(centerX + 10, 0)
  ctx.lineTo(centerX, 20)
  ctx.closePath()
  ctx.fillStyle = '#FF6B35'
  ctx.fill()
}

/**
 * Cubic ease-out timing function used to decelerate the wheel animation.
 * Maps a linear progress value in [0, 1] to an eased value in [0, 1] that
 * starts fast and slows to a stop — mimicking the physics of a real spinning
 * wheel losing momentum due to friction.
 *
 * Formula: `1 - (1 - t)^3`
 *
 * @param t - Linear progress in the range [0, 1] where 0 is the start and 1
 *   is the end of the animation.
 * @returns Eased progress value in the range [0, 1].
 */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Determines which `TACO_TYPES` segment is aligned with the fixed pointer at
 * the top of the canvas (12 o'clock, which is `Math.PI * 1.5` in canvas
 * coordinates where 0 is 3 o'clock) for a given cumulative rotation.
 *
 * The calculation normalises the rotation to [0, 2π), then computes how far
 * the pointer angle is offset from the normalised rotation to find the adjusted
 * angle within [0, 2π), and finally maps that to a segment index.
 *
 * @param rotation - Cumulative rotation of the wheel in radians (may be many
 *   multiples of 2π after several spins).
 * @returns The taco type label string of the winning segment.
 */
function getWinner(rotation: number): string {
  const segmentAngle = (Math.PI * 2) / TACO_TYPES.length
  const normalized = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
  const pointerAngle = Math.PI * 1.5
  const adjusted = (pointerAngle - normalized + Math.PI * 2) % (Math.PI * 2)
  const index = Math.floor(adjusted / segmentAngle) % TACO_TYPES.length
  return TACO_TYPES[index]
}

/**
 * Initiates a spin animation when the user presses the spin button.
 * Guards against double-firing by checking both `isSpinning` (local animation
 * lock) and `randomizerStore.isSpinning` (store async lock).
 *
 * Spin mechanics:
 *  - Total spin amount: 5–8 full rotations (Math.PI * 2 each) plus a random
 *    extra partial rotation, keeping the final position non-deterministic.
 *  - Duration: 4 000 ms fixed.
 *  - Easing: cubic ease-out via `easeOut()`.
 *  - Each animation frame updates `currentRotation` and calls `drawWheel` to
 *    re-render the canvas.
 *  - When `progress >= 1` the animation ends, `isSpinning` is set back to
 *    `false`, and `spin-complete` is emitted with the winning taco type.
 */
function startSpin() {
  if (isSpinning.value || randomizerStore.isSpinning) return

  isSpinning.value = true

  const spinAmount =
    (5 + Math.random() * 3) * Math.PI * 2 + Math.random() * Math.PI * 2
  const startRotation = currentRotation.value
  const targetRotation = startRotation + spinAmount
  const duration = 4000
  let startTime: number | null = null

  function animate(timestamp: number) {
    if (startTime === null) startTime = timestamp
    const elapsed = timestamp - startTime
    const progress = elapsed / duration
    const easedProgress = easeOut(Math.min(progress, 1))

    currentRotation.value = startRotation + spinAmount * easedProgress
    drawWheel(currentRotation.value)

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      currentRotation.value = targetRotation
      isSpinning.value = false
      const winner = getWinner(currentRotation.value)
      emit('spin-complete', winner)
    }
  }

  requestAnimationFrame(animate)
}

/**
 * Lifecycle hook: draws the initial static wheel as soon as the canvas element
 * is mounted in the DOM and `canvasEl` ref is populated. Without this call the
 * canvas would appear blank until the user triggers their first spin.
 */
onMounted(() => {
  drawWheel(currentRotation.value)
})
</script>
