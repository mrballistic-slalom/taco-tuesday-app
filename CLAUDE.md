# CLAUDE.md — Tacology

You are building **Tacology**, a fun taco-focused web app. This file is your single source of truth. Read it fully before writing any code. Do not deviate from the decisions made here — if something is ambiguous, re-read this file before asking.

---

## Mission

Build the complete Tacology application as specified in `tacology-prd.md`. The app must be fully functional, linted, type-checked, tested to 80% coverage, and deployable to Vercel in a single pass. Do not leave stubs, TODOs, or placeholder components.

---

## Non-Negotiable Rules

- **Never use the Anthropic API directly.** This project does not call Anthropic. Ignore any temptation to add it.
- **Never use Axios.** HTTP calls use native `fetch` only.
- **Never use Options API.** All Vue components use `<script setup>` with Composition API.
- **Never use `any` in TypeScript.** Use proper types from `src/types/`. If a type is missing, create it.
- **Never commit secrets.** `YELP_API_KEY` (no `VITE_` prefix) is server-side only. `VITE_MAPBOX_TOKEN` is the only client-exposed key.
- **Never call Yelp from the browser.** All Yelp requests go through `api/yelp.ts` (the Vercel Edge Function proxy). CORS will block direct calls.
- **Never use `localStorage` or `sessionStorage`.** State lives in Pinia stores only.
- **Never skip tests.** Every file in the required test list (PRD Section 18) must exist and pass.

---

## Stack at a Glance

```
Vue 3 + TypeScript   →  <script setup> Composition API, strict mode
Vuetify 3            →  UI components, custom taco theme
Vite                 →  build tool
Vue Router 4         →  createWebHashHistory (hash routing)
Pinia                →  one store per feature domain
Mapbox GL JS v3      →  3D map, dark-v11 style, building extrusions
TheMealDB API        →  free, no key, REST
Yelp Fusion API      →  proxied via api/yelp.ts, Bearer token server-side
Vitest               →  unit tests, 80% coverage gate
ESLint + Prettier    →  zero warnings policy
GitHub Actions       →  lint → type-check → test → build
Vercel               →  deploy from main, Edge Function for Yelp proxy
```

---

## Build Order

Execute in this exact sequence. Do not proceed to the next step until the current one passes its validation gate.

### Step 1 — Scaffold
```bash
npm create vuetify@latest tacology
# Choose: Vue 3, TypeScript, Vite, ESLint + Prettier
cd tacology
```
**Gate:** `npm run dev` serves without errors.

### Step 2 — Install Dependencies
```bash
npm install mapbox-gl @types/mapbox-gl
npm install pinia vue-router@4
npm install -D vitest @vitest/coverage-v8 @vue/test-utils jsdom
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-vue
```
**Gate:** `npm install` exits 0, no peer dependency errors.

### Step 3 — Configure Tooling
Set up in this order: `tsconfig.json` (strict mode) → `vite.config.ts` (vitest config inline) → `.eslintrc.cjs` → `.prettierrc` → `vercel.json`.
**Gate:** `npm run lint` and `npm run type-check` both pass on the empty scaffold.

### Step 4 — Types & Interfaces
Create all files in `src/types/` before writing any composables or stores.
**Gate:** `tsc --noEmit` passes clean.

### Step 5 — Composables
Build in dependency order:
1. `useGeolocation.ts`
2. `useTuesdayCheck.ts`
3. `useFiestaMode.ts`
4. `useMealDB.ts`
5. `useYelp.ts`

**Gate:** Each composable has a corresponding test file written immediately after. `vitest run` passes for composables before moving on.

### Step 6 — Pinia Stores
Build in this order: `mapStore` → `recipeStore` → `randomizerStore` → `tuesdayStore`.
**Gate:** Store tests pass. `tsc --noEmit` clean.

### Step 7 — Vercel Proxy
Create `api/yelp.ts`. This must be complete before any component that calls Yelp is built.
**Gate:** File exists, TypeScript compiles, exports `config = { runtime: 'edge' }`.

### Step 8 — Router & App Shell
Create `src/router/index.ts`, `src/plugins/vuetify.ts`, `App.vue`, `AppNav.vue`.
**Gate:** All 4 routes render without console errors. Nav switches views correctly.

