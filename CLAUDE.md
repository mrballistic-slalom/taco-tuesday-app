# CLAUDE.md — Tacology

You are building **Tacology**, a fun taco-focused web app. This file is your single source of truth. Read it fully before writing any code. The full PRD lives at `docs/tacology-prd.md` — consult it for additional detail, but this file wins on any conflict.

---

## Non-Negotiable Rules

- **Never use the Anthropic API.** This project does not call Anthropic.
- **Never use Axios.** HTTP calls use native `fetch` only.
- **Never use Options API.** All Vue components use `<script setup>` with Composition API.
- **Never use `any` in TypeScript.** Use proper types from `src/types/`. If a type is missing, create it.
- **Never commit secrets.** `VITE_MAPBOX_TOKEN` is a Mapbox publishable token (safe in the browser bundle) and is the only client-exposed key. Protect it with a Mapbox URL allowlist scoped to your deploy hostnames.
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
Mapbox GL JS v3      →  3D map, streets-v12 style w/ faded-postcard CSS filter, building extrusions
Mapbox Search Box    →  taco POI search, browser-direct (CORS-friendly), uses VITE_MAPBOX_TOKEN
TheMealDB API        →  free, no key, REST
Vitest               →  unit tests, 80% coverage gate
ESLint + Prettier    →  zero warnings policy
GitHub Actions       →  lint → type-check → test → build
Vercel               →  deploy from main, no serverless function required for shop search
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
5. `useMapbox.ts`

**Gate:** Each composable has a corresponding test file written immediately after. `vitest run` passes for composables before moving on.

### Step 6 — Pinia Stores
Build in this order: `mapStore` → `recipeStore` → `randomizerStore` → `tuesdayStore`.
**Gate:** Store tests pass. `tsc --noEmit` clean.

### Step 7 — No Proxy Needed
Mapbox Search Box supports CORS, so `useMapbox` calls `api.mapbox.com` directly from the browser using `VITE_MAPBOX_TOKEN`. There is no Vercel serverless function for shop search. Skip this step.
**Gate:** None.

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
| `VITE_MAPBOX_TOKEN` | Client (browser) — Mapbox publishable token | `TacoMap.vue`, `useMapbox.ts` |

`.env.example`:
```
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

The Mapbox token is intentionally browser-exposed (Mapbox's `pk.*` publishable tokens are designed for this). Lock it down by adding a URL allowlist on the token at `account.mapbox.com` — include the production hostname and any preview hostnames you actively test against. Changes to the allowlist can take up to 10 minutes to propagate.

---

## API Contracts

### TheMealDB (no auth)
```
GET https://www.themealdb.com/api/json/v1/1/search.php?s={query}
GET https://www.themealdb.com/api/json/v1/1/lookup.php?i={id}
GET https://www.themealdb.com/api/json/v1/1/random.php
```
All return `{ meals: Meal[] | null }`. A `null` meals array means no results — handle gracefully, do not throw.

### Mapbox Search Box — Forward (taco POI search)
```
GET https://api.mapbox.com/search/searchbox/v1/forward
  ?q={query}
  &proximity={lng},{lat}
  &limit={1..10}
  &types=poi
  &access_token={VITE_MAPBOX_TOKEN}
```
Called directly from the browser by `useMapbox`. Returns a GeoJSON `FeatureCollection`; `useMapbox` reshapes each feature into a `MapboxTacoShop`. The forward endpoint caps `limit` at 10 — both `searchTacoShops` (`q=tacos`) and `searchTacoTuesdayShops` (`q=taco tuesday`) request `limit=10`.

### Mapbox GL JS (map style + tiles)
Access token from `import.meta.env.VITE_MAPBOX_TOKEN`. Style: `mapbox://styles/mapbox/streets-v12`, softened to a "faded postcard" look via a CSS `filter: saturate(0.7) brightness(1.04) contrast(0.96) sepia(0.06)` on the `#map` element. Never hardcode the token.

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

### `src/types/mapbox.ts`
```typescript
export interface MapboxTacoShop {
  id: string                // properties.mapbox_id
  name: string              // properties.name
  full_address: string      // properties.full_address ?? place_formatted
  coordinates: { latitude: number; longitude: number }
  categories: string[]      // properties.poi_category (slugs, e.g. 'mexican_restaurant')
  maki?: string             // properties.maki (icon name)
}

export interface MapboxSearchFeature {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: {
    mapbox_id: string
    name: string
    full_address?: string
    place_formatted?: string
    coordinates?: { latitude: number; longitude: number }
    poi_category?: string[]
    maki?: string
  }
}

export interface MapboxSearchResponse {
  type: 'FeatureCollection'
  features: MapboxSearchFeature[]
  attribution?: string
}
```

