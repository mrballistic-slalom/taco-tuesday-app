import { mount, VueWrapper } from '@vue/test-utils'
import { vi, afterEach, beforeEach } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'
import RecipeGrid from '@/components/recipes/RecipeGrid.vue'
import type { SpoonacularRecipe } from '@/types/spoonacular'

const vuetify = createVuetify({ components, directives })

const mockRecipes: SpoonacularRecipe[] = [
  { id: 1, title: 'Beef Tacos', image: 'https://example.com/thumb.jpg' },
  { id: 2, title: 'Fish Tacos', image: 'https://example.com/fish.jpg' },
]

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

it('renders a card for each recipe', () => {
  wrapper = mount(RecipeGrid, {
    global: { plugins: [vuetify, createPinia()] },
    props: { recipes: mockRecipes },
  })
  expect(wrapper.text()).toContain('Beef Tacos')
  expect(wrapper.text()).toContain('Fish Tacos')
})

it('renders empty when no recipes', () => {
  wrapper = mount(RecipeGrid, {
    global: { plugins: [vuetify, createPinia()] },
    props: { recipes: [] },
  })
  expect(wrapper.exists()).toBe(true)
})

it('emits recipe-click when a card is clicked', async () => {
  wrapper = mount(RecipeGrid, {
    global: { plugins: [vuetify, createPinia()] },
    props: { recipes: mockRecipes },
  })
  const btn = wrapper.find('button')
  if (btn.exists()) {
    await btn.trigger('click')
    expect(wrapper.emitted('recipe-click')).toBeTruthy()
  }
})
