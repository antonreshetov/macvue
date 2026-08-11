<script setup lang="ts">
import { MacStepper } from '@macvue/core'
</script>

<template>
  <MacStepper
    disabled
    :default-value="5"
    aria-label="Disabled"
  />
</template>
