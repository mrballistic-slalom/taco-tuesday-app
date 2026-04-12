import { mount, VueWrapper } from '@vue/test-utils'
import { vi, afterEach, beforeEach } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'
import TacoResult from '@/components/randomizer/TacoResult.vue'
import type { SpoonacularRecipe } from '@/types/spoonacular'

const vuetify = createVuetify({ components, directives })

const mockRecipe: SpoonacularRecipe = {
  id: 1,
  title: 'Al Pastor Tacos',
  image: 'https://example.com/thumb.jpg',
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

it('renders meal name', () => {
  wrapper = mount(TacoResult, {
    global: { plugins: [vuetify, createPinia()] },
    props: { recipe: mockRecipe },
  })
  expect(wrapper.text()).toContain('Al Pastor Tacos')
})

it('renders "View Full Recipe" button', () => {
  wrapper = mount(TacoResult, {
    global: { plugins: [vuetify, createPinia()] },
    props: { recipe: mockRecipe },
  })
  expect(wrapper.text()).toContain('View Full Recipe')
})

it('renders "SPIN AGAIN" button', () => {
  wrapper = mount(TacoResult, {
    global: { plugins: [vuetify, createPinia()] },
    props: { recipe: mockRecipe },
  })
  expect(wrapper.text()).toContain('SPIN AGAIN')
})

it('emits view-recipe on button click', async () => {
  wrapper = mount(TacoResult, {
    global: { plugins: [vuetify, createPinia()] },
    props: { recipe: mockRecipe },
  })
  const btns = wrapper.findAll('button')
  const viewBtn = btns.find((b) => b.text().includes('View Full Recipe'))
  if (viewBtn) {
    await viewBtn.trigger('click')
    expect(wrapper.emitted('view-recipe')).toBeTruthy()
  }
})

it('emits spin-again on button click', async () => {
  wrapper = mount(TacoResult, {
    global: { plugins: [vuetify, createPinia()] },
    props: { recipe: mockRecipe },
  })
  const btns = wrapper.findAll('button')
  const spinBtn = btns.find((b) => b.text().includes('SPIN AGAIN'))
  if (spinBtn) {
    await spinBtn.trigger('click')
    expect(wrapper.emitted('spin-again')).toBeTruthy()
  }
})