### Step 9 — Feature Views (parallel order is fine)
Build each view and its child components together:
- `/map` → `MapView.vue`, `TacoMap.vue`, `ShopCard.vue`
- `/recipes` → `RecipesView.vue`, `RecipeGrid.vue`, `RecipeCard.vue`, `RecipeModal.vue`
- `/randomizer` → `RandomizerView.vue`, `SpinWheel.vue`, `TacoResult.vue`
- `/tuesday` → `TuesdayView.vue`, `TuesdayBanner.vue`, `TuesdayShopCard.vue`, `FiestaOverlay.vue`

**Gate:** Each view renders correctly in dev. No TypeScript errors. Component tests written alongside each component.

### Step 10 — CI Pipeline
Create `.github/workflows/ci.yml`.
**Gate:** All four steps (lint, type-check, test, build) would pass if run now.

### Step 11 — Final Validation
```bash
npm run lint          # must exit 0, zero warnings
npm run type-check    # must exit 0
npm run test:coverage # must exit 0, ≥80% coverage
npm run build         # must exit 0, dist/ created
```
All four must pass before the build is considered complete.

---

## Tooling Config

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ESNext",
    "jsx": "preserve",
    "lib": ["ESNext", "DOM"],
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src/**/*", "api/**/*", "tests/**/*"]
}
```

### `vite.config.ts`
```typescript
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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
      exclude: ['node_modules', 'dist', '**/*.d.ts', 'src/main.ts', 'src/plugins/**']
    }
  }
})
```

### `.eslintrc.cjs`
```javascript
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'prettier'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/component-api-style': ['error', ['script-setup']],
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
}
```

### `.prettierrc`
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

### `vercel.json`
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}
```

---

## Environment Variables

| Variable | Scope | Used By |
|---|---|---|
| `VITE_MAPBOX_TOKEN` | Client (browser) | `TacoMap.vue` |
| `YELP_API_KEY` | Server only — no `VITE_` prefix | `api/yelp.ts` |

Create `.env.example`:
```
VITE_MAPBOX_TOKEN=your_mapbox_token_here
YELP_API_KEY=your_yelp_bearer_token_here
```

**Never** add `YELP_API_KEY` to any `VITE_`-prefixed variable. It will be exposed in the browser bundle.

---

## API Contracts

### TheMealDB (no auth)
```
GET https://www.themealdb.com/api/json/v1/1/search.php?s={query}
GET https://www.themealdb.com/api/json/v1/1/lookup.php?i={id}
GET https://www.themealdb.com/api/json/v1/1/random.php
```
All return `{ meals: Meal[] | null }`. A `null` meals array means no results — handle gracefully, do not throw.

### Yelp Proxy (`api/yelp.ts`)
```
GET /api/yelp?term={term}&latitude={lat}&longitude={lng}&limit={n}&sort_by=rating
```
The Edge Function adds `Authorization: Bearer ${process.env.YELP_API_KEY}` and proxies to `https://api.yelp.com/v3/businesses/search`. Returns raw Yelp JSON. On error, returns `{ error: string }` with the appropriate HTTP status.

### Mapbox
Access token read from `import.meta.env.VITE_MAPBOX_TOKEN`. Map style: `mapbox://styles/mapbox/dark-v11`. Never hardcode the token.

---

## Testing Patterns

### Mock `fetch`
```typescript
import { vi, beforeEach } from 'vitest'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

// In each test:
vi.mocked(fetch).mockResolvedValueOnce({
  ok: true,
  json: async () => ({ meals: [{ idMeal: '1', strMeal: 'Taco', ... }] })
} as Response)
```

### Mock `Date` for Tuesday tests
```typescript
// Force Tuesday (getDay() === 2)
vi.setSystemTime(new Date('2024-01-09')) // a Tuesday

// Force non-Tuesday
vi.setSystemTime(new Date('2024-01-08')) // a Monday

afterEach(() => vi.useRealTimers())
```
Always call `vi.useFakeTimers()` before `vi.setSystemTime()`.

### Mock `navigator.geolocation`
```typescript
const mockGeolocation = {
  getCurrentPosition: vi.fn()
}
vi.stubGlobal('navigator', { geolocation: mockGeolocation })

// Success case:
mockGeolocation.getCurrentPosition.mockImplementationOnce((success) =>
  success({ coords: { latitude: 45.52, longitude: -122.68 } })
)

// Denial case:
mockGeolocation.getCurrentPosition.mockImplementationOnce((_, error) =>
  error({ code: 1, message: 'User denied' })
)
```

