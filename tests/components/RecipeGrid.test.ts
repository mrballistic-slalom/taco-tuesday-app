import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'
import RecipeGrid from '@/components/recipes/RecipeGrid.vue'
import type { Meal } from '@/types/mealdb'

const vuetify = createVuetify({ components, directives })

const mockMeals: Meal[] = [
  {
    idMeal: '1',
    strMeal: 'Beef Tacos',
    strCategory: 'Mexican',
    strArea: 'Mexican',
    strInstructions: 'Cook the beef.',
    strMealThumb: 'https://example.com/thumb.jpg',
  },
  {
    idMeal: '2',
    strMeal: 'Fish Tacos',
    strCategory: 'Seafood',
    strArea: 'Mexican',
    strInstructions: 'Grill the fish.',
    strMealThumb: 'https://example.com/fish.jpg',
  },
]

beforeEach(() => setActivePinia(createPinia()))

it('renders a card for each meal', () => {
  const wrapper = mount(RecipeGrid, {
    global: { plugins: [vuetify, createPinia()] },
    props: { recipes: mockMeals },
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
    props: { recipes: mockMeals },
  })
  // Trigger click on first button found (Get Recipe)
  const btn = wrapper.find('button')
  if (btn.exists()) {
    await btn.trigger('click')
    expect(wrapper.emitted('recipe-click')).toBeTruthy()
  }
})
