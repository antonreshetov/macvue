<script setup lang="ts">
import { MacSegment, MacSegmentedControl } from 'macvue'
import { ref } from 'vue'

const styles = ref(['bold'])
</script>

<template>
  <MacSegmentedControl
    v-model="styles"
    type="multiple"
    aria-label="Text style"
  >
    <MacSegment value="bold">
      B
    </MacSegment>
    <MacSegment value="italic">
      I
    </MacSegment>
    <MacSegment value="underline">
      U
    </MacSegment>
  </MacSegmentedControl>
</template>
