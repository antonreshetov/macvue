<script setup lang="ts">
import type { MacControlSize } from '@macvue/core'
import { MacSearchField } from '@macvue/core'

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
    <MacSearchField
      v-for="size in sizes"
      :key="size"
      :size="size"
      :aria-label="`Search (${size})`"
      style="width: 220px"
    />
  </div>
</template>
