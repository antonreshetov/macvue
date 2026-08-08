<script setup lang="ts">
import { MacSlider } from 'macvue'
import { ref } from 'vue'

const volume = ref(50)
</script>

<template>
  <MacSlider
    v-model="volume"
    aria-label="Volume"
    style="width: 220px"
  />
</template>
