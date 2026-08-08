<script setup lang="ts">
import { MacSlider } from 'macvue'
import { ref } from 'vue'

const level = ref(50)
</script>

<template>
  <MacSlider
    v-model="level"
    :ticks="5"
    snap-to-ticks
    aria-label="Level"
    style="width: 220px"
  />
</template>
