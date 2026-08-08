<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { RadioGroupItem } from 'reka-ui'
import { computed, ref, useAttrs } from 'vue'
import './radio-group.css'

export interface MacRadioProps {
  value: string
  disabled?: boolean
}

defineOptions({ inheritAttrs: false })

const props = defineProps<MacRadioProps>()

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
const item = ref<ComponentPublicInstance | null>(null)
const el = computed<HTMLButtonElement | null>(() => item.value?.$el ?? null)

defineExpose({
  el,
  focus: () => el.value?.focus(),
  blur: () => el.value?.blur(),
})
</script>

<template>
  <!-- Clicking the caption selects: the label forwards its click to the
       button, matching the AppKit hit-area of NSButton titles. The disabled
       look keys off the item's data-disabled (set for both the item's own
       and the group's disabled) via :has() in radio-group.css. -->
  <label
    class="macvue-radio"
    v-bind="labelAttrs"
  >
    <RadioGroupItem
      ref="item"
      v-bind="controlAttrs"
      :value="props.value"
      :disabled="disabled"
      class="macvue-radio-control"
    />
    <span
      v-if="$slots.default"
      class="macvue-radio-label"
    >
      <slot />
    </span>
  </label>
</template>
