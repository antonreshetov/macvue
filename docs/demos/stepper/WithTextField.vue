<script setup lang="ts">
import { MacStepper, MacTextField } from '@macvue/core'
import { computed, ref } from 'vue'

const copies = ref(1)

// The classic AppKit pairing: a text field and a stepper share one value.
const text = computed({
  get: () => String(copies.value),
  set: (value) => {
    const parsed = Number.parseInt(value, 10)
    if (!Number.isNaN(parsed))
      copies.value = Math.min(99, Math.max(1, parsed))
  },
})
</script>

<template>
  <div style="display: flex; align-items: center; gap: 4px">
    <MacTextField
      v-model="text"
      aria-label="Copies"
      style="width: 60px"
    />
    <MacStepper
      v-model="copies"
      :min="1"
      :max="99"
      aria-label="Adjust copies"
    />
  </div>
</template>