Mapbox does NOT return ratings, review counts, prices, or photos. Shop cards fall back to category chips and a Google Maps directions deep link instead.

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
// state: shops: MapboxTacoShop[], selectedShop: MapboxTacoShop | null, loading: boolean, error: string | null
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
// state: spots: MapboxTacoShop[], loading: boolean, error: string | null
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

### `useMapbox.ts`
```typescript
// Calls https://api.mapbox.com/search/searchbox/v1/forward directly from the browser
// (CORS-supported; no proxy). Reads VITE_MAPBOX_TOKEN at call time.
// Exports: searchTacoShops(lat: number, lng: number): Promise<MapboxTacoShop[]>
//          searchTacoTuesdayShops(lat: number, lng: number): Promise<MapboxTacoShop[]>
// searchTacoShops:        q='tacos',        limit=10
// searchTacoTuesdayShops: q='taco tuesday', limit=10
// Mapbox forward search caps limit at 10. Both functions throw on missing token,
// non-2xx response, or a payload missing the features array.
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
      'fill-extrusion-color': '#b8a78d',
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-opacity': 0.55
    }
  })
})
```
Color tuned for `streets-v12` + the canvas-only `filter: saturate(0.4) sepia(0.28) hue-rotate(-10deg)`. The filter is applied to `.mapboxgl-canvas` only — markers and controls are sibling DOM elements so they keep full saturation.

Always destroy the map instance in `onUnmounted` to prevent memory leaks:
```typescript
onUnmounted(() => map?.remove())
```

### Map pins
Custom HTML element for each marker: a 36×36 px circular badge with a `#FF6B35→#E11D48` radial gradient, a 2 px bone-white border, layered shadows, and a soft inner highlight. Drops in on add (`pinDrop` animation: 0.4 → 1.08 → 1 scale, opacity 0 → 1, 380 ms). On hover/focus: `scale: 1.18; translate: 0 -2px` plus a marigold halo via `box-shadow`. Click sets `mapStore.selectedShop`, flies the camera to coords (zoom 15, pitch 60), and opens the floating ShopCard.

**Critical:** all marker motion uses the independent `scale` / `translate` CSS properties — **not** `transform`. Mapbox positions markers via inline `transform: translate(...)` on the marker element itself, and CSS animations always win over inline styles in the cascade. If we animated `transform`, every marker would stack at (0, 0) once the animation locked in its final keyframe. `scale` and `translate` properties compose with `transform`, so Mapbox's positioning survives.

### Map camera initialization
Fly to user coords at zoom `14`, pitch `45`, bearing `0`. Default to Portland if geolocation fails.

Map options include `minPitch: 35` and `maxPitch: 70` so the camera never fully flattens when the user zooms out — preserves the 3D cantina-postcard feel across the whole zoom range.

After shops resolve, `fitBounds()` is called with `{ padding: { top: 100, right: 60, bottom: 120, left: 60 }, maxZoom: 15, duration: 700 }` so all pins are visible without zooming so far in that we miss any.

### "Search this area" affordance
`TacoMap` emits `userMove({ lat, lng })` whenever the user pans/zooms — filtered by `e.originalEvent` so our own programmatic `fitBounds`/`flyTo` don't trigger it. `MapView` keeps a `pendingSearchCenter` ref; while it's set, a glass pill labelled "🔍 Search this area" rises from below (animated via `<Transition name="search-rise">`). Tapping the pill re-fetches at the new center, clears the ref, and `fitBounds` re-centers on the new results.

