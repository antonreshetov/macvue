<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { MacControlSize } from '../../types'
import { ToggleGroupRoot } from 'reka-ui'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import './segmented.css'

export interface MacSegmentedControlProps {
  modelValue?: string | string[]
  defaultValue?: string | string[]
  /** NSSegmentedControl selectOne / selectAny. Momentary is not modeled — use buttons. */
  type?: 'single' | 'multiple'
  size?: MacControlSize
  disabled?: boolean
  name?: string
}

const props = withDefaults(defineProps<MacSegmentedControlProps>(), {
  type: 'single',
  size: 'regular',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

const internal = ref<string | string[] | undefined>(props.defaultValue)
const current = computed(() => props.modelValue ?? internal.value)

// The state is held controlled towards Reka: its single-type toggle group
// deselects on a repeated click (emits undefined), which NSSegmentedControl
// never does — that update is swallowed.
function onUpdate(value: unknown) {
  if (props.type === 'single' && (value === undefined || value === null))
    return
  internal.value = value as string | string[]
  emit('update:modelValue', value as string | string[])
}

const selectedValues = computed<string[]>(() => {
  if (current.value === undefined)
    return []
  return Array.isArray(current.value) ? current.value : [current.value]
})

const classes = computed(() => [
  'macvue-segmented',
  `macvue-segmented--${props.size}`,
  `macvue-segmented--${props.type}`,
])

// Not useTemplateRef: it landed in Vue 3.5 and the peer range starts at 3.4.
// ComponentPublicInstance because Reka roots are generic function components
// with no construct signature for InstanceType.
const root = ref<ComponentPublicInstance | null>(null)
const el = computed<HTMLElement | null>(() => root.value?.$el ?? null)

// Sliding pill (single mode): positioned from the active segment's offset
// geometry. SSR-safe — nothing renders until mounted.
const mounted = ref(false)
const pillStyle = ref<{ left: string, width: string } | null>(null)
let resizeObserver: ResizeObserver | undefined

function updatePill() {
  if (props.type !== 'single' || !el.value) {
    pillStyle.value = null
    return
  }
  const active = el.value.querySelector<HTMLElement>(
    '.macvue-segment[data-state="on"]',
  )
  pillStyle.value = active
    ? { left: `${active.offsetLeft}px`, width: `${active.offsetWidth}px` }
    : null
}

onMounted(() => {
  mounted.value = true
  updatePill()
  if (typeof ResizeObserver !== 'undefined' && el.value) {
    resizeObserver = new ResizeObserver(updatePill)
    resizeObserver.observe(el.value)
  }
})

onBeforeUnmount(() => resizeObserver?.disconnect())

watch([current, () => props.size], () => nextTick(updatePill))

function focus() {
  const target
    = el.value?.querySelector<HTMLElement>('.macvue-segment[tabindex="0"]')
      ?? el.value?.querySelector<HTMLElement>('.macvue-segment')
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
  <ToggleGroupRoot
    ref="root"
    :type="type"
    :model-value="current"
    :disabled="disabled"
    orientation="horizontal"
    :class="classes"
    @update:model-value="onUpdate"
  >
    <div
      v-if="mounted && type === 'single' && pillStyle"
      class="macvue-segmented-pill"
      :style="pillStyle"
      aria-hidden="true"
    />
    <slot />
    <template v-if="name">
      <input
        v-for="value in selectedValues"
        :key="value"
        type="hidden"
        :name="name"
        :value="value"
      >
    </template>
  </ToggleGroupRoot>
</template>
