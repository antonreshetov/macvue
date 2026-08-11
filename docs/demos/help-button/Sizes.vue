<script setup lang="ts">
import type { MacControlSize } from '@macvue/core'
import { MacHelpButton } from '@macvue/core'

const sizes: MacControlSize[] = [
  'extra-large',
  'large',
  'regular',
  'small',
  'mini',
]
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <MacHelpButton
      v-for="size in sizes"
      :key="size"
      :size="size"
      :label="`Help (${size})`"
    />
  </div>
</template>
