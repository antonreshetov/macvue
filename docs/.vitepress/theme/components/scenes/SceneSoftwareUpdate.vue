<script setup lang="ts">
import { MacButton, MacCheckbox } from 'macvue'
import { ref } from 'vue'

defineProps<{ appearance?: 'light' | 'dark' }>()

const autoUpdate = ref(true)
</script>

<template>
  <div
    class="mv-scene-dialog"
    role="presentation"
    :data-macvue-appearance="appearance"
  >
    <p class="mv-scene-dialog-headline">
      Software Update
    </p>
    <p class="mv-scene-dialog-body">
      macOS Sequoia 15.6 is available and can be installed later tonight.
    </p>
    <div class="mv-scene-dialog-option">
      <MacCheckbox v-model="autoUpdate">
        Automatically keep my Mac up to date
      </MacCheckbox>
    </div>
    <div class="mv-scene-dialog-actions">
      <MacButton>Not Now</MacButton>
      <MacButton variant="prominent">
        Update Now
      </MacButton>
    </div>
  </div>
</template>
