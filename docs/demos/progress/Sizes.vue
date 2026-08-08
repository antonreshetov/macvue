<script setup lang="ts">
import { MacProgress } from 'macvue'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; width: 240px">
    <MacProgress
      :value="60"
      size="regular"
      aria-label="Regular"
    />
    <MacProgress
      :value="60"
      size="small"
      aria-label="Small"
    />
  </div>
</template>
