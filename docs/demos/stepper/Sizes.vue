<script setup lang="ts">
import type { MacControlSize } from 'macvue'
import { MacStepper } from 'macvue'

const sizes: MacControlSize[] = [
  'extra-large',
  'large',
  'regular',
  'small',
  'mini',
]
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <MacStepper
      v-for="size in sizes"
      :key="size"
      :size="size"
      :default-value="5"
      :aria-label="`Stepper (${size})`"
    />
  </div>
</template>