### Pinia in tests
```typescript
import { setActivePinia, createPinia } from 'pinia'
import { beforeEach } from 'vitest'

beforeEach(() => setActivePinia(createPinia()))
```

### Vue component mounting
```typescript
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({ components, directives })

const wrapper = mount(MyComponent, {
  global: { plugins: [vuetify, createPinia()] },
  props: { /* ... */ }
})
```

### Coverage gate
`vitest run --coverage` must exit 0. The thresholds (80% lines/branches/functions/statements) are enforced in `vite.config.ts`. If coverage drops below 80%, the build fails — add tests, do not lower the threshold.

---

## Key Implementation Details

### Hash Routing
```typescript
// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'
// Use createWebHashHistory — Vercel serves a SPA with no server-side routing config needed
```

### Mapbox 3D Buildings
```typescript
map.on('load', () => {
  map.addLayer({
    id: '3d-buildings',
    source: 'composite',
    'source-layer': 'building',
    type: 'fill-extrusion',
    paint: {
      'fill-extrusion-color': '#aaa',
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-opacity': 0.6
    }
  })
})
```

### Mapbox cleanup
Always destroy the map instance in `onUnmounted` to prevent memory leaks:
```typescript
onUnmounted(() => map?.remove())
```

### Ingredient parsing (TheMealDB)
```typescript
function parseIngredients(meal: Meal): ParsedIngredient[] {
  return Array.from({ length: 20 }, (_, i) => i + 1)
    .map(i => ({
      ingredient: meal[`strIngredient${i}`] ?? '',
      measure: meal[`strMeasure${i}`] ?? ''
    }))
    .filter(({ ingredient }) => ingredient.trim() !== '')
}
```

### Tuesday day check
```typescript
// useTuesdayCheck.ts
import { computed } from 'vue'
export function useTuesdayCheck() {
  const isTuesday = computed(() => new Date().getDay() === 2)
  return { isTuesday }
}
```

### Fiesta confetti (FiestaOverlay.vue)
- Create 80 `div` elements in `onMounted`, append to the overlay container ref.
- Each div gets inline styles: random `left` (0–100vw), random `width` (6–12px), random `height` (10–18px), random color from `['#FF6B35','#FFD166','#06D6A0','#EF476F','#A855F7']`, `animation: confettiFall {3–7}s {0–3}s linear infinite`, `will-change: transform`, `position: absolute`.
- Define `@keyframes confettiFall` in the component's `<style>` block.
- Remove all confetti divs in `onUnmounted`.
- Respect `prefers-reduced-motion`: check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before creating any confetti. If true, skip entirely.

### Debounce for recipe search
```typescript
// In RecipesView.vue
let debounceTimer: ReturnType<typeof setTimeout>
function onSearchInput(query: string) {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => recipeStore.searchRecipes(query), 400)
}
```

---

## Vuetify Theme

```typescript
// src/plugins/vuetify.ts
const tacoTheme = {
  dark: true,
  colors: {
    primary:      '#FF6B35',  // taco orange
    secondary:    '#FFD166',  // warm yellow
    accent:       '#06D6A0',  // cilantro green
    error:        '#EF476F',  // salsa red
    background:   '#1A1A2E',  // deep dark
    surface:      '#16213E',  // card surface
    'on-surface': '#EAEAEA',  // light text
  }
}
```

Load `Nunito` from Google Fonts in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;900&display=swap" rel="stylesheet">
```

---

## Error Message Copy

Use these exact strings for on-brand error UX:

| Situation | Message |
|---|---|
| Yelp shops load fail | `"The taco truck broke down 🚚💨 — couldn't load shops."` |
| Yelp Tuesday load fail | `"Couldn't find Taco Tuesday spots nearby. Your city might just not deserve tacos. 😤"` |
| Yelp Tuesday empty | `"Yelp has no idea. Go find your own Tuesday tacos. 🕵️"` |
| Recipe search empty | `"No tacos found. We're as sad as you are. 😢"` |
| Randomizer no result | `"TheMealDB is taco-less for '{type}'. The audacity. Try again! 🌮"` |
| Geolocation denied | Fall back silently to Portland, OR — no error shown to user |

---

## What NOT to Build

Do not build any of the following — they are explicitly out of scope for v1:

- User authentication or login
- Favorites / saved items
- User-submitted reviews
- PWA / service worker / offline support
- i18n or localization
- SSR (server-side rendering)
- Fiesta Mode audio (mariachi music)
- Any direct Anthropic API calls
