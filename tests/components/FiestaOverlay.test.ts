import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'
import FiestaOverlay from '@/components/tuesday/FiestaOverlay.vue'

const vuetify = createVuetify({ components, directives })

function makeMatchMedia(prefersReducedMotion = false) {
  return vi.fn().mockImplementation((query: string) => ({
    matches: prefersReducedMotion ? query.includes('reduced-motion') : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

beforeEach(() => {
  // Fresh mock each test — prevents impl bleeding between tests
  vi.stubGlobal('matchMedia', makeMatchMedia(false))
  vi.useFakeTimers()
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it('renders 80 confetti elements on Tuesday', async () => {
  vi.setSystemTime(new Date('2024-01-09T12:00:00')) // Tuesday
  const wrapper = mount(FiestaOverlay, {
    global: { plugins: [vuetify, createPinia()] },
    attachTo: document.body,
  })
  await wrapper.vm.$nextTick()
  expect(wrapper.element.children.length).toBe(80)
  wrapper.unmount()
})

it('does not create confetti when prefers-reduced-motion is set', async () => {
  vi.stubGlobal('matchMedia', makeMatchMedia(true))
  vi.setSystemTime(new Date('2024-01-09T12:00:00')) // Tuesday
  const wrapper = mount(FiestaOverlay, {
    global: { plugins: [vuetify, createPinia()] },
    attachTo: document.body,
  })
  await wrapper.vm.$nextTick()
  expect(wrapper.element.children.length).toBe(0)
  wrapper.unmount()
})

it('does not render confetti on a non-Tuesday day', async () => {
  vi.setSystemTime(new Date('2024-01-08T12:00:00')) // Monday
  const wrapper = mount(FiestaOverlay, {
    global: { plugins: [vuetify, createPinia()] },
    attachTo: document.body,
  })
  await wrapper.vm.$nextTick()
  expect(wrapper.find('.fiesta-overlay').exists()).toBe(false)
  wrapper.unmount()
})

it('removes confetti elements on unmount', async () => {
  vi.setSystemTime(new Date('2024-01-09T12:00:00')) // Tuesday
  const wrapper = mount(FiestaOverlay, {
    global: { plugins: [vuetify, createPinia()] },
    attachTo: document.body,
  })
  await wrapper.vm.$nextTick()
  expect(wrapper.element.children.length).toBe(80)
  wrapper.unmount()
  expect(document.querySelectorAll('.fiesta-overlay').length).toBe(0)
})
