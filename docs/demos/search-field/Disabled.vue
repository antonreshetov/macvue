<script setup lang="ts">
import { MacSearchField } from '@macvue/core'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <MacSearchField
      disabled
      aria-label="Disabled empty"
      style="width: 220px"
    />
    <MacSearchField
      disabled
      model-value="Read-only query"
      aria-label="Disabled with value"
      style="width: 220px"
    />
  </div>
</template>
