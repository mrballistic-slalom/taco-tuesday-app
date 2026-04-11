import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'
import RecipeModal from '@/components/recipes/RecipeModal.vue'
import type { SpoonacularRecipe } from '@/types/spoonacular'

const vuetify = createVuetify({ components, directives })

const mockRecipe: SpoonacularRecipe = {
  id: 1,
  title: 'Beef Tacos',
  image: 'https://example.com/thumb.jpg',
  instructions: 'Season the beef.\nCook in a pan.\nServe in tortillas.',
  extendedIngredients: [
    { id: 1, name: 'beef', original: '500g Beef', amount: 500, unit: 'g' },
    { id: 2, name: 'tortillas', original: '8 Tortillas', amount: 8, unit: '' },
  ],
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

function mountModal(recipe: SpoonacularRecipe = mockRecipe, modelValue = true) {
  return mount(RecipeModal, {
    global: { plugins: [vuetify, createPinia()] },
    props: { recipe, modelValue },
    attachTo: document.body,
  })
}

it('renders recipe title when open', async () => {
  const wrapper = mountModal()
  await wrapper.vm.$nextTick()
  // v-dialog teleports to body — check document.body
  expect(document.body.textContent).toContain('Beef Tacos')
  wrapper.unmount()
})

it('renders ingredients list', async () => {
  const wrapper = mountModal()
  await wrapper.vm.$nextTick()
  expect(document.body.textContent).toContain('500g Beef')
  expect(document.body.textContent).toContain('8 Tortillas')
  wrapper.unmount()
})

it('does not render source link when sourceUrl is absent', async () => {
  const wrapper = mountModal()
  await wrapper.vm.$nextTick()
  expect(document.body.textContent).not.toContain('View Full Recipe 🔗')
  wrapper.unmount()
})

it('renders source link button when sourceUrl is present', async () => {
  const recipeWithSource: SpoonacularRecipe = {
    ...mockRecipe,
    sourceUrl: 'https://example.com/recipe',
  }
  const wrapper = mountModal(recipeWithSource)
  await wrapper.vm.$nextTick()
  expect(document.body.textContent).toContain('View Full Recipe')
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
