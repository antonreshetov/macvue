<script setup lang="ts">
import { MacProgress } from 'macvue'
import { ref } from 'vue'

const progress = ref(40)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; width: 240px">
    <MacProgress
      :value="progress"
      aria-label="Progress"
    />
    <input
      v-model.number="progress"
      type="range"
      min="0"
      max="100"
      aria-label="Demo value"
    >
  </div>
</template>
