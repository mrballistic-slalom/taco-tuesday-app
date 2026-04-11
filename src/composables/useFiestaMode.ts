import { computed, type ComputedRef } from 'vue'
import { useTuesdayCheck } from '@/composables/useTuesdayCheck'

export function useFiestaMode(): { isActive: ComputedRef<boolean> } {
  const { isTuesday } = useTuesdayCheck()
  const isActive = computed(() => isTuesday.value)
  return { isActive }
}
