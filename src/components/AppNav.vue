<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useFiestaMode } from '@/composables/useFiestaMode'

const route = useRoute()
const router = useRouter()
const display = useDisplay()
const { isActive } = useFiestaMode()

const reducedMotion = ref(false)

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  randomFact.value = tacoFacts[Math.floor(Math.random() * tacoFacts.length)]
})

const tacoFacts = [
  'Americans eat over 4.5 billion tacos a year!',
  'The word "taco" predates Europeans arriving in Mexico.',
  'The first hard-shell taco recipe appeared in 1949.',
  'Tacos are the most popular Mexican food in the US.',
  'October 4th is National Taco Day.',
]

const randomFact = ref('')

const navItems = [
  { label: 'Find Tacos', path: '/map', icon: 'mdi-map-marker-radius' },
  { label: 'Recipes', path: '/recipes', icon: 'mdi-book-open-variant' },
  { label: 'Spin It', path: '/randomizer', icon: 'mdi-slot-machine' },
  { label: 'Taco Tuesday', path: '/tuesday', icon: 'mdi-party-popper' },
]

const currentRoute = computed(() => route.path)

function navigate(path: string) {
  router.push(path)
}

const fiestaNavStyle = computed(() => {
  if (!isActive.value || reducedMotion.value) return {}
  return { animation: 'fiestaNav 4s linear infinite' }
})

const tuesdayItemStyle = computed(() => {
  if (!isActive.value || reducedMotion.value) return {}
  return { animation: 'pulse 1.5s infinite' }
})
</script>

<template>
  <template v-if="display.mdAndUp.value">
    <!-- Desktop: permanent navigation drawer -->
    <v-navigation-drawer permanent width="220" :style="fiestaNavStyle">
      <div class="nav-logo pa-4">
        <div class="text-h5 font-weight-black">🌮 Tacology</div>
      </div>

      <v-divider />

      <v-list nav class="mt-2">
        <v-list-item
          v-for="item in navItems"
          :key="item.path"
          :prepend-icon="item.icon"
          :title="item.label"
          :active="currentRoute === item.path"
          active-color="primary"
          :style="item.path === '/tuesday' ? tuesdayItemStyle : {}"
          @click="navigate(item.path)"
        />
      </v-list>

      <template #append>
        <div class="pa-3">
          <v-chip size="small" color="secondary" class="text-wrap" style="height: auto; white-space: normal">
            {{ randomFact }}
          </v-chip>
        </div>
      </template>
    </v-navigation-drawer>
  </template>

  <template v-else>
    <!-- Mobile: bottom navigation -->
    <v-bottom-navigation :model-value="currentRoute" color="#FF6B35" :style="fiestaNavStyle">
      <v-btn
        v-for="item in navItems"
        :key="item.path"
        :value="item.path"
        :style="item.path === '/tuesday' ? tuesdayItemStyle : {}"
        @click="navigate(item.path)"
      >
        <v-icon>{{ item.icon }}</v-icon>
        <span>{{ item.label }}</span>
      </v-btn>
    </v-bottom-navigation>
  </template>
</template>

<style scoped>
.nav-logo {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

@keyframes fiestaNav {
  0% {
    background-color: #ff6b35;
  }
  25% {
    background-color: #ffd166;
  }
  50% {
    background-color: #06d6a0;
  }
  75% {
    background-color: #ef476f;
  }
  100% {
    background-color: #ff6b35;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
