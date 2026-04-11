<script setup lang="ts">
import { computed } from 'vue'

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
