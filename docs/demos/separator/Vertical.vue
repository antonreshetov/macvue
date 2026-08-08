<script setup lang="ts">
import { MacLabel, MacSeparator } from 'macvue'
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px; height: 20px">
    <MacLabel>Day</MacLabel>
    <MacSeparator orientation="vertical" />
    <MacLabel>Week</MacLabel>
    <MacSeparator orientation="vertical" />
    <MacLabel>Month</MacLabel>
  </div>
</template>
