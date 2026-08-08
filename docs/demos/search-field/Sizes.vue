<script setup lang="ts">
import type { MacControlSize } from 'macvue'
import { MacSearchField } from 'macvue'

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
