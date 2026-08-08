<script setup lang="ts">
import { MacSwitch } from 'macvue'

const sizes = [
  { size: 'extra-large', label: 'Extra large' },
  { size: 'large', label: 'Large' },
  { size: 'regular', label: 'Regular' },
  { size: 'small', label: 'Small' },
  { size: 'mini', label: 'Mini' },
] as const
</script>

<template>
  <!-- Settings-style rows: labels flush left, switches flush right,
       as macOS lays out NSSwitch in a form. -->
  <div
    style="
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: min(260px, 100%);
    "
  >
    <MacSwitch
      v-for="item in sizes"
      :key="item.size"
      :size="item.size"
      default-value
      style="justify-content: space-between"
    >
      {{ item.label }}
    </MacSwitch>
  </div>
</template>
