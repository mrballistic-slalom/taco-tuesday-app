# CLAUDE.md — Tacology

You are building **Tacology**, a fun taco-focused web app. This file is your single source of truth. Read it fully before writing any code. The full PRD lives at `docs/tacology-prd.md` — consult it for additional detail, but this file wins on any conflict.

---

## Non-Negotiable Rules

- **Never use the Anthropic API.** This project does not call Anthropic.
- **Never use Axios.** HTTP calls use native `fetch` only.
- **Never use Options API.** All Vue components use `<script setup>` with Composition API.
- **Never use `any` in TypeScript.** Use proper types from `src/types/`. If a type is missing, create it.
- **Never commit secrets.** `YELP_API_KEY` (no `VITE_` prefix) is server-side only. `VITE_MAPBOX_TOKEN` is the only client-exposed key.
- **Never call Yelp from the browser.** All Yelp requests go through `api/yelp.ts`. CORS will block direct calls.
- **Never use `localStorage` or `sessionStorage`.** State lives in Pinia stores only.
- **Never skip tests.** Every file in the required test list must exist and pass.

---

## Stack

```
Vue 3 + TypeScript   →  <script setup> Composition API, strict mode
Vuetify 3            →  UI components, custom taco theme (dark)
Vite                 →  build tool
Vue Router 4         →  createWebHashHistory (hash routing, no server config needed)
Pinia                →  one store per feature domain
Mapbox GL JS v3      →  3D map, dark-v11 style, building extrusions
TheMealDB API        →  free, no key, REST
Yelp Fusion API      →  proxied via api/yelp.ts, Bearer token server-side only
Vitest               →  unit tests, 80% coverage gate
ESLint + Prettier    →  zero warnings policy
GitHub Actions       →  lint → type-check → test → build
Vercel               →  deploy from main, serverless function for Yelp proxy
```

---

## Build Order

Execute in this exact sequence. Do not proceed until the current gate passes.

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
Set up in this order: `tsconfig.json` → `vite.config.ts` → `.eslintrc.cjs` → `.prettierrc` → `vercel.json`.
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
Create `api/yelp.ts`. Must be complete before any component that calls Yelp is built.
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

### `package.json` scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.ts,.tsx --max-warnings 0",
    "lint:fix": "eslint . --ext .vue,.ts,.tsx --fix",
    "type-check": "vue-tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Environment Variables

| Variable | Scope | Used By |
|---|---|---|
| `VITE_MAPBOX_TOKEN` | Client (browser) | `TacoMap.vue` |
| `YELP_API_KEY` | Server only — no `VITE_` prefix | `api/yelp.ts` |

`.env.example`:
```
VITE_MAPBOX_TOKEN=your_mapbox_token_here
YELP_API_KEY=your_yelp_bearer_token_here
```

**Never** prefix `YELP_API_KEY` with `VITE_` — it will be exposed in the browser bundle.

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
The function adds `Authorization: Bearer ${process.env.YELP_API_KEY}` and proxies to `https://api.yelp.com/v3/businesses/search`. Returns raw Yelp JSON. On error, returns `{ error: string }` with the appropriate HTTP status.

### Mapbox
Access token from `import.meta.env.VITE_MAPBOX_TOKEN`. Style: `mapbox://styles/mapbox/dark-v11`. Never hardcode the token.

---

## Routing

| Path | View | Nav Label | Icon |
|---|---|---|---|
| `/` | Redirect → `/map` | — | — |
| `/map` | `MapView.vue` | Find Tacos | `mdi-map-marker-radius` |
| `/recipes` | `RecipesView.vue` | Recipes | `mdi-book-open-variant` |
| `/randomizer` | `RandomizerView.vue` | Spin It | `mdi-slot-machine` |
| `/tuesday` | `TuesdayView.vue` | Taco Tuesday | `mdi-party-popper` |

Use `createWebHashHistory` — no server-side routing config needed on Vercel.

---

## TypeScript Types

### `src/types/yelp.ts`
```typescript
export interface YelpBusiness {
  id: string
  name: string
  rating: number
  review_count: number
  price?: string
  location: { display_address: string[] }
  coordinates: { latitude: number; longitude: number }
  categories: { alias: string; title: string }[]
  url: string
  image_url?: string
}

export interface YelpSearchResponse {
  businesses: YelpBusiness[]
  total: number
}
```

