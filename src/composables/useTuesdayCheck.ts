import { computed } from 'vue'

export function useTuesdayCheck() {
  const isTuesday = computed(() => new Date().getDay() === 2)
  return { isTuesday }
}
