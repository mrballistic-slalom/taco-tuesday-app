import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'
import TuesdayBanner from '@/components/tuesday/TuesdayBanner.vue'

const vuetify = createVuetify({ components, directives })

beforeEach(() => {
  vi.useFakeTimers()
  setActivePinia(createPinia())
})
afterEach(() => vi.useRealTimers())

it('renders proximity-aware countdown copy on a Monday', () => {
  vi.setSystemTime(new Date('2024-01-08T12:00:00')) // Monday — 1 day until Tuesday
  const wrapper = mount(TuesdayBanner, { global: { plugins: [vuetify, createPinia()] } })
  expect(wrapper.text()).toContain('Almost there')
  expect(wrapper.text()).toContain('Tomorrow we feast')
})

it('shows days until Tuesday on a Monday', () => {
  vi.setSystemTime(new Date('2024-01-08T12:00:00')) // Monday, 1 day until Tuesday
  const wrapper = mount(TuesdayBanner, { global: { plugins: [vuetify, createPinia()] } })
  expect(wrapper.text()).toContain('1')
})

it('renders the bobbing taco emoji', () => {
  vi.setSystemTime(new Date('2024-01-08T12:00:00'))
  const wrapper = mount(TuesdayBanner, { global: { plugins: [vuetify, createPinia()] } })
  expect(wrapper.text()).toContain('🌮')
})

it('shows 7 days when it is already Tuesday', () => {
  vi.setSystemTime(new Date('2024-01-09T12:00:00')) // Tuesday
  const wrapper = mount(TuesdayBanner, { global: { plugins: [vuetify, createPinia()] } })
  expect(wrapper.text()).toContain('7')
})

it('renders the "Until the next Taco Tuesday" subtitle', () => {
  vi.setSystemTime(new Date('2024-01-08T12:00:00'))
  const wrapper = mount(TuesdayBanner, { global: { plugins: [vuetify, createPinia()] } })
  expect(wrapper.text()).toContain('Until the next Taco Tuesday')
})

it('shows correct days on a Wednesday (6 days until Tuesday)', () => {
  vi.setSystemTime(new Date('2024-01-10T12:00:00')) // Wednesday
  const wrapper = mount(TuesdayBanner, { global: { plugins: [vuetify, createPinia()] } })
  expect(wrapper.text()).toContain('6')
})
