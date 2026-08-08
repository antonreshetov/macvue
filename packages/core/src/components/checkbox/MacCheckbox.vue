<script setup lang="ts">
import type { CheckboxCheckedState } from 'reka-ui'
import type { ComponentPublicInstance } from 'vue'
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from 'reka-ui'
import { computed, ref, useAttrs } from 'vue'
import './checkbox.css'

export interface MacCheckboxProps {
  modelValue?: boolean | 'indeterminate'
  defaultValue?: boolean | 'indeterminate'
  size?: 'extra-large' | 'large' | 'regular' | 'small' | 'mini'
  disabled?: boolean
  name?: string
  value?: string
  required?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MacCheckboxProps>(), {
  size: 'regular',
})

const emit = defineEmits<{
  'update:modelValue': [value: CheckboxCheckedState]
}>()

// size is presentation-only; forwarding it would land as a size="..."
// attribute on Reka's button.
const delegated = computed(() => {
  const { size: _size, ...rest } = props
  return rest
})
const forwarded = useForwardPropsEmits(delegated, emit)

const classes = computed(() => [
  'macvue-checkbox',
  `macvue-checkbox--${props.size}`,
])

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
    :class="classes"
    v-bind="labelAttrs"
  >
    <CheckboxRoot
      ref="box"
      v-bind="{ ...controlAttrs, ...forwarded }"
      class="macvue-checkbox-box"
    >
      <CheckboxIndicator class="macvue-checkbox-indicator">
        <!-- Glyph boxes match the kit's fixed check (9.3×8.9) and dash
             (6.5×2) instead of stretching across the control. The kit ships
             the check as a filled shape, so stroke-width 1.7 is picked
             visually to match — only the bbox is measured. -->
        <svg
          class="macvue-checkbox-check"
          viewBox="0 0 9.3 8.9"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M0.9 5.1 3.3 7.8 8.4 1.1" />
        </svg>
        <svg
          class="macvue-checkbox-dash"
          viewBox="0 0 6.5 2"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path d="M1 1h4.5" />
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
