import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const tacoTheme = {
  dark: true,
  colors: {
    primary: '#FF6B35',
    secondary: '#FFD166',
    accent: '#06D6A0',
    error: '#EF476F',
    background: '#1A1A2E',
    surface: '#16213E',
    'on-surface': '#EAEAEA',
  },
}

export default createVuetify({
  icons: { defaultSet: 'mdi', aliases, sets: { mdi } },
  theme: { defaultTheme: 'tacoTheme', themes: { tacoTheme } },
  defaults: { global: { rounded: 'lg' } },
})
