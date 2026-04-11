# Tacology — Product Requirements Document

> **One-shot Claude Code CLI target.** This document is written for zero-ambiguity autonomous execution. Every architectural decision, API contract, environment variable, and UI behavior is specified explicitly.

---

## 1. Project Overview

**Tacology** is a fun, irreverent single-user web application dedicated entirely to tacos. It features a taco recipe browser powered by TheMealDB API, a 3D interactive map of nearby taco shops powered by Mapbox GL JS + Yelp Fusion API, a taco randomizer with a spin-the-wheel interaction, and a Taco Tuesday finder that — when it actually is Tuesday — erupts into full Fiesta Mode (animated confetti, color-cycling UI). The app is built with Vue 3 + TypeScript + Vuetify 3, deployed to Vercel.

**Tagline:** *"Life's too short for bad tacos."* 🌮

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Vue 3 + TypeScript | Composition API throughout, `<script setup>` syntax |
| UI Library | Vuetify 3 | Material Design components, custom taco-themed palette |
| Build Tool | Vite | Default Vuetify scaffold |
| Routing | Vue Router 4 | Hash-based routing for Vercel SPA compatibility |
| State Management | Pinia | One store per feature domain |
| Map | Mapbox GL JS v3 | 3D buildings enabled, dark map style |
| Recipe API | TheMealDB REST API | Free tier, no API key required |
| Local Business API | Yelp Fusion API | Free tier, requires `VITE_YELP_API_KEY` |
| HTTP Client | Native `fetch` | No Axios; keep bundle lean |
| Linting | ESLint + `@typescript-eslint` + `eslint-plugin-vue` | Must pass with zero errors |
| Formatting | Prettier | Enforced via lint |
| Testing | Vitest + Vue Test Utils | 80% coverage minimum, 100% pass rate |
| Type Checking | TypeScript strict mode (`tsc --noEmit`) | Must pass clean |
| CI | GitHub Actions | Lint → type-check → test on every push/PR |
| Deployment | Vercel | Auto-deploy from `main` branch |

---

## 3. Environment Variables

All secrets are prefixed `VITE_` for Vite client exposure. Add all of these to both `.env.local` and the Vercel project environment settings.

```
VITE_MAPBOX_TOKEN=        # Mapbox public access token
VITE_YELP_API_KEY=        # Yelp Fusion API key (Bearer token)
```

> **Note on Yelp CORS:** The Yelp Fusion API does not support browser-side CORS. All Yelp API calls must be proxied through a Vercel serverless function at `/api/yelp`. See Section 9 for the proxy spec.

---

## 4. Project Structure

```
tacology/
├── .github/
│   └── workflows/
│       └── ci.yml
├── api/
│   └── yelp.ts                  # Vercel serverless proxy for Yelp
├── public/
│   └── taco-favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── AppNav.vue            # Bottom nav (mobile) / sidebar (desktop)
│   │   ├── map/
│   │   │   ├── TacoMap.vue       # Mapbox GL JS wrapper
│   │   │   └── ShopCard.vue      # Popup card for a taco shop
│   │   ├── recipes/
│   │   │   ├── RecipeGrid.vue    # Grid of recipe cards
│   │   │   ├── RecipeCard.vue    # Individual recipe card
│   │   │   └── RecipeModal.vue   # Full recipe detail modal
│   │   ├── randomizer/
│   │   │   ├── SpinWheel.vue     # CSS/Canvas spin wheel
│   │   │   └── TacoResult.vue    # Result display after spin
│   │   └── tuesday/
│   │       ├── TuesdayBanner.vue # "Come back Tuesday" banner (non-Tuesday)
│   │       ├── TuesdayShopCard.vue # Shop card variant for Tuesday list
│   │       └── FiestaOverlay.vue # Confetti + color-cycle overlay (Tuesday only)
│   ├── composables/
│   │   ├── useYelp.ts            # Yelp proxy fetch composable
│   │   ├── useMealDB.ts          # TheMealDB fetch composable
│   │   ├── useGeolocation.ts     # Browser geolocation composable
│   │   ├── useTuesdayCheck.ts    # Day-of-week detection composable
│   │   └── useFiestaMode.ts      # Fiesta Mode state + animation orchestration
│   ├── router/
│   │   └── index.ts
│   ├── stores/
│   │   ├── mapStore.ts
│   │   ├── recipeStore.ts
│   │   ├── randomizerStore.ts
│   │   └── tuesdayStore.ts
│   ├── types/
│   │   ├── yelp.ts
│   │   ├── mealdb.ts
│   │   └── map.ts
│   ├── views/
│   │   ├── MapView.vue
│   │   ├── RecipesView.vue
│   │   ├── RandomizerView.vue
│   │   └── TuesdayView.vue
│   ├── App.vue
│   ├── main.ts
│   └── plugins/
│       └── vuetify.ts
├── tests/
│   ├── composables/
│   ├── stores/
│   └── components/
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── tsconfig.json
├── vite.config.ts
├── vercel.json
└── package.json
```

