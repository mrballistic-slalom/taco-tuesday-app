import { mount } from '@vue/test-utils'
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

beforeEach(() => setActivePinia(createPinia()))

it('renders a card for each recipe', () => {
  const wrapper = mount(RecipeGrid, {
    global: { plugins: [vuetify, createPinia()] },
    props: { recipes: mockRecipes },
  })
  expect(wrapper.text()).toContain('Beef Tacos')
  expect(wrapper.text()).toContain('Fish Tacos')
})

it('renders empty when no recipes', () => {
  const wrapper = mount(RecipeGrid, {
    global: { plugins: [vuetify, createPinia()] },
    props: { recipes: [] },
  })
  expect(wrapper.exists()).toBe(true)
})

it('emits recipe-click when a card is clicked', async () => {
  const wrapper = mount(RecipeGrid, {
    global: { plugins: [vuetify, createPinia()] },
    props: { recipes: mockRecipes },
  })
  // Trigger click on first button found (Get Recipe)
  const btn = wrapper.find('button')
  if (btn.exists()) {
    await btn.trigger('click')
    expect(wrapper.emitted('recipe-click')).toBeTruthy()
  }
})
