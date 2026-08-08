<script setup lang="ts">
import type { MacControlSize } from '../../types'
import { computed, ref } from 'vue'
import { useAutoRepeat } from './useAutoRepeat'
import './stepper.css'

export interface MacStepperProps {
  modelValue?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  /** NSStepper.valueWraps: stepping past a bound continues from the other. */
  wraps?: boolean
  size?: MacControlSize
  disabled?: boolean
  name?: string
}

const props = withDefaults(defineProps<MacStepperProps>(), {
  min: 0,
  max: 100,
  step: 1,
  wraps: false,
  size: 'regular',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

// Not useTemplateRef: it landed in Vue 3.5 and the peer range starts at 3.4.
const el = ref<HTMLDivElement | null>(null)

const internal = ref(props.defaultValue ?? props.min)
const current = computed(() => props.modelValue ?? internal.value)

function setValue(next: number): boolean {
  if (next === current.value)
    return false
  internal.value = next
  emit('update:modelValue', next)
  return true
}

// Overshoot clamps to the bound first; wrapping only fires FROM the bound,
// so holding the button pauses at min/max before jumping across.
function stepBy(direction: 1 | -1): boolean {
  if (props.disabled)
    return false
  let next = current.value + direction * props.step
  if (next > props.max)
    next = props.wraps && current.value >= props.max ? props.min : props.max
  else if (next < props.min)
    next = props.wraps && current.value <= props.min ? props.max : props.min
  return setValue(next)
}

const repeatUp = useAutoRepeat(() => stepBy(1))
const repeatDown = useAutoRepeat(() => stepBy(-1))

function onPointerDown(event: PointerEvent, repeat: { start: () => void }) {
  if (props.disabled || event.button !== 0)
    return
  // The buttons are presentation-only; focus stays on the spinbutton root.
  event.preventDefault()
  el.value?.focus()
  repeat.start()
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled)
    return
  const handlers: Record<string, () => unknown> = {
    ArrowUp: () => stepBy(1),
    ArrowDown: () => stepBy(-1),
    Home: () => setValue(props.min),
    End: () => setValue(props.max),
  }
  const handler = handlers[event.key]
  if (handler) {
    event.preventDefault()
    handler()
  }
}

const classes = computed(() => [
  'macvue-stepper',
  `macvue-stepper--${props.size}`,
])

defineExpose({
  el,
  focus: () => el.value?.focus(),
  blur: () => el.value?.blur(),
})
</script>

<template>
  <!-- A custom spinbutton, NOT Reka Stepper (that primitive is a wizard
       stepper, no relation to NSStepper). The root carries the value
       semantics and keyboard handling; the halves are pointer-only. -->
  <div
    ref="el"
    role="spinbutton"
    :tabindex="disabled ? -1 : 0"
    :aria-valuenow="current"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-disabled="disabled || undefined"
    :class="classes"
    @keydown="onKeydown"
  >
    <button
      type="button"
      class="macvue-stepper-button macvue-stepper-button--up"
      tabindex="-1"
      aria-hidden="true"
      :disabled="disabled"
      @pointerdown="onPointerDown($event, repeatUp)"
      @pointerup="repeatUp.cancel()"
      @pointercancel="repeatUp.cancel()"
      @pointerleave="repeatUp.cancel()"
    >
      <!-- Chevron bbox from the kit; stroke-width picked visually (the kit
           ships filled shapes, only the bbox is measured). -->
      <svg
        viewBox="0 0 10.6 6"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M1 5 5.3 1 9.6 5" />
      </svg>
    </button>
    <button
      type="button"
      class="macvue-stepper-button macvue-stepper-button--down"
      tabindex="-1"
      aria-hidden="true"
      :disabled="disabled"
      @pointerdown="onPointerDown($event, repeatDown)"
      @pointerup="repeatDown.cancel()"
      @pointercancel="repeatDown.cancel()"
      @pointerleave="repeatDown.cancel()"
    >
      <svg
        viewBox="0 0 10.6 6"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M1 1 5.3 5 9.6 1" />
      </svg>
    </button>
    <span
      class="macvue-stepper-separator"
      aria-hidden="true"
    />
    <input
      v-if="name"
      type="hidden"
      :name="name"
      :value="current"
    >
  </div>
</template>
