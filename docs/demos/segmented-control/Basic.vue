<script setup lang="ts">
import { MacSegment, MacSegmentedControl } from 'macvue'
import { ref } from 'vue'

const view = ref('list')
</script>

<template>
  <MacSegmentedControl
    v-model="view"
    aria-label="View"
  >
    <MacSegment value="list">
      List
    </MacSegment>
    <MacSegment value="icons">
      Icons
    </MacSegment>
    <MacSegment value="columns">
      Columns
    </MacSegment>
  </MacSegmentedControl>
</template>
