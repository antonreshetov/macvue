<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { MacControlSize } from '../../types'
import { RadioGroupRoot } from 'reka-ui'
import { computed, ref, watchPostEffect } from 'vue'
import './radio-group.css'

export interface MacRadioGroupProps {
  modelValue?: string
  defaultValue?: string
  size?: MacControlSize
  disabled?: boolean
  orientation?: 'vertical' | 'horizontal'
  name?: string
  required?: boolean
}

const props = withDefaults(defineProps<MacRadioGroupProps>(), {
  size: 'regular',
  orientation: 'vertical',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Reka types the payload as its wide AcceptableValue; this library's radio
// values are strings, so the payload is narrowed here instead of forwarding.
function onUpdate(value: unknown) {
  emit('update:modelValue', value as string)
}

// size is applied as a group class only: the radios read the per-size
// geometry through inherited CSS variables (the AppKit model — controlSize
// is set on the group), so no provide/inject is needed.
const classes = computed(() => [
  'macvue-radio-group',
  `macvue-radio-group--${props.orientation}`,
  `macvue-radio-group--${props.size}`,
])

// Not useTemplateRef: it landed in Vue 3.5 and the peer range starts at 3.4.
// ComponentPublicInstance because Reka roots are generic function components
// with no construct signature for InstanceType.
const root = ref<ComponentPublicInstance | null>(null)
const el = computed<HTMLElement | null>(() => root.value?.$el ?? null)

// Since orientation is not passed to Reka, aria-orientation would fall back
// to the implicit radiogroup default (vertical). A fallthrough attr cannot
// restore it: Reka's Slot merges the child's explicit undefined last
// (mergeProps(attrs, child.props)), wiping the attr — so it is set on the
// element directly, post-render.
watchPostEffect(() => {
  el.value?.setAttribute('aria-orientation', props.orientation)
})

// Roving focus keeps at most one radio tabbable; before any item became the
// tab stop, focusing the group root lets Reka delegate to the right item.
function focus() {
  const target
    = el.value?.querySelector<HTMLElement>('[role="radio"][tabindex="0"]')
      ?? el.value
  target?.focus()
}

function blur() {
  const active = el.value?.ownerDocument.activeElement
  if (active instanceof HTMLElement && el.value?.contains(active))
    active.blur()
}

defineExpose({ el, focus, blur })
</script>

<template>
  <!-- orientation is intentionally NOT passed to Reka: it only drives the
       layout class. With an orientation Reka ignores the cross-axis arrows,
       while APG expects all four to move selection in a radio group. -->
  <RadioGroupRoot
    ref="root"
    :model-value="props.modelValue"
    :default-value="props.defaultValue"
    :disabled="props.disabled"
    :name="props.name"
    :required="props.required"
    :class="classes"
    @update:model-value="onUpdate"
  >
    <slot />
  </RadioGroupRoot>
</template>
