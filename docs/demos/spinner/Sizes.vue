<script setup lang="ts">
import { MacSpinner } from 'macvue'
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <MacSpinner size="regular" />
    <MacSpinner
      size="small"
      label="Loading (small)"
    />
  </div>
</template>
