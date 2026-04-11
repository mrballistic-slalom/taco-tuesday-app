<template>
  <v-container class="text-center py-8">
    <h1 class="text-h3 font-weight-black mb-2">🌮 Spin the Wheel</h1>
    <p class="text-subtitle-1 text-medium-emphasis mb-8">Fortune favors the taco-bold.</p>

    <SpinWheel @spin-complete="onSpinComplete" />

    <Transition name="slide-up">
      <div v-if="randomizerStore.result" class="mt-10">
        <TacoResult
          :meal="randomizerStore.result"
          @view-recipe="openRecipeModal(randomizerStore.result!)"
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

    <RecipeModal
      v-if="selectedMealForModal"
      :meal="selectedMealForModal"
      :model-value="modalOpen"
      @update:model-value="onModalUpdate"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRandomizerStore } from '@/stores/randomizerStore'
import SpinWheel from '@/components/randomizer/SpinWheel.vue'
import TacoResult from '@/components/randomizer/TacoResult.vue'
import RecipeModal from '@/components/recipes/RecipeModal.vue'
import type { Meal } from '@/types/mealdb'

const randomizerStore = useRandomizerStore()

const selectedMealForModal = ref<Meal | null>(null)
const modalOpen = ref(false)

function onSpinComplete(tacoType: string) {
  randomizerStore.spin(tacoType)
}

function openRecipeModal(meal: Meal) {
  selectedMealForModal.value = meal
  modalOpen.value = true
}

function onModalUpdate(value: boolean) {
  modalOpen.value = value
  if (!value) {
    selectedMealForModal.value = null
  }
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