### `src/types/mealdb.ts`
```typescript
export interface Meal {
  idMeal: string
  strMeal: string
  strCategory: string
  strArea: string
  strInstructions: string
  strMealThumb: string
  strYoutube?: string
  [key: `strIngredient${number}`]: string | null
  [key: `strMeasure${number}`]: string | null
}

export interface MealDBResponse {
  meals: Meal[] | null
}

export interface ParsedIngredient {
  ingredient: string
  measure: string
}
```

---

## Pinia Stores

### `mapStore.ts`
```typescript
// state: shops: YelpBusiness[], selectedShop: YelpBusiness | null, loading: boolean, error: string | null
// actions: fetchShops(lat, lng), selectShop(shop), clearSelection()
```

### `recipeStore.ts`
```typescript
// state: recipes: Meal[], selectedRecipe: Meal | null, loading: boolean, searchQuery: string, error: string | null
// actions: searchRecipes(query), fetchRecipeById(id), clearSelection()
```

### `randomizerStore.ts`
```typescript
// state: isSpinning: boolean, result: Meal | null, error: string | null
// actions: spin(tacoType), reset()
```

### `tuesdayStore.ts`
```typescript
// state: spots: YelpBusiness[], loading: boolean, error: string | null
// actions: fetchSpots(lat, lng), clear()
// getters: hasSpots: boolean
```

---

## Composables

### `useGeolocation.ts`
```typescript
// Wraps navigator.geolocation.getCurrentPosition in a Promise
// Exports: getLocation(): Promise<{ lat: number; lng: number }>
// Rejects with Error if geolocation unavailable or user denies
// Timeout: 8000ms
```

### `useTuesdayCheck.ts`
```typescript
// Exports: isTuesday: ComputedRef<boolean>
// Uses new Date().getDay() === 2
// Evaluated once on composable init — no reactive timer needed
export function useTuesdayCheck() {
  const isTuesday = computed(() => new Date().getDay() === 2)
  return { isTuesday }
}
```

### `useFiestaMode.ts`
```typescript
// Exports: isActive: ComputedRef<boolean>
// isActive delegates to isTuesday from useTuesdayCheck
// Consumed by both TuesdayView and AppNav
```

### `useMealDB.ts`
```typescript
// Exports: searchMeals(query: string): Promise<Meal[]>
//          getMealById(id: string): Promise<Meal | null>
//          getRandomMeal(): Promise<Meal | null>
// All functions throw on non-2xx HTTP responses
```

### `useYelp.ts`
```typescript
// Fetches from /api/yelp (the Vercel proxy — never call Yelp directly)
// Exports: searchTacoShops(lat: number, lng: number): Promise<YelpBusiness[]>
//          searchTacoTuesdayShops(lat: number, lng: number): Promise<YelpBusiness[]>
// searchTacoShops:        term='tacos',        limit=20, sort_by=rating
// searchTacoTuesdayShops: term='taco tuesday', limit=10, sort_by=rating
// Both functions throw on error
```

---

## Key Implementation Details

### Geolocation fallback
On success: use user coords. On denial or unavailability: fall back silently to Portland, OR (`[-122.6765, 45.5231]`). Never show an error to the user for geolocation denial.

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
Always destroy the map instance in `onUnmounted` to prevent memory leaks:
```typescript
onUnmounted(() => map?.remove())
```

### Map pins
Custom HTML element for each marker: a `div` styled as a taco emoji `🌮` in a circular badge (32×32px, white background, subtle drop shadow, `cursor: pointer`). On click: set `mapStore.selectedShop`, fly to coords (zoom 15, pitch 60), open ShopCard panel.

### Map camera initialization
Fly to user coords at zoom `13`, pitch `45`, bearing `0`. Default to Portland if geolocation fails.

### ShopCard quips (10 hardcoded strings)
Random tagline from:
- `"This place slaps harder than a late-night craving."`
- `"Rated 🌮🌮🌮 on the Todd Scale."`
- *(add 8 more taco-themed quips)*

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

### RecipeModal ingredient UX
Render ingredients as a `v-list` with checkboxes. Toggling a checkbox marks it as "I have this" (crossed-off style). Instructions: replace `\n` with `<br>`. If `strYoutube` is present, show "Watch on YouTube 🎬" button.

### Debounce for recipe search
```typescript
let debounceTimer: ReturnType<typeof setTimeout>
function onSearchInput(query: string) {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => recipeStore.searchRecipes(query), 400)
}
```
Search triggers on mount with query `'taco'`.

