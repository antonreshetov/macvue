<script setup lang="ts">
import { MacButton } from '@macvue/core'
</script>

<template>
  <div
    class="mv-scene-dialog"
    role="presentation"
  >
    <p class="mv-scene-dialog-headline">
      Empty Trash?
    </p>
    <p class="mv-scene-dialog-body">
      All items in the Trash will be permanently deleted. You can't undo this
      action.
    </p>
    <div class="mv-scene-dialog-actions">
      <MacButton>Cancel</MacButton>
      <MacButton variant="prominent">
        Empty Trash
      </MacButton>
    </div>
  </div>
</template>
