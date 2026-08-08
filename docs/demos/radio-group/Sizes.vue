<script setup lang="ts">
import type { MacControlSize } from 'macvue'
import { MacRadio, MacRadioGroup } from 'macvue'

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
    <MacRadioGroup
      v-for="item in sizes"
      :key="item.size"
      :size="item.size"
      default-value="on"
      orientation="horizontal"
      :aria-label="`${item.label} radios`"
    >
      <MacRadio value="on">
        {{ item.label }}
      </MacRadio>
      <MacRadio value="off">
        Option
      </MacRadio>
    </MacRadioGroup>
  </div>
</template>
