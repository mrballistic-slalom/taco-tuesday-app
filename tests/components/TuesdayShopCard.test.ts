import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'
import TuesdayShopCard from '@/components/tuesday/TuesdayShopCard.vue'
import type { YelpBusiness } from '@/types/yelp'

const vuetify = createVuetify({ components, directives })

const mockShop: YelpBusiness = {
  id: '1',
  name: 'Tuesday Taco Spot',
  rating: 4.8,
  review_count: 350,
  price: '$',
  location: { display_address: ['456 Taco Ave', 'Portland, OR'] },
  coordinates: { latitude: 45.52, longitude: -122.68 },
  categories: [{ alias: 'tacos', title: 'Tacos' }],
  url: 'https://yelp.com/biz/tuesday-taco-spot',
}

beforeEach(() => setActivePinia(createPinia()))

it('renders shop name', () => {
  const wrapper = mount(TuesdayShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop, rank: 1 },
  })
  expect(wrapper.text()).toContain('Tuesday Taco Spot')
})

it('renders gold medal badge for rank 1', () => {
  const wrapper = mount(TuesdayShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop, rank: 1 },
  })
  expect(wrapper.text()).toContain('🥇')
})

it('renders silver medal badge for rank 2', () => {
  const wrapper = mount(TuesdayShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop, rank: 2 },
  })
  expect(wrapper.text()).toContain('🥈')
})

it('renders bronze medal badge for rank 3', () => {
  const wrapper = mount(TuesdayShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop, rank: 3 },
  })
  expect(wrapper.text()).toContain('🥉')
})

it('renders numeric badge for rank 4+', () => {
  const wrapper = mount(TuesdayShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop, rank: 4 },
  })
  expect(wrapper.text()).toContain('#4')
})

it('renders Yelp link', () => {
  const wrapper = mount(TuesdayShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop, rank: 1 },
  })
  const link = wrapper.find('[href="https://yelp.com/biz/tuesday-taco-spot"]')
  expect(link.exists()).toBe(true)
})

it('renders address', () => {
  const wrapper = mount(TuesdayShopCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { shop: mockShop, rank: 1 },
  })
  expect(wrapper.text()).toContain('456 Taco Ave')
})