---

## 5. Routing

Use Vue Router 4 with `createWebHashHistory` (hash-based, no server config needed on Vercel).

| Path | View | Nav Label | Icon |
|---|---|---|---|
| `/` | Redirect → `/map` | — | — |
| `/map` | `MapView.vue` | Find Tacos | `mdi-map-marker-radius` |
| `/recipes` | `RecipesView.vue` | Recipes | `mdi-book-open-variant` |
| `/randomizer` | `RandomizerView.vue` | Spin It | `mdi-slot-machine` |
| `/tuesday` | `TuesdayView.vue` | Taco Tuesday | `mdi-party-popper` |

---

## 6. Navigation Component (`AppNav.vue`)

- **Mobile (< 960px):** Vuetify `v-bottom-navigation` pinned to the bottom with four items (icons + labels). Active route highlighted in the brand orange (`#FF6B35`). On Tuesdays, the Taco Tuesday nav item pulses with a CSS `animation: pulse 1.5s infinite` using the `secondary` yellow color.
- **Desktop (≥ 960px):** Vuetify `v-navigation-drawer` on the left, permanent, 220px wide. Shows app logo/name at top (`🌮 Tacology`), nav items in the middle, a fun taco fact in a `v-chip` at the bottom that rotates randomly on each page load. On Tuesdays, the drawer's top logo area cycles through the Fiesta palette (see Section 11.1).
- The drawer/bottom-nav uses `vue-router`'s `useRoute` to track the active route.
- **Fiesta Mode** (Tuesdays only): `AppNav` reads `fiestaStore.isActive`. When true, the nav background color animates through the Fiesta palette using a CSS keyframe animation applied via a dynamic `:style` binding. This is the only global layout change — all other Fiesta effects are scoped to `TuesdayView`.

---

## 7. Feature: Map View (`/map`)

### 7.1 Layout

Full-viewport Mapbox map (100vw × 100vh minus the nav). A floating `v-card` search/filter panel overlays the top-left corner. A `v-bottom-sheet` (mobile) or right-side `v-navigation-drawer` (desktop) slides in when a shop pin is tapped, showing the `ShopCard` detail.

### 7.2 Map Initialization

- **Library:** Mapbox GL JS v3 (`mapbox-gl` npm package).
- **Style:** `mapbox://styles/mapbox/dark-v11` (dark base map, 3D buildings look great on it).
- **3D Buildings:** Enable the `building` fill-extrusion layer from the Mapbox style with a subtle white/gray extrusion color and opacity `0.6`. This gives the city a 3D skyline look.
- **Initial camera:** On component mount, call `useGeolocation()`. If granted, fly the camera to the user's coordinates at zoom `13`, pitch `45`, bearing `0`. If denied or unavailable, default to Portland, OR (`[-122.6765, 45.5231]`).
- **Map container:** A `div` with `id="map"` that fills its parent. Initialize the `Map` instance in `onMounted`, destroy it in `onUnmounted`.

### 7.3 Geolocation Composable (`useGeolocation.ts`)

```typescript
// Returns: { coords: Ref<GeolocationCoordinates | null>, error: Ref<string | null>, loading: Ref<boolean> }
// Calls navigator.geolocation.getCurrentPosition once on invoke.
// On success: sets coords ref.
// On error or if geolocation unavailable: sets error ref, coords stays null.
```

### 7.4 Yelp Data Fetching

