<script setup lang="ts">
import type { MacControlSize } from '../../types'
import { computed, ref } from 'vue'
import { useFieldAttrs, useFieldModel } from './useField'
import './field.css'

export interface MacSearchFieldProps {
  modelValue?: string
  defaultValue?: string
  size?: MacControlSize
  disabled?: boolean
  placeholder?: string
  name?: string
  required?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MacSearchFieldProps>(), {
  size: 'regular',
  placeholder: 'Search',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const model = useFieldModel(props, emit)
const { wrapperAttrs, inputAttrs } = useFieldAttrs()

const classes = computed(() => [
  'macvue-field',
  'macvue-field--search',
  `macvue-field--${props.size}`,
])

// Not useTemplateRef: it landed in Vue 3.5 and the peer range starts at 3.4.
const el = ref<HTMLInputElement | null>(null)

// NSSearchField clears on Escape and on the clear button; the button sits
// outside the tab order (keyboard users clear with Escape instead).
function clear() {
  model.value = ''
  el.value?.focus()
}

defineExpose({
  el,
  focus: () => el.value?.focus(),
  blur: () => el.value?.blur(),
})
</script>

<template>
  <div
    :class="classes"
    v-bind="wrapperAttrs"
  >
    <svg
      class="macvue-field-search-icon"
      viewBox="0 0 16 15"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="6.75"
        cy="6.25"
        r="5"
        stroke="currentColor"
        stroke-width="1.5"
      />
      <path
        d="M10.5 10 14.2 13.7"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
    <input
      ref="el"
      v-model="model"
      type="search"
      class="macvue-field-input"
      :disabled="disabled"
      :placeholder="placeholder"
      :name="name"
      :required="required"
      v-bind="inputAttrs"
      @keydown.escape="clear"
    >
    <button
      v-if="model !== ''"
      type="button"
      class="macvue-field-clear"
      tabindex="-1"
      aria-label="Clear text"
      :disabled="disabled"
      @mousedown.prevent
      @click="clear"
    >
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="currentColor"
        />
        <path
          d="M5.5 5.5 10.5 10.5 M10.5 5.5 5.5 10.5"
          stroke="var(--macvue-field-bg)"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </div>
</template>
