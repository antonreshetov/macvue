<script setup lang="ts">
import { MacProgress, MacSlider } from 'macvue'
import { ref } from 'vue'

const progress = ref(40)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; width: 240px">
    <MacProgress
      :value="progress"
      aria-label="Progress"
    />
    <MacSlider
      v-model="progress"
      aria-label="Demo value"
    />
  </div>
</template>
