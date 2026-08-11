<script setup lang="ts">
import { MacSlider } from '@macvue/core'
import { ref } from 'vue'

const value = ref(30)
</script>

<template>
  <MacSlider
    v-model="value"
    orientation="vertical"
    aria-label="Value"
    style="height: 120px"
  />
</template>
