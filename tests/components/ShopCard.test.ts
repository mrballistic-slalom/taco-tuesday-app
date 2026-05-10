import { mount, VueWrapper } from '@vue/test-utils'
import { vi, afterEach, beforeEach } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'
import ShopCard from '@/components/map/ShopCard.vue'
import type { MapboxTacoShop } from '@/types/mapbox'

const vuetify = createVuetify({ components, directives })

const mockShop: MapboxTacoShop = {
  id: 'abc',
  name: 'Taco Paradise',
  full_address: '123 Taco St, Portland, OR',
  coordinates: { latitude: 45.52, longitude: -122.68 },
  categories: ['restaurant', 'mexican_restaurant'],
  maki: 'restaurant',
}

let wrapper: VueWrapper

beforeEach(() => {
  vi.useFakeTimers()
  setActivePinia(createPinia())
})

afterEach(() => {
  wrapper.unmount()
  vi.runOnlyPendingTimers()
  vi.useRealTimers()
})

it('renders shop name', () => {
  wrapper = mount(ShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop },
  })
  expect(wrapper.text()).toContain('Taco Paradise')
})

it('renders full address', () => {
  wrapper = mount(ShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop },
  })
  expect(wrapper.text()).toContain('123 Taco St, Portland, OR')
})

it('renders Get Directions link with Google Maps directions URL', () => {
  wrapper = mount(ShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop },
  })
  const link = wrapper.find('a[href*="google.com/maps/dir"]')
  expect(link.exists()).toBe(true)
  const href = link.attributes('href') ?? ''
  expect(href).toContain('destination=45.52,-122.68')
})

it('renders human-readable category chips from underscore slugs', () => {
  wrapper = mount(ShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop },
  })
  expect(wrapper.text()).toContain('Mexican Restaurant')
  expect(wrapper.text()).toContain('Restaurant')
})

it('renders Get Directions button with correct aria-label', () => {
  wrapper = mount(ShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop },
  })
  const btn = wrapper.find('[aria-label="Get directions"]')
  expect(btn.exists()).toBe(true)
})

it('omits address row when full_address is empty', () => {
  const shop: MapboxTacoShop = { ...mockShop, full_address: '' }
  wrapper = mount(ShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop },
  })
  expect(wrapper.text()).not.toContain('123 Taco St')
})

it('renders a random tagline', () => {
  wrapper = mount(ShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop },
  })
  const knownTaglines = [
    'This place slaps harder than a late-night craving.',
    'Rated 🌮🌮🌮 on the Todd Scale.',
    'Your taste buds called. This is their answer.',
    'Certified banger by the Taco Council.',
    "We're not saying it's perfect, but it's pretty close.",
    'The taco gods smile upon this establishment.',
    'Warning: may cause immediate taco obsession.',
    'Life is short. Eat here first.',
    'Scientists confirm: this place cures sadness.',
    'Five out of five tacos. Would recommend. Again and again.',
  ]
  const text = wrapper.text()
  const hasTagline = knownTaglines.some((tagline) => text.includes(tagline))
  expect(hasTagline).toBe(true)
})
