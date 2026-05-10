import { mount, VueWrapper } from '@vue/test-utils'
import { vi, afterEach, beforeEach } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'
import TuesdayShopCard from '@/components/tuesday/TuesdayShopCard.vue'
import type { MapboxTacoShop } from '@/types/mapbox'

const vuetify = createVuetify({ components, directives })

const mockShop: MapboxTacoShop = {
  id: 'abc',
  name: 'Tuesday Taco Spot',
  full_address: '456 Taco Ave, Portland, OR',
  coordinates: { latitude: 45.52, longitude: -122.68 },
  categories: ['mexican_restaurant'],
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
  wrapper = mount(TuesdayShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop, rank: 1 },
  })
  expect(wrapper.text()).toContain('Tuesday Taco Spot')
})

it('renders gold medal badge for rank 1', () => {
  wrapper = mount(TuesdayShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop, rank: 1 },
  })
  expect(wrapper.text()).toContain('🥇')
})

it('renders silver medal badge for rank 2', () => {
  wrapper = mount(TuesdayShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop, rank: 2 },
  })
  expect(wrapper.text()).toContain('🥈')
})

it('renders bronze medal badge for rank 3', () => {
  wrapper = mount(TuesdayShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop, rank: 3 },
  })
  expect(wrapper.text()).toContain('🥉')
})

it('renders numeric badge for rank 4+', () => {
  wrapper = mount(TuesdayShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop, rank: 4 },
  })
  expect(wrapper.text()).toContain('#4')
})

it('renders Get Directions link with Google Maps directions URL', () => {
  wrapper = mount(TuesdayShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop, rank: 1 },
  })
  const link = wrapper.find('a[href*="google.com/maps/dir"]')
  expect(link.exists()).toBe(true)
  const href = link.attributes('href') ?? ''
  expect(href).toContain('destination=45.52,-122.68')
})

it('renders address', () => {
  wrapper = mount(TuesdayShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop, rank: 1 },
  })
  expect(wrapper.text()).toContain('456 Taco Ave')
})
