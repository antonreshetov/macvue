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
}

const props = withDefaults(defineProps<MacProgressProps>(), {
  value: null,
  max: 100,
  size: 'regular',
})

const classes = computed(() => [
  'macvue-progress',
  `macvue-progress--${props.size}`,
])

const fillStyle = computed(() =>
  props.value === null
    ? undefined
    : {
        width: `${(Math.min(Math.max(props.value, 0), props.max) / props.max) * 100}%`,
      },
)
</script>

<template>
  <!-- Display-only (NSProgressIndicator has no user input): no v-model. -->
  <ProgressRoot
    :model-value="value"
    :max="max"
    :class="classes"
  >
    <ProgressIndicator
      v-if="value !== null"
      class="macvue-progress-fill"
      :style="fillStyle"
    />
    <div
      v-else
      class="macvue-progress-comet"
      aria-hidden="true"
    />
  </ProgressRoot>
</template>
