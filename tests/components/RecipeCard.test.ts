import { mount, VueWrapper } from '@vue/test-utils'
import { vi, afterEach, beforeEach } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'
import RecipeCard from '@/components/recipes/RecipeCard.vue'
import type { SpoonacularRecipe } from '@/types/spoonacular'

const vuetify = createVuetify({ components, directives })
const mockRecipe: SpoonacularRecipe = {
  id: 1,
  title: 'Al Pastor Tacos',
  image: 'https://example.com/thumb.jpg',
  cuisines: ['Mexican'],
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

it('renders meal name', async () => {
  wrapper = mount(RecipeCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { recipe: mockRecipe },
  })
  expect(wrapper.text()).toContain('Al Pastor Tacos')
})

it('renders category chip', async () => {
  wrapper = mount(RecipeCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { recipe: mockRecipe },
  })
  expect(wrapper.text()).toContain('Mexican')
})

it('renders Get Recipe button', async () => {
  wrapper = mount(RecipeCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { recipe: mockRecipe },
  })
  expect(wrapper.text()).toContain('Get Recipe')
})

it('emits click when Get Recipe button pressed', async () => {
  wrapper = mount(RecipeCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { recipe: mockRecipe },
  })
  const btn = wrapper.find('button')
  await btn.trigger('click')
  expect(wrapper.emitted('click')).toBeTruthy()
})
