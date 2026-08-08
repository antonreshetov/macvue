<script setup lang="ts">
import { MacButton, MacCheckbox, MacSwitch } from 'macvue'
import { ref } from 'vue'
import SceneFrame from './SceneFrame.vue'

const checked = ref(true)
const enabled = ref(true)
</script>

<template>
  <SceneFrame>
    <div class="mv-scene-controls">
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
</template>
