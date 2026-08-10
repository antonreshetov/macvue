<script setup lang="ts">
import type { MacControlSize } from '../../types'
import { computed, ref, useAttrs } from 'vue'
import GlassLens from '../glass/GlassLens.vue'
import { switchGlassPreset } from '../glass/glassPresets'
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
  // Absent boolean props are cast to false by Vue; an explicit undefined
  // default keeps "no v-model" distinguishable from "v-model false".
  modelValue: undefined,
  defaultValue: undefined,
  value: 'on',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isControlled = props.modelValue !== undefined
const internal = ref(props.defaultValue ?? false)
const checked = computed(() =>
  isControlled ? (props.modelValue ?? false) : internal.value,
)

function setChecked(next: boolean) {
  if (next === checked.value)
    return
  internal.value = next
  emit('update:modelValue', next)
}

const classes = computed(() => [
  'macvue-switch',
  `macvue-switch--${props.size}`,
])

const glassAvailable = ref(false)

const attrs = useAttrs()
const labelAttrs = computed(() => {
  // The attrs proxy has no reactive `has` trap, so use property reads.
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

const hiddenInputStyle = {
  position: 'absolute',
  border: 0,
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  top: '-1px',
  left: '-1px',
  pointerEvents: 'none',
} as const

// Not useTemplateRef: it landed in Vue 3.5 and the peer range starts at 3.4.
const el = ref<HTMLInputElement | null>(null)

const DRAG_THRESHOLD_PX = 3

const dragging = ref(false)
const liveProgress = ref(0)
let activePointerId: number | null = null
let startX = 0
let dragTravel = 0
let hasDragged = false
// Range changes on pointerdown; the visual state must wait for movement.
let pendingProgress = 0

const thumbStyle = computed(() =>
  dragging.value
    ? {
        transform: `translateX(${liveProgress.value * dragTravel}px)`,
        transition: 'none',
      }
    : undefined,
)
const visualChecked = computed(() =>
  dragging.value ? liveProgress.value >= 0.5 : checked.value,
)
const dataState = computed(() =>
  visualChecked.value ? 'checked' : 'unchecked',
)

function measureDrag() {
  const track = el.value?.parentElement?.querySelector<HTMLElement>(
    '.macvue-switch-control',
  )
  const thumb = track?.querySelector<HTMLElement>('.macvue-switch-thumb')
  if (!track || !thumb)
    return 0
  const rect = track.getBoundingClientRect()
  const inset = thumb.offsetLeft
  return Math.max(rect.width - 2 * inset - thumb.offsetWidth, 0)
}

function resetPointer() {
  activePointerId = null
  dragging.value = false
  hasDragged = false
}

function onPointerDown(event: PointerEvent) {
  if (
    props.disabled
    || event.button !== 0
    || event.isPrimary === false
    || activePointerId !== null
  ) {
    return
  }
  activePointerId = event.pointerId
  startX = event.clientX
  dragTravel = measureDrag()
  liveProgress.value = checked.value ? 1 : 0
  pendingProgress = liveProgress.value
  hasDragged = false
  dragging.value = true
  const control = event.currentTarget as HTMLInputElement
  control.focus()
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerId !== activePointerId)
    return
  const delta = event.clientX - startX
  if (!hasDragged && Math.abs(delta) >= DRAG_THRESHOLD_PX) {
    hasDragged = true
    liveProgress.value = pendingProgress
  }
}

function onInput(event: Event) {
  const progress = Number((event.currentTarget as HTMLInputElement).value)
  pendingProgress = Math.min(Math.max(progress, 0), 1)
  if (dragging.value) {
    if (hasDragged)
      liveProgress.value = pendingProgress
  }
  else {
    setChecked(pendingProgress >= 0.5)
  }
}

function onPointerUp(event: PointerEvent) {
  if (event.pointerId !== activePointerId)
    return
  const wasDragging = hasDragged
  const commitOn = pendingProgress >= 0.5
  resetPointer()
  if (!wasDragging) {
    setChecked(!checked.value)
    return
  }
  setChecked(commitOn)
}

function onPointerCancel(event: PointerEvent) {
  if (event.pointerId === activePointerId)
    resetPointer()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && activePointerId !== null) {
    event.preventDefault()
    resetPointer()
    return
  }

  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault()
    setChecked(!checked.value)
  }
  else if (event.key === 'ArrowLeft' || event.key === 'Home') {
    event.preventDefault()
    setChecked(false)
  }
  else if (event.key === 'ArrowRight' || event.key === 'End') {
    event.preventDefault()
    setChecked(true)
  }
}

function onCaptionClick(event: MouseEvent) {
  event.preventDefault()
  if (!props.disabled)
    setChecked(!checked.value)
}

function onClick(event: MouseEvent) {
  if (props.disabled)
    return

  // Physical clicks have detail > 0; keyboard, AT and HTMLElement.click()
  // activations have detail 0. Pointer gestures already committed on pointerup.
  if (event.detail !== 0)
    return
  setChecked(!checked.value)
}

defineExpose({
  el,
  focus: () => el.value?.focus(),
  blur: () => el.value?.blur(),
})
</script>

<template>
  <label
    :class="classes"
    v-bind="labelAttrs"
  >
    <span
      v-if="$slots.default"
      class="macvue-switch-label"
      @click="onCaptionClick"
    >
      <slot />
    </span>
    <span class="macvue-switch-slider">
      <input
        ref="el"
        type="range"
        min="0"
        max="1"
        step="0.001"
        class="macvue-switch-input"
        :value="dragging ? liveProgress : checked ? 1 : 0"
        :aria-valuetext="visualChecked ? 'On' : 'Off'"
        :aria-required="required || undefined"
        :data-state="dataState"
        :data-disabled="disabled ? '' : undefined"
        :disabled="disabled"
        v-bind="controlAttrs"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerCancel"
        @input="onInput"
        @keydown="onKeydown"
        @click="onClick"
      >
      <span
        class="macvue-switch-control"
        :data-state="dataState"
        :data-disabled="disabled ? '' : undefined"
      >
        <span
          class="macvue-switch-thumb"
          :data-state="dataState"
          :data-macvue-glass-ready="glassAvailable ? '' : undefined"
          :style="thumbStyle"
        >
          <GlassLens
            lens-class="macvue-switch-glass-lens"
            filter-class="macvue-switch-glass-filter"
            :preset="switchGlassPreset"
            @availability="glassAvailable = $event"
          />
        </span>
      </span>
    </span>
  </label>
  <input
    v-if="name"
    type="checkbox"
    :checked="checked"
    :required="required"
    :disabled="disabled"
    :name="name"
    :value="value"
    :style="hiddenInputStyle"
    tabindex="-1"
    aria-hidden="true"
  >
</template>