The pill is hidden during `mapStore.loading` so the user can't double-fire.

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
- 8 segments with 8 taco types that all have matching recipes in TheMealDB: `Al Pastor`, `Carnitas`, `Fish Taco`, `Veggie`, `Chicken Tinga`, `Shrimp`, `Chorizo`, `Potato`. (Birria, Lengua, Barbacoa, and Carne Asada are excluded — they always 404 against TheMealDB.)
- Warm/vibrant colors for segments (oranges, reds, yellows, greens — no muted colors).
- Triangular pointer SVG at the top pointing down.
- Spin button: `v-btn`, color `#FF6B35`, text `"🌮 SPIN THE WHEEL"`, size `x-large`. Disabled while spinning.
- Animation: `transform: rotate()` — 5–8 full rotations over 4 seconds, `cubic-bezier(0.17, 0.67, 0.12, 0.99)` easing. Final rotation determines the winning segment.
- On result: animate in `TacoResult` with `<Transition name="slide-up">`.
- `TacoResult`: meal image, name, **"View Full Recipe"** rendered as a direct `<a href="recipe.sourceUrl" target="_blank">` link (no intermediate modal — clicking opens the recipe page in a new tab), plus a **"SPIN AGAIN"** button that emits `spin-again`. The button is hidden when `sourceUrl` is missing.

### AppNav
- **Mobile (< 960px):** `v-bottom-navigation` with warm-dark glass background (`rgba(60,15,22,0.82) → rgba(20,6,8,0.92)` linear gradient) and `backdrop-filter: blur`. Inactive labels are bone-white at 72% opacity; the active item gets an orange→salsa pill behind it with bone-white text.
- **Desktop (≥ 960px):** `v-navigation-drawer`, permanent, 240px wide, frosted glass (`var(--glass-bg)` + `backdrop-filter: blur`). The logo row uses Yatra One for "Tacology" alongside a 🌮 emoji, set on a warm gradient panel at the top. A taco-fact line (italic, marigold ✦ bullet) and a GitHub "View source" link sit in the drawer footer.
- **Active nav item:** orange→salsa linear gradient pill with an inset highlight and a glow shadow. Vuetify's `color="primary"` prop tries to paint the label/icon orange too, so we override with `color: var(--taco-bone) !important` on the title and icon.
- **Tuesday glow:** when `useFiestaMode().isActive` is true and `prefers-reduced-motion` is NOT set, the "Taco Tuesday" nav item gets a marigold halo (`tuesdayPulse` keyframe pulses the `box-shadow`, `tuesdayShimmer` pulses an underlay glow). The drawer background no longer color-cycles — the glow is the only fiesta tell, which reads as celebratory rather than chaotic against the glass.

### TuesdayView — it IS Tuesday
- **Papel-picado strip** across the top: an SVG `<pattern>` of cut-paper banderitas (marigold with salsa border, dot/triangle cutouts) tiled horizontally. The whole strip slowly sways via a `papelSway` keyframe.
- **Hero:** Yatra-One headline that wraps "It's / Taco Tuesday / , baby" with the middle phrase rendered in a gradient-fill (`#FFF8F0 → #FCD34D → #FF6B35`) and a pulsing drop-shadow glow. Eyebrow above ("TODAY'S THE DAY", uppercased + tracked).
- **Bobbing emoji row** below the headline: 🌮 🥑 🌶️ 🌮 🧀, each bobbing with a staggered animation delay.
- **Spot list:** glass cards stagger-fade in (60 ms cascade per card via `cardIn` animation + inline `animation-delay`). Rank-1 card wears a **"👑 Today's Champion"** ribbon and a marigold-glow `championShimmer` box-shadow.
- `TuesdayShopCard`: rank badge (🥇🥈🥉 for top 3, numbered chip for 4+), name (Yatra One), italic marigold tagline, full address, category chips with emoji prefixes (🇲🇽 for `mexican_restaurant`, 🌮 for `taco_shop`, 🍽️ for `restaurant`, …), and a "Get Directions" gradient-pill button that deep-links to Google Maps. No ratings / reviews / prices / photos — Mapbox doesn't return those.

### TuesdayView — it is NOT Tuesday
- `TuesdayBanner` only — energetic countdown, not a funereal placeholder.
- Glass card on the warm gradient with a soft marigold aura behind it.
- Eyebrow text adapts to proximity: "Almost there" (1 day), "Soon, very soon" (2), "Patience, amigo" (3), "Hang in there" (4–5), "A full week ahead" (6+).
- Headline matches: "Tomorrow we feast.", "Two sleeps to tacos.", "We're getting closer.", "Worth the wait.", "Build the appetite."
- Huge gradient-text day number (Yatra One, `#FFF8F0 → #FCD34D → #FF6B35`) followed by lowercase "day(s)" label.
- Progress rail: 10 px translucent track with a salsa→marigold gradient fill that animates from 0% (last Tuesday) to 100% (Tuesday again). A 🌮 emoji rides the right edge of the fill, free-floating above the rail so it isn't clipped.
- Row of 7 week-dots beneath the rail; elapsed dots glow marigold.
- Bobbing taco emoji at the top of the card.

