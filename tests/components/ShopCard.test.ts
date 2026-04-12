import { mount, VueWrapper } from '@vue/test-utils'
import { vi, afterEach, beforeEach } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'
import ShopCard from '@/components/map/ShopCard.vue'
import type { YelpBusiness } from '@/types/yelp'

const vuetify = createVuetify({ components, directives })

const mockShop: YelpBusiness = {
  id: '1',
  name: 'Taco Paradise',
  rating: 4.5,
  review_count: 200,
  price: '$$',
  location: { display_address: ['123 Taco St', 'Portland, OR'] },
  coordinates: { latitude: 45.52, longitude: -122.68 },
  categories: [{ alias: 'tacos', title: 'Tacos' }],
  url: 'https://yelp.com/biz/taco-paradise',
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

it('renders address', () => {
  wrapper = mount(ShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop },
  })
  expect(wrapper.text()).toContain('123 Taco St')
})

it('renders Yelp link with correct href', () => {
  wrapper = mount(ShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop },
  })
  const link = wrapper.find('a[href="https://yelp.com/biz/taco-paradise"]')
  expect(link.exists()).toBe(true)
})

it('renders price chip', () => {
  wrapper = mount(ShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop },
  })
  expect(wrapper.text()).toContain('$$')
})

it('renders category chip', () => {
  wrapper = mount(ShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop },
  })
  expect(wrapper.text()).toContain('Tacos')
})

it('renders review count', () => {
  wrapper = mount(ShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop },
  })
  expect(wrapper.text()).toContain('200 reviews')
})

it('renders View on Yelp button with correct aria-label', () => {
  wrapper = mount(ShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop },
  })
  const btn = wrapper.find('[aria-label="View on Yelp"]')
  expect(btn.exists()).toBe(true)
})

it('does not render price chip when price is undefined', () => {
  const shopWithoutPrice: YelpBusiness = { ...mockShop, price: undefined }
  wrapper = mount(ShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: shopWithoutPrice },
  })
  expect(wrapper.text()).toContain('Taco Paradise')
  expect(wrapper.text()).not.toContain('$$')
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
