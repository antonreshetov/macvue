<script setup lang="ts">
import type { MacControlSize } from '@macvue/core'
import { MacSlider } from '@macvue/core'

const sizes: MacControlSize[] = [
  'extra-large',
  'large',
  'regular',
  'small',
  'mini',
]
</script>

<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    "
  >
    <MacSlider
      v-for="size in sizes"
      :key="size"
      :size="size"
      :default-value="50"
      :aria-label="`Volume (${size})`"
      style="width: 220px"
    />
  </div>
</template>
