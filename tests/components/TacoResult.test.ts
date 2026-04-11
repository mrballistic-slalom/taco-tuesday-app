import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'
import TacoResult from '@/components/randomizer/TacoResult.vue'
import type { Meal } from '@/types/mealdb'

const vuetify = createVuetify({ components, directives })

const mockMeal: Meal = {
  idMeal: '1',
  strMeal: 'Al Pastor Tacos',
  strCategory: 'Mexican',
  strArea: 'Mexican',
  strInstructions: 'Marinate and grill the pork.',
  strMealThumb: 'https://example.com/thumb.jpg',
}

beforeEach(() => setActivePinia(createPinia()))

it('renders meal name', () => {
  const wrapper = mount(TacoResult, {
    global: { plugins: [vuetify, createPinia()] },
    props: { meal: mockMeal },
  })
  expect(wrapper.text()).toContain('Al Pastor Tacos')
})

it('renders "View Full Recipe" button', () => {
  const wrapper = mount(TacoResult, {
    global: { plugins: [vuetify, createPinia()] },
    props: { meal: mockMeal },
  })
  expect(wrapper.text()).toContain('View Full Recipe')
})

it('renders "SPIN AGAIN" button', () => {
  const wrapper = mount(TacoResult, {
    global: { plugins: [vuetify, createPinia()] },
    props: { meal: mockMeal },
  })
  expect(wrapper.text()).toContain('SPIN AGAIN')
})

it('emits view-recipe on button click', async () => {
  const wrapper = mount(TacoResult, {
    global: { plugins: [vuetify, createPinia()] },
    props: { meal: mockMeal },
  })
  const btns = wrapper.findAll('button')
  const viewBtn = btns.find((b) => b.text().includes('View Full Recipe'))
  if (viewBtn) {
    await viewBtn.trigger('click')
    expect(wrapper.emitted('view-recipe')).toBeTruthy()
  }
})

it('emits spin-again on button click', async () => {
  const wrapper = mount(TacoResult, {
    global: { plugins: [vuetify, createPinia()] },
    props: { meal: mockMeal },
  })
  const btns = wrapper.findAll('button')
  const spinBtn = btns.find((b) => b.text().includes('SPIN AGAIN'))
  if (spinBtn) {
    await spinBtn.trigger('click')
    expect(wrapper.emitted('spin-again')).toBeTruthy()
  }
})
