/**
 * @file src/plugins/vuetify.ts
 *
 * Vuetify 3 plugin configuration for Tacology.
 *
 * Registers the Material Design Icons set, the warm "Mercado Glass" theme,
 * and globally defaulted component options. The theme leans into the taco
 * palette (orange, marigold, cilantro, salsa) on a deep mole-oxblood base —
 * a far cry from a generic dark dashboard. Most surfaces are rendered with
 * glassmorphism utility classes from `App.vue`, so the `surface` token only
 * acts as a fallback for components that bypass the glass treatment.
 */
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

/**
 * The "Mercado Glass" theme — Mexican mercado at golden hour, behind frosted
 * glass. The body gradient in `App.vue` provides the visible canvas; these
 * tokens cover semantic component colors and any solid-fallback paint.
 *
 * | Role          | Value     | Description                              |
 * |---------------|-----------|------------------------------------------|
 * | `primary`     | `#FF6B35` | Taco orange — CTAs, active states        |
 * | `secondary`   | `#FCD34D` | Marigold yellow — accents, highlights    |
 * | `accent`      | `#06D6A0` | Cilantro green — icons, chips            |
 * | `error`       | `#E11D48` | Salsa rose — error states, alerts        |
 * | `background`  | `#1A0608` | Deep mole — fallback under the gradient  |
 * | `surface`     | `#3B0F14` | Oxblood — fallback for non-glass cards   |
 * | `on-surface`  | `#FFF8F0` | Warm bone-white — body text              |
 */
const tacoTheme = {
  dark: true,
  colors: {
    primary: '#FF6B35',
    secondary: '#FCD34D',
    accent: '#06D6A0',
    error: '#E11D48',
    background: '#1A0608',
    surface: '#3B0F14',
    'on-surface': '#FFF8F0',
  },
}

export default createVuetify({
  icons: { defaultSet: 'mdi', aliases, sets: { mdi } },
  theme: { defaultTheme: 'tacoTheme', themes: { tacoTheme } },
  defaults: { global: { rounded: 'lg' } },
})
