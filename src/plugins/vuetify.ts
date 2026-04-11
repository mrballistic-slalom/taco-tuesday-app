/**
 * @file src/plugins/vuetify.ts
 *
 * Vuetify 3 plugin configuration for Tacology.
 *
 * This module creates and exports the configured Vuetify instance that is
 * registered in `src/main.ts` via `app.use(vuetify)`. It sets up:
 *
 * - **Icon set**: Material Design Icons (MDI) via the `@mdi/font` web font,
 *   aliased so components can use shorthand names like `"mdi-map-marker"`.
 *
 * - **Custom theme** (`tacoTheme`): A dark-mode theme built around the
 *   Tacology brand palette. All semantic colour roles are overridden so every
 *   Vuetify component automatically adopts the taco-inspired colour scheme
 *   without per-component styling.
 *
 * - **Global defaults**: Sets `rounded: 'lg'` (12 px border radius) as the
 *   default for all components that accept a `rounded` prop, giving the UI a
 *   consistent, softly rounded aesthetic.
 *
 * @module plugins/vuetify
 */
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

/**
 * The Tacology Vuetify theme definition.
 *
 * All colours are hand-picked to match the project's brand palette. They are
 * exposed as CSS custom properties (e.g. `var(--v-theme-primary)`) and as
 * Vuetify's semantic colour tokens throughout the component tree.
 *
 * | Role          | Value     | Description                          |
 * |---------------|-----------|--------------------------------------|
 * | `primary`     | `#FF6B35` | Taco orange — CTAs, active states    |
 * | `secondary`   | `#FFD166` | Warm yellow — ratings, accents       |
 * | `accent`      | `#06D6A0` | Cilantro green — icons, chips        |
 * | `error`       | `#EF476F` | Salsa red — error states, alerts     |
 * | `background`  | `#1A1A2E` | Deep dark — page / body background   |
 * | `surface`     | `#16213E` | Slightly lighter — cards, drawers    |
 * | `on-surface`  | `#EAEAEA` | Light grey — body text on surfaces   |
 */
const tacoTheme = {
  /** Enable dark-mode colouring throughout the application. */
  dark: true,
  colors: {
    /** Taco orange — used for primary buttons, active nav highlights. */
    primary: '#FF6B35',
    /** Warm yellow — used for star ratings and secondary accents. */
    secondary: '#FFD166',
    /** Cilantro green — used for accent icons and category chips. */
    accent: '#06D6A0',
    /** Salsa red — used for error states, the error snackbar, and alerts. */
    error: '#EF476F',
    /** Deep dark blue-black — the base page/body background. */
    background: '#1A1A2E',
    /** Dark navy — the background for cards, navigation drawers, and sheets. */
    surface: '#16213E',
    /** Off-white — readable body text rendered on any surface colour. */
    'on-surface': '#EAEAEA',
  },
}

/**
 * Configured Vuetify 3 instance for Tacology.
 *
 * Registered as a Vue plugin in `src/main.ts`. After registration, all
 * `v-*` components and directives are globally available, the `tacoTheme` is
 * active, and the MDI icon font is loaded.
 *
 * @example
 * ```ts
 * // src/main.ts
 * import vuetify from './plugins/vuetify'
 * app.use(vuetify)
 * ```
 */
export default createVuetify({
  /**
   * Icon configuration: use Material Design Icons as the default icon set.
   * `aliases` provides shorthand mapping (e.g. `"$vuetify"`) and `sets.mdi`
   * registers the full MDI glyph set loaded from `@mdi/font`.
   */
  icons: { defaultSet: 'mdi', aliases, sets: { mdi } },

  /**
   * Theme configuration: register `tacoTheme` and set it as the active theme.
   * All Vuetify components render in dark mode using the brand colour palette
   * defined above.
   */
  theme: { defaultTheme: 'tacoTheme', themes: { tacoTheme } },

  /**
   * Global component defaults: every component that accepts a `rounded` prop
   * defaults to `"lg"` (12 px border radius) unless overridden locally. This
   * gives cards, chips, dialogs, and buttons a consistently softened look.
   */
  defaults: { global: { rounded: 'lg' } },
})