### Randomizer wheel
- Canvas element: 340×340px (scales down on small screens).
- 12 segments with 12 taco types: `Al Pastor`, `Carnitas`, `Birria`, `Fish Taco`, `Carne Asada`, `Veggie`, `Chicken Tinga`, `Barbacoa`, `Shrimp`, `Chorizo`, `Lengua`, `Potato`
- Warm/vibrant colors for segments (oranges, reds, yellows, greens — no muted colors).
- Triangular pointer SVG at the top pointing down.
- Spin button: `v-btn`, color `#FF6B35`, text `"🌮 SPIN THE WHEEL"`, size `x-large`. Disabled while spinning.
- Animation: `transform: rotate()` — 5–8 full rotations over 4 seconds, `cubic-bezier(0.17, 0.67, 0.12, 0.99)` easing. Final rotation determines the winning segment.
- On result: animate in `TacoResult` with `<Transition name="slide-up">`.
- `TacoResult`: meal image, name, "View Full Recipe" button (opens RecipeModal), "SPIN AGAIN" button (resets state).

### AppNav
- **Mobile (< 960px):** `v-bottom-navigation` with 4 items (icons + labels). Active route highlighted in `#FF6B35`. On Tuesdays, the Taco Tuesday nav item pulses: `animation: pulse 1.5s infinite` using the secondary yellow.
- **Desktop (≥ 960px):** `v-navigation-drawer`, permanent, 220px wide. App logo `🌮 Tacology` at top. A fun taco fact in a `v-chip` at the bottom that rotates randomly on each page load. On Tuesdays, the logo area cycles through the Fiesta palette (CSS keyframe via dynamic `:style`).
- **Fiesta Mode:** When `isActive` is true, nav background animates through the Fiesta palette:
```css
@keyframes fiestaNav {
  0%   { background-color: #FF6B35; }
  25%  { background-color: #FFD166; }
  50%  { background-color: #06D6A0; }
  75%  { background-color: #EF476F; }
  100% { background-color: #FF6B35; }
}
/* animation: fiestaNav 3s ease-in-out infinite */
```

### TuesdayView — it IS Tuesday
- Hero banner: gradient `#FF6B35 → #FFD166`, text `"🌮 IT'S TACO TUESDAY, BABY! 🌮"`, 3rem desktop / 2rem mobile, bold, white, subtle `text-shadow`.
- Below: `v-progress-circular` while loading, then vertically stacked `TuesdayShopCard` list.
- `TuesdayShopCard`: rank badge (🥇🥈🥉 for top 3, plain numbers for 4–10), name, `v-rating`, address, price, Yelp button, one of 6 Tuesday-specific quips.

### TuesdayView — it is NOT Tuesday
- `TuesdayBanner` only. No Yelp data, no Fiesta elements.
- Shows: `"Come Back on Tuesday"`, `"Tacos are coming. Hold tight."`, day countdown.
- Countdown computed: days until next Tuesday using `new Date()`.
- Desaturated/grayscale brand colors. Taco emoji bobs: `transform: translateY` keyframe, 2s infinite ease-in-out.

### Fiesta confetti (FiestaOverlay.vue)
- Positioned `fixed`, `pointer-events: none`, `z-index: 9999`, full viewport.
- Create 80 `div` elements in `onMounted`, append to the overlay container ref.
- Each div: random `left` (0–100vw), random `width` (6–12px), random `height` (10–18px), random color from `['#FF6B35','#FFD166','#06D6A0','#EF476F','#A855F7']`, `animation: confettiFall {3–7}s {0–3}s linear infinite`, `will-change: transform`, `position: absolute`.
- `@keyframes confettiFall`: starts at `top: -20px; transform: rotate(0deg)`, ends at `top: 110vh; transform: rotate(720deg)`.
- Destroy all confetti divs in `onUnmounted`.
- **Respect `prefers-reduced-motion`:** Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before creating any confetti. If true, skip entirely — also skip nav color-cycle in AppNav.

### Page transitions
Wrap `<router-view>` in `<Transition name="fade">` with 200ms opacity transition.

### Accessibility
- All interactive elements must have `aria-label` attributes.
- Map markers must be keyboard-focusable (`tabIndex=0`, `keydown Enter` triggers click).
- Use `v-skeleton-loader` for all async loading states (not spinners).
- App must be usable at 375px width (iPhone SE).

---

## Vuetify Theme

