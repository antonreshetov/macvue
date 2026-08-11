<script setup lang="ts">
import { MacButton } from '@macvue/core'
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <MacButton>Default</MacButton>
    <MacButton variant="prominent">
      Prominent
    </MacButton>
    <MacButton variant="destructive">
      Destructive
    </MacButton>
  </div>
</template>
