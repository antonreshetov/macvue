<script setup lang="ts">
import { MacButton, MacCheckbox } from '@macvue/core'
import { ref } from 'vue'
import SceneFrame from './SceneFrame.vue'

defineProps<{ appearance?: 'light' | 'dark' }>()

const preventSleep = ref(true)
const disksToSleep = ref(true)
const wakeForNetwork = ref(false)
</script>

<template>
  <SceneFrame
    title="Energy Saver"
    :appearance="appearance"
  >
    <div class="mv-scene-settings">
      <div class="mv-scene-settings-group">
        <div class="mv-scene-settings-row">
          <MacCheckbox v-model="preventSleep">
            Prevent automatic sleeping when the display is off
          </MacCheckbox>
        </div>
        <div class="mv-scene-settings-row">
          <MacCheckbox v-model="disksToSleep">
            Put hard disks to sleep when possible
          </MacCheckbox>
        </div>
        <div class="mv-scene-settings-row">
          <MacCheckbox v-model="wakeForNetwork">
            Wake for network access
          </MacCheckbox>
        </div>
      </div>

      <div class="mv-scene-settings-footer">
        <MacButton>Restore Defaults</MacButton>
      </div>
    </div>
  </SceneFrame>
</template>
