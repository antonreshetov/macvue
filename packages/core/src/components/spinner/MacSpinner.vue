<script setup lang="ts">
import { ProgressRoot } from 'reka-ui'
import { computed } from 'vue'
import './spinner.css'

export interface MacSpinnerProps {
  /** The kit ships the spinner in two sizes only (regular 32, small 16). */
  size?: 'regular' | 'small'
  /** Accessible label (no locale layer yet). */
  label?: string
}

const props = withDefaults(defineProps<MacSpinnerProps>(), {
  size: 'regular',
  label: 'Loading',
})

const classes = computed(() => [
  'macvue-spinner',
  `macvue-spinner--${props.size}`,
])

// Kit blade geometry (viewBox 32): 8 capsules 4×10 every 45°, opacities
// stepping 0.55 → 0.06 by 0.07. The small size is an exact half — one SVG.
const blades = Array.from({ length: 8 }, (_, index) => ({
  rotation: index * 45,
  opacity: (55 - index * 7) / 100,
}))
</script>

<template>
  <!-- An indeterminate progressbar for AT; the blades are decorative. -->
  <ProgressRoot
    :model-value="null"
    :aria-label="label"
    :class="classes"
  >
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <rect
        v-for="blade in blades"
        :key="blade.rotation"
        x="14"
        y="0"
        width="4"
        height="10"
        rx="2"
        fill="currentColor"
        :opacity="blade.opacity"
        :transform="`rotate(${blade.rotation} 16 16)`"
      />
    </svg>
  </ProgressRoot>
</template>
