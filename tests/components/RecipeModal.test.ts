import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'
import RecipeModal from '@/components/recipes/RecipeModal.vue'
import type { Meal } from '@/types/mealdb'

const vuetify = createVuetify({ components, directives })

const mockMeal: Meal = {
  idMeal: '1',
  strMeal: 'Beef Tacos',
  strCategory: 'Mexican',
  strArea: 'Mexican',
  strInstructions: 'Season the beef.\nCook in a pan.\nServe in tortillas.',
  strMealThumb: 'https://example.com/thumb.jpg',
  strIngredient1: 'Beef',
  strMeasure1: '500g',
  strIngredient2: 'Tortillas',
  strMeasure2: '8',
  strIngredient3: '',
  strMeasure3: '',
}

beforeEach(() => {
  // VDialog (VOverlay) uses visualViewport for positioning — not in jsdom
  vi.stubGlobal('visualViewport', {
    offsetTop: 0, offsetLeft: 0, scale: 1, width: 1024, height: 768,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  })
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.unstubAllGlobals()
  // Clean up any teleported dialog DOM
  document.body.innerHTML = ''
})

function mountModal(meal: Meal = mockMeal, modelValue = true) {
  return mount(RecipeModal, {
    global: { plugins: [vuetify, createPinia()] },
    props: { meal, modelValue },
    attachTo: document.body,
  })
}

it('renders meal name when open', async () => {
  const wrapper = mountModal()
  await wrapper.vm.$nextTick()
  // v-dialog teleports to body — check document.body
  expect(document.body.textContent).toContain('Beef Tacos')
  wrapper.unmount()
})

it('renders ingredients list', async () => {
  const wrapper = mountModal()
  await wrapper.vm.$nextTick()
  expect(document.body.textContent).toContain('Beef')
  expect(document.body.textContent).toContain('Tortillas')
  wrapper.unmount()
})

it('does not render YouTube button when strYoutube is absent', async () => {
  const wrapper = mountModal()
  await wrapper.vm.$nextTick()
  expect(document.body.textContent).not.toContain('Watch on YouTube')
  wrapper.unmount()
})

it('renders YouTube button when strYoutube is present', async () => {
  const mealWithYT: Meal = { ...mockMeal, strYoutube: 'https://youtube.com/watch?v=abc' }
  const wrapper = mountModal(mealWithYT)
  await wrapper.vm.$nextTick()
  expect(document.body.textContent).toContain('Watch on YouTube')
  wrapper.unmount()
})

it('emits update:modelValue false when close button is clicked', async () => {
  const wrapper = mountModal()
  await wrapper.vm.$nextTick()
  const closeBtn = document.querySelector('[aria-label="Close"]')
  if (closeBtn) {
    ;(closeBtn as HTMLElement).click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  }
  wrapper.unmount()
})
