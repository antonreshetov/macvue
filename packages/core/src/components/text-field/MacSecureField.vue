<script setup lang="ts">
import type { MacControlSize } from '../../types'
import { computed, ref } from 'vue'
import { useFieldAttrs, useFieldModel } from './useField'
import './field.css'

export interface MacSecureFieldProps {
  modelValue?: string
  defaultValue?: string
  size?: MacControlSize
  disabled?: boolean
  placeholder?: string
  name?: string
  required?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MacSecureFieldProps>(), {
  size: 'regular',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const model = useFieldModel(props, emit)
const { wrapperAttrs, inputAttrs } = useFieldAttrs()

const classes = computed(() => ['macvue-field', `macvue-field--${props.size}`])

// Not useTemplateRef: it landed in Vue 3.5 and the peer range starts at 3.4.
const el = ref<HTMLInputElement | null>(null)

defineExpose({
  el,
  focus: () => el.value?.focus(),
  blur: () => el.value?.blur(),
})
</script>

<template>
  <!-- NSSecureTextField has no reveal affordance; neither does this one. -->
  <div
    :class="classes"
    v-bind="wrapperAttrs"
  >
    <input
      ref="el"
      v-model="model"
      type="password"
      class="macvue-field-input"
      :disabled="disabled"
      :placeholder="placeholder"
      :name="name"
      :required="required"
      v-bind="inputAttrs"
    >
  </div>
</template>