- On map load (after geolocation resolves), call `useYelp()` composable which hits `/api/yelp` with query params.
- **Search params:** `term=tacos`, `latitude`, `longitude`, `limit=20`, `sort_by=rating`.
- **Response:** Array of up to 20 taco shops. Store in `mapStore.shops`.
- Show a `v-progress-circular` overlay while loading. Show a `v-snackbar` with a fun error message on failure (e.g., *"The taco truck broke down 🚚💨 — couldn't load shops."*).

### 7.5 Map Pins

- For each shop in `mapStore.shops`, add a Mapbox `Marker` with a custom HTML element: a `div` styled as a taco emoji `🌮` in a circular badge (32×32px, white background, subtle drop shadow, `cursor: pointer`).
- On marker click: set `mapStore.selectedShop` to that shop, fly the camera to center on it (zoom 15, pitch 60), and open the ShopCard panel.

### 7.6 ShopCard Component

Displays:
- Shop name (bold, large)
- Star rating rendered as Vuetify `v-rating` (read-only, half-stars)
- Review count
- Address
- Price range (Yelp's `price` field, e.g. `$$`)
- Categories (as `v-chip` tags)
- "View on Yelp" `v-btn` (outlined, opens Yelp URL in new tab)
- A fun random tagline from a hardcoded array of 10 taco-themed quips (e.g., *"This place slaps harder than a late-night craving."*, *"Rated 🌮🌮🌮 on the Todd Scale."*)

---

## 8. Feature: Recipes View (`/recipes`)

### 8.1 Data Source

TheMealDB free API — no API key required.

**Endpoints used:**
- `https://www.themealdb.com/api/json/v1/1/search.php?s=taco` — search for taco recipes on mount.
- `https://www.themealdb.com/api/json/v1/1/lookup.php?i={id}` — full recipe detail on card click.
- `https://www.themealdb.com/api/json/v1/1/random.php` — used by the Randomizer feature.

### 8.2 Layout

- Page header: `🌮 Taco Recipes` with a subtitle: *"Because every taco deserves to exist."*
- Search bar (`v-text-field`) at the top — debounced 400ms — hits `search.php?s={query}` on change.
- Results rendered in a responsive `v-row`/`v-col` grid: 1 col on mobile, 2 on tablet, 3 on desktop, 4 on wide desktop.
- Loading state: show 8 `v-skeleton-loader` cards while fetching.
- Empty state: centered `v-empty-state` with a crying taco SVG (inline) and copy: *"No tacos found. We're as sad as you are. 😢"*

### 8.3 RecipeCard Component

- Meal thumbnail image (`strMealThumb`) — full-width, 200px tall, `object-fit: cover`.
- Meal name.
- Category and area as `v-chip` tags (e.g., `Mexican`, `Beef`).
- "Get Recipe" `v-btn` — opens `RecipeModal`.
- Hovering the card lifts it with a CSS `transform: translateY(-4px)` and box-shadow transition.

### 8.4 RecipeModal Component

A full-screen `v-dialog` (mobile) or large centered dialog (desktop) showing:
- Meal image (full-width header).
- Meal name as `v-card-title`.
- **Ingredients list:** TheMealDB returns up to 20 `strIngredient{N}` / `strMeasure{N}` pairs. Parse these into a clean `{ ingredient, measure }[]` array (filter out empty strings). Render as a `v-list` with checkboxes (toggling crossed-off state for "I have this" UX).
- **Instructions:** Rendered in a `v-card-text` block. Replace newline characters with `<br>` tags.
- **YouTube link:** If `strYoutube` is present, show a "Watch on YouTube 🎬" `v-btn`.
- Close button (X) in the top-right corner.

---

## 11. Feature: Taco Tuesday View (`/tuesday`)

### 11.1 Day Detection (`useTuesdayCheck.ts`)

```typescript
// Exports: isTuesday: ComputedRef<boolean>
// Uses new Date().getDay() === 2 (Tuesday = 2 in JS)
// Evaluated once on composable init — no reactive timer needed
// Exported as a composable so it can be mocked in tests
```

### 11.2 Tuesday State: It IS Tuesday 🎉

**Layout:**
- Full-width hero banner at the top: deep gradient background (`#FF6B35` → `#FFD166`), large centered text: *"🌮 IT'S TACO TUESDAY, BABY! 🌮"*, font size `3rem` on desktop / `2rem` on mobile, bold, white text with a subtle `text-shadow`.
- Below the hero: a `v-progress-circular` while Yelp data loads, then a vertically stacked list of `TuesdayShopCard` components (not a map — this is a ranked list format).

**Yelp Query:**
- On mount, call `useYelp().searchTacoTuesdayShops(lat, lng)` which hits `/api/yelp` with:
  - `term=taco tuesday`
  - `latitude`, `longitude` (from `useGeolocation`)
  - `limit=10`
  - `sort_by=rating`
- Store results in `tuesdayStore.spots`.
- If geolocation fails, fall back to Portland, OR defaults (same as MapView).

**TuesdayShopCard Component:**
- Rank badge (1st, 2nd, 3rd… styled as `🥇 🥈 🥉` for top 3, plain numbers for 4–10).
- Shop name (large, bold).
- Star rating (`v-rating`, read-only).
- Address.
- Price range.
- "View on Yelp" button.
- A Tuesday-specific tagline from a hardcoded array of 6 quips (separate from the general ShopCard quips), e.g.: *"Your Tuesday just got a whole lot tastier."*, *"The taco gods have spoken."*

**Error state:** `v-snackbar` with *"Couldn't find Taco Tuesday spots nearby. Your city might just not deserve tacos. 😤"*

**Empty state (no results):** Centered copy: *"Yelp has no idea. Go find your own Tuesday tacos. 🕵️"*

### 11.3 Tuesday State: It is NOT Tuesday 😢

Render a single centered `TuesdayBanner` component:

```
[ 🌮 ]
Come Back on Tuesday
Tacos are coming. Hold tight.

Next Taco Tuesday in: [X days]
```

- The day countdown is computed from `useTuesdayCheck` — calculate the number of days until the next Tuesday using `new Date()`.
- The entire banner uses muted/grayscale colors (desaturated versions of the brand palette) to emphasize the sadness.
- A subtle CSS animation makes the taco emoji slowly bob up and down (`transform: translateY` keyframe, 2s infinite ease-in-out) — even in grief, tacos persist.
- Do NOT show any Yelp data, shop list, or Fiesta Mode elements on non-Tuesday days.

### 11.4 Fiesta Mode (`useFiestaMode.ts` + `FiestaOverlay.vue`)

Fiesta Mode activates **automatically** when the user visits `/tuesday` on a Tuesday. It does not require user interaction to start.

**`useFiestaMode.ts`:**
```typescript
// Exports: isActive: ComputedRef<boolean>
// isActive = isTuesday (from useTuesdayCheck)
// Also exported to fiestaStore for AppNav to consume
```

**`FiestaOverlay.vue`:**
- Rendered inside `TuesdayView` when `isActive` is true, positioned `fixed`, `pointer-events: none`, `z-index: 9999`, full viewport size.
- **Confetti animation:** Generate 80 confetti pieces on mount using JavaScript. Each piece is a `div` with:
  - Random `width` (6–12px), `height` (10–18px)
  - Random color from the Fiesta palette: `#FF6B35`, `#FFD166`, `#06D6A0`, `#EF476F`, `#A855F7`
  - Random `left` position (0–100vw)
  - CSS `animation: confettiFall {duration}s {delay}s linear infinite` where duration is 3–7s (random) and delay is 0–3s (random)
  - `@keyframes confettiFall`: starts at `top: -20px; transform: rotate(0deg)`, ends at `top: 110vh; transform: rotate(720deg)`
- All 80 confetti divs are created programmatically in `onMounted` and appended to the overlay container. Destroyed in `onUnmounted`.
- **Performance:** Use `will-change: transform` on confetti pieces. Cap at 80 pieces regardless of screen size.

**Color-cycling nav** (handled in `AppNav.vue` as described in Section 6):
```css
@keyframes fiestaNav {
  0%   { background-color: #FF6B35; }
  25%  { background-color: #FFD166; }
  50%  { background-color: #06D6A0; }
  75%  { background-color: #EF476F; }
  100% { background-color: #FF6B35; }
}
/* Applied via: animation: fiestaNav 3s ease-in-out infinite */
```

### 11.5 `tuesdayStore.ts`
```typescript
// state: spots: YelpBusiness[], loading: boolean, error: string | null
// actions: fetchSpots(lat, lng), clear()
// getters: hasSpots: boolean
```

### 11.6 `useYelp.ts` — Additional Export
Add to the existing `useYelp` composable:
```typescript
// searchTacoTuesdayShops(lat: number, lng: number): Promise<YelpBusiness[]>
// Same proxy as searchTacoShops but with term='taco tuesday'
```

---

## 12. Vercel Serverless Proxy (`api/yelp.ts`)

Yelp's Fusion API blocks browser requests due to CORS. This Vercel Edge Function proxies the request server-side.

```typescript
// File: api/yelp.ts
// Method: GET
// Query params passed through: term, latitude, longitude, limit, sort_by
// Adds Authorization: Bearer ${process.env.YELP_API_KEY} header
// Forwards response JSON from https://api.yelp.com/v3/businesses/search
// Returns the raw Yelp JSON response with status 200
// On Yelp error: returns { error: string } with appropriate status code
// Runtime: edge (set via export const config = { runtime: 'edge' })
```

**`vercel.json`:**
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}
```

> **Important:** `YELP_API_KEY` (no `VITE_` prefix) must be set as a server-side Vercel environment variable — it must never be exposed to the browser.

---

## 13. Feature: Randomizer View (`/randomizer`)

### 13.1 Concept

A spin-the-wheel experience. The wheel is populated with taco types/names. Spinning lands on a random taco style, then fetches a matching recipe from TheMealDB and reveals it dramatically.

### 13.2 Wheel Contents

Hardcode 12 taco types on the wheel segments:
`Al Pastor`, `Carnitas`, `Birria`, `Fish Taco`, `Carne Asada`, `Veggie`, `Chicken Tinga`, `Barbacoa`, `Shrimp`, `Chorizo`, `Lengua`, `Potato`

### 13.3 SpinWheel Component

- Rendered on an HTML `<canvas>` element, 340×340px (scales down on small screens).
- 12 equal segments, each a different color from a warm/vibrant palette (oranges, reds, yellows, greens — no muted colors).
- Each segment has the taco type label drawn radially.
- A triangular pointer SVG sits at the top of the wheel pointing down.
- **Spin button:** A large `v-btn` below the wheel, color `#FF6B35`, text *"🌮 SPIN THE WHEEL"*, size `x-large`.
- **Animation:** On click, trigger a CSS `transform: rotate()` animation — spin 5–8 full rotations over 4 seconds with a `cubic-bezier(0.17, 0.67, 0.12, 0.99)` easing (fast start, slow stop). The final rotation determines the winning segment.
- Disable the button while spinning.

