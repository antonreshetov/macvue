<script setup lang="ts">
import type { MacControlSize } from '@macvue/core'
import { MacTextField } from '@macvue/core'

const sizes: { size: MacControlSize, label: string }[] = [
  { size: 'extra-large', label: 'Extra large' },
  { size: 'large', label: 'Large' },
  { size: 'regular', label: 'Regular' },
  { size: 'small', label: 'Small' },
  { size: 'mini', label: 'Mini' },
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
    <MacTextField
      v-for="item in sizes"
      :key="item.size"
      :size="item.size"
      :aria-label="item.label"
      :placeholder="item.label"
      style="width: 220px"
    />
  </div>
</template>
