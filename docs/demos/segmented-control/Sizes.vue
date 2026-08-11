<script setup lang="ts">
import type { MacControlSize } from '@macvue/core'
import { MacSegment, MacSegmentedControl } from '@macvue/core'

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
    <MacSegmentedControl
      v-for="size in sizes"
      :key="size"
      :size="size"
      default-value="day"
      :aria-label="`Range (${size})`"
    >
      <MacSegment value="day">
        Day
      </MacSegment>
      <MacSegment value="week">
        Week
      </MacSegment>
      <MacSegment value="month">
        Month
      </MacSegment>
    </MacSegmentedControl>
  </div>
</template>
