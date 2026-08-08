<script setup lang="ts">
import type { CheckboxCheckedState } from 'reka-ui'
import type { ComponentPublicInstance } from 'vue'
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from 'reka-ui'
import { computed, ref, useAttrs } from 'vue'
import './checkbox.css'

export interface MacCheckboxProps {
  modelValue?: boolean | 'indeterminate'
  defaultValue?: boolean | 'indeterminate'
  disabled?: boolean
  name?: string
  value?: string
  required?: boolean
}

defineOptions({ inheritAttrs: false })

const props = defineProps<MacCheckboxProps>()

const emit = defineEmits<{
  'update:modelValue': [value: CheckboxCheckedState]
}>()

const forwarded = useForwardPropsEmits(props, emit)

// class/style skin the visible root; everything else (aria attributes,
// listeners) belongs on the actual control, not on a generic <label>.
const attrs = useAttrs()
const labelAttrs = computed(() => {
  // Only keys present in $attrs: an always-present `style` key would
  // SSR-render as an empty style="" attribute.
  const result: Record<string, unknown> = {}
  if ('class' in attrs)
    result.class = attrs.class
  if ('style' in attrs)
    result.style = attrs.style
  return result
})
const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

// Not useTemplateRef: it landed in Vue 3.5 and the peer range starts at 3.4.
// ComponentPublicInstance because Reka roots are generic function components
// with no construct signature for InstanceType.
const box = ref<ComponentPublicInstance | null>(null)
const el = computed<HTMLButtonElement | null>(() => box.value?.$el ?? null)

defineExpose({
  el,
  focus: () => el.value?.focus(),
  blur: () => el.value?.blur(),
})
</script>

<template>
  <!-- Clicking the caption toggles: the label forwards its click to the
       button, matching the AppKit hit-area of NSButton titles. -->
  <label
    class="macvue-checkbox"
    v-bind="labelAttrs"
  >
    <CheckboxRoot
      ref="box"
      v-bind="{ ...controlAttrs, ...forwarded }"
      class="macvue-checkbox-box"
    >
      <CheckboxIndicator class="macvue-checkbox-indicator">
        <svg
          class="macvue-checkbox-check"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M3.5 7.5 6 10l4.5-6" />
        </svg>
        <svg
          class="macvue-checkbox-dash"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path d="M4 7h6" />
        </svg>
      </CheckboxIndicator>
    </CheckboxRoot>
    <span
      v-if="$slots.default"
      class="macvue-checkbox-label"
    >
      <slot />
    </span>
  </label>
</template>