### 13.4 Result Flow

1. Wheel stops → winning taco type is determined from the final rotation angle.
2. Call TheMealDB `search.php?s={tacoType}` — take the first result.
3. If no result: show a `v-snackbar` (*"TheMealDB is taco-less for '{type}'. The audacity. Try again! 🌮"*) and re-enable the spin button.
4. If result found: animate in a `TacoResult` card below the wheel using a Vue `<Transition name="slide-up">`.
5. `TacoResult` card shows: meal image, name, a "View Full Recipe" button (opens `RecipeModal`), and a "SPIN AGAIN" button that resets state.

---

## 14. Theming & Design System (`plugins/vuetify.ts`)

```typescript
const tacoTheme = {
  dark: false,
  colors: {
    primary: '#FF6B35',      // Taco orange
    secondary: '#FFD166',    // Warm yellow
    accent: '#06D6A0',       // Fresh green (cilantro!)
    error: '#EF476F',        // Salsa red
    background: '#1A1A2E',   // Deep dark background
    surface: '#16213E',      // Card surface
    'on-surface': '#EAEAEA', // Light text on dark
  }
}
```

- **Font:** Load `Nunito` from Google Fonts (playful, rounded — fits the vibe). Set as default in Vuetify's typography config.
- **Global styles:** In `App.vue` `<style>`, set `body { background-color: #1A1A2E; }` and `* { font-family: 'Nunito', sans-serif; }`.
- **Dark mode:** The app uses a dark theme globally (the map and cards look stunning on dark).
- **Border radius:** Vuetify `rounded` default set to `lg` (12px) globally for a softer feel.

