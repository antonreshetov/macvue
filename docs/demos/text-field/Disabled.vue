<script setup lang="ts">
import { MacTextField } from '@macvue/core'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <MacTextField
      disabled
      aria-label="Disabled empty"
      placeholder="Disabled"
      style="width: 220px"
    />
    <MacTextField
      disabled
      model-value="Read-only value"
      aria-label="Disabled with value"
      style="width: 220px"
    />
  </div>
</template>
