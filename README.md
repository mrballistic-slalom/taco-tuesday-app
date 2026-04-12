# 🌮 Tacology

A fun, taco-obsessed web app built with Vue 3, TypeScript, and Vuetify 3. Find taco spots near you, browse recipes, spin a randomizer wheel, and celebrate Taco Tuesday in style.

**Live app:** [https://ccc-demo-eight.vercel.app](https://ccc-demo-eight.vercel.app)

---

## Features

| View | What it does |
|------|-------------|
| **Find Tacos** (`/map`) | Mapbox GL 3D map pinpointing nearby taco shops via the Yelp Fusion API. Click a pin to see ratings, address, and a random quip. |
| **Recipes** (`/recipes`) | Search thousands of taco recipes via Spoonacular. Click any card to open a full recipe modal with an ingredient checklist and step-by-step instructions. |
| **Spin It** (`/randomizer`) | Canvas spin wheel with 12 taco types. Land on one and get a randomly matched recipe result. |
| **Taco Tuesday** (`/tuesday`) | On Tuesdays: full fiesta mode with animated confetti, cycling brand colors, and a ranked list of nearby Taco Tuesday spots. Any other day: a countdown to next Tuesday. |

---

## Stack

- **Vue 3** — `<script setup>` Composition API throughout, strict TypeScript
- **Vuetify 3** — Custom dark taco theme (primary: `#FF6B35`)
- **Vite 6** — Fast dev server and production bundler
- **Vue Router 4** — Hash-based routing (no server config needed)
- **Pinia** — One store per feature domain
- **Mapbox GL JS v3** — 3D map with building extrusions
- **Spoonacular** — Recipe API with thousands of taco recipes, proxied server-side
- **Yelp Fusion API** — Proxied via Vercel Edge Function (key stays server-side)
- **Vitest** — Unit tests with v8 coverage (80% threshold enforced)
- **GitHub Actions** — CI: lint → type-check → test → build

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Mapbox](https://mapbox.com) access token (free tier works)
- A [Yelp Fusion](https://docs.developer.yelp.com/) API key (free)
- A [Spoonacular](https://spoonacular.com/food-api) API key (free tier: 150 req/day)

### Install

```bash
git clone https://github.com/mrballistic-slalom/taco-tuesday-app.git
cd taco-tuesday-app
npm install
```

### Environment variables

Copy the example file and fill in your keys:

```bash
cp .env.example .env
```

```env
# Exposed to the browser (safe — Mapbox tokens are restricted by domain)
VITE_MAPBOX_TOKEN=your_mapbox_token_here

# Server-side only — never prefix with VITE_
YELP_API_KEY=your_yelp_bearer_token_here
SPOONACULAR_API_KEY=your_spoonacular_api_key_here
```

> **Note:** `YELP_API_KEY` and `SPOONACULAR_API_KEY` must NOT have the `VITE_` prefix. They are only used inside Vercel Edge Functions (`api/yelp.ts`, `api/spoonacular.ts`) and are never included in the browser bundle.

### Run locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

For the Yelp proxy to work locally you'll need the [Vercel CLI](https://vercel.com/docs/cli):

```bash
npm i -g vercel
vercel dev   # runs both the Vite dev server and the Edge Function
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint (zero warnings enforced) |
| `npm run type-check` | `vue-tsc --noEmit` |
| `npm run test` | Vitest in watch mode |
| `npm run test:coverage` | Vitest with v8 coverage report |

---

## Project Structure

```
src/
├── components/
│   ├── AppNav.vue              # Responsive nav (drawer on desktop, bottom bar on mobile)
│   ├── map/
│   │   ├── TacoMap.vue         # Mapbox GL map with taco-emoji markers
│   │   └── ShopCard.vue        # Yelp shop detail panel
│   ├── randomizer/
│   │   ├── SpinWheel.vue       # Canvas spin wheel (12 taco types)
│   │   └── TacoResult.vue      # Result card after spin
│   ├── recipes/
│   │   ├── RecipeCard.vue      # Grid card for a single meal
│   │   ├── RecipeGrid.vue      # Responsive grid of RecipeCards
│   │   └── RecipeModal.vue     # Full recipe dialog with ingredient checklist
│   └── tuesday/
│       ├── TuesdayBanner.vue   # Non-Tuesday countdown banner
│       ├── TuesdayShopCard.vue # Ranked Yelp shop card for Tuesday view
│       └── FiestaOverlay.vue   # 80-confetti particle overlay (respects prefers-reduced-motion)
├── composables/
│   ├── useFiestaMode.ts        # isActive flag (true on Tuesdays)
│   ├── useGeolocation.ts       # navigator.geolocation wrapper, falls back to Portland
│   ├── useMealDB.ts            # TheMealDB API calls
│   ├── useTuesdayCheck.ts      # isTuesday computed (getDay() === 2)
│   └── useYelp.ts              # Yelp proxy calls via /api/yelp
├── stores/
│   ├── mapStore.ts             # Yelp shops + selected shop state
│   ├── randomizerStore.ts      # Spin state + meal result
│   ├── recipeStore.ts          # Recipe search + selected recipe
│   └── tuesdayStore.ts         # Tuesday Yelp spots
├── views/
│   ├── MapView.vue
│   ├── RandomizerView.vue
│   ├── RecipesView.vue
│   └── TuesdayView.vue
├── types/
│   ├── mealdb.ts               # Meal, MealDBResponse, ParsedIngredient
│   └── yelp.ts                 # YelpBusiness, YelpSearchResponse
├── plugins/vuetify.ts          # Vuetify theme + icon config
├── router/index.ts             # Hash-history routes
└── main.ts                     # App entry point
api/
├── spoonacular.ts              # Vercel Edge Function — Spoonacular proxy
└── yelp.ts                     # Vercel Edge Function — Yelp proxy
```

---

## Deployment

The app is deployed to Vercel from the `main` branch.

Set these environment variables in **Vercel Dashboard → Project → Settings → Environment Variables**:

| Variable | Scope | Description |
|----------|-------|-------------|
| `VITE_MAPBOX_TOKEN` | All environments | Mapbox GL access token |
| `YELP_API_KEY` | All environments | Yelp Fusion Bearer token (server-side only) |
| `SPOONACULAR_API_KEY` | All environments | Spoonacular API key (server-side only) |

After adding the variables, trigger a redeploy so the build picks up `VITE_MAPBOX_TOKEN`.

---

## Testing

```bash
npm run test:coverage
```

- **83 tests** across composables, stores, and components
- **>80% coverage** on lines, branches, functions, and statements
- Coverage thresholds enforced — CI fails if they drop

---

## CI

GitHub Actions runs on every push and PR to `main`:

1. `npm run lint` — zero warnings allowed
2. `npm run type-check` — strict TypeScript
3. `npm run test:coverage` — 80% coverage gate
4. `npm run build` — production build must succeed

---

## License

[MIT](./LICENSE)
