<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { MacControlSize } from '../../types'
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'
import { computed, ref, useAttrs } from 'vue'
import GlassLens from '../glass/GlassLens.vue'
import { sliderGlassPreset } from '../glass/glassPresets'
import './slider.css'

export interface MacSliderProps {
  modelValue?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  /** Vertical is unverified: the kit has no vertical slider masters. */
  orientation?: 'horizontal' | 'vertical'
  /** Number of tick marks to render under the track. */
  ticks?: number
  /** Derives the step from the tick count: step = (max - min) / (ticks - 1). */
  snapToTicks?: boolean
  size?: MacControlSize
  disabled?: boolean
  name?: string
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MacSliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  orientation: 'horizontal',
  size: 'regular',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  /** Fired at the end of an interaction (forwarded Reka valueCommit). */
  'valueCommit': [value: number]
}>()

// The public model is a single number; Reka's slider works in number[].
const internal = ref(props.defaultValue ?? props.min)
const current = computed(() => props.modelValue ?? internal.value)
const sliderValue = computed(() => [current.value])

const tickCount = computed(() =>
  props.ticks !== undefined && props.ticks > 1 ? props.ticks : 0,
)

const effectiveStep = computed(() =>
  props.snapToTicks && tickCount.value > 1
    ? (props.max - props.min) / (tickCount.value - 1)
    : props.step,
)

function onUpdate(value: number[] | undefined) {
  const next = value?.[0]
  // Reka's payload is number[] | undefined; guard the empty case.
  if (next === undefined)
    return
  internal.value = next
  emit('update:modelValue', next)
}

function onCommit(value: number[] | undefined) {
  const committed = value?.[0]
  if (committed !== undefined)
    emit('valueCommit', committed)
}

// class/style skin the root; everything else (aria attributes) belongs on
// the focusable thumb — the element with role="slider".
const attrs = useAttrs()
const rootAttrs = computed(() => {
  const result: Record<string, unknown> = {}
  if (attrs.class !== undefined)
    result.class = attrs.class
  if (attrs.style !== undefined)
    result.style = attrs.style
  return result
})
const thumbAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

const classes = computed(() => [
  'macvue-slider',
  `macvue-slider--${props.size}`,
])

const glassAvailable = ref(false)

// Not useTemplateRef: it landed in Vue 3.5 and the peer range starts at 3.4.
// ComponentPublicInstance because Reka components are generic function
// components with no construct signature for InstanceType.
const thumb = ref<ComponentPublicInstance | null>(null)
const el = computed<HTMLElement | null>(() => thumb.value?.$el ?? null)

defineExpose({
  el,
  focus: () => el.value?.focus(),
  blur: () => el.value?.blur(),
})
</script>

<template>
  <SliderRoot
    :model-value="sliderValue"
    :min="min"
    :max="max"
    :step="effectiveStep"
    :orientation="orientation"
    :disabled="disabled"
    thumb-alignment="contain"
    :class="classes"
    v-bind="rootAttrs"
    @update:model-value="onUpdate"
    @value-commit="onCommit"
  >
    <div
      v-if="tickCount"
      class="macvue-slider-ticks"
      aria-hidden="true"
    >
      <i
        v-for="n in tickCount"
        :key="n"
        class="macvue-slider-tick"
      />
    </div>
    <SliderTrack class="macvue-slider-track">
      <SliderRange class="macvue-slider-range" />
    </SliderTrack>
    <SliderThumb
      ref="thumb"
      class="macvue-slider-thumb"
      :data-macvue-glass-ready="glassAvailable ? '' : undefined"
      v-bind="thumbAttrs"
    >
      <GlassLens
        lens-class="macvue-slider-glass-lens"
        filter-class="macvue-slider-glass-filter"
        :preset="sliderGlassPreset"
        @availability="glassAvailable = $event"
      />
    </SliderThumb>
    <!-- Own hidden input: Reka's VisuallyHiddenInput would submit the
         array form (name[0]) — NSSlider is a single scalar. -->
    <input
      v-if="name"
      type="hidden"
      :name="name"
      :value="current"
    >
  </SliderRoot>
</template>
