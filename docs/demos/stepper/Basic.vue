<script setup lang="ts">
import { MacStepper } from 'macvue'
import { ref } from 'vue'

const copies = ref(1)
</script>

<template>
  <div style="display: flex; align-items: center; gap: 8px">
    <span style="font-size: 13px">Copies: {{ copies }}</span>
    <MacStepper
      v-model="copies"
      :min="1"
      :max="99"
      aria-label="Copies"
    />
  </div>
</template>