### Fiesta confetti (FiestaOverlay.vue)
- Positioned `fixed`, `pointer-events: none`, `z-index: 9999`, full viewport.
- Creates exactly **80 child elements** in `onMounted` (the test asserts the count). About **70%** are colored rectangles, **30%** are emoji (🌮 🥑 🌶️ 🌽 🌯 🎉 ✨) for variety.
- Rectangle colors drawn from `['#FF6B35','#FCD34D','#06D6A0','#E11D48','#A855F7','#FFF8F0']`.
- Each piece has randomised `left` (0–100vw), size, rotation start/end, and horizontal drift, plus a 3–8 s `confettiFall` animation with a 0–4 s delay. Motion uses `translate3d(...) rotate(...)` composed via `transform`.
- `@keyframes confettiFall`: from `translate3d(0, 0, 0) rotate(start)` to `translate3d(drift, 110vh, 0) rotate(end)`.
- Destroy all elements in `onUnmounted`.
- **Respect `prefers-reduced-motion`:** Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before creating any confetti. If true, skip entirely. The Tuesday-glow nav animation also respects this preference.

### Page transitions
Wrap `<router-view>` in `<Transition name="fade">` with 200ms opacity transition.

### Accessibility
- All interactive elements must have `aria-label` attributes.
- Map markers must be keyboard-focusable (`tabIndex=0`, `keydown Enter` triggers click).
- Use `v-skeleton-loader` for all async loading states (not spinners).
- App must be usable at 375px width (iPhone SE).

---

## Design System — "Mercado Glass"

The visual language is **Mexican mercado / cantina at golden hour, behind frosted glass.** Warm sunset gradient as canvas, glassmorphism on every chrome surface, hand-painted display typography. The dark navy of the original spec is gone.

### Vuetify Theme

```typescript
// src/plugins/vuetify.ts
const tacoTheme = {
  dark: true,
  colors: {
    primary:      '#FF6B35',  // taco orange — CTAs, active states
    secondary:    '#FCD34D',  // marigold yellow — accents, highlights
    accent:       '#06D6A0',  // cilantro green — chips, icons
    error:        '#E11D48',  // salsa rose — error states
    background:   '#1A0608',  // deep mole — fallback under the gradient
    surface:      '#3B0F14',  // oxblood — fallback for non-glass surfaces
    'on-surface': '#FFF8F0',  // warm bone — body text
  }
}
```

Most actual surfaces (sidebar, count pill, shop cards, Tuesday banner) are translucent glass — the `background` / `surface` hex values are only fallbacks for anything that bypasses the glass utility classes.

### Body canvas

A fixed gradient + subtle SVG film-grain overlay applied to `<body>` in `App.vue`:
```css
background-image:
  radial-gradient(at 14% 8%, rgba(252,211,77,0.22), transparent 45%),
  radial-gradient(at 88% 92%, rgba(255,107,53,0.35), transparent 55%),
  linear-gradient(160deg,
    #1A0608 0%, #3B0F14 22%, #7C2D12 50%, #C2410C 78%, #EA8B26 100%);
background-attachment: fixed;
```
`.v-application`, `.v-application__wrap`, `.v-main`, `.v-layout` are forced to `background: transparent !important` so the body canvas shows through everywhere.

### Glass utility tokens

Exposed on `:root` in `App.vue`:
```css
--glass-bg:            rgba(255, 248, 240, 0.08);   /* bone tint, for dark-bg surfaces */
--glass-bg-strong:     rgba(255, 248, 240, 0.14);
--glass-border:        rgba(255, 248, 240, 0.18);
--glass-blur:          22px;
--glass-shadow:        0 8px 32px rgba(20, 6, 8, 0.35), inset 0 1px 0 rgba(255,255,255,0.18);
--glass-shadow-lifted: 0 18px 48px rgba(20, 6, 8, 0.45), inset 0 1px 0 rgba(255,255,255,0.22);
```

Two utility classes (`.glass-panel`, `.glass-panel-strong`) bundle them with `backdrop-filter: blur(...) saturate(140%)` + the border + the shadow.

