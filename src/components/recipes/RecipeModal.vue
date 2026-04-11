<template>
  <v-dialog
    :model-value="modelValue"
    :max-width="smAndDown ? undefined : '800'"
    :fullscreen="smAndDown"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-img :src="meal.strMealThumb" height="300" cover>
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

      <v-card-title class="text-h5 pt-4">{{ meal.strMeal }}</v-card-title>

      <v-card-text>
        <div class="text-h6 mb-2">Ingredients</div>
        <v-list density="compact">
          <v-list-item v-for="ing in parsedIngredients" :key="ing.ingredient" class="px-0">
            <template #prepend>
              <v-checkbox
                v-model="checkedIngredients[ing.ingredient]"
                density="compact"
                hide-details
              />
            </template>
            <v-list-item-title
              :style="checkedIngredients[ing.ingredient] ? 'text-decoration: line-through; opacity: 0.6' : ''"
            >
              {{ ing.measure }} {{ ing.ingredient }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-text>
        <div class="text-h6 mb-2">Instructions</div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="instructions-text" v-html="formattedInstructions" />
      </v-card-text>

      <v-card-actions v-if="meal.strYoutube" class="pa-4">
        <v-btn
          color="error"
          variant="elevated"
          :href="meal.strYoutube"
          target="_blank"
          aria-label="Watch recipe on YouTube"
        >
          Watch on YouTube 🎬
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useDisplay } from 'vuetify'
import type { Meal, ParsedIngredient } from '@/types/mealdb'

const props = defineProps<{
  meal: Meal
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { smAndDown } = useDisplay()

const checkedIngredients = reactive<Record<string, boolean>>({})

function parseIngredients(meal: Meal): ParsedIngredient[] {
  return Array.from({ length: 20 }, (_, i) => i + 1)
    .map((i) => ({
      ingredient: (meal[`strIngredient${i}`] as string | null) ?? '',
      measure: (meal[`strMeasure${i}`] as string | null) ?? '',
    }))
    .filter(({ ingredient }) => ingredient.trim() !== '')
}

const parsedIngredients = computed(() => parseIngredients(props.meal))

const formattedInstructions = computed(() =>
  props.meal.strInstructions.replace(/\n/g, '<br>')
)
</script>

<style scoped>
.instructions-text {
  line-height: 1.7;
  white-space: pre-line;
}
</style>
