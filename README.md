# 🌮 Tacology

A taco-obsessed Vue 3 app with a cantina-at-golden-hour design language: glassmorphism panels floating over a warm sunset gradient, taco-emoji map pins, and an animated papel-picado strip on Taco Tuesday. Find taco joints near you, browse recipes, spin the wheel, and celebrate the holiest day of the week.

**Live app:** [https://ccc-demo-eight.vercel.app](https://ccc-demo-eight.vercel.app)

---

## Features

| View | What it does |
|------|-------------|
| **Find Tacos** (`/map`) | Mapbox GL 3D map (streets-v12, softened to a faded-postcard look). Taco-emoji pins drop in, hover to glow, click to slide a glass detail card in from the edge. Pan the map and a "Search this area" pill rises up — tap to re-fetch nearby spots at the new center. |
| **Recipes** (`/recipes`) | Search hundreds of taco recipes via Spoonacular. Click any card to open a recipe modal with image, ingredient list, and step-by-step instructions. |
| **Spin It** (`/randomizer`) | Canvas spin wheel with 8 taco types (the four that always 404 against the recipe API have been retired). Land on one and the result links straight to the source recipe — no in-between modal. |
| **Taco Tuesday** (`/tuesday`) | On Tuesdays: papel-picado banner across the top, gradient-text hero, bobbing taco/avocado/chili emoji row, mixed confetti rain (🌮 🥑 🌶️ alongside rectangles), and a ranked list of nearby Tuesday spots with a "Today's Champion" glow on #1. Any other day: a dynamic countdown card that adapts copy as Tuesday gets closer ("Tomorrow we feast", "Two sleeps to tacos", …) plus a progress bar with a riding 🌮. |

---

## Stack

- **Vue 3** — `<script setup>` Composition API, strict TypeScript
- **Vuetify 3** — Component primitives + custom "Mercado Glass" theme
- **Vite 6** — Dev server and production bundler
- **Vue Router 4** — Hash-based routing (no server config needed)
- **Pinia** — One store per feature domain
- **Mapbox GL JS v3** — 3D map with building extrusions
- **Mapbox Search Box API** — POI search, called direct from the browser (CORS-friendly, uses the publishable map token)
- **Spoonacular** — Recipe API, proxied server-side
- **Vercel Analytics** — Pageviews + custom events via `@vercel/analytics/vue`
- **Vitest** — 83 unit tests with v8 coverage (80% threshold enforced)
- **GitHub Actions** — CI: lint → type-check → test → build

---

## Design language

The whole app sits on top of a fixed CSS gradient — deep mole → oxblood → terracotta → marigold — with a subtle film-grain overlay. Chrome surfaces (the sidebar, the count pill, the floating shop card) are translucent glass panels with `backdrop-filter: blur`, picking up the warm gradient through their frosted layers. The map is desaturated and slightly sepia-tinted so it blends with the palette instead of fighting it.

Type: **Yatra One** (hand-painted cantina signage feel) for hero headlines, logo, and shop names; **Nunito** for body. Motion is reserved for high-impact moments: pin drop-ins, the Tuesday hero gradient pulse, the papel-picado sway, the count pill's slide-in. Everything respects `prefers-reduced-motion`.

CSS variables exposed on `:root` (in `App.vue`) for reuse: `--glass-bg`, `--glass-bg-strong`, `--glass-border`, `--glass-blur`, `--glass-shadow`, plus accent ramps `--taco-orange`, `--taco-marigold`, `--taco-cilantro`, `--taco-salsa`, `--taco-bone`.

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Mapbox](https://mapbox.com) access token (free tier works) — used for both the map tiles AND the Search Box POI calls, so it does need to be a publishable `pk.*` token with `mapbox:streets`, `mapbox:terrain`, and search scopes enabled
- A [Spoonacular](https://spoonacular.com/food-api) API key (free tier: 150 req/day)

### Install

```bash
git clone https://github.com/mrballistic-slalom/taco-tuesday-app.git
cd taco-tuesday-app
npm install
```

### Environment variables

```bash
cp .env.example .env
```

```env
# Mapbox publishable token — safe to expose to the browser. Locks down via
# Mapbox's URL allowlist (set both your prod hostname AND http://localhost:5173).
VITE_MAPBOX_TOKEN=your_mapbox_token_here

# Spoonacular API key — SERVER SIDE ONLY, never prefix with VITE_
SPOONACULAR_API_KEY=your_spoonacular_api_key_here
```

> **Note:** `SPOONACULAR_API_KEY` must not have the `VITE_` prefix — it is only consumed by the Vercel Edge Function at `api/spoonacular.ts` and never makes it into the browser bundle. The Mapbox token is intentionally exposed; the security boundary there is the URL allowlist you configure at `account.mapbox.com`.

### Run locally

```bash
npm run dev          # plain Vite — only Mapbox features work
vercel dev           # full stack — Spoonacular proxy + Vite together
```

The app will be available at `http://localhost:5173`.

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
│   ├── AppNav.vue              # Glass-frosted nav (drawer on desktop, bottom bar on mobile)
│   ├── map/
│   │   ├── TacoMap.vue         # Mapbox GL map; emits `userMove` when user pans/zooms
│   │   └── ShopCard.vue        # Floating warm-glass detail card
│   ├── randomizer/
│   │   ├── SpinWheel.vue       # Canvas wheel (8 taco types)
│   │   └── TacoResult.vue      # Spin result — links directly to recipe sourceUrl
│   ├── recipes/
│   │   ├── RecipeCard.vue
│   │   ├── RecipeGrid.vue
│   │   └── RecipeModal.vue
│   └── tuesday/
│       ├── TuesdayBanner.vue   # Non-Tuesday countdown card (proximity-aware copy)
│       ├── TuesdayShopCard.vue # Ranked card; #1 gets "Today's Champion" glow
│       └── FiestaOverlay.vue   # Mixed-emoji confetti rain (80 pieces, respects reduced-motion)
├── composables/
│   ├── useFiestaMode.ts        # isActive flag (true on Tuesdays)
│   ├── useGeolocation.ts       # navigator.geolocation wrapper, falls back to Portland
│   ├── useMapbox.ts            # Mapbox Search Box /forward — browser-direct, CORS-friendly
│   ├── useMealDB.ts
│   ├── useSpoonacular.ts
│   └── useTuesdayCheck.ts
├── stores/
│   ├── mapStore.ts             # MapboxTacoShop[] + selected shop
│   ├── randomizerStore.ts      # Spin state + recipe result
│   ├── recipeStore.ts
│   └── tuesdayStore.ts
├── types/
│   ├── mapbox.ts               # MapboxTacoShop + Search Box response shapes
│   ├── mealdb.ts
│   └── spoonacular.ts
├── views/
│   ├── MapView.vue             # Full-viewport map + glass count pill + "Search this area"
│   ├── RandomizerView.vue
│   ├── RecipesView.vue
│   └── TuesdayView.vue         # Papel-picado strip + animated hero + champion list
├── plugins/vuetify.ts          # "Mercado Glass" theme
├── App.vue                     # Body gradient + grain + glass utility tokens
├── router/index.ts
└── main.ts
api/
└── spoonacular.ts              # Vercel Edge Function — Spoonacular proxy
```

---

## Deployment

The app deploys to Vercel from the `main` branch.

Set these environment variables in **Vercel Dashboard → Project → Settings → Environment Variables**:

| Variable | Scope | Description |
|----------|-------|-------------|
| `VITE_MAPBOX_TOKEN` | All environments | Mapbox publishable token (also used for Search Box POI lookups) |
| `SPOONACULAR_API_KEY` | All environments | Spoonacular API key (server-side only) |

After adding the variables, trigger a redeploy so the build picks them up. Don't forget to add your production hostname (and any preview hostname you care about) to the **Mapbox URL allowlist** at `account.mapbox.com` — without it, every tile and search call 403s.

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