**When NOT to use them:** anywhere the surface lives over the *light* map basemap (count pill, ShopCard floating panel). The bone-tinted glass is invisible against light tiles — use a **warm-dark glass** instead:
```css
background: linear-gradient(135deg, rgba(60,15,22,0.78) 0%, rgba(124,45,18,0.7) 100%);
backdrop-filter: blur(var(--glass-blur)) saturate(160%);
border: 1px solid rgba(252, 211, 77, 0.4);
```

### Accent ramp (also on `:root`)
```css
--taco-orange:   #FF6B35;
--taco-marigold: #FCD34D;
--taco-cilantro: #06D6A0;
--taco-salsa:    #E11D48;
--taco-bone:     #FFF8F0;
```

### Typography

Two Google Fonts loaded in `index.html`:
- **Yatra One** — chunky hand-painted display face, used for the app logo, `h1`/`h2`, hero headlines, day-count number, shop names. Cantina-signage energy.
- **Nunito** (400/600/700/900) — body, UI, chips, labels.

Apply Yatra One via `font-family: 'Yatra One', cursive;` or the `.display-font` utility class. The global `* { font-family: 'Nunito', sans-serif; }` rule handles body.

### Map UI chrome

- **Count pill** (top-center over the map): warm-dark glass tint, marigold border, bone text. Shifts to `left: calc(50% + 120px)` on desktop to center over the visible map area (the 240 px sidebar takes the left edge). Slides in from above via `pillIn` keyframe. Shows `"Finding taco spots…"` with bouncing dots during load, otherwise `"N taco spots near you"`.
- **"Search this area" pill** (bottom-center over the map): orange→salsa gradient button with marigold border. Same horizontal-shift trick for desktop centering. Hidden until the user pans/zooms; tap re-fetches at the new center.
- **ShopCard** (desktop): floating warm-dark glass card pinned to the right edge (`top: 88px; right: 24px; width: 360px`), with a circular close × button overlapping its top-right corner. Slides in via `<Transition name="card-slide">` (opacity + 36 px right-to-left). No drawer slab.
- **ShopCard** (mobile): same warm-dark glass card pinned to the bottom (`left: 16px; right: 16px; bottom: 76px`), with a tap-to-dismiss scrim behind it. Rises via `<Transition name="card-rise">`.

### Vuetify global rounded default
```typescript
defaults: { global: { rounded: 'lg' } }
```
12 px corners everywhere unless overridden locally.

---

### Google Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;900&family=Yatra+One&display=swap" rel="stylesheet">
```

Global styles in `App.vue`: `body { background-color: #1A1A2E; }`, `* { font-family: 'Nunito', sans-serif; }`. Set Vuetify `rounded` default to `lg` (12px).

---

## Error Message Copy

Use these exact strings:

| Situation | Message |
|---|---|
| Map shops load fail | `"The taco truck broke down 🚚💨 — couldn't load shops."` |
| Tuesday shops load fail | `"Couldn't find Taco Tuesday spots nearby. Your city might just not deserve tacos. 😤"` |
| Tuesday shops empty | `"The map's coming up empty. Go find your own Tuesday tacos. 🕵️"` |
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
| `tests/composables/useMapbox.test.ts` | Mock fetch to `api.mapbox.com`; stub `VITE_MAPBOX_TOKEN`; test searchTacoShops and searchTacoTuesdayShops; success, missing token, non-2xx, malformed-payload, and sparse-feature fallback cases |
| `tests/composables/useGeolocation.test.ts` | Mock `navigator.geolocation`; test success, denial, timeout |
| `tests/composables/useTuesdayCheck.test.ts` | Mock `Date` to a Tuesday and a non-Tuesday; assert isTuesday both ways |
| `tests/composables/useFiestaMode.test.ts` | Assert isActive mirrors isTuesday; mock useTuesdayCheck |
| `tests/stores/mapStore.test.ts` | Test fetchShops, selectShop, clearSelection; mock useMapbox |
| `tests/stores/recipeStore.test.ts` | Test searchRecipes, fetchRecipeById; mock useMealDB |
| `tests/stores/randomizerStore.test.ts` | Test spin (found + not found), reset; mock useMealDB |
| `tests/stores/tuesdayStore.test.ts` | Test fetchSpots (success, error, empty); test clear(); mock useMapbox |
| `tests/components/RecipeCard.test.ts` | Renders meal name, image, chips; emits click |
| `tests/components/ShopCard.test.ts` | Renders shop name, full address, formatted category chips; "Get Directions" link points to Google Maps with the shop's lat/lng |
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