```typescript
// src/plugins/vuetify.ts
const tacoTheme = {
  dark: true,  // dark theme throughout
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

Global styles in `App.vue`: `body { background-color: #1A1A2E; }`, `* { font-family: 'Nunito', sans-serif; }`. Set Vuetify `rounded` default to `lg` (12px).

---

## Error Message Copy

Use these exact strings:

| Situation | Message |
|---|---|
| Yelp shops load fail | `"The taco truck broke down 🚚💨 — couldn't load shops."` |
| Yelp Tuesday load fail | `"Couldn't find Taco Tuesday spots nearby. Your city might just not deserve tacos. 😤"` |
| Yelp Tuesday empty | `"Yelp has no idea. Go find your own Tuesday tacos. 🕵️"` |
| Recipe search empty | `"No tacos found. We're as sad as you are. 😢"` |
| Randomizer no result | `"TheMealDB is taco-less for '{type}'. The audacity. Try again! 🌮"` |
| Geolocation denied | Fall back silently to Portland, OR — no error shown to user |

---

## Testing Patterns

### Mock `fetch`
```typescript
import { vi, beforeEach } from 'vitest'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

vi.mocked(fetch).mockResolvedValueOnce({
  ok: true,
  json: async () => ({ meals: [{ idMeal: '1', strMeal: 'Taco' }] })
} as Response)
```

### Mock `Date` for Tuesday tests
```typescript
// Always call vi.useFakeTimers() before vi.setSystemTime()
vi.useFakeTimers()
vi.setSystemTime(new Date('2024-01-09')) // a Tuesday (getDay() === 2)
vi.setSystemTime(new Date('2024-01-08')) // a Monday
afterEach(() => vi.useRealTimers())
```

### Mock `navigator.geolocation`
```typescript
const mockGeolocation = { getCurrentPosition: vi.fn() }
vi.stubGlobal('navigator', { geolocation: mockGeolocation })

// Success:
mockGeolocation.getCurrentPosition.mockImplementationOnce((success) =>
  success({ coords: { latitude: 45.52, longitude: -122.68 } })
)
// Denial:
mockGeolocation.getCurrentPosition.mockImplementationOnce((_, error) =>
  error({ code: 1, message: 'User denied' })
)
```

### Pinia in tests
```typescript
import { setActivePinia, createPinia } from 'pinia'
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

### Required test files

| File | What to test |
|---|---|
| `tests/composables/useMealDB.test.ts` | Mock fetch; test search, getById, getRandom; test error throwing |
| `tests/composables/useYelp.test.ts` | Mock fetch to `/api/yelp`; test searchTacoShops and searchTacoTuesdayShops; success and error cases |
| `tests/composables/useGeolocation.test.ts` | Mock `navigator.geolocation`; test success, denial, timeout |
| `tests/composables/useTuesdayCheck.test.ts` | Mock `Date` to a Tuesday and a non-Tuesday; assert isTuesday both ways |
| `tests/composables/useFiestaMode.test.ts` | Assert isActive mirrors isTuesday; mock useTuesdayCheck |
| `tests/stores/mapStore.test.ts` | Test fetchShops, selectShop, clearSelection; mock useYelp |
| `tests/stores/recipeStore.test.ts` | Test searchRecipes, fetchRecipeById; mock useMealDB |
| `tests/stores/randomizerStore.test.ts` | Test spin (found + not found), reset; mock useMealDB |
| `tests/stores/tuesdayStore.test.ts` | Test fetchSpots (success, error, empty); test clear(); mock useYelp |
| `tests/components/RecipeCard.test.ts` | Renders meal name, image, chips; emits click |
| `tests/components/ShopCard.test.ts` | Renders shop name, rating, address; Yelp link correct |
| `tests/components/AppNav.test.ts` | Renders all 4 nav items; active route highlighted; Tuesday item pulses on Tuesday |
| `tests/components/TuesdayBanner.test.ts` | Renders countdown correctly on non-Tuesday; does not render on Tuesday |
| `tests/components/FiestaOverlay.test.ts` | Mounts 80 confetti divs on Tuesday; does not render on non-Tuesday |

### Coverage gate
`vitest run --coverage` must exit 0. Thresholds enforced in `vite.config.ts`: 80% lines/branches/functions/statements. Add tests; never lower the threshold.

---

## CI Pipeline (`.github/workflows/ci.yml`)

```yaml
name: CI
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
      - run: npm run build
```

---

## Out of Scope (v1)

- User authentication or login
- Favorites / saved items
- User-submitted reviews
- PWA / service worker / offline support
- i18n or localization
- SSR (server-side rendering)
- Fiesta Mode audio (mariachi music)
- Any direct Anthropic API calls
