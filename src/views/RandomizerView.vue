<template>
  <v-container class="text-center py-8">
    <h1 class="text-h3 font-weight-black mb-2">🌮 Spin the Wheel</h1>
    <p class="text-subtitle-1 text-medium-emphasis mb-8">Fortune favors the taco-bold.</p>

    <SpinWheel @spin-complete="onSpinComplete" />

    <Transition name="slide-up">
      <div v-if="randomizerStore.result" class="mt-10">
        <TacoResult
          :recipe="randomizerStore.result"
          @spin-again="randomizerStore.reset()"
        />
      </div>
    </Transition>

    <v-snackbar
      :model-value="randomizerStore.error !== null"
      color="error"
      timeout="5000"
      location="bottom"
      @update:model-value="(v) => !v && randomizerStore.reset()"
    >
      {{ randomizerStore.error }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
/**
 * @component RandomizerView
 *
 * The `/randomizer` route view. Renders the spin wheel, shows the resulting
 * `TacoResult` card when a spin lands on a recipe, and surfaces any error
 * via a snackbar. "View Full Recipe" links directly to the external recipe
 * page via `recipe.sourceUrl` (no modal hop), so this view stays focused on
 * the spin experience itself.
 */

import { useRandomizerStore } from '@/stores/randomizerStore'
import SpinWheel from '@/components/randomizer/SpinWheel.vue'
import TacoResult from '@/components/randomizer/TacoResult.vue'

const randomizerStore = useRandomizerStore()

/**
 * Forwards the wheel's winning taco type to the store, which performs the
 * async Spoonacular lookup and populates `result` or `error`.
 */
function onSpinComplete(tacoType: string) {
  randomizerStore.spin(tacoType)
}
</script>

<style scoped>
.slide-up-enter-active {
  transition: all 0.4s ease-out;
}
.slide-up-enter-from {
  transform: translateY(40px);
  opacity: 0;
}
</style>
