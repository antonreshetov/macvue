<script setup lang="ts">
import type { MacLabelVariant } from '@macvue/core'
import { MacLabel } from '@macvue/core'

const variants: MacLabelVariant[] = [
  'large-title',
  'title-1',
  'title-2',
  'title-3',
  'headline',
  'body',
  'callout',
  'subheadline',
  'footnote',
  'caption-1',
  'caption-2',
]
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 4px">
    <MacLabel
      v-for="variant in variants"
      :key="variant"
      :variant="variant"
    >
      {{ variant }}
    </MacLabel>
  </div>
</template>
