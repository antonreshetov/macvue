<script setup lang="ts">
import { MacSlider } from '@macvue/core'
</script>

<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    "
  >
    <MacSlider
      disabled
      :default-value="60"
      aria-label="Disabled"
      style="width: 220px"
    />
    <MacSlider
      disabled
      :default-value="60"
      :ticks="5"
      aria-label="Disabled with ticks"
      style="width: 220px"
    />
  </div>
</template>
