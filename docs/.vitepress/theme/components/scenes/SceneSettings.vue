<script setup lang="ts">
import {
  MacButton,
  MacCheckbox,
  MacRadio,
  MacRadioGroup,
  MacSlider,
  MacStepper,
  MacSwitch,
} from 'macvue'
import { ref } from 'vue'
import SceneFrame from './SceneFrame.vue'

defineProps<{ accent?: string }>()

const appearance = defineModel<'light' | 'dark'>('appearance', {
  default: 'light',
})

const wifi = ref(true)
const bluetooth = ref(true)
const showExtensions = ref(true)
const showHidden = ref(false)
const brightness = ref(70)
const autoHideDelay = ref(5)
</script>

<template>
  <SceneFrame
    title="Settings"
    :appearance="appearance"
    :accent="accent"
  >
    <div class="mv-scene-settings">
      <div class="mv-scene-settings-group">
        <div class="mv-scene-settings-row">
          <span class="mv-scene-settings-label">Appearance</span>
          <MacRadioGroup
            v-model="appearance"
            orientation="horizontal"
            aria-label="Appearance"
          >
            <MacRadio value="light">
              Light
            </MacRadio>
            <MacRadio value="dark">
              Dark
            </MacRadio>
          </MacRadioGroup>
        </div>
      </div>

      <div class="mv-scene-settings-group">
        <div class="mv-scene-settings-row">
          <span class="mv-scene-settings-label">Wi-Fi</span>
          <MacSwitch
            v-model="wifi"
            aria-label="Wi-Fi"
          />
        </div>
        <div class="mv-scene-settings-row">
          <span class="mv-scene-settings-label">Bluetooth</span>
          <MacSwitch
            v-model="bluetooth"
            aria-label="Bluetooth"
          />
        </div>
      </div>

      <div class="mv-scene-settings-group">
        <div class="mv-scene-settings-row">
          <span class="mv-scene-settings-label">Brightness</span>
          <MacSlider
            v-model="brightness"
            size="small"
            aria-label="Brightness"
            style="width: 160px"
          />
        </div>
        <div class="mv-scene-settings-row">
          <span class="mv-scene-settings-label">Hide toolbar after {{ autoHideDelay }} s</span>
          <MacStepper
            v-model="autoHideDelay"
            :min="1"
            :max="30"
            size="small"
            aria-label="Hide toolbar delay"
          />
        </div>
      </div>

      <div class="mv-scene-settings-group">
        <div class="mv-scene-settings-row">
          <MacCheckbox v-model="showExtensions">
            Show all filename extensions
          </MacCheckbox>
        </div>
        <div class="mv-scene-settings-row">
          <MacCheckbox v-model="showHidden">
            Show hidden files
          </MacCheckbox>
        </div>
      </div>

      <div class="mv-scene-settings-footer">
        <MacButton>Restore Defaults</MacButton>
        <MacButton variant="prominent">
          Done
        </MacButton>
      </div>
    </div>
  </SceneFrame>
</template>
