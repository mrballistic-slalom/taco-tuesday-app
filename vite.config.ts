import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    globals: true,
    environment: 'jsdom',
    server: {
      deps: {
        inline: ['vuetify'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
      exclude: [
        'node_modules',
        'dist',
        '**/*.d.ts',
        // App entry & infrastructure
        'src/main.ts',
        'src/App.vue',
        'src/plugins/**',
        'src/router/**',
        'src/types/**',
        // Root config files
        '*.config.*',
        '.eslintrc.cjs',
        // Vercel Edge Function (E2E tested)
        'api/**',
        // Views are integration-level; logic lives in stores/composables
        'src/views/**',
        // Mapbox GL requires WebGL — untestable in jsdom
        'src/components/map/TacoMap.vue',
        // Canvas wheel requires CanvasRenderingContext2D — untestable in jsdom
        'src/components/randomizer/SpinWheel.vue',
      ],
    },
  },
})
