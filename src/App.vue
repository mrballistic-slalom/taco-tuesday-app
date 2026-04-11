<script setup lang="ts">
import AppNav from './components/AppNav.vue'
</script>

<template>
  <v-app>
    <AppNav />
    <v-main>
      <router-view v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </v-main>
  </v-app>
</template>

<style>
body {
  background-color: #1a1a2e;
}
* {
  font-family: 'Nunito', sans-serif;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
