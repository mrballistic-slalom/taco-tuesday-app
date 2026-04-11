import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppNav from '@/components/AppNav.vue'

const vuetify = createVuetify({ components, directives })
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', redirect: '/map' },
    { path: '/map', component: { template: '<div/>' } },
    { path: '/recipes', component: { template: '<div/>' } },
    { path: '/randomizer', component: { template: '<div/>' } },
    { path: '/tuesday', component: { template: '<div/>' } },
  ],
})

// VNavigationDrawer and VBottomNavigation require v-app layout context which
// hangs in jsdom. Stub them with slot-forwarding divs so nav item text renders.
function mountAppNav() {
  return mount(AppNav, {
    global: {
      plugins: [vuetify, createPinia(), router],
      stubs: {
        VNavigationDrawer: { template: '<div data-stub="drawer"><slot /><slot name="append" /></div>' },
        VBottomNavigation: { template: '<div data-stub="bottom-nav"><slot /></div>' },
      },
    },
  })
}

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((q: string) => ({
    matches: false, media: q, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })))
  setActivePinia(createPinia())
})

afterEach(() => vi.unstubAllGlobals())

it('renders without errors', () => {
  const wrapper = mountAppNav()
  expect(wrapper.exists()).toBe(true)
})

it('renders all 4 nav items', () => {
  const wrapper = mountAppNav()
  const text = wrapper.text()
  expect(text).toContain('Find Tacos')
  expect(text).toContain('Recipes')
  expect(text).toContain('Spin It')
  expect(text).toContain('Taco Tuesday')
})
