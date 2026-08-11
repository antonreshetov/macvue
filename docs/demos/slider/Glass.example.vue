<script setup lang="ts">
import { MacSlider } from '@macvue/core'
import { ref } from 'vue'

const volume = ref(42)
</script>

<template>
  <div data-macvue-glass="on">
    <MacSlider
      v-model="volume"
      aria-label="Volume"
    />
  </div>
</template>
