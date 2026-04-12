<template>
  <v-dialog
    :model-value="modelValue"
    :max-width="smAndDown ? undefined : '800'"
    :fullscreen="smAndDown"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-img :src="recipe.image" height="300" cover>
        <div class="d-flex justify-end pa-2">
          <v-btn
            icon="mdi-close"
            aria-label="Close"
            color="white"
            variant="tonal"
            @click="emit('update:modelValue', false)"
          />
        </div>
      </v-img>

      <v-card-title class="text-h5 pt-4">{{ recipe.title }}</v-card-title>

      <v-card-text>
        <div class="text-h6 mb-2">Ingredients</div>
        <v-list density="compact">
          <v-list-item
            v-for="ing in recipe.extendedIngredients ?? []"
            :key="ing.name"
            class="px-0"
          >
            <template #prepend>
              <v-checkbox
                v-model="checkedIngredients[ing.name]"
                density="compact"
                hide-details
              />
            </template>
            <v-list-item-title
              :style="checkedIngredients[ing.name] ? 'text-decoration: line-through; opacity: 0.6' : ''"
            >
              {{ ing.original }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-text>
        <div class="text-h6 mb-2">Instructions</div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="instructions-text" v-html="formattedInstructions" />
      </v-card-text>

      <v-card-actions v-if="recipe.sourceUrl" class="pa-4">
        <v-btn
          color="primary"
          variant="elevated"
          :href="recipe.sourceUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View full recipe source"
        >
          View Full Recipe 🔗
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
/**
 * @component RecipeModal
 *
 * A full-featured recipe detail dialog built on Vuetify's `v-dialog`. When
 * opened it shows:
 *   - A large hero image (300px tall, cover-cropped) with a close button
 *     overlaid in the top-right corner.
 *   - A scrollable ingredients list rendered as a `v-list` where each item has
 *     a checkbox. Checking an ingredient marks it as "in hand" with a
 *     strikethrough and reduced opacity — purely local, client-side UX.
 *   - Cooking instructions with newline characters converted to `<br>` tags for
 *     proper multi-line display.
 *   - An optional "View Full Recipe" button that opens the recipe's source URL
 *     in a new tab, shown only when `recipe.sourceUrl` is present.
 *
 * On small-and-down (`smAndDown`) screens the dialog goes fullscreen to make
 * better use of limited viewport space. On larger screens it is constrained to
 * a max-width of 800px and centred.
 *
 * This component implements the Vue `v-model` pattern: `modelValue` controls
 * visibility and `update:modelValue` is emitted to close it.
 *
 * @example
 * <RecipeModal
 *   v-if="selectedRecipe"
 *   :recipe="selectedRecipe"
 *   v-model="modalOpen"
 * />
 */

import { computed, reactive } from 'vue'
import { useDisplay } from 'vuetify'
import type { SpoonacularRecipe } from '@/types/spoonacular'

/**
 * Props accepted by RecipeModal.
 *
 * @prop recipe - The full `SpoonacularRecipe` object from Spoonacular whose
 *   details are displayed. Must be a complete record so that `instructions`
 *   and `extendedIngredients` are populated. Passing a stub or partial object
 *   will produce empty ingredient lists and blank instructions.
 *
 * @prop modelValue - Controls the open/closed state of the underlying
 *   `v-dialog`. Pass `true` to show the modal, `false` to hide it. Follows the
 *   standard Vue `v-model` convention — bind with `v-model` or manually with
 *   `:model-value` and `@update:model-value`.
 */
const props = defineProps<{
  recipe: SpoonacularRecipe
  modelValue: boolean
}>()

/**
 * Events emitted by RecipeModal.
 *
 * @emits update:modelValue - Fired whenever the dialog requests a visibility
 *   change: when the user clicks the close button (emitted with `false`) or when
 *   the Vuetify dialog fires its own `update:model-value` event (forwarded
 *   directly). The parent must update its own boolean ref in response to keep
 *   the `v-model` in sync.
 *
 * @param value - `true` to keep the dialog open, `false` to close it.
 */
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

/**
 * Vuetify display composable destructured for the `smAndDown` breakpoint ref.
 * When `smAndDown` is `true` (screen width ≤ 599px) the dialog switches to
 * fullscreen mode to maximise the usable area on small devices like phones.
 */
const { smAndDown } = useDisplay()

/**
 * Reactive dictionary that tracks which ingredients the user has checked off.
 * Keys are ingredient name strings (e.g. `"chicken"`); values are booleans
 * where `true` means the ingredient has been checked (user has it on hand).
 * State is per-modal-instance and resets whenever the component is unmounted.
 *
 * Ingredient names from `extendedIngredients[].name` are used as keys so that
 * checking one item in a re-ordered list does not accidentally mark the wrong
 * ingredient.
 */
const checkedIngredients = reactive<Record<string, boolean>>({})

/**
 * Computed string containing the recipe's cooking instructions with all newline
 * characters (`\n`) replaced by HTML `<br>` tags. This allows instructions that
 * use newlines for paragraph breaks to render correctly inside the `v-html` div
 * in the template.
 *
 * Note: The template suppresses the `vue/no-v-html` ESLint warning with a
 * comment because the source data is trusted (Spoonacular, a curated public API).
 *
 * @returns The full instructions string with `\n` replaced by `<br>`, or an
 *   empty string when `instructions` is undefined.
 */
/**
 * Strips all HTML tags except `<br>` from the given string to prevent XSS
 * from untrusted third-party API responses rendered via `v-html`.
 */
function sanitizeHtml(html: string): string {
  return html.replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\n/g, '<br>')
}

const formattedInstructions = computed(() =>
  sanitizeHtml(props.recipe.instructions?.replace(/\n/g, '<br>') ?? '')
)
</script>

<style scoped>
.instructions-text {
  line-height: 1.7;
  white-space: pre-line;
}
</style>
