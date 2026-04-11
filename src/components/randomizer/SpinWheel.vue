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
import { ref, onMounted } from 'vue'
import { useRandomizerStore } from '@/stores/randomizerStore'

const emit = defineEmits<{
  (e: 'spin-complete', tacoType: string): void
}>()

const randomizerStore = useRandomizerStore()

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

const canvasEl = ref<HTMLCanvasElement | null>(null)
const currentRotation = ref(0)
const isSpinning = ref(false)

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

    // Draw text label
    const textAngle = startAngle + segmentAngle / 2
    const textX = centerX + Math.cos(textAngle) * radius * 0.65
    const textY = centerY + Math.sin(textAngle) * radius * 0.65

    ctx.save()
    ctx.translate(textX, textY)
    ctx.rotate(textAngle + Math.PI / 2)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 12px Nunito, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(TACO_TYPES[i], 0, 0)
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

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function getWinner(rotation: number): string {
  const segmentAngle = (Math.PI * 2) / TACO_TYPES.length
  const normalized = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
  const pointerAngle = Math.PI * 1.5
  const adjusted = (pointerAngle - normalized + Math.PI * 2) % (Math.PI * 2)
  const index = Math.floor(adjusted / segmentAngle) % TACO_TYPES.length
  return TACO_TYPES[index]
}

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

onMounted(() => {
  drawWheel(currentRotation.value)
})
</script>
