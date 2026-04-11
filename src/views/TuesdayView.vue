<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTuesdayCheck } from '@/composables/useTuesdayCheck'
import { useGeolocation } from '@/composables/useGeolocation'
import { useTuesdayStore } from '@/stores/tuesdayStore'
import FiestaOverlay from '@/components/tuesday/FiestaOverlay.vue'
import TuesdayBanner from '@/components/tuesday/TuesdayBanner.vue'
import TuesdayShopCard from '@/components/tuesday/TuesdayShopCard.vue'

const { isTuesday } = useTuesdayCheck()
const { getLocation } = useGeolocation()
const tuesdayStore = useTuesdayStore()

const showError = ref(false)

onMounted(async () => {
  if (!isTuesday.value) return

  let lat = 45.5231
  let lng = -122.6765

  try {
    const location = await getLocation()
    lat = location.lat
    lng = location.lng
  } catch {
    // Fall back to Portland silently
  }

  await tuesdayStore.fetchSpots(lat, lng)

  if (tuesdayStore.error) {
    showError.value = true
  }
})

onUnmounted(() => {
  tuesdayStore.clear()
})
</script>

<template>
  <div v-if="isTuesday" class="tuesday-view">
    <FiestaOverlay />
    <div class="tuesday-hero">
      <h1>🌮 IT'S TACO TUESDAY, BABY! 🌮</h1>
      <p>Find your nearest Taco Tuesday spots</p>
    </div>
    <v-container>
      <v-progress-circular
        v-if="tuesdayStore.loading"
        indeterminate
        color="primary"
        size="64"
        class="d-flex mx-auto my-8"
      />
      <div v-else-if="tuesdayStore.error">
        <v-snackbar v-model="showError" timeout="5000" color="error">
          Couldn't find Taco Tuesday spots nearby. Your city might just not deserve tacos. 😤
        </v-snackbar>
      </div>
      <div v-else-if="!tuesdayStore.hasSpots" class="text-center pa-8">
        <p>Yelp has no idea. Go find your own Tuesday tacos. 🕵️</p>
      </div>
      <div v-else>
        <TuesdayShopCard
          v-for="(spot, index) in tuesdayStore.spots"
          :key="spot.id"
          :shop="spot"
          :rank="index + 1"
          class="mb-4"
        />
      </div>
    </v-container>
  </div>
  <div v-else>
    <TuesdayBanner />
  </div>
</template>

<style scoped>
.tuesday-hero {
  background: linear-gradient(135deg, #ff6b35, #ffd166);
  text-align: center;
  padding: 48px 16px;
}
.tuesday-hero h1 {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 900;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  margin: 0;
}
</style>
