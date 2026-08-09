<script setup lang="ts">
import { ProgressIndicator, ProgressRoot } from 'reka-ui'
import { computed } from 'vue'
import './progress.css'

export interface MacProgressProps {
  /** Current value; omit (or pass null) for an indeterminate bar. */
  value?: number | null
  max?: number
  /** The kit ships the linear bar in two sizes only (regular 10, small 6). */
  size?: 'regular' | 'small'
  /** Accessible label (no locale layer yet); an aria-label attr overrides it. */
  label?: string
}

const props = withDefaults(defineProps<MacProgressProps>(), {
  value: null,
  max: 100,
  size: 'regular',
  label: 'Progress',
})

const classes = computed(() => [
  'macvue-progress',
  `macvue-progress--${props.size}`,
])

// Reka warns on out-of-range values and ARIA would report nonsense
// (valuenow above valuemax) — bind pre-clamped numbers.
const clampedMax = computed(() => (props.max > 0 ? props.max : 100))
const clampedValue = computed(() =>
  props.value === null
    ? null
    : Math.min(Math.max(props.value, 0), clampedMax.value),
)

const fillStyle = computed(() =>
  clampedValue.value === null
    ? undefined
    : { width: `${(clampedValue.value / clampedMax.value) * 100}%` },
)
</script>

<template>
  <!-- Display-only (NSProgressIndicator has no user input): no v-model. -->
  <ProgressRoot
    :model-value="clampedValue"
    :max="clampedMax"
    :aria-label="label"
    :class="classes"
  >
    <ProgressIndicator
      v-if="clampedValue !== null"
      class="macvue-progress-fill"
      :style="fillStyle"
    />
    <div
      v-else
      class="macvue-progress-comet"
      aria-hidden="true"
    >
      <span class="macvue-progress-comet-forward" />
      <span class="macvue-progress-comet-backward" />
    </div>
  </ProgressRoot>
</template>
