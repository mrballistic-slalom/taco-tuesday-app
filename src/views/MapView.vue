<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import TacoMap from '@/components/map/TacoMap.vue'
import ShopCard from '@/components/map/ShopCard.vue'
import { useMapStore } from '@/stores/mapStore'

const mapStore = useMapStore()
const { mdAndUp } = useDisplay()

const drawerOpen = computed({
  get: () => mdAndUp.value && mapStore.selectedShop !== null,
  set: () => {
    /* controlled via mapStore */
  },
})

const sheetOpen = computed({
  get: () => !mdAndUp.value && mapStore.selectedShop !== null,
  set: () => {
    /* controlled via mapStore */
  },
})

const snackbarVisible = computed(() => mapStore.error !== null)

function closeSelection() {
  mapStore.clearSelection()
}
</script>

<template>
  <div class="map-view-container">
    <!-- Map fills the full view -->
    <TacoMap />

    <!-- Floating search/info panel (top-left) -->
    <v-card
      class="map-overlay-panel"
      color="surface"
      elevation="6"
      rounded="lg"
      style="position: absolute; top: 72px; left: 16px; z-index: 10; min-width: 220px"
    >
      <v-card-title class="d-flex align-center ga-3 py-3 px-4">
        <span>Find Tacos Near You</span>
        <v-progress-circular
          v-if="mapStore.loading"
          indeterminate
          size="20"
          width="2"
          color="primary"
          aria-label="Loading taco shops"
        />
      </v-card-title>
    </v-card>

    <!-- Desktop: navigation drawer on the right -->
    <v-navigation-drawer
      v-if="mdAndUp"
      :model-value="drawerOpen"
      location="right"
      :temporary="true"
      width="340"
      color="surface"
      aria-label="Shop details"
    >
      <div class="pa-3">
        <div class="d-flex justify-end mb-2">
          <v-btn
            icon
            variant="text"
            aria-label="Close shop details"
            @click="closeSelection"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <ShopCard v-if="mapStore.selectedShop" :shop="mapStore.selectedShop" />
      </div>
    </v-navigation-drawer>

    <!-- Mobile: bottom sheet -->
    <v-bottom-sheet
      v-if="!mdAndUp"
      :model-value="sheetOpen"
      aria-label="Shop details"
    >
      <div class="pa-3" style="background-color: #16213e">
        <div class="d-flex justify-end mb-2">
          <v-btn
            icon
            variant="text"
            aria-label="Close shop details"
            @click="closeSelection"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <ShopCard v-if="mapStore.selectedShop" :shop="mapStore.selectedShop" />
      </div>
    </v-bottom-sheet>

    <!-- Error snackbar -->
    <v-snackbar
      :model-value="snackbarVisible"
      color="error"
      timeout="5000"
      location="bottom"
    >
      The taco truck broke down 🚚💨 — couldn't load shops.
      <template #actions>
        <v-btn
          variant="text"
          aria-label="Dismiss error"
          @click="mapStore.error = null"
        >
          Dismiss
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<style scoped>
.map-view-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 64px);
  overflow: hidden;
}
</style>
