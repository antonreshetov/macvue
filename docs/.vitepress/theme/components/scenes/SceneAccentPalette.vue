<script setup lang="ts">
import { MacButton, MacCheckbox, MacSwitch } from 'macvue'
import { ref } from 'vue'
import { defaultAccent } from '../../accents'
import AccentSwatches from '../AccentSwatches.vue'
import SceneFrame from './SceneFrame.vue'

const accent = ref(defaultAccent)
const checked = ref(true)
const enabled = ref(true)
</script>

<template>
  <div class="mv-scene-palette">
    <AccentSwatches v-model="accent" />

    <SceneFrame :accent="accent">
      <div class="mv-scene-palette-controls">
        <MacCheckbox v-model="checked">
          Notifications
        </MacCheckbox>
        <MacSwitch
          v-model="enabled"
          aria-label="Focus"
        />
        <MacButton variant="prominent">
          Save
        </MacButton>
      </div>
    </SceneFrame>
  </div>
</template>
