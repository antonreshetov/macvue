<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { MacControlSize } from '../../types'
import { SwitchRoot, SwitchThumb, useForwardPropsEmits } from 'reka-ui'
import { computed, ref, useAttrs } from 'vue'
import './switch.css'

export interface MacSwitchProps {
  modelValue?: boolean
  defaultValue?: boolean
  size?: MacControlSize
  disabled?: boolean
  name?: string
  value?: string
  required?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MacSwitchProps>(), {
  size: 'regular',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// size is presentation-only; forwarding it would land as a size="..."
// attribute on Reka's button.
const delegated = computed(() => {
  const { size: _size, ...rest } = props
  return rest
})
const forwarded = useForwardPropsEmits(delegated, emit)

const classes = computed(() => [
  'macvue-switch',
  `macvue-switch--${props.size}`,
])

// class/style skin the visible root; everything else (aria attributes,
// listeners) belongs on the actual control, not on a generic <label>.
const attrs = useAttrs()
const labelAttrs = computed(() => {
  // Property reads, not `in`: the attrs proxy has no `has` trap, so an
  // `in` check is not tracked and the computed would cache the first
  // (possibly empty) result forever. Undefined keys are dropped so an
  // absent style does not SSR-render as an empty style="" attribute.
  const result: Record<string, unknown> = {}
  if (attrs.class !== undefined)
    result.class = attrs.class
  if (attrs.style !== undefined)
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
const control = ref<ComponentPublicInstance | null>(null)
const el = computed<HTMLButtonElement | null>(() => control.value?.$el ?? null)

defineExpose({
  el,
  focus: () => el.value?.focus(),
  blur: () => el.value?.blur(),
})
</script>

<template>
  <!-- Caption on the left, toggle on the right — the System Settings layout.
       Clicking the caption toggles: the label forwards its click to the
       button. -->
  <label
    :class="classes"
    v-bind="labelAttrs"
  >
    <span
      v-if="$slots.default"
      class="macvue-switch-label"
    >
      <slot />
    </span>
    <SwitchRoot
      ref="control"
      v-bind="{ ...controlAttrs, ...forwarded }"
      class="macvue-switch-control"
    >
      <SwitchThumb class="macvue-switch-thumb" />
    </SwitchRoot>
  </label>
</template>
