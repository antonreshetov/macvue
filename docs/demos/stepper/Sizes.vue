<script setup lang="ts">
import type { MacControlSize } from '@macvue/core'
import { MacStepper } from '@macvue/core'

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