---

## 15. TypeScript Types

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

## 16. Pinia Stores

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

## 17. Composables

### `useMealDB.ts`
```typescript
// Thin fetch wrapper around TheMealDB API
// Exports: searchMeals(query: string): Promise<Meal[]>
//          getMealById(id: string): Promise<Meal | null>
//          getRandomMeal(): Promise<Meal | null>
// All functions throw on non-2xx HTTP responses with a descriptive Error message
```

### `useYelp.ts`
```typescript
// Fetches from /api/yelp (the Vercel proxy)
// Exports: searchTacoShops(lat: number, lng: number): Promise<YelpBusiness[]>
//          searchTacoTuesdayShops(lat: number, lng: number): Promise<YelpBusiness[]>
// searchTacoTuesdayShops uses term='taco tuesday', limit=10, sort_by=rating
// Both functions throw on error
```

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
```

### `useFiestaMode.ts`
```typescript
// Exports: isActive: ComputedRef<boolean>
// isActive delegates to isTuesday from useTuesdayCheck
// Consumed by both TuesdayView and AppNav
```

---

## 18. Testing Requirements

- **Framework:** Vitest + `@vue/test-utils`
- **Coverage:** 80% minimum across lines/branches/functions/statements
- **All tests must pass (100%)** — `vitest run --coverage` must exit 0

### Required test files:

| File | What to test |
|---|---|
| `tests/composables/useMealDB.test.ts` | Mock fetch; test search, getById, getRandom; test error throwing |
| `tests/composables/useYelp.test.ts` | Mock fetch to `/api/yelp`; test searchTacoShops and searchTacoTuesdayShops; success and error cases |
| `tests/composables/useGeolocation.test.ts` | Mock `navigator.geolocation`; test success, denial, timeout |
| `tests/composables/useTuesdayCheck.test.ts` | Mock `Date` to a Tuesday and a non-Tuesday; assert isTuesday value both ways |
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

---

## 19. CI Pipeline (`.github/workflows/ci.yml`)

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
      - run: npm run lint          # eslint --max-warnings 0
      - run: npm run type-check    # tsc --noEmit
      - run: npm run test:coverage # vitest run --coverage (must exit 0)
      - run: npm run build         # vite build (must succeed)
```

