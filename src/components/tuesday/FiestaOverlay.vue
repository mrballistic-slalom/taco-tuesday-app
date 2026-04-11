<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useFiestaMode } from '@/composables/useFiestaMode'

const { isActive } = useFiestaMode()
const containerRef = ref<HTMLDivElement | null>(null)
const confettiEls: HTMLDivElement[] = []

const COLORS = ['#FF6B35', '#FFD166', '#06D6A0', '#EF476F', '#A855F7']

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
