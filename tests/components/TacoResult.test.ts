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
  sourceUrl: 'https://example.com/recipes/al-pastor-tacos',
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

it('renders "View Full Recipe" as a direct link to recipe.sourceUrl', () => {
  wrapper = mount(TacoResult, {
    global: { plugins: [vuetify, createPinia()] },
    props: { recipe: mockRecipe },
  })
  const link = wrapper.find('a[href="https://example.com/recipes/al-pastor-tacos"]')
  expect(link.exists()).toBe(true)
  expect(link.attributes('target')).toBe('_blank')
  expect(link.text()).toContain('View Full Recipe')
})

it('hides "View Full Recipe" when recipe.sourceUrl is missing', () => {
  const recipeWithoutUrl: SpoonacularRecipe = { ...mockRecipe, sourceUrl: undefined }
  wrapper = mount(TacoResult, {
    global: { plugins: [vuetify, createPinia()] },
    props: { recipe: recipeWithoutUrl },
  })
  expect(wrapper.text()).not.toContain('View Full Recipe')
  expect(wrapper.text()).toContain('SPIN AGAIN')
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