**`package.json` scripts must include:**
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

## 20. Vercel Deployment

1. Connect the GitHub repo to Vercel.
2. Framework preset: **Vite**.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set environment variables in Vercel dashboard:
   - `VITE_MAPBOX_TOKEN` (client-side)
   - `VITE_YELP_API_KEY` — **do not set this one** (it should not reach the browser)
   - `YELP_API_KEY` (server-side only, used by `api/yelp.ts`)

---

## 21. `.env.example`

```
# Mapbox public token (safe to expose to browser)
VITE_MAPBOX_TOKEN=your_mapbox_token_here

# Yelp API key — SERVER SIDE ONLY, never prefix with VITE_
YELP_API_KEY=your_yelp_bearer_token_here
```

---

## 22. Accessibility & UX Polish

- All interactive elements must have `aria-label` attributes.
- Map markers must be keyboard-focusable (`tabIndex=0`, `keydown Enter` triggers click).
- `v-skeleton-loader` used for all async loading states (not spinners).
- All error states use friendly, on-brand copy (not "Error 500").
- The app must be usable on screens as small as 375px width (iPhone SE).
- Smooth page transitions: wrap `<router-view>` in a `<Transition name="fade">` with 200ms opacity transition.
- `FiestaOverlay` must use `pointer-events: none` so confetti never blocks clicks.
- `FiestaOverlay` must respect `prefers-reduced-motion`: if the media query matches, skip all confetti animation and the nav color-cycle entirely.

---

## 23. Out of Scope (v1)

- User authentication or accounts
- Saving favorites
- User-submitted taco reviews
- Offline support / PWA
- i18n / localization
- Server-side rendering (SSR)
- Fiesta Mode audio (mariachi music — maybe v2 😈)
