import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'
import RecipeCard from '@/components/recipes/RecipeCard.vue'
import type { Meal } from '@/types/mealdb'

const vuetify = createVuetify({ components, directives })
const mockMeal: Meal = {
  idMeal: '1',
  strMeal: 'Beef Tacos',
  strCategory: 'Mexican',
  strArea: 'Mexican',
  strInstructions: 'Cook the beef.',
  strMealThumb: 'https://example.com/thumb.jpg',
}

beforeEach(() => setActivePinia(createPinia()))

it('renders meal name', async () => {
  const wrapper = mount(RecipeCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { meal: mockMeal },
  })
  expect(wrapper.text()).toContain('Beef Tacos')
})

it('renders category chip', async () => {
  const wrapper = mount(RecipeCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { meal: mockMeal },
  })
  expect(wrapper.text()).toContain('Mexican')
})

it('renders Get Recipe button', async () => {
  const wrapper = mount(RecipeCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { meal: mockMeal },
  })
  expect(wrapper.text()).toContain('Get Recipe')
})

it('emits click when Get Recipe button pressed', async () => {
  const wrapper = mount(RecipeCard, {
    global: { plugins: [vuetify, createPinia()] },
    props: { meal: mockMeal },
  })
  // Find and click the button
  const btn = wrapper.find('button')
  await btn.trigger('click')
  expect(wrapper.emitted('click')).toBeTruthy()
})
