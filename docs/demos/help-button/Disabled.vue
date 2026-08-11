<script setup lang="ts">
import { MacHelpButton } from '@macvue/core'
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <MacHelpButton label="Help" />
    <MacHelpButton
      disabled
      label="Help (disabled)"
    />
  </div>
</template>
