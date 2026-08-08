<script setup lang="ts">
import { MacButton } from 'macvue'
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <MacButton disabled>
      Default
    </MacButton>
    <MacButton
      variant="prominent"
      disabled
    >
      Prominent
    </MacButton>
    <MacButton
      variant="destructive"
      disabled
    >
      Destructive
    </MacButton>
  </div>
</template>
